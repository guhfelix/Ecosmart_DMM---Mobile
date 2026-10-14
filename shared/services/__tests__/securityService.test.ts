import { securityService } from '../securityService';

describe('securityService (Criptografia e Sessões)', () => {
  it('deve gerar hash determinístico para a mesma senha e salt', () => {
    const hash1 = securityService.hashPassword('1234');
    const hash2 = securityService.hashPassword('1234');
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^sha256_[0-9a-f]{8}$/);
  });

  it('deve gerar hashes distintos para senhas diferentes', () => {
    const hashA = securityService.hashPassword('senha1');
    const hashB = securityService.hashPassword('senha2');
    expect(hashA).not.toBe(hashB);
  });

  it('deve verificar senha corretamente contra hash gerado', () => {
    const hash = securityService.hashPassword('minhaSenhaForte');
    expect(securityService.verifyPassword('minhaSenhaForte', hash)).toBe(true);
    expect(securityService.verifyPassword('senhaIncorreta', hash)).toBe(false);
  });

  it('deve manter compatibilidade com senhas legadas em texto puro', () => {
    expect(securityService.verifyPassword('1234', '1234')).toBe(true);
  });

  it('deve retornar false se storedHash for vazio', () => {
    expect(securityService.verifyPassword('1234', '')).toBe(false);
  });

  it('deve gerar tokens de sessão únicos com prefixo do usuário', () => {
    const token = securityService.generateSessionToken('user-123');
    expect(token).toMatch(/^eco_user-123_/);
  });

  describe('Isolamento de Banco de Dados e Privilégio Mínimo (ecosmart-admin-db)', () => {
    it('deve impedir que usuários comuns (cidadão/coletor) acessem ecosmart-admin-db', () => {
      const cidadaoToken = { role: 'cidadao', perfil: 'cidadao' };
      const coletorToken = { role: 'coletor', perfil: 'coletor' };
      const anonToken = null;

      expect(securityService.canAccessDatabase(cidadaoToken, 'ecosmart-admin-db')).toBe(false);
      expect(securityService.canAccessDatabase(coletorToken, 'ecosmart-admin-db')).toBe(false);
      expect(securityService.canAccessDatabase(anonToken, 'ecosmart-admin-db')).toBe(false);
    });

    it('deve permitir acesso ao banco de dados administrativo apenas para tokens de administrador', () => {
      const adminToken = { role: 'admin', perfil: 'admin' };
      expect(securityService.canAccessDatabase(adminToken, 'ecosmart-admin-db')).toBe(true);
    });

    it('deve permitir acesso ao banco padrão ((default)) para usuários autenticados', () => {
      const cidadaoToken = { role: 'cidadao', perfil: 'cidadao' };
      expect(securityService.canAccessDatabase(cidadaoToken, '(default)')).toBe(true);
    });

    it('deve bloquear clientes comuns de acessar as coleções admins e admin_logs', () => {
      const cidadaoToken = { role: 'cidadao', perfil: 'cidadao' };
      const coletorToken = { role: 'coletor', perfil: 'coletor' };

      expect(securityService.canAccessCollection(cidadaoToken, 'admins')).toBe(false);
      expect(securityService.canAccessCollection(coletorToken, 'admins')).toBe(false);
      expect(securityService.canAccessCollection(cidadaoToken, 'admin_logs')).toBe(false);
      expect(securityService.canAccessCollection(coletorToken, 'admin_logs')).toBe(false);
    });

    it('deve permitir que administradores acessem as coleções exclusivas de admins', () => {
      const adminToken = { role: 'admin', perfil: 'admin' };
      expect(securityService.canAccessCollection(adminToken, 'admins')).toBe(true);
      expect(securityService.canAccessCollection(adminToken, 'admin_logs')).toBe(true);
    });

    it('assertAdminPrivilege deve lançar exceção para usuários comuns e passar para admin', () => {
      const cidadaoToken = { role: 'cidadao' };
      const adminToken = { role: 'admin' };

      expect(() => securityService.assertAdminPrivilege(cidadaoToken)).toThrow('Acesso Negado');
      expect(() => securityService.assertAdminPrivilege(null)).toThrow('Acesso Negado');
      expect(() => securityService.assertAdminPrivilege(adminToken)).not.toThrow();
    });
  });
});
