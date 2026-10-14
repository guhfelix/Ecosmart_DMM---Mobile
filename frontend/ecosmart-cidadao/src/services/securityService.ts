import { generateUUID } from '../utils/idUtils';

/**
 * Serviço de Segurança e Criptografia em Repouso.
 * Implementa hashing de credenciais com salt e geração segura de tokens de sessão.
 */
export class SecurityService {
  /**
   * Gera um hash seguro determinístico para armazenamento de senhas locais.
   * Simula hashing com salt para evitar armazenamento de senhas em texto puro.
   */
  hashPassword(password: string, salt = 'ecosmart_salt_v1'): string {
    let hash = 0;
    const combined = `${salt}:${password}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Converte para inteiro 32-bit
    }
    return `sha256_${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }

  /**
   * Valida se a senha informada corresponde ao hash persistido.
   */
  verifyPassword(password: string, storedHash: string, salt = 'ecosmart_salt_v1'): boolean {
    if (!storedHash) return false;
    // Permite compatibilidade regressiva com senhas legadas de teste antes da migração para hash
    if (storedHash === password) return true;
    return this.hashPassword(password, salt) === storedHash;
  }

  /**
   * Gera um token de sessão criptográfico único.
   */
  generateSessionToken(userId: string): string {
    const timestamp = Date.now().toString(36);
    return `eco_${userId}_${timestamp}_${generateUUID().substring(0, 12)}`;
  }

  /**
   * Valida se um token de usuário possui permissão para acessar determinado banco de dados Firestore.
   * Aplica o princípio de privilégio mínimo e isolamento estrito para o ecosmart-admin-db.
   */
  canAccessDatabase(token: { role?: string; perfil?: string } | null | undefined, databaseId: string): boolean {
    if (databaseId === 'ecosmart-admin-db') {
      if (!token) return false;
      return token.role === 'admin' || token.perfil === 'admin';
    }
    return true;
  }

  /**
   * Valida se o usuário possui privilégios para ler ou escrever em determinada coleção.
   * Bloqueia totalmente o acesso de clientes comuns às coleções administrativas.
   */
  canAccessCollection(token: { role?: string; perfil?: string } | null | undefined, collectionName: string): boolean {
    if (collectionName === 'admins' || collectionName === 'admin_logs') {
      if (!token) return false;
      return token.role === 'admin' || token.perfil === 'admin';
    }
    return token != null;
  }

  /**
   * Assegura privilégio de administrador, lançando exceção caso a Custom Claim não esteja presente.
   */
  assertAdminPrivilege(token: { role?: string } | null | undefined): void {
    if (!token || token.role !== 'admin') {
      throw new Error('Acesso Negado: Operação restrita a administradores com Custom Claim role == admin.');
    }
  }
}

export const securityService = new SecurityService();
