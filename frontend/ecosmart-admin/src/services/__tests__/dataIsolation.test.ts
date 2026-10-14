jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { crossAppSync } from '../crossAppSync';
import { firebaseService } from '../firebaseService';
import { authenticateUser } from '../authService';
import { securityService } from '../securityService';
import { DiscardItem, Usuario } from '../../models';

describe('Data Isolation and Leakage Prevention (Isolamento de Dados por Usuário e Perfil)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    firebaseService.clearLocalMemoryCache();
  });

  describe('Frontend Service Isolation', () => {
    it('crossAppSync.fetchDiscardsByUser deve retornar lista vazia para usuário novo sem dados', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as any);

      const discards = await crossAppSync.fetchDiscardsByUser('user-novo-123', 'novo@gmail.com');
      expect(discards).toEqual([]);
    });

    it('firebaseService.getDiscardsByCitizen deve filtrar apenas os itens pertencentes ao usuário/e-mail', async () => {
      const itemA: DiscardItem = {
        id: 'disc-user-a',
        type: 'Metal',
        quantity: '3 latas',
        observation: '',
        date: '29/08/2026',
        status: 'Pendente',
      };

      await firebaseService.saveCitizenDiscard(itemA, {
        id: 'user-a-uid',
        email: 'user.a@gmail.com',
        nome: 'Usuário A',
      });

      const userADiscards = await firebaseService.getDiscardsByCitizen('user.a@gmail.com', 'user-a-uid');
      expect(userADiscards.length).toBe(1);
      expect(userADiscards[0].id).toBe('disc-user-a');

      // Novo usuário não deve ver os descartes do Usuário A
      const userBDiscards = await firebaseService.getDiscardsByCitizen('novo.usuario@gmail.com', 'user-b-uid');
      expect(userBDiscards.length).toBe(0);
    });

    it('firebaseService.clearLocalMemoryCache deve resetar os descartes da memória no logout', async () => {
      const item: DiscardItem = {
        id: 'disc-cache-test',
        type: 'Vidro',
        quantity: '2 garrafas',
        observation: '',
        date: '29/08/2026',
        status: 'Pendente',
      };

      await firebaseService.saveCitizenDiscard(item, {
        id: 'user-cache-1',
        email: 'cache@gmail.com',
      });

      expect((await firebaseService.getDiscards()).length).toBeGreaterThan(0);

      // Simula logout / limpeza
      firebaseService.clearLocalMemoryCache();

      const discardsAfter = await firebaseService.getDiscardsByCitizen('cache@gmail.com', 'user-cache-1');
      expect(discardsAfter.length).toBe(0);
    });
  });

  describe('Isolamento Estrito de Dados do Administrador (ecosmart-admin-db)', () => {
    it('firebaseService.saveUserDocument deve recusar persistência de administrador na coleção comum', async () => {
      const adminAttempt: Usuario = {
        id: 'fake-admin-in-common',
        nome: 'Invasor Admin',
        email: 'invasor@admin.com',
        perfil: 'admin',
      };

      await expect(firebaseService.saveUserDocument(adminAttempt)).rejects.toThrow(
        /Violação de Isolamento de Dados/
      );
    });

    it('firebaseService.getUserByEmail não deve retornar dados de administradores da coleção padrão', async () => {
      // Cria usuário comum
      const cidadao: Usuario = {
        id: 'user-cidadao-real',
        nome: 'Maria Real',
        email: 'maria.real@gmail.com',
        perfil: 'cidadao',
      };
      await firebaseService.saveUserDocument(cidadao);

      // Usuário comum é retornado
      const foundCidadao = await firebaseService.getUserByEmail('maria.real@gmail.com');
      expect(foundCidadao).not.toBeNull();
      expect(foundCidadao?.email).toBe('maria.real@gmail.com');

      // E-mail de admin não deve ser encontrado na coleção comum (default)
      const foundAdminInUsers = await firebaseService.getUserByEmail('joao@gmail.com');
      expect(foundAdminInUsers).toBeNull();
    });

    it('usuário comum autenticado não deve conseguir ler documentos de administradores', () => {
      const cidadaoToken = { role: 'cidadao', perfil: 'cidadao' };

      // Tentativa de acessar coleção de administradores
      const podeAcessarAdmins = securityService.canAccessCollection(cidadaoToken, 'admins');
      expect(podeAcessarAdmins).toBe(false);

      // Tentativa de acessar banco de dados isolado ecosmart-admin-db
      const podeAcessarBancoAdmin = securityService.canAccessDatabase(cidadaoToken, 'ecosmart-admin-db');
      expect(podeAcessarBancoAdmin).toBe(false);

      // Usuário comum é bloqueado com exceção de segurança
      expect(() => securityService.assertAdminPrivilege(cidadaoToken)).toThrow('Acesso Negado');
    });

    it('authService.authenticateUser para perfil cidadão ou coletor nunca retorna dados do administrador', () => {
      // Tentativa de logar com dados de admin no app cidadão
      const authAttempt = authenticateUser('joao@gmail.com', '1234', 'cidadao');
      expect(authAttempt.success).toBe(false);
      expect(authAttempt.user).toBeUndefined();
      expect(authAttempt.message).toContain('Acesso não autorizado');
    });

    it('administrador deve ser gravado e recuperado com sucesso exclusivamente via saveAdminDocument e getAdminByEmail', async () => {
      const novoAdmin: Usuario = {
        id: 'admin-sec-1',
        nome: 'Gestor de Segurança',
        email: 'gestor.seguranca@ecosmart.com',
        perfil: 'admin',
        cargo: 'Auditor Chefe',
      };

      await firebaseService.saveAdminDocument(novoAdmin);

      // Recupera com sucesso da base isolada
      const adminConsultado = await firebaseService.getAdminByEmail('gestor.seguranca@ecosmart.com');
      expect(adminConsultado).not.toBeNull();
      expect(adminConsultado?.email).toBe('gestor.seguranca@ecosmart.com');
      expect(adminConsultado?.cargo).toBe('Auditor Chefe');

      // Permanece invisível na base comum de usuários
      const adminNaBaseComum = await firebaseService.getUserByEmail('gestor.seguranca@ecosmart.com');
      expect(adminNaBaseComum).toBeNull();
    });
  });
});
