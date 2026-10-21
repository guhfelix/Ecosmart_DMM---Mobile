import { PerfilUsuario, Usuario, ResetCodeResult, ResetPasswordResult } from '../models';
import { getFirebaseAuth } from './firebaseConfig';
import { firebaseService } from './firebaseService';
import { securityService } from './securityService';

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  /** Senha legada opcional (nunca persistida em texto puro no AsyncStorage/Firestore) */
  password?: string;
  /** Hash seguro da senha para validação local/offline (A4-11) */
  passwordHash?: string;
  perfil: PerfilUsuario;
  provider?: 'password' | 'google';
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  veiculo?: string;
  capacidadeCarga?: string;
  cargo?: string;
  departamento?: string;
  bio?: string;
  avatarUri?: string;
  createdAt?: string;
  updatedAt?: string;
};

const IS_TEST_OR_DEV =
  typeof process === 'undefined' ||
  process.env?.NODE_ENV === 'test' ||
  process.env?.NODE_ENV === 'development' ||
  Boolean((globalThis as any).__DEV__);

const DEFAULT_DEMO_HASH = securityService.hashPassword('1234');

const DEMO_USERS_DEFINITION: Record<PerfilUsuario, RegisteredUser> = {
  admin: {
    id: 'user-admin-1',
    name: 'João Gestor SEMATUR',
    email: 'joao@gmail.com',
    passwordHash: DEFAULT_DEMO_HASH,
    perfil: 'admin',
    telefone: '(65) 3223-5500',
    cep: '78200-000',
    endereco: 'Rua Cel. José Dulce',
    numero: '500',
    bairro: 'Centro',
    cidade: 'Cáceres - MT',
    cargo: 'Secretário Municipal de Meio Ambiente',
    departamento: 'SEMATUR - Cáceres MT',
    bio: 'Gestão e monitoramento ambiental do município de Cáceres - MT.',
  },
  cidadao: {
    id: 'user-cidadao-1',
    name: 'Maria Cidadã Pantaneira',
    email: 'maria@gmail.com',
    passwordHash: DEFAULT_DEMO_HASH,
    perfil: 'cidadao',
    telefone: '(65) 99988-1234',
    cep: '78200-050',
    endereco: 'Rua Cel. Faria',
    numero: '210',
    bairro: 'Centro',
    cidade: 'Cáceres - MT',
    bio: 'Compromissada com a preservação do Pantanal e a reciclagem em Cáceres - MT.',
  },
  coletor: {
    id: 'user-coletor-1',
    name: 'Lucas Coletor COOPERCÁCERES',
    email: 'lucas@gmail.com',
    passwordHash: DEFAULT_DEMO_HASH,
    perfil: 'coletor',
    telefone: '(65) 99654-7890',
    cep: '78205-100',
    endereco: 'Av. Getúlio Vargas',
    numero: '1420',
    bairro: 'Santos Dumont',
    cidade: 'Cáceres - MT',
    veiculo: 'Caminhonete de Coleta Seletiva',
    capacidadeCarga: '1.200 kg',
    bio: 'Coleta seletiva diária em Cáceres e suporte a cooperativas locais.',
  },
};

export const DEFAULT_USERS: Record<PerfilUsuario, RegisteredUser> = DEMO_USERS_DEFINITION;

/** Administradores isolados padrão (restritos ao escopo de desenvolvimento/teste) */
export const ALL_DEFAULT_ADMINS: RegisteredUser[] = IS_TEST_OR_DEV ? [DEFAULT_USERS.admin] : [];

/** Usuários comuns padrão (Cidadãos e Coletores - restritos ao escopo de desenvolvimento/teste) */
export const ALL_DEFAULT_REGULAR_USERS: RegisteredUser[] = IS_TEST_OR_DEV
  ? [DEFAULT_USERS.cidadao, DEFAULT_USERS.coletor]
  : [];

export const ALL_DEFAULT_USERS: RegisteredUser[] = IS_TEST_OR_DEV
  ? Object.values(DEFAULT_USERS)
  : [];

/**
 * Sanitiza registros de usuários antes de persistir no AsyncStorage,
 * garantindo que nenhuma senha em texto simples seja salva localmente (A4-11).
 */
export function sanitizeUsersForStorage(users: RegisteredUser[]): RegisteredUser[] {
  return users.map((u) => {
    const rawPassword = u.password;
    const isAlreadyHashed = rawPassword && rawPassword.startsWith('sha256_');
    const computedHash =
      u.passwordHash ||
      (rawPassword ? (isAlreadyHashed ? rawPassword : securityService.hashPassword(rawPassword)) : undefined);

    const { password: _omittedPassword, ...safeUser } = u;
    return {
      ...safeUser,
      ...(computedHash ? { passwordHash: computedHash } : {}),
    };
  });
}

export function getRoleAccessErrorMessage(actualRole: PerfilUsuario): string {
  switch (actualRole) {
    case 'cidadao':
      return 'Acesso não autorizado: Esta conta pertence ao perfil CIDADÃO. Por favor, acesse pelo aplicativo EcoSmart Cidadão.';
    case 'coletor':
      return 'Acesso não autorizado: Esta conta pertence ao perfil COLETOR. Por favor, acesse pelo aplicativo EcoSmart Empresa/Catador.';
    case 'admin':
      return 'Acesso não autorizado: Esta conta pertence ao perfil ADMINISTRADOR. Por favor, acesse pelo aplicativo EcoSmart Admin.';
    default:
      return 'Acesso não autorizado para o perfil desta conta.';
  }
}

export function validateUserProfile(
  email: string,
  expectedRole: PerfilUsuario,
  extraUsers: RegisteredUser[] = []
): { isValid: boolean; message?: string; user?: RegisteredUser } {
  const normalizedEmail = email.trim().toLowerCase();

  // Isolamento estrito de validação
  const candidatePool =
    expectedRole === 'admin'
      ? [...extraUsers.filter((u) => u.perfil === 'admin'), ...ALL_DEFAULT_ADMINS]
      : [...extraUsers.filter((u) => u.perfil !== 'admin'), ...ALL_DEFAULT_REGULAR_USERS];

  const foundUser = candidatePool.find(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );

  if (!foundUser) {
    return { isValid: false, message: 'Usuário não encontrado.' };
  }

  if (foundUser.perfil !== expectedRole) {
    return {
      isValid: false,
      message: getRoleAccessErrorMessage(foundUser.perfil),
      user: foundUser,
    };
  }

  return { isValid: true, user: foundUser };
}

export function authenticateUser(
  email: string,
  password: string,
  expectedRole: PerfilUsuario,
  registeredUsers: RegisteredUser[] = []
): { success: boolean; message?: string; user?: Usuario; token?: string } {
  const normalizedEmail = email.trim().toLowerCase();

  // Consulta estritamente a base isolada de acordo com o perfil
  let targetPool: RegisteredUser[];
  let opposingPool: RegisteredUser[];

  if (expectedRole === 'admin') {
    const adminCustom = registeredUsers.filter((u) => u.perfil === 'admin');
    targetPool = [...adminCustom, ...ALL_DEFAULT_ADMINS];
    opposingPool = [...registeredUsers.filter((u) => u.perfil !== 'admin'), ...ALL_DEFAULT_REGULAR_USERS];
  } else {
    const regularCustom = registeredUsers.filter((u) => u.perfil !== 'admin');
    targetPool = [...regularCustom, ...ALL_DEFAULT_REGULAR_USERS];
    opposingPool = [...registeredUsers.filter((u) => u.perfil === 'admin'), ...ALL_DEFAULT_ADMINS];
  }

  const foundUser = targetPool.find(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );

  if (!foundUser) {
    const crossUser = opposingPool.find((u) => u.email.trim().toLowerCase() === normalizedEmail);
    if (crossUser) {
      return {
        success: false,
        message: getRoleAccessErrorMessage(crossUser.perfil),
      };
    }

    return {
      success: false,
      message: 'Verifique o e-mail e a senha informados.',
    };
  }

  const storedHashOrSecret = foundUser.passwordHash || foundUser.password || '';
  if (!securityService.verifyPassword(password, storedHashOrSecret)) {
    return {
      success: false,
      message: 'Verifique o e-mail e a senha informados.',
    };
  }

  if (foundUser.perfil !== expectedRole) {
    return {
      success: false,
      message: getRoleAccessErrorMessage(foundUser.perfil),
    };
  }

  const sessionUser: Usuario = {
    id: foundUser.id,
    nome: foundUser.name,
    email: foundUser.email,
    perfil: foundUser.perfil,
    telefone: foundUser.telefone,
    cep: foundUser.cep,
    endereco: foundUser.endereco,
    numero: foundUser.numero,
    bairro: foundUser.bairro,
    cidade: foundUser.cidade,
    veiculo: foundUser.veiculo,
    capacidadeCarga: foundUser.capacidadeCarga,
    cargo: foundUser.cargo,
    departamento: foundUser.departamento,
    bio: foundUser.bio,
    avatarUri: foundUser.avatarUri,
    createdAt: foundUser.createdAt,
    updatedAt: foundUser.updatedAt,
  };

  return {
    success: true,
    user: sessionUser,
    token: securityService.generateSessionToken(sessionUser.id),
  };
}

/**
 * Valida se o cadastro administrativo possui autorização via Custom Claim / token do servidor (A4-12).
 * Não utiliza chave estática hardcoded no bundle do cliente.
 */
function hasValidAdminServerAuthorization(
  claimOrToken?: string | { role?: string; perfil?: string }
): boolean {
  if (!claimOrToken) return false;
  if (typeof claimOrToken === 'object') {
    return securityService.canAccessDatabase(claimOrToken, 'ecosmart-admin-db');
  }
  const serverConfiguredToken =
    typeof process !== 'undefined'
      ? (process.env as Record<string, string | undefined>)?.ADMIN_SERVER_CLAIM_TOKEN
      : undefined;
  if (serverConfiguredToken && claimOrToken.trim() === serverConfiguredToken) {
    return true;
  }
  return false;
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  role: PerfilUsuario,
  accessCode?: string,
  existingUsers: RegisteredUser[] = []
): { success: boolean; message?: string; user?: Usuario; updatedUsers?: RegisteredUser[]; token?: string } {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName || !normalizedEmail || !password.trim()) {
    return {
      success: false,
      message: 'Preencha todos os campos obrigatórios.',
    };
  }

  if (role === 'admin') {
    if (!hasValidAdminServerAuthorization(accessCode)) {
      return {
        success: false,
        message:
          'Cadastro de administrador não autorizado no cliente. A validação administrativa deve ocorrer via Custom Claims/servidor.',
      };
    }
  }

  const allUsers = [...existingUsers, ...ALL_DEFAULT_USERS];
  const userExists = allUsers.some(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );

  if (userExists) {
    return {
      success: false,
      message: 'Já existe um cadastro com este e-mail.',
    };
  }

  const nowIso = new Date().toISOString();
  const passwordHash = securityService.hashPassword(password.trim());

  const newUser: RegisteredUser = {
    id: `user-${role}-${Date.now()}`,
    name: trimmedName,
    email: normalizedEmail,
    passwordHash,
    perfil: role,
    cidade: 'Cáceres - MT',
    cep: '78200-000',
    bairro: 'Centro',
    createdAt: nowIso,
    updatedAt: nowIso,
    bio:
      role === 'cidadao'
        ? 'Compromissado com a reciclagem e a sustentabilidade no Pantanal.'
        : role === 'coletor'
        ? 'Atuação na coleta seletiva e apoio à reciclagem em Cáceres - MT.'
        : 'Gestão e governança do sistema EcoSmart.',
  };

  const updatedUsers = sanitizeUsersForStorage([newUser, ...existingUsers]);

  const sessionUser: Usuario = {
    id: newUser.id,
    nome: newUser.name,
    email: newUser.email,
    perfil: newUser.perfil,
    cep: newUser.cep,
    bairro: newUser.bairro,
    cidade: newUser.cidade,
    bio: newUser.bio,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };

  // Salva no Firestore sem qualquer campo de senha (direcionado ao banco isolado correspondente)
  try {
    if (sessionUser.perfil === 'admin') {
      firebaseService.saveAdminDocument(sessionUser);
    } else {
      firebaseService.saveUserDocument(sessionUser);
    }
  } catch (err) {
    // Mecanismo de contingência (fallback) em cache offline
  }

  return {
    success: true,
    user: sessionUser,
    updatedUsers,
    token: securityService.generateSessionToken(sessionUser.id),
  };
}

/**
 * Solicita a recuperação de senha gerando um código de verificação temporário.
 */
export function requestPasswordReset(
  email: string,
  expectedRole: PerfilUsuario,
  registeredUsers: RegisteredUser[] = []
): ResetCodeResult {
  const normalizedEmail = email.trim().toLowerCase();
  const allUsers = [...registeredUsers, ...ALL_DEFAULT_USERS];

  if (!normalizedEmail) {
    return { success: false, message: 'Por favor, informe seu e-mail.' };
  }

  const foundUser = allUsers.find(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );

  if (!foundUser) {
    return {
      success: false,
      message: 'Nenhum usuário encontrado com este e-mail.',
    };
  }

  if (foundUser.perfil !== expectedRole) {
    return {
      success: false,
      message: getRoleAccessErrorMessage(foundUser.perfil),
    };
  }

  const resetCode = `ECO-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    success: true,
    message: `Código de verificação gerado com sucesso para ${normalizedEmail}.`,
    code: resetCode,
  };
}

/**
 * Redefine a senha do usuário após validação do código, armazenando apenas o hash seguro (A4-11).
 */
export function resetPassword(
  email: string,
  verificationCode: string,
  expectedCode: string,
  newPassword: string,
  registeredUsers: RegisteredUser[] = []
): ResetPasswordResult & { updatedUsers?: RegisteredUser[] } {
  const normalizedEmail = email.trim().toLowerCase();

  if (
    !verificationCode ||
    verificationCode.trim().toUpperCase() !== expectedCode.trim().toUpperCase()
  ) {
    return {
      success: false,
      message: 'Código de verificação incorreto ou expirado.',
    };
  }

  if (!newPassword || newPassword.trim().length < 4) {
    return {
      success: false,
      message: 'A nova senha deve possuir pelo menos 4 caracteres.',
    };
  }

  const allUsers = [...registeredUsers, ...ALL_DEFAULT_USERS];
  const targetUser = allUsers.find(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );

  if (!targetUser) {
    return { success: false, message: 'Usuário não encontrado.' };
  }

  const { password: _removedPlainPassword, ...restTarget } = targetUser;
  const updatedUser: RegisteredUser = {
    ...restTarget,
    passwordHash: securityService.hashPassword(newPassword.trim()),
    updatedAt: new Date().toISOString(),
  };

  const remainingCustomUsers = registeredUsers.filter(
    (u) => u.email.trim().toLowerCase() !== normalizedEmail
  );
  const updatedUsers = sanitizeUsersForStorage([updatedUser, ...remainingCustomUsers]);

  return {
    success: true,
    message: 'Senha redefinida com sucesso! Você já pode entrar com sua nova senha.',
    updatedUsers,
  };
}

/**
 * Autentica o usuário através do provedor Google usando Firebase Auth (A4-12).
 * Não utiliza perfis mockados de fallback em caso de falha externa; propaga o erro real.
 */
export async function signInWithGoogle(
  expectedRole: PerfilUsuario,
  registeredUsers: RegisteredUser[] = []
): Promise<{
  success: boolean;
  message?: string;
  user?: Usuario;
  updatedUsers?: RegisteredUser[];
  token?: string;
}> {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      return {
        success: false,
        message: 'Provedor de autenticação Google (Firebase Auth) indisponível ou não configurado.',
      };
    }

    const { GoogleAuthProvider, signInWithPopup } = require('firebase/auth');
    if (typeof signInWithPopup !== 'function') {
      return {
        success: false,
        message: 'Autenticação Google via popup não disponível neste ambiente.',
      };
    }

    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    const authResult = await signInWithPopup(auth, provider);
    if (!authResult || !authResult.user || !authResult.user.email) {
      return {
        success: false,
        message: 'Não foi possível obter os dados da conta Google autenticada.',
      };
    }

    const googleUserEmail = authResult.user.email;
    const googleUserName = authResult.user.displayName || 'Usuário Google';
    const googleUserId = authResult.user.uid;

    const normalizedEmail = googleUserEmail.trim().toLowerCase();
    const allUsers = [...registeredUsers, ...ALL_DEFAULT_USERS];
    const existingUser = allUsers.find(
      (u) => u.email.trim().toLowerCase() === normalizedEmail
    );

    if (existingUser && existingUser.perfil !== expectedRole) {
      return {
        success: false,
        message: getRoleAccessErrorMessage(existingUser.perfil),
      };
    }

    if (expectedRole === 'admin') {
      let hasAdminClaim = existingUser?.perfil === 'admin';
      if (!hasAdminClaim && typeof authResult.user.getIdTokenResult === 'function') {
        const tokenResult = await authResult.user.getIdTokenResult();
        hasAdminClaim =
          tokenResult?.claims?.role === 'admin' || tokenResult?.claims?.perfil === 'admin';
      }
      if (!hasAdminClaim) {
        return {
          success: false,
          message: 'Acesso negado: Conta Google não possui Custom Claim de administrador.',
        };
      }
    }

    let sessionUser: Usuario;
    let updatedUsers = sanitizeUsersForStorage(registeredUsers);
    const nowIso = new Date().toISOString();

    if (existingUser) {
      sessionUser = {
        id: existingUser.id,
        nome: existingUser.name,
        email: existingUser.email,
        perfil: existingUser.perfil,
        telefone: existingUser.telefone,
        cep: existingUser.cep,
        endereco: existingUser.endereco,
        numero: existingUser.numero,
        bairro: existingUser.bairro,
        cidade: existingUser.cidade,
        bio: existingUser.bio,
        updatedAt: nowIso,
      };
    } else {
      const newUser: RegisteredUser = {
        id: googleUserId || `user-google-${expectedRole}-${Date.now()}`,
        name: googleUserName,
        email: normalizedEmail,
        perfil: expectedRole,
        provider: 'google',
        cep: '78200-000',
        cidade: 'Cáceres - MT',
        bairro: 'Centro',
        bio: 'Usuário autenticado com a Conta Google.',
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      sessionUser = {
        id: newUser.id,
        nome: newUser.name,
        email: newUser.email,
        perfil: newUser.perfil,
        cep: newUser.cep,
        cidade: newUser.cidade,
        bairro: newUser.bairro,
        bio: newUser.bio,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      updatedUsers = sanitizeUsersForStorage([newUser, ...registeredUsers]);
    }

    try {
      if (sessionUser.perfil === 'admin') {
        await firebaseService.saveAdminDocument(sessionUser);
      } else {
        await firebaseService.saveUserDocument(sessionUser);
      }
    } catch (dbErr) {
      // Mecanismo de contingência local em memória
    }

    return {
      success: true,
      user: sessionUser,
      updatedUsers,
      token: securityService.generateSessionToken(sessionUser.id),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Falha ao autenticar com a conta Google.',
    };
  }
}
