import { syncService } from '../services/syncService';

/**
 * Definição de Rotas de Sincronização e Outbox Offline.
 * Endpoints:
 * - POST /api/sync/discards
 * - POST /api/sync/batch
 */
export const syncRoutes = {
  syncDiscards: async (localDiscards: any[]) => {
    return syncService.syncOfflineDiscards(localDiscards);
  },
};
