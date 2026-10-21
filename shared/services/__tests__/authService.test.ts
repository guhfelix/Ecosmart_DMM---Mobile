import {
  authenticateUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  signInWithGoogle,
  sanitizeUsersForStorage,
  ALL_DEFAULT_USERS,
  RegisteredUser,
} from '../authService';
import * as firebaseConfig from '../firebaseConfig';

describe('authService (Autenticação Segura, Hash Local, RBAC e Google Auth - A4-11 / A4-12)', () => {
  let registeredUsers: RegisteredUser[];

  beforeEach(() => {
    jest.restoreAllMocks();
    registeredUsers = [...ALL_DEFAULT_USERS];
  });

  describe('Proteção de Senha (A4-11)', () => {
    it('não deve armazenar senhas em texto simples nos usuários padrão ou recém-cadastrados', () => {
      for (const u of ALL_DEFAULT_USERS) {
        expect(u.password).toBeUndefined();
        expect(u.passwordHash).toMatch(/^sha256_/);
      }

      const reg = registerUser('Novo Cidadão', 'novo@cidadao.com', 'minhaSenhaSecreta', 'cidadao');
      expect(reg.success).toBe(true);
      const savedUser = reg.updatedUsers?.find((u) => u.email === 'novo@cidadao.com');
      expect(savedUser?.password).toBeUndefined();
      expect(savedUser?.passwordHash).toMatch(/^sha256_/);
      expect(savedUser?.passwordHash).not.toBe('minhaSenhaSecreta');
    });

    it('sanitizeUsersForStorage deve remover qualquer campo password em texto simples', () => {
      const legacyUsers: RegisteredUser[] = [
        {
          id: 'u-legacy',
          name: 'Legado',
          email: 'legado@gmail.com',
          password: '1234',
          perfil: 'cidadao',
        },
      ];
      const sanitized = sanitizeUsersForStorage(legacyUsers);
      expect(sanitized[0].password).toBeUndefined();
      expect(sanitized[0].passwordHash).toMatch(/^sha256_/);
    });
  });

  describe('authenticateUser', () => {
    it('deve realizar login com sucesso para usuário existente e perfil correto usando hash seguro', () => {
      const result = authenticateUser('maria@gmail.com', '1234', 'cidadao', registeredUsers);
      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('maria@gmail.com');
      expect(result.user?.perfil).toBe('cidadao');
      expect(result.token).toMatch(/^eco_user-cidadao-1_/);
    });

    it('deve falhar para senha incorreta', () => {
      const result = authenticateUser('maria@gmail.com', 'senhaErrada', 'cidadao', registeredUsers);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Verifique o e-mail e a senha');
    });

    it('deve bloquear login de perfil cruzado com mensagem instrutiva', () => {
      const result = authenticateUser('maria@gmail.com', '1234', 'coletor', registeredUsers);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Acesso não autorizado');
      expect(result.message).toContain('CIDADÃO');
    });

    it('deve falhar para e-mail não cadastrado', () => {
      const result = authenticateUser('inexistente@gmail.com', '1234', 'cidadao', registeredUsers);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Verifique o e-mail e a senha');
    });
  });

  describe('registerUser e bloqueio de chave administrativa no cliente (A4-12)', () => {
    it('deve cadastrar um novo cidadão com sucesso', () => {
      const result = registerUser(
        'Ana Silva',
        'ana@gmail.com',
        '1234',
        'cidadao',
        undefined,
        registeredUsers
      );
      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('ana@gmail.com');
      expect(result.user?.perfil).toBe('cidadao');
    });

    it('deve impedir cadastro duplicado com mesmo e-mail', () => {
      const result = registerUser(
        'Outra Maria',
        'maria@gmail.com',
        '1234',
        'cidadao',
        undefined,
        registeredUsers
      );
      expect(result.success).toBe(false);
      expect(result.message).toContain('Já existe um cadastro');
    });

    it('deve bloquear cadastro de administrador por código estático no cliente e exigir validação de servidor/claims (A4-12)', () => {
      const resultSemClaim = registerUser(
        'Novo Admin',
        'admin.novo@gmail.com',
        '1234',
        'admin',
        'ADMIN2026',
        registeredUsers
      );
      expect(resultSemClaim.success).toBe(false);
      expect(resultSemClaim.message).toContain('Custom Claims/servidor');

      // Simula validação autorizada via token de servidor configurado em variável de ambiente do backend
      (process.env as Record<string, string | undefined>).ADMIN_SERVER_CLAIM_TOKEN = 'SERVER_VERIFIED_CLAIM_2026';
      const resultComClaim = registerUser(
        'Novo Admin',
        'admin.novo@gmail.com',
        '1234',
        'admin',
        'SERVER_VERIFIED_CLAIM_2026',
        registeredUsers
      );
      delete (process.env as Record<string, string | undefined>).ADMIN_SERVER_CLAIM_TOKEN;

      expect(resultComClaim.success).toBe(true);
      expect(resultComClaim.user?.perfil).toBe('admin');
    });
  });

  describe('requestPasswordReset e resetPassword', () => {
    it('deve gerar código de recuperação para e-mail cadastrado', () => {
      const result = requestPasswordReset('maria@gmail.com', 'cidadao', registeredUsers);
      expect(result.success).toBe(true);
      expect(result.code).toMatch(/^ECO-\d{4}$/);
    });

    it('deve falhar recuperação para e-mail inexistente', () => {
      const result = requestPasswordReset('naocadastrado@gmail.com', 'cidadao', registeredUsers);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Nenhum usuário encontrado');
    });

    it('deve redefinir a senha com sucesso gravando apenas passwordHash', () => {
      const resetReq = requestPasswordReset('maria@gmail.com', 'cidadao', registeredUsers);
      const code = resetReq.code!;

      const resetResult = resetPassword(
        'maria@gmail.com',
        code,
        code,
        'novaSenha123',
        registeredUsers
      );
      expect(resetResult.success).toBe(true);

      const mariaUpdated = resetResult.updatedUsers?.find((u) => u.email === 'maria@gmail.com');
      expect(mariaUpdated?.password).toBeUndefined();
      expect(mariaUpdated?.passwordHash).toMatch(/^sha256_/);

      const loginResult = authenticateUser(
        'maria@gmail.com',
        'novaSenha123',
        'cidadao',
        resetResult.updatedUsers!
      );
      expect(loginResult.success).toBe(true);
    });

    it('deve falhar redefinição para token incorreto', () => {
      const resetReq = requestPasswordReset('maria@gmail.com', 'cidadao', registeredUsers);
      const correctCode = resetReq.code!;

      const result = resetPassword(
        'maria@gmail.com',
        'ECO-9999',
        correctCode,
        'novaSenha123',
        registeredUsers
      );
      expect(result.success).toBe(false);
      expect(result.message).toContain('Código de verificação incorreto');
    });
  });

  describe('signInWithGoogle sem fallback fictício (A4-12)', () => {
    it('deve propagar erro real e NÃO autenticar perfil mockado quando o provedor Google falhar ou estiver indisponível', async () => {
      jest.spyOn(firebaseConfig, 'getFirebaseAuth').mockReturnValue(null);

      const result = await signInWithGoogle('cidadao', registeredUsers);
      expect(result.success).toBe(false);
      expect(result.user).toBeUndefined();
      expect(result.message).toBeDefined();
    });
  });
});
