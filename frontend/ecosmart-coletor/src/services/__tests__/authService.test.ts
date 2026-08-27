import {
  authenticateUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  signInWithGoogle,
  ALL_DEFAULT_USERS,
  RegisteredUser,
} from '../authService';

describe('authService (Autenticação, RBAC e Google Auth)', () => {
  let registeredUsers: RegisteredUser[];

  beforeEach(() => {
    registeredUsers = [...ALL_DEFAULT_USERS];
  });

  describe('authenticateUser', () => {
    it('deve realizar login com sucesso para usuário existente e perfil correto', () => {
      const result = authenticateUser('maria@gmail.com', '1234', 'cidadao', registeredUsers);
      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('maria@gmail.com');
      expect(result.user?.perfil).toBe('cidadao');
    });

    it('deve falhar para senha incorreta', () => {
      const result = authenticateUser('maria@gmail.com', 'senhaErrada', 'cidadao', registeredUsers);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Verifique o e-mail e a senha');
    });

    it('deve bloquear login de perfil cruzado com mensagem instrutiva', () => {
      // Maria (cidadã) tentando entrar como coletor
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

  describe('registerUser', () => {
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
      expect(result.updatedUsers?.length).toBe(registeredUsers.length + 1);
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

    it('deve exigir código mestre ADMIN2026 para cadastro de administrador', () => {
      const resultSemCodigo = registerUser(
        'Novo Admin',
        'admin.novo@gmail.com',
        '1234',
        'admin',
        'CODIGO_ERRADO',
        registeredUsers
      );
      expect(resultSemCodigo.success).toBe(false);
      expect(resultSemCodigo.message).toContain('Código de Acesso Administrativo inválido');

      const resultComCodigo = registerUser(
        'Novo Admin',
        'admin.novo@gmail.com',
        '1234',
        'admin',
        'ADMIN2026',
        registeredUsers
      );
      expect(resultComCodigo.success).toBe(true);
      expect(resultComCodigo.user?.perfil).toBe('admin');
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

    it('deve redefinir a senha com sucesso para token e e-mail válidos', () => {
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

      // Verifica se autenticação com a nova senha funciona
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

  describe('signInWithGoogle', () => {
    it('deve autenticar ou registrar usuário Google com perfil correspondente', async () => {
      const result = await signInWithGoogle('cidadao', registeredUsers);
      expect(result.success).toBe(true);
      expect(result.user?.perfil).toBe('cidadao');
    });

    it('deve suportar login Google para coletor e admin', async () => {
      const resultColetor = await signInWithGoogle('coletor', registeredUsers);
      expect(resultColetor.success).toBe(true);
      expect(resultColetor.user?.perfil).toBe('coletor');

      const resultAdmin = await signInWithGoogle('admin', registeredUsers);
      expect(resultAdmin.success).toBe(true);
      expect(resultAdmin.user?.perfil).toBe('admin');
    });
  });
});
