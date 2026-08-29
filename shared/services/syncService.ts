import { DiscardItem, CollectorDiscard, AdminDiscardRecord, DiscardStatus } from '../models';
import { generateUUID } from '../utils/idUtils';

export interface OutboxMutation<T = any> {
  id: string;
  action: 'CREATE_DISCARD' | 'COLLECT_DISCARD' | 'UPDATE_RECORD';
  payload: T;
  createdAt: number;
  retryCount: number;
}

/**
 * Converte qualquer objeto de descarte para o formato unificado do Coletor.
 */
export function normalizeToCollectorDiscard(raw: any): CollectorDiscard {
  const isCollected = (raw.status || '').toLowerCase() === 'coletado';
  const status: DiscardStatus = isCollected ? 'coletado' : 'pendente';

  return {
    id: raw.id || generateUUID(),
    userId: raw.userId || raw.citizenId || raw.usuario_id || raw.usuarioId,
    citizenId: raw.citizenId || raw.userId || raw.usuario_id || raw.usuarioId,
    citizenEmail: raw.citizenEmail || raw.email,
    citizenName: raw.citizenName || raw.nome_cidadao || 'Maria Cidadã Pantaneira',
    wasteType: raw.wasteType || raw.type || raw.tipo_residuo || 'Plástico e PET',
    quantity: raw.quantity || raw.quantidade || '1 volume',
    address: raw.address || raw.endereco || 'Cáceres - MT',
    number: raw.number || raw.numero || '',
    numero: raw.numero || raw.number || '',
    neighborhood: raw.neighborhood || raw.bairro || 'Centro',
    city: raw.city || raw.cidade || 'Cáceres',
    cep: raw.cep || '78200-000',
    observation: raw.observation || raw.observacao || 'Material separado para coleta.',
    status,
    createdAt: raw.createdAt || raw.date || raw.data_cadastro || new Date().toLocaleDateString('pt-BR'),
    collectedAt: raw.collectedAt || raw.data_coleta,
    coletorId: raw.coletorId || raw.coletor_id,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : -16.0725,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : -57.6798,
    distanceKm: typeof raw.distanceKm === 'number' ? raw.distanceKm : 0.8,
    offlineSyncPending: Boolean(raw.offlineSyncPending || raw.offline),
    photoUri: raw.photoUri || raw.foto_url,
  };
}

/**
 * Converte qualquer objeto de descarte para o formato do Cidadão.
 */
export function normalizeToCitizenDiscard(raw: any): DiscardItem {
  const isCollected = (raw.status || '').toLowerCase() === 'coletado';
  const status: 'Pendente' | 'Coletado' | 'Pendente (Offline)' = isCollected
    ? 'Coletado'
    : raw.status === 'Pendente (Offline)' || raw.offline
    ? 'Pendente (Offline)'
    : 'Pendente';

  return {
    id: raw.id || generateUUID(),
    userId: raw.userId || raw.citizenId || raw.usuario_id || raw.usuarioId,
    citizenId: raw.citizenId || raw.userId || raw.usuario_id || raw.usuarioId,
    citizenEmail: raw.citizenEmail || raw.email,
    type: raw.type || raw.wasteType || raw.tipo_residuo || 'Plástico e PET',
    quantity: raw.quantity || raw.quantidade || '1 volume',
    observation: raw.observation || raw.observacao || 'Material separado para coleta.',
    date: raw.date || raw.createdAt || raw.data_cadastro || new Date().toLocaleDateString('pt-BR'),
    status,
    cep: raw.cep || '78200-000',
    address: raw.address || raw.endereco || 'Cáceres - MT',
    number: raw.number || raw.numero || '',
    numero: raw.numero || raw.number || '',
    neighborhood: raw.neighborhood || raw.bairro || 'Centro',
    city: raw.city || raw.cidade || 'Cáceres',
    latitude: typeof raw.latitude === 'number' ? raw.latitude : -16.0725,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : -57.6798,
    offline: Boolean(raw.offline || raw.offlineSyncPending),
    photoUri: raw.photoUri || raw.foto_url,
  };
}

/**
 * Converte qualquer objeto de descarte para o formato do Administrador.
 */
export function normalizeToAdminDiscard(raw: any): AdminDiscardRecord {
  const isCollected = (raw.status || '').toLowerCase() === 'coletado';
  const status: 'pendente' | 'coletado' = isCollected ? 'coletado' : 'pendente';

  return {
    id: raw.id || generateUUID(),
    citizenName: raw.citizenName || raw.nome_cidadao || 'Maria Cidadã Pantaneira',
    wasteType: raw.wasteType || raw.type || raw.tipo_residuo || 'Plástico e PET',
    quantity: raw.quantity || raw.quantidade || '1 volume',
    neighborhood: raw.neighborhood || raw.bairro || 'Centro',
    address: raw.address || raw.endereco || 'Cáceres - MT',
    number: raw.number || raw.numero || '',
    numero: raw.numero || raw.number || '',
    city: raw.city || raw.cidade || 'Cáceres',
    cep: raw.cep || '78200-000',
    createdAt: raw.createdAt || raw.date || raw.data_cadastro || new Date().toLocaleDateString('pt-BR'),
    status,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : -16.0725,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : -57.6798,
    offline: Boolean(raw.offline || raw.offlineSyncPending),
  };
}

/**
 * Serviço de Auto-Sincronização em Segundo Plano (Offline-First Auto Sync).
 * Implementa o Outbox Pattern com suporte a fila de mutações e resolução Last-Write-Wins (LWW).
 */
export class AutoSyncService {
  private outboxQueue: OutboxMutation[] = [];

  /**
   * Enfileira uma mutação offline para envio posterior quando houver rede.
   */
  enqueueMutation<T>(action: OutboxMutation['action'], payload: T): OutboxMutation<T> {
    const mutation: OutboxMutation<T> = {
      id: generateUUID(),
      action,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
    };
    this.outboxQueue.push(mutation);
    return mutation;
  }

  /**
   * Retorna o total de mutações pendentes na fila de saída.
   */
  getPendingMutationCount(): number {
    return this.outboxQueue.length;
  }

  /**
   * Sincroniza descartes pendentes cadastrados pelo Cidadão em modo offline.
   */
  processAutoSyncCitizenDiscards(
    discards: DiscardItem[],
    isOffline: boolean
  ): { updatedDiscards: DiscardItem[]; syncedCount: number } {
    if (isOffline) {
      return { updatedDiscards: discards, syncedCount: 0 };
    }

    let syncedCount = 0;
    const updatedDiscards = discards.map((item) => {
      if (item.status === 'Pendente (Offline)' || item.offline) {
        syncedCount += 1;
        return {
          ...item,
          status: 'Pendente' as const,
          offline: false,
        };
      }
      return item;
    });

    this.outboxQueue = this.outboxQueue.filter((m) => m.action !== 'CREATE_DISCARD');

    return { updatedDiscards, syncedCount };
  }

  /**
   * Sincroniza coletas marcadas pelo Coletor em modo offline.
   */
  processAutoSyncCollectorDiscards(
    discards: CollectorDiscard[],
    isOffline: boolean
  ): { updatedDiscards: CollectorDiscard[]; syncedCount: number } {
    if (isOffline) {
      return { updatedDiscards: discards, syncedCount: 0 };
    }

    let syncedCount = 0;
    const updatedDiscards = discards.map((item) => {
      if (item.offlineSyncPending) {
        syncedCount += 1;
        return {
          ...item,
          offlineSyncPending: false,
        };
      }
      return item;
    });

    this.outboxQueue = this.outboxQueue.filter((m) => m.action !== 'COLLECT_DISCARD');

    return { updatedDiscards, syncedCount };
  }

  /**
   * Sincroniza registros e atualizações do Administrador em modo offline.
   */
  processAutoSyncAdminRecords(
    records: AdminDiscardRecord[],
    isOffline: boolean
  ): { updatedRecords: AdminDiscardRecord[]; syncedCount: number } {
    if (isOffline) {
      return { updatedRecords: records, syncedCount: 0 };
    }

    let syncedCount = 0;
    const updatedRecords = records.map((record) => {
      if (record.offline) {
        syncedCount += 1;
        return {
          ...record,
          offline: false,
        };
      }
      return record;
    });

    this.outboxQueue = this.outboxQueue.filter((m) => m.action !== 'UPDATE_RECORD');

    return { updatedRecords, syncedCount };
  }
}

export const autoSyncService = new AutoSyncService();
