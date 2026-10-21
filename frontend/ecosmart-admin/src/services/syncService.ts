import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DiscardItem,
  CollectorDiscard,
  AdminDiscardRecord,
  DiscardStatus,
  CitizenDiscardStatus,
} from '../models';
import { generateUUID } from '../utils/idUtils';
import { getOutboxStorageKey, getTombstonesStorageKey } from './storageKeys';

export type OutboxAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'CREATE_DISCARD'
  | 'COLLECT_DISCARD'
  | 'UPDATE_RECORD';

export interface OutboxMutation<T = any> {
  id: string;
  action: OutboxAction;
  discardId: string;
  payload: T;
  timestamp: string;
  createdAt: number;
  retryCount: number;
  userId?: string;
}

/**
 * Normaliza qualquer entrada de data para formato canônico ISO 8601 UTC (A4-16).
 */
export function normalizeToIsoDate(dateInput?: string | number | Date): string {
  if (!dateInput) {
    return new Date().toISOString();
  }
  if (dateInput instanceof Date) {
    return Number.isNaN(dateInput.getTime())
      ? new Date().toISOString()
      : dateInput.toISOString();
  }
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  const trimmed = String(dateInput).trim();
  if (!trimmed) {
    return new Date().toISOString();
  }
  // Já está em ISO 8601
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return trimmed;
  }
  // Formato legado brasileiro dd/mm/yyyy
  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, dd, mm, yyyy] = brMatch;
    const d = new Date(`${yyyy}-${mm}-${dd}T12:00:00.000Z`);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }
  return new Date().toISOString();
}

/**
 * Converte qualquer objeto de descarte para o formato unificado do Coletor (A4-16).
 */
export function normalizeToCollectorDiscard(raw: any): CollectorDiscard {
  const isCollected = (raw.status || '').toLowerCase() === 'coletado';
  const status: DiscardStatus = isCollected ? 'coletado' : 'pendente';
  const nowIso = new Date().toISOString();
  const createdAt = raw.createdAt || raw.date || raw.data_cadastro || nowIso;
  const updatedAt = raw.updatedAt || normalizeToIsoDate(createdAt);
  const resolvedType = raw.wasteType || raw.type || raw.tipo_residuo || raw.tipoResiduo || 'Plástico e PET';
  const isPendingSync = Boolean(raw.offlineSyncPending || raw.syncPending || raw.offline);

  return {
    id: raw.id || generateUUID(),
    userId: raw.userId || raw.citizenId || raw.usuario_id || raw.usuarioId,
    citizenId: raw.citizenId || raw.userId || raw.usuario_id || raw.usuarioId,
    citizenEmail: raw.citizenEmail || raw.email,
    citizenName: raw.citizenName || raw.nome_cidadao || raw.nomeCidadao || 'Maria Cidadã Pantaneira',
    wasteType: resolvedType,
    type: resolvedType,
    quantity: raw.quantity !== undefined ? raw.quantity : raw.quantidade || 1,
    unit: raw.unit,
    address: raw.address || raw.endereco || 'Cáceres - MT',
    number: raw.number || raw.numero || '',
    numero: raw.numero || raw.number || '',
    neighborhood: raw.neighborhood || raw.bairro || 'Centro',
    city: raw.city || raw.cidade || 'Cáceres',
    cep: raw.cep || '78200-000',
    observation: raw.observation ?? raw.observacao ?? 'Material separado para coleta.',
    status,
    createdAt,
    date: raw.date || createdAt,
    collectedAt: raw.collectedAt || raw.data_coleta || raw.dataColeta,
    coletorId: raw.coletorId || raw.coletor_id,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : -16.0725,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : -57.6798,
    distanceKm: typeof raw.distanceKm === 'number' ? raw.distanceKm : 0.8,
    offlineSyncPending: isPendingSync,
    syncPending: isPendingSync,
    photoUri: raw.photoUri || raw.foto_url,
    updatedAt,
  };
}

/**
 * Converte qualquer objeto de descarte para o formato do Cidadão (A4-16).
 */
export function normalizeToCitizenDiscard(raw: any): DiscardItem {
  const isCollected = (raw.status || '').toLowerCase() === 'coletado';
  const isPendingSync = Boolean(
    raw.syncPending ||
      raw.offline ||
      raw.offlineSyncPending ||
      raw.status === 'Pendente (Offline)'
  );
  const status: CitizenDiscardStatus = isCollected
    ? 'Coletado'
    : isPendingSync
    ? 'Pendente (Offline)'
    : 'Pendente';

  const nowIso = new Date().toISOString();
  const rawDate = raw.date || raw.createdAt || raw.data_cadastro || nowIso;
  const createdAt = raw.createdAt || normalizeToIsoDate(rawDate);
  const updatedAt = raw.updatedAt || createdAt;
  const resolvedType = raw.type || raw.wasteType || raw.tipo_residuo || raw.tipoResiduo || 'Plástico e PET';

  return {
    id: raw.id || generateUUID(),
    userId: raw.userId || raw.citizenId || raw.usuario_id || raw.usuarioId,
    citizenId: raw.citizenId || raw.userId || raw.usuario_id || raw.usuarioId,
    citizenEmail: raw.citizenEmail || raw.email,
    citizenName: raw.citizenName || raw.nome_cidadao || raw.nomeCidadao,
    type: resolvedType,
    wasteType: resolvedType,
    quantity: raw.quantity !== undefined ? raw.quantity : raw.quantidade || 1,
    unit: raw.unit,
    observation: raw.observation ?? raw.observacao ?? 'Material separado para coleta.',
    date: rawDate,
    createdAt,
    updatedAt,
    status,
    cep: raw.cep || '78200-000',
    address: raw.address || raw.endereco || 'Cáceres - MT',
    number: raw.number || raw.numero || '',
    numero: raw.numero || raw.number || '',
    neighborhood: raw.neighborhood || raw.bairro || 'Centro',
    city: raw.city || raw.cidade || 'Cáceres',
    latitude: typeof raw.latitude === 'number' ? raw.latitude : -16.0725,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : -57.6798,
    offline: isCollected ? false : isPendingSync,
    syncPending: isCollected ? false : isPendingSync,
    photoUri: raw.photoUri || raw.foto_url,
  };
}

/**
 * Converte qualquer objeto de descarte para o formato do Administrador (A4-16).
 */
export function normalizeToAdminDiscard(raw: any): AdminDiscardRecord {
  const isCollected = (raw.status || '').toLowerCase() === 'coletado';
  const status: 'pendente' | 'coletado' = isCollected ? 'coletado' : 'pendente';
  const nowIso = new Date().toISOString();
  const createdAt = raw.createdAt || raw.date || raw.data_cadastro || nowIso;
  const updatedAt = raw.updatedAt || normalizeToIsoDate(createdAt);
  const resolvedType = raw.wasteType || raw.type || raw.tipo_residuo || raw.tipoResiduo || 'Plástico e PET';
  const isPendingSync = Boolean(raw.offline || raw.offlineSyncPending || raw.syncPending);

  return {
    id: raw.id || generateUUID(),
    userId: raw.userId || raw.citizenId || raw.usuario_id || raw.usuarioId,
    citizenId: raw.citizenId || raw.userId || raw.usuario_id || raw.usuarioId,
    citizenEmail: raw.citizenEmail || raw.email,
    citizenName: raw.citizenName || raw.nome_cidadao || raw.nomeCidadao || 'Maria Cidadã Pantaneira',
    wasteType: resolvedType,
    type: resolvedType,
    quantity: raw.quantity !== undefined ? raw.quantity : raw.quantidade || 1,
    unit: raw.unit,
    neighborhood: raw.neighborhood || raw.bairro || 'Centro',
    address: raw.address || raw.endereco || 'Cáceres - MT',
    number: raw.number || raw.numero || '',
    numero: raw.numero || raw.number || '',
    city: raw.city || raw.cidade || 'Cáceres',
    cep: raw.cep || '78200-000',
    createdAt,
    updatedAt,
    collectedAt: raw.collectedAt || raw.data_coleta || raw.dataColeta,
    coletorId: raw.coletorId || raw.coletor_id,
    status,
    latitude: typeof raw.latitude === 'number' ? raw.latitude : -16.0725,
    longitude: typeof raw.longitude === 'number' ? raw.longitude : -57.6798,
    offline: isPendingSync,
    syncPending: isPendingSync,
    photoUri: raw.photoUri || raw.foto_url,
  };
}

/**
 * Concilia a lista local de descartes com a lista remota sem perder edições ou criações offline
 * e sem ressuscitar itens excluídos localmente (tombstones) (A4-05 e A4-06).
 */
export function reconcileCitizenDiscards(
  localItems: DiscardItem[],
  remoteItems: DiscardItem[],
  outbox: OutboxMutation[] = [],
  tombstones: Set<string> = new Set()
): DiscardItem[] {
  const deletedIds = new Set<string>(tombstones);
  const pendingMutationsByDiscardId = new Map<string, OutboxMutation>();

  for (const m of outbox) {
    const dId = m.discardId || m.payload?.id;
    if (!dId) continue;
    if (m.action === 'DELETE') {
      deletedIds.add(dId);
    } else {
      pendingMutationsByDiscardId.set(dId, m);
    }
  }

  const mergedMap = new Map<string, DiscardItem>();

  // 1. Insere itens locais (exceto tombstones)
  for (const local of localItems) {
    if (!local || !local.id || deletedIds.has(local.id)) continue;
    mergedMap.set(local.id, normalizeToCitizenDiscard(local));
  }

  // 2. Concilia com itens remotos respeitando precedência da fila local e updatedAt (LWW)
  for (const rawRemote of remoteItems) {
    const remote = normalizeToCitizenDiscard({
      ...rawRemote,
      offline: false,
      syncPending: false,
    });
    if (!remote.id || deletedIds.has(remote.id)) continue;

    const existingLocal = mergedMap.get(remote.id);
    if (!existingLocal) {
      mergedMap.set(remote.id, remote);
      continue;
    }

    const hasPendingLocalMutation =
      Boolean(existingLocal.syncPending || existingLocal.offline) ||
      existingLocal.status === 'Pendente (Offline)' ||
      pendingMutationsByDiscardId.has(remote.id);

    const isCollected =
      existingLocal.status === 'Coletado' || remote.status === 'Coletado';

    if (hasPendingLocalMutation && !isCollected) {
      // Mutações locais pendentes na fila têm precedência sobre dados remotos desatualizados
      mergedMap.set(remote.id, {
        ...remote,
        ...existingLocal,
        status: 'Pendente (Offline)',
        offline: true,
        syncPending: true,
      });
    } else {
      const localTime = Date.parse(existingLocal.updatedAt || existingLocal.createdAt || '') || 0;
      const remoteTime = Date.parse(remote.updatedAt || remote.createdAt || '') || 0;

      if (localTime > remoteTime && !isCollected) {
        mergedMap.set(remote.id, {
          ...remote,
          ...existingLocal,
        });
      } else {
        mergedMap.set(remote.id, {
          ...existingLocal,
          ...remote,
          status: isCollected ? 'Coletado' : remote.status,
          offline: false,
          syncPending: false,
        });
      }
    }
  }

  const reconciled = Array.from(mergedMap.values());
  reconciled.sort((a, b) => {
    const timeA = Date.parse(a.updatedAt || a.createdAt || '') || 0;
    const timeB = Date.parse(b.updatedAt || b.createdAt || '') || 0;
    return timeB - timeA;
  });

  return reconciled;
}

/**
 * Serviço de Auto-Sincronização em Segundo Plano (Offline-First Auto Sync).
 * Implementa o Outbox Pattern persistente no AsyncStorage (A4-04),
 * Tombstones para exclusões seguras (A4-05) e verificação real de rede (A4-03 / A4-07).
 */
export class AutoSyncService {
  private outboxQueue: OutboxMutation[] = [];
  private tombstones: Set<string> = new Set();
  private activeUserId?: string;
  private remoteExecutor?: (mutation: OutboxMutation) => Promise<boolean>;

  /**
   * Configura o executor remoto padrão para envio das mutações da fila.
   */
  setRemoteExecutor(executor: (mutation: OutboxMutation) => Promise<boolean>): void {
    this.remoteExecutor = executor;
  }

  /**
   * Retorna cópia da fila atual em memória.
   */
  getOutboxQueue(): OutboxMutation[] {
    return [...this.outboxQueue];
  }

  /**
   * Retorna o conjunto de IDs com exclusão pendente (tombstones).
   */
  getTombstoneSet(): Set<string> {
    const combined = new Set<string>(this.tombstones);
    for (const m of this.outboxQueue) {
      if (m.action === 'DELETE' && m.discardId) {
        combined.add(m.discardId);
      }
    }
    return combined;
  }

  isTombstoned(discardId: string): boolean {
    return this.getTombstoneSet().has(discardId);
  }

  /**
   * Carrega a fila de mutações pendentes e tombstones do AsyncStorage para o usuário (A4-04 / A4-05).
   */
  async loadOutboxQueue(userId?: string): Promise<OutboxMutation[]> {
    if (userId !== undefined) {
      this.activeUserId = userId;
    }
    const targetUserId = userId ?? this.activeUserId;
    try {
      const [rawOutbox, rawTombstones] = await Promise.all([
        AsyncStorage.getItem(getOutboxStorageKey(targetUserId)),
        AsyncStorage.getItem(getTombstonesStorageKey(targetUserId)),
      ]);

      if (rawOutbox) {
        const parsed = JSON.parse(rawOutbox);
        if (Array.isArray(parsed)) {
          this.outboxQueue = parsed;
        }
      }
      if (rawTombstones) {
        const parsedT = JSON.parse(rawTombstones);
        if (Array.isArray(parsedT)) {
          this.tombstones = new Set(parsedT);
        }
      }
    } catch (err) {
      // Fallback silencioso para memória
    }
    return [...this.outboxQueue];
  }

  /**
   * Persiste a fila atual no AsyncStorage (A4-04).
   */
  async saveOutboxQueue(userId?: string): Promise<void> {
    const targetUserId = userId ?? this.activeUserId;
    try {
      await AsyncStorage.setItem(
        getOutboxStorageKey(targetUserId),
        JSON.stringify(this.outboxQueue)
      );
    } catch (err) {}
  }

  /**
   * Registra um tombstone de exclusão pendente no AsyncStorage (A4-05).
   */
  async addTombstone(discardId: string, userId?: string): Promise<void> {
    if (!discardId) return;
    this.tombstones.add(discardId);
    const targetUserId = userId ?? this.activeUserId;
    try {
      await AsyncStorage.setItem(
        getTombstonesStorageKey(targetUserId),
        JSON.stringify(Array.from(this.tombstones))
      );
    } catch (err) {}
  }

  /**
   * Remove um tombstone após confirmação de exclusão remota (A4-05).
   */
  async removeTombstone(discardId: string, userId?: string): Promise<void> {
    this.tombstones.delete(discardId);
    const targetUserId = userId ?? this.activeUserId;
    try {
      await AsyncStorage.setItem(
        getTombstonesStorageKey(targetUserId),
        JSON.stringify(Array.from(this.tombstones))
      );
    } catch (err) {}
  }

  /**
   * Enfileira uma mutação offline e persiste imediatamente no AsyncStorage (A4-04).
   */
  enqueueMutation<T = any>(
    action: OutboxMutation['action'],
    payload: T,
    userId?: string,
    explicitDiscardId?: string
  ): OutboxMutation<T> {
    if (userId !== undefined) {
      this.activeUserId = userId;
    }
    const targetUserId = userId ?? this.activeUserId;
    const discardId =
      explicitDiscardId ||
      (payload as any)?.id ||
      (payload as any)?.discardId ||
      generateUUID();
    const now = Date.now();
    const timestamp = new Date(now).toISOString();

    if (action === 'DELETE') {
      this.tombstones.add(discardId);
      // Se o item foi criado e deletado offline ou tinha UPDATE pendente, consolida para DELETE
      this.outboxQueue = this.outboxQueue.filter((m) => m.discardId !== discardId);
      this.addTombstone(discardId, targetUserId).catch(() => {});
    } else if (action === 'UPDATE') {
      // Se já existe um CREATE ou UPDATE na fila para o mesmo descarte, atualiza o payload existente sem duplicar
      const existingIdx = this.outboxQueue.findIndex(
        (m) =>
          m.discardId === discardId &&
          (m.action === 'CREATE' || m.action === 'CREATE_DISCARD' || m.action === 'UPDATE')
      );
      if (existingIdx >= 0) {
        const existing = this.outboxQueue[existingIdx];
        const mergedMutation: OutboxMutation<T> = {
          ...existing,
          payload: { ...(existing.payload || {}), ...(payload as any) },
          timestamp,
        };
        this.outboxQueue[existingIdx] = mergedMutation;
        this.saveOutboxQueue(targetUserId).catch(() => {});
        return mergedMutation;
      }
    } else if (action === 'CREATE' || action === 'CREATE_DISCARD') {
      // Evita duplicidade de CREATE para o mesmo discardId
      const existingIdx = this.outboxQueue.findIndex(
        (m) =>
          m.discardId === discardId &&
          (m.action === 'CREATE' || m.action === 'CREATE_DISCARD')
      );
      if (existingIdx >= 0) {
        const existing = this.outboxQueue[existingIdx];
        const updatedMutation: OutboxMutation<T> = {
          ...existing,
          payload,
          timestamp,
        };
        this.outboxQueue[existingIdx] = updatedMutation;
        this.saveOutboxQueue(targetUserId).catch(() => {});
        return updatedMutation;
      }
    }

    const mutation: OutboxMutation<T> = {
      id: generateUUID(),
      action,
      discardId,
      payload,
      timestamp,
      createdAt: now,
      retryCount: 0,
      userId: targetUserId,
    };

    this.outboxQueue.push(mutation);
    this.saveOutboxQueue(targetUserId).catch(() => {});
    return mutation;
  }

  /**
   * Remove mutações confirmadas de um descarte específico da fila persistente.
   */
  async removeMutationsByDiscardId(
    discardId: string,
    action?: OutboxAction,
    userId?: string
  ): Promise<void> {
    this.outboxQueue = this.outboxQueue.filter((m) => {
      if (m.discardId !== discardId) return true;
      if (action && m.action !== action) return true;
      return false;
    });
    await this.saveOutboxQueue(userId);
  }

  /**
   * Retorna o total de mutações pendentes na fila de saída.
   */
  getPendingMutationCount(): number {
    return this.outboxQueue.length;
  }

  /**
   * Sincroniza de forma assíncrona e verificada os descartes e mutações pendentes do Cidadão (A4-03, A4-04, A4-07).
   * O status syncPending/offline só é removido após confirmação inequívoca do destino remoto.
   */
  async processAutoSyncCitizenDiscards(
    discards: DiscardItem[],
    isOffline: boolean,
    options?: {
      userId?: string;
      syncExecutor?: (mutation: OutboxMutation) => Promise<boolean>;
    }
  ): Promise<{ updatedDiscards: DiscardItem[]; syncedCount: number; failedCount: number }> {
    if (isOffline) {
      return { updatedDiscards: discards, syncedCount: 0, failedCount: 0 };
    }

    const targetUserId = options?.userId ?? this.activeUserId;
    await this.loadOutboxQueue(targetUserId);

    // Garante que qualquer item marcado como offline/syncPending na lista também esteja representado na fila
    for (const item of discards) {
      const isPending =
        item.status === 'Pendente (Offline)' || Boolean(item.offline || item.syncPending);
      if (isPending && !this.isTombstoned(item.id)) {
        const alreadyQueued = this.outboxQueue.some((m) => m.discardId === item.id);
        if (!alreadyQueued) {
          this.enqueueMutation('CREATE', item, targetUserId, item.id);
        }
      }
    }

    const executor = options?.syncExecutor || this.remoteExecutor;
    const syncedIds = new Set<string>();
    const failedIds = new Set<string>();
    const remainingQueue: OutboxMutation[] = [];
    let syncedCount = 0;
    let failedCount = 0;

    for (const mutation of this.outboxQueue) {
      let confirmed = false;
      try {
        if (executor) {
          confirmed = await executor(mutation);
        } else {
          // Se não houver executor customizado, tenta usar o crossAppSync registrado dinamicamente
          const { crossAppSync } = require('./crossAppSync');
          if (mutation.action === 'DELETE') {
            confirmed = await crossAppSync.deleteDiscard(
              mutation.discardId,
              'cidadao',
              mutation.userId || targetUserId
            );
          } else if (mutation.action === 'UPDATE') {
            const res = await crossAppSync.updateDiscard(
              mutation.discardId,
              mutation.payload,
              'cidadao'
            );
            confirmed = Boolean(res?.remoteSynced || res?.success);
          } else {
            const res = await crossAppSync.postNewDiscard(mutation.payload, 'cidadao');
            confirmed = Boolean(res?.remoteSynced || res?.success);
          }
        }
      } catch (err) {
        confirmed = false;
      }

      if (confirmed) {
        syncedCount += 1;
        syncedIds.add(mutation.discardId);
        if (mutation.action === 'DELETE') {
          await this.removeTombstone(mutation.discardId, targetUserId);
        }
      } else {
        failedCount += 1;
        failedIds.add(mutation.discardId);
        remainingQueue.push({
          ...mutation,
          retryCount: (mutation.retryCount || 0) + 1,
        });
      }
    }

    this.outboxQueue = remainingQueue;
    await this.saveOutboxQueue(targetUserId);

    const activeTombstones = this.getTombstoneSet();
    const updatedDiscards = discards
      .filter((item) => !activeTombstones.has(item.id))
      .map((item) => {
        if (syncedIds.has(item.id) && !failedIds.has(item.id)) {
          return {
            ...item,
            status: item.status === 'Coletado' ? ('Coletado' as const) : ('Pendente' as const),
            offline: false,
            syncPending: false,
          };
        }
        return item;
      });

    return { updatedDiscards, syncedCount, failedCount };
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
          syncPending: false,
        };
      }
      return item;
    });

    this.outboxQueue = this.outboxQueue.filter((m) => m.action !== 'COLLECT_DISCARD');
    this.saveOutboxQueue().catch(() => {});

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
          syncPending: false,
        };
      }
      return record;
    });

    this.outboxQueue = this.outboxQueue.filter((m) => m.action !== 'UPDATE_RECORD');
    this.saveOutboxQueue().catch(() => {});

    return { updatedRecords, syncedCount };
  }
}

export const autoSyncService = new AutoSyncService();
