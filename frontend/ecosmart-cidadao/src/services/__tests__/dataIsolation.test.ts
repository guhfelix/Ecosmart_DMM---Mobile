jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { crossAppSync } from '../crossAppSync';
import { firebaseService } from '../firebaseService';
import { DiscardItem } from '../../models';

describe('Data Isolation and Leakage Prevention (Isolamento de Dados por Usuário)', () => {
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
});
