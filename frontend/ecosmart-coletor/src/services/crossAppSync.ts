import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectorDiscard, DiscardItem, Usuario } from '../models';
import { STORAGE_KEYS } from './storageKeys';
import { firebaseService } from './firebaseService';
import { normalizeToCitizenDiscard, normalizeToCollectorDiscard } from './syncService';

/**
 * URL base do Servidor de Sincronização em Tempo Real EcoSmart.
 */
export const SYNC_SERVER_URL =
  process.env.EXPO_PUBLIC_SYNC_SERVER_URL ||
  process.env.REACT_NATIVE_API_URL ||
  'http://localhost:3333';

const TIMEOUT_MS = 1500;

export type SyncEventType =
  | 'NEW_DISCARD'
  | 'DISCARD_COLLECTED'
  | 'DISCARD_DELETED'
  | 'USER_UPDATED'
  | 'REQUEST_DISCARDS_SYNC'
  | 'RESPONSE_DISCARDS_SYNC';

export interface SyncEvent {
  type: SyncEventType;
  payload?: any;
  timestamp: string;
  senderApp?: string;
}

/**
 * Helper com timeout para chamadas HTTP seguras
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = TIMEOUT_MS): Promise<Response> {
  if (typeof AbortController === 'undefined') {
    return fetch(url, options);
  }
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export class CrossAppSyncService {
  private channel: any = null;
  private listeners: Set<(event: SyncEvent) => void> = new Set();

  constructor() {
    this.initBroadcastChannel();
  }

  private initBroadcastChannel() {
    const isTestEnvironment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    if (isTestEnvironment) return;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('ecosmart_realtime_sync_bus');
        this.channel.onmessage = (event: MessageEvent) => {
          if (event && event.data && event.data.type) {
            this.notifyListeners(event.data);
          }
        };
      } catch (err) {
        // BroadcastChannel não suportado ou restrito
      }
    }
  }

  /**
   * Inscreve um ouvinte para receber eventos em tempo real
   */
  onSyncEvent(callback: (event: SyncEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(event: SyncEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {}
    });
  }

  /**
   * Emite um evento através do BroadcastChannel para todas as instâncias e abas abertas
   */
  broadcastEvent(type: SyncEventType, payload?: any, senderApp?: string) {
    const event: SyncEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      senderApp,
    };

    // Notifica ouvintes locais
    this.notifyListeners(event);

    // Transmite para outras abas / instâncias
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (e) {}
    }
  }

  /**
   * Busca a lista mais atualizada de descartes pertencentes a um usuário específico.
   */
  async fetchDiscardsByUser(userId?: string, email?: string): Promise<CollectorDiscard[]> {
    if (!userId && !email) return [];

    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. Tenta obter do Servidor de Sincronização Local com filtro
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (normalizedEmail) params.append('email', normalizedEmail);
      const res = await fetchWithTimeout(`${SYNC_SERVER_URL}/api/discards?${params.toString()}`, { method: 'GET' });
      if (res.ok) {
        const serverDiscards = await res.json();
        if (Array.isArray(serverDiscards)) {
          return serverDiscards.map(normalizeToCollectorDiscard);
        }
      }
    } catch (err) {}

    // 2. Tenta obter do Cloud Firestore filtrado por usuário
    try {
      const cloudDiscards = await firebaseService.getDiscardsByCitizen(normalizedEmail, userId);
      if (Array.isArray(cloudDiscards) && cloudDiscards.length > 0) {
        return cloudDiscards.map(normalizeToCollectorDiscard);
      }
    } catch (err) {}

    // 3. Fallback no armazenamento local específico do usuário
    try {
      const userKey = userId ? `${STORAGE_KEYS.CIDADAO.DISCARDS}_${userId}` : STORAGE_KEYS.CIDADAO.DISCARDS;
      const stored = await AsyncStorage.getItem(userKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeToCollectorDiscard);
        }
      }
    } catch (err) {}

    return [];
  }

  /**
   * Busca a lista mais atualizada de descartes (combinando Servidor Sync, Cloud Firestore e Local Storage).
   */
  async fetchAllDiscards(): Promise<CollectorDiscard[]> {
    // 1. Tenta obter do Servidor de Sincronização Local (em tempo real)
    try {
      const res = await fetchWithTimeout(`${SYNC_SERVER_URL}/api/discards`, { method: 'GET' });
      if (res.ok) {
        const serverDiscards = await res.json();
        if (Array.isArray(serverDiscards) && serverDiscards.length > 0) {
          const normalized = serverDiscards.map(normalizeToCollectorDiscard);
          AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(normalized)).catch(() => {});
          return normalized;
        }
      }
    } catch (err) {
      // Servidor local não respondeu, continua para o Firestore
    }

    // 2. Tenta obter do Cloud Firestore (Nuvem oficial)
    try {
      const cloudDiscards = await firebaseService.getDiscards();
      if (Array.isArray(cloudDiscards)) {
        const normalized = cloudDiscards.map(normalizeToCollectorDiscard);
        AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(normalized)).catch(() => {});
        return normalized;
      }
    } catch (err) {
      // Fallback
    }

    // 3. Fallback no armazenamento compartilhado local
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED.DISCARDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeToCollectorDiscard);
        }
      }
    } catch (err) {}

    return [];
  }

  /**
   * Envia um novo descarte cadastrado para todos os aplicativos e nuvem.
   */
  async postNewDiscard(item: any, senderApp = 'cidadao'): Promise<{ success: boolean; id: string }> {
    const normalized = normalizeToCollectorDiscard(item);

    // 1. Transmissão imediata via Event Bus em tempo real (0ms de latência)
    this.broadcastEvent('NEW_DISCARD', normalized, senderApp);

    // 2. Envia para o Cloud Firestore
    await firebaseService.saveDiscardDocument(normalized).catch(() => {});

    // 3. Envia para o Servidor de Sincronização Local
    fetchWithTimeout(`${SYNC_SERVER_URL}/api/discards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized),
    }).catch(() => {});

    // 4. Atualiza o armazenamento compartilhado local
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED.DISCARDS);
      const list = stored ? JSON.parse(stored) : [];
      const updated = [normalized, ...list.filter((x: any) => x.id !== normalized.id)];
      await AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(updated));
    } catch (err) {}

    return { success: true, id: normalized.id };
  }

  /**
   * Marca um descarte como coletado e sincroniza a baixa com todos os aplicativos.
   */
  async markAsCollected(id: string, coletorId?: string, senderApp = 'coletor'): Promise<boolean> {
    const collectedDate = new Date().toLocaleDateString('pt-BR');

    // 1. Transmissão imediata da coleta via Event Bus
    this.broadcastEvent(
      'DISCARD_COLLECTED',
      { id, coletorId, collectedAt: collectedDate },
      senderApp
    );

    // 2. Envia para o Cloud Firestore
    await firebaseService.markDiscardAsCollected(id, coletorId).catch(() => {});

    // 3. Envia para o Servidor de Sincronização Local
    fetchWithTimeout(`${SYNC_SERVER_URL}/api/discards/${id}/collect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coletorId }),
    }).catch(() => {});

    // 4. Atualiza o armazenamento compartilhado local
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED.DISCARDS);
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map((item: any) =>
          item.id === id
            ? { ...item, status: 'coletado', collectedAt: collectedDate, coletorId }
            : item
        );
        await AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(updated));
      }
    } catch (err) {}

    return true;
  }

  /**
   * Apaga um descarte de todos os aplicativos, servidor e Firestore.
   */
  async deleteDiscard(id: string, senderApp = 'cidadao'): Promise<boolean> {
    // 1. Transmissão imediata da exclusão via Event Bus
    this.broadcastEvent('DISCARD_DELETED', { id }, senderApp);

    // 2. Remove do Cloud Firestore
    await firebaseService.deleteDiscardDocument(id).catch(() => {});

    // 3. Envia requisição DELETE para o Servidor de Sincronização Local
    fetchWithTimeout(`${SYNC_SERVER_URL}/api/discards/${id}`, {
      method: 'DELETE',
    }).catch(() => {});

    // 4. Remove do armazenamento compartilhado local
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED.DISCARDS);
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.filter((item: any) => item.id !== id);
        await AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(updated));
      }
    } catch (err) {}

    return true;
  }

  /**
   * Sincroniza o perfil do usuário atualizado entre os aplicativos.
   */
  async syncUserProfile(user: Usuario, senderApp = 'user'): Promise<boolean> {
    this.broadcastEvent('USER_UPDATED', user, senderApp);

    fetchWithTimeout(`${SYNC_SERVER_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    }).catch(() => {});

    firebaseService.saveUserDocument(user).catch(() => {});

    return true;
  }

  /**
   * Limpa todos os dados locais de descartes em cache.
   */
  async clearLocalDiscards(): Promise<void> {
    firebaseService.clearLocalMemoryCache();
    await AsyncStorage.removeItem(STORAGE_KEYS.SHARED.DISCARDS).catch(() => {});
    await AsyncStorage.removeItem(STORAGE_KEYS.CIDADAO.DISCARDS).catch(() => {});
    await AsyncStorage.removeItem(STORAGE_KEYS.COLETOR.DATA).catch(() => {});
    await AsyncStorage.removeItem(STORAGE_KEYS.COLETOR.DISCARDS).catch(() => {});
    await AsyncStorage.removeItem(STORAGE_KEYS.ADMIN.RECORDS).catch(() => {});
    await AsyncStorage.removeItem(STORAGE_KEYS.ADMIN.DATA).catch(() => {});
  }
}

export const crossAppSync = new CrossAppSyncService();

