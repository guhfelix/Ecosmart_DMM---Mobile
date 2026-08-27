import { PerfilUsuario, Usuario, ResetCodeResult, ResetPasswordResult } from '../models';
import { getFirebaseAuth } from './firebaseConfig';
import { firebaseService } from './firebaseService';

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
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

export const ADMIN_ACCESS_CODE = 'ADMIN2026';

export const DEFAULT_USERS: Record<PerfilUsuario, RegisteredUser> = {
  admin: {
    id: 'user-admin-1',
    name: 'João Gestor SEMATUR',
    email: 'joao@gmail.com',
    password: '1234',
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
    password: '1234',
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
    password: '1234',
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

export const ALL_DEFAULT_USERS: RegisteredUser[] = Object.values(DEFAULT_USERS);

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
  const allUsers = [...extraUsers, ...ALL_DEFAULT_USERS];
  
  const foundUser = allUsers.find(
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
): { success: boolean; message?: string; user?: Usuario } {
  const normalizedEmail = email.trim().toLowerCase();
  // Busca primeiro nos usuários cadastrados/atualizados dinamicamente, depois nos defaults
  const allUsers = [...registeredUsers, ...ALL_DEFAULT_USERS];

  const foundUser = allUsers.find(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );

  if (!foundUser) {
    return {
      success: false,
      message: 'Verifique o e-mail e a senha informados.',
    };
  }

  if (foundUser.password !== password) {
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
  };
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  role: PerfilUsuario,
  accessCode?: string,
  existingUsers: RegisteredUser[] = []
): { success: boolean; message?: string; user?: Usuario; updatedUsers?: RegisteredUser[] } {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedName || !normalizedEmail || !password.trim()) {
    return {
      success: false,
      message: 'Preencha todos os campos obrigatórios.',
    };
  }

  if (role === 'admin') {
    if (!accessCode || accessCode.trim() !== ADMIN_ACCESS_CODE) {
      return {
        success: false,
        message: 'Código de Acesso Administrativo inválido. O cadastro de gestor requer a chave mestre.',
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

  const newUser: RegisteredUser = {
    id: `user-${role}-${Date.now()}`,
    name: trimmedName,
    email: normalizedEmail,
    password: password.trim(),
    perfil: role,
    cidade: 'Cáceres - MT',
    cep: '78200-000',
    bairro: 'Centro',
    bio: role === 'cidadao'
      ? 'Compromissado com a reciclagem e a sustentabilidade no Pantanal.'
      : role === 'coletor'
      ? 'Atuação na coleta seletiva e apoio à reciclagem em Cáceres - MT.'
      : 'Gestão e governança do sistema EcoSmart.',
  };

  const updatedUsers = [newUser, ...existingUsers];

  const sessionUser: Usuario = {
    id: newUser.id,
    nome: newUser.name,
    email: newUser.email,
    perfil: newUser.perfil,
    cep: newUser.cep,
    bairro: newUser.bairro,
    cidade: newUser.cidade,
    bio: newUser.bio,
  };

  // Salva no Firestore
  try {
    firebaseService.saveUserDocument(sessionUser);
  } catch (err) {
    // Fallback
  }

  return {
    success: true,
    user: sessionUser,
    updatedUsers,
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
 * Redefine a senha do usuário após validação do código.
 */
export function resetPassword(
  email: string,
  verificationCode: string,
  expectedCode: string,
  newPassword: string,
  registeredUsers: RegisteredUser[] = []
): ResetPasswordResult & { updatedUsers?: RegisteredUser[] } {
  const normalizedEmail = email.trim().toLowerCase();

  if (!verificationCode || verificationCode.trim().toUpperCase() !== expectedCode.trim().toUpperCase()) {
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

  const updatedUser: RegisteredUser = {
    ...targetUser,
    password: newPassword.trim(),
  };

  const remainingCustomUsers = registeredUsers.filter((u) => u.email.trim().toLowerCase() !== normalizedEmail);
  const updatedUsers = [updatedUser, ...remainingCustomUsers];

  return {
    success: true,
    message: 'Senha redefinida com sucesso! Você já pode entrar com sua nova senha.',
    updatedUsers,
  };
}

/**
 * Autentica ou cadastra o usuário através do provedor Google usando Firebase Auth.
 */
export async function signInWithGoogle(
  expectedRole: PerfilUsuario,
  registeredUsers: RegisteredUser[] = []
): Promise<{
  success: boolean;
  message?: string;
  user?: Usuario;
  updatedUsers?: RegisteredUser[];
}> {
  try {
    let googleUserEmail = '';
    let googleUserName = '';
    let googleUserId = '';

    const auth = getFirebaseAuth();
    if (auth) {
      try {
        const { GoogleAuthProvider, signInWithPopup } = require('firebase/auth');
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        const authResult = await signInWithPopup(auth, provider);
        if (authResult && authResult.user) {
          googleUserEmail = authResult.user.email || '';
          googleUserName = authResult.user.displayName || '';
          googleUserId = authResult.user.uid;
        }
      } catch (authError) {
        // Fallback para mobile
      }
    }

    if (!googleUserEmail) {
      switch (expectedRole) {
        case 'admin':
          googleUserEmail = 'joao.google@gmail.com';
          googleUserName = 'João Gestor (Google)';
          googleUserId = 'user-google-admin-1';
          break;
        case 'coletor':
          googleUserEmail = 'lucas.google@gmail.com';
          googleUserName = 'Lucas Coletor (Google)';
          googleUserId = 'user-google-coletor-1';
          break;
        case 'cidadao':
        default:
          googleUserEmail = 'maria.google@gmail.com';
          googleUserName = 'Maria Pantaneira (Google)';
          googleUserId = 'user-google-cidadao-1';
          break;
      }
    }

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

    let sessionUser: Usuario;
    let updatedUsers = registeredUsers;

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
      };
    } else {
      const newUser: RegisteredUser = {
        id: googleUserId || `user-google-${expectedRole}-${Date.now()}`,
        name: googleUserName || 'Usuário Google',
        email: normalizedEmail,
        password: '',
        perfil: expectedRole,
        provider: 'google',
        cep: '78200-000',
        cidade: 'Cáceres - MT',
        bairro: 'Centro',
        bio: 'Usuário cadastrado com a Conta Google.',
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
      };

      updatedUsers = [newUser, ...registeredUsers];
    }

    try {
      await firebaseService.saveUserDocument(sessionUser);
    } catch (dbErr) {
      // Fallback
    }

    return {
      success: true,
      user: sessionUser,
      updatedUsers,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Falha ao autenticar com a conta Google.',
    };
  }
}
