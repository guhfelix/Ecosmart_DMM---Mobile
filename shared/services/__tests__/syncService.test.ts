jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AutoSyncService,
  reconcileCitizenDiscards,
  normalizeToIsoDate,
} from '../syncService';
import { DiscardItem, CollectorDiscard, AdminDiscardRecord } from '../../models';
import { getOutboxStorageKey } from '../storageKeys';

describe('syncService (Outbox Persistente, Sincronização Real, Tombstones e Conciliação - A4-03 a A4-06)', () => {
  let syncService: AutoSyncService;

  beforeEach(async () => {
    await AsyncStorage.clear();
    syncService = new AutoSyncService();
  });

  describe('Fila Offline Persistente no AsyncStorage (A4-04)', () => {
    it('deve enfileirar mutações offline, persistir no AsyncStorage e recarregar ao reabrir o app', async () => {
      expect(syncService.getPendingMutationCount()).toBe(0);

      syncService.enqueueMutation('CREATE', { id: 'disc-1', type: 'Plástico' }, 'user-1', 'disc-1');
      syncService.enqueueMutation('UPDATE', { id: 'disc-2', type: 'Vidro' }, 'user-1', 'disc-2');

      expect(syncService.getPendingMutationCount()).toBe(2);

      // Verifica persistência real no AsyncStorage
      const storedRaw = await AsyncStorage.getItem(getOutboxStorageKey('user-1'));
      expect(storedRaw).toBeTruthy();
      const parsed = JSON.parse(storedRaw!);
      expect(parsed.length).toBe(2);
      expect(parsed[0]).toEqual(
        expect.objectContaining({
          action: 'CREATE',
          discardId: 'disc-1',
          retryCount: 0,
        })
      );

      // Simula fechamento e reabertura do aplicativo com nova instância de serviço
      const restartedService = new AutoSyncService();
      await restartedService.loadOutboxQueue('user-1');
      expect(restartedService.getPendingMutationCount()).toBe(2);
    });
  });

  describe('Sincronização Real e Fim do Falso Sucesso (A4-03 e A4-07)', () => {
    const mockCitizenDiscards: DiscardItem[] = [
      {
        id: '1',
        type: 'Plástico',
        quantity: 2,
        unit: 'saco',
        observation: '',
        date: '2026-08-24T12:00:00.000Z',
        status: 'Pendente (Offline)',
        offline: true,
        syncPending: true,
      },
      {
        id: '2',
        type: 'Vidro',
        quantity: 1,
        unit: 'unidade',
        observation: '',
        date: '2026-08-24T12:00:00.000Z',
        status: 'Coletado',
        offline: false,
        syncPending: false,
      },
    ];

    it('não deve sincronizar quando estiver offline', async () => {
      const result = await syncService.processAutoSyncCitizenDiscards(mockCitizenDiscards, true);
      expect(result.syncedCount).toBe(0);
      expect(result.updatedDiscards).toEqual(mockCitizenDiscards);
    });

    it('deve manter syncPending: true e item na fila quando o servidor falhar (sem falso sucesso)', async () => {
      syncService.enqueueMutation('CREATE', mockCitizenDiscards[0], 'user-1', '1');

      const result = await syncService.processAutoSyncCitizenDiscards(
        mockCitizenDiscards,
        false,
        {
          userId: 'user-1',
          syncExecutor: async () => false, // Simula falha de rede/servidor
        }
      );

      expect(result.syncedCount).toBe(0);
      expect(result.failedCount).toBe(1);
      expect(result.updatedDiscards[0].status).toBe('Pendente (Offline)');
      expect(result.updatedDiscards[0].offline).toBe(true);
      expect(result.updatedDiscards[0].syncPending).toBe(true);
      expect(syncService.getPendingMutationCount()).toBe(1);
      expect(syncService.getOutboxQueue()[0].retryCount).toBe(1);
    });

    it('deve alterar para Pendente e limpar fila somente após confirmação inequívoca do servidor', async () => {
      syncService.enqueueMutation('CREATE', mockCitizenDiscards[0], 'user-1', '1');

      const result = await syncService.processAutoSyncCitizenDiscards(
        mockCitizenDiscards,
        false,
        {
          userId: 'user-1',
          syncExecutor: async () => true, // Confirmação real da API/Firestore
        }
      );

      expect(result.syncedCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(result.updatedDiscards[0].status).toBe('Pendente');
      expect(result.updatedDiscards[0].offline).toBe(false);
      expect(result.updatedDiscards[0].syncPending).toBe(false);
      expect(syncService.getPendingMutationCount()).toBe(0);
    });
  });

  describe('Tombstones Offline e Conciliação Sem Sobrescrita (A4-05 e A4-06)', () => {
    it('não deve reimportar um item excluído localmente (tombstone) durante a conciliação', () => {
      syncService.enqueueMutation('DELETE', { id: 'disc-deleted' }, 'user-1', 'disc-deleted');

      const localItems: DiscardItem[] = [];
      const remoteItems: DiscardItem[] = [
        {
          id: 'disc-deleted',
          type: 'Metal',
          quantity: 3,
          unit: 'kg',
          observation: '',
          date: '2026-08-25T10:00:00.000Z',
          status: 'Pendente',
        },
        {
          id: 'disc-active',
          type: 'Vidro',
          quantity: 5,
          unit: 'unidade',
          observation: '',
          date: '2026-08-25T11:00:00.000Z',
          status: 'Pendente',
        },
      ];

      const reconciled = reconcileCitizenDiscards(
        localItems,
        remoteItems,
        syncService.getOutboxQueue(),
        syncService.getTombstoneSet()
      );

      expect(reconciled.length).toBe(1);
      expect(reconciled[0].id).toBe('disc-active');
    });

    it('deve dar precedência às edições locais pendentes sobre versões remotas antigas', () => {
      const localEdited: DiscardItem = {
        id: 'disc-edit-1',
        type: 'Papel e Papelão',
        quantity: 10,
        unit: 'kg',
        observation: 'Editado offline',
        date: '2026-08-25T10:00:00.000Z',
        updatedAt: '2026-08-25T12:00:00.000Z',
        status: 'Pendente (Offline)',
        offline: true,
        syncPending: true,
      };

      syncService.enqueueMutation('UPDATE', localEdited, 'user-1', 'disc-edit-1');

      const remoteOld: DiscardItem = {
        id: 'disc-edit-1',
        type: 'Plástico',
        quantity: 2,
        unit: 'saco',
        observation: 'Versão antiga no servidor',
        date: '2026-08-25T10:00:00.000Z',
        updatedAt: '2026-08-25T10:00:00.000Z',
        status: 'Pendente',
        offline: false,
      };

      const reconciled = reconcileCitizenDiscards(
        [localEdited],
        [remoteOld],
        syncService.getOutboxQueue(),
        syncService.getTombstoneSet()
      );

      expect(reconciled.length).toBe(1);
      expect(reconciled[0].type).toBe('Papel e Papelão');
      expect(reconciled[0].quantity).toBe(10);
      expect(reconciled[0].observation).toBe('Editado offline');
      expect(reconciled[0].syncPending).toBe(true);
    });

    it('deve reconstruir descartes criados offline a partir da fila outbox mesmo que localItems esteja vazio (Zero Data Loss)', () => {
      const offlineCreated: DiscardItem = {
        id: 'disc-crash-recovery',
        type: 'Eletrônico',
        quantity: 2,
        unit: 'unidade',
        observation: 'Salvo na fila antes de fechar app',
        date: '2026-08-26T09:00:00.000Z',
        status: 'Pendente (Offline)',
        offline: true,
        syncPending: true,
      };

      syncService.enqueueMutation('CREATE', offlineCreated, 'user-1', 'disc-crash-recovery');

      const reconciled = reconcileCitizenDiscards(
        [],
        [],
        syncService.getOutboxQueue(),
        syncService.getTombstoneSet()
      );

      expect(reconciled.length).toBe(1);
      expect(reconciled[0].id).toBe('disc-crash-recovery');
      expect(reconciled[0].offline).toBe(true);
      expect(reconciled[0].syncPending).toBe(true);
      expect(reconciled[0].status).toBe('Pendente (Offline)');
    });

    it('deve preservar flags offline quando itens remotos vierem do cache local pendente', () => {
      const cachedOfflineItem: DiscardItem = {
        id: 'disc-cached-offline',
        type: 'Vidro',
        quantity: 4,
        unit: 'kg',
        observation: 'Cache local retornado no fallback',
        date: '2026-08-26T10:00:00.000Z',
        status: 'Pendente (Offline)',
        offline: true,
        syncPending: true,
      };

      const reconciled = reconcileCitizenDiscards(
        [],
        [cachedOfflineItem],
        [],
        new Set()
      );

      expect(reconciled.length).toBe(1);
      expect(reconciled[0].offline).toBe(true);
      expect(reconciled[0].syncPending).toBe(true);
      expect(reconciled[0].status).toBe('Pendente (Offline)');
    });
  });

  describe('Normalização ISO 8601 e Coletor/Admin (A4-16)', () => {
    it('deve converter datas legadas dd/mm/yyyy para ISO 8601 UTC', () => {
      const iso = normalizeToIsoDate('24/08/2026');
      expect(iso).toMatch(/^2026-08-24T/);
    });

    it('deve sincronizar coletas pendentes do Coletor quando online', () => {
      const mockCollectorDiscards: CollectorDiscard[] = [
        {
          id: 'col-1',
          citizenName: 'Cidadão 1',
          wasteType: 'Metal e Alumínio',
          quantity: 10,
          unit: 'kg',
          address: 'Rua 1',
          neighborhood: 'Centro',
          createdAt: '2026-08-24T12:00:00.000Z',
          status: 'coletado',
          offlineSyncPending: true,
        },
      ];
      syncService.enqueueMutation('COLLECT_DISCARD', { id: 'col-1' });
      const result = syncService.processAutoSyncCollectorDiscards(mockCollectorDiscards, false);
      expect(result.syncedCount).toBe(1);
      expect(result.updatedDiscards[0].offlineSyncPending).toBe(false);
    });

    it('deve sincronizar registros administrativos quando online', () => {
      const mockAdminRecords: AdminDiscardRecord[] = [
        {
          id: 'adm-1',
          citizenName: 'Carlos',
          wasteType: 'Plástico',
          quantity: 1,
          neighborhood: 'Centro',
          createdAt: '2026-08-24T12:00:00.000Z',
          status: 'pendente',
          offline: true,
        },
      ];
      syncService.enqueueMutation('UPDATE_RECORD', { id: 'adm-1' });
      const result = syncService.processAutoSyncAdminRecords(mockAdminRecords, false);
      expect(result.syncedCount).toBe(1);
      expect(result.updatedRecords[0].offline).toBe(false);
    });
  });
});
