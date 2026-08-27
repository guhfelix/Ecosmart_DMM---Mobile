import { AutoSyncService } from '../syncService';
import { DiscardItem, CollectorDiscard, AdminDiscardRecord } from '../../models';

describe('syncService (AutoSyncService - Outbox Pattern & LWW)', () => {
  let syncService: AutoSyncService;

  beforeEach(() => {
    syncService = new AutoSyncService();
  });

  describe('enqueueMutation e getPendingMutationCount', () => {
    it('deve enfileirar mutações offline e atualizar a contagem', () => {
      expect(syncService.getPendingMutationCount()).toBe(0);

      syncService.enqueueMutation('CREATE_DISCARD', { id: '1' });
      syncService.enqueueMutation('COLLECT_DISCARD', { id: '2' });

      expect(syncService.getPendingMutationCount()).toBe(2);
    });
  });

  describe('processAutoSyncCitizenDiscards', () => {
    const mockCitizenDiscards: DiscardItem[] = [
      {
        id: '1',
        type: 'Plástico',
        quantity: '2 sacolas',
        observation: '',
        date: '24/08/2026',
        status: 'Pendente (Offline)',
        offline: true,
      },
      {
        id: '2',
        type: 'Vidro',
        quantity: '1 caixa',
        observation: '',
        date: '24/08/2026',
        status: 'Coletado',
        offline: false,
      },
    ];

    it('não deve sincronizar quando estiver offline', () => {
      const result = syncService.processAutoSyncCitizenDiscards(mockCitizenDiscards, true);
      expect(result.syncedCount).toBe(0);
      expect(result.updatedDiscards).toEqual(mockCitizenDiscards);
    });

    it('deve sincronizar registros pendentes para status Pendente online', () => {
      syncService.enqueueMutation('CREATE_DISCARD', { id: '1' });
      const result = syncService.processAutoSyncCitizenDiscards(mockCitizenDiscards, false);

      expect(result.syncedCount).toBe(1);
      expect(result.updatedDiscards[0].status).toBe('Pendente');
      expect(result.updatedDiscards[0].offline).toBe(false);
      expect(result.updatedDiscards[1].status).toBe('Coletado');
      expect(syncService.getPendingMutationCount()).toBe(0);
    });
  });

  describe('processAutoSyncCollectorDiscards', () => {
    const mockCollectorDiscards: CollectorDiscard[] = [
      {
        id: 'col-1',
        citizenName: 'Cidadão 1',
        wasteType: 'Metal e Alumínio',
        quantity: '10 kg',
        address: 'Rua 1',
        neighborhood: 'Centro',
        createdAt: '24/08/2026',
        status: 'coletado',
        offlineSyncPending: true,
      },
      {
        id: 'col-2',
        citizenName: 'Cidadão 2',
        wasteType: 'Papel e Papelão',
        quantity: '5 kg',
        address: 'Rua 2',
        neighborhood: 'Cavalhada',
        createdAt: '24/08/2026',
        status: 'coletado',
        offlineSyncPending: false,
      },
    ];

    it('não deve sincronizar se estiver offline', () => {
      const result = syncService.processAutoSyncCollectorDiscards(mockCollectorDiscards, true);
      expect(result.syncedCount).toBe(0);
    });

    it('deve sincronizar coletas pendentes quando online', () => {
      syncService.enqueueMutation('COLLECT_DISCARD', { id: 'col-1' });
      const result = syncService.processAutoSyncCollectorDiscards(mockCollectorDiscards, false);

      expect(result.syncedCount).toBe(1);
      expect(result.updatedDiscards[0].offlineSyncPending).toBe(false);
      expect(syncService.getPendingMutationCount()).toBe(0);
    });
  });

  describe('processAutoSyncAdminRecords', () => {
    const mockAdminRecords: AdminDiscardRecord[] = [
      {
        id: 'adm-1',
        citizenName: 'Carlos',
        wasteType: 'Plástico',
        quantity: '1',
        neighborhood: 'Centro',
        createdAt: '24/08/2026',
        status: 'pendente',
        offline: true,
      },
    ];

    it('deve sincronizar registros administrativos quando online', () => {
      syncService.enqueueMutation('UPDATE_RECORD', { id: 'adm-1' });
      const result = syncService.processAutoSyncAdminRecords(mockAdminRecords, false);

      expect(result.syncedCount).toBe(1);
      expect(result.updatedRecords[0].offline).toBe(false);
      expect(syncService.getPendingMutationCount()).toBe(0);
    });

    it('não deve sincronizar registros administrativos se offline', () => {
      const result = syncService.processAutoSyncAdminRecords(mockAdminRecords, true);
      expect(result.syncedCount).toBe(0);
    });
  });
});
