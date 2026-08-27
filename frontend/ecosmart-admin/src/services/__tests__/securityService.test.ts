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
});
