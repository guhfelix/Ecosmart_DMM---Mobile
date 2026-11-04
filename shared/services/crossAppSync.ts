import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectorDiscard, Usuario } from '../models';
import { STORAGE_KEYS } from './storageKeys';
import { firebaseService } from './firebaseService';
import { securityService } from './securityService';
import {
  autoSyncService,
  normalizeToCollectorDiscard,
} from './syncService';

/**
 * URL da rede local (LAN) detectada no computador host pelo script sync-shared.js.
 * Serve como candidato automático para dispositivos físicos na mesma rede Wi-Fi.
 */
export const DETECTED_HOST_LAN_URL = '';

/**
 * Extrai o endereço IPv4 ou hostname de uma URL/URI do bundler (Metro / Expo Go).
 */
function extractHostFromUri(uri?: string | null): string | null {
  if (!uri || typeof uri !== 'string') return null;
  const trimmed = uri.trim();
  if (!trimmed) return null;

  // Formato host:port (ex: "192.168.1.15:8081")
  const directHostPort = trimmed.match(/^([a-zA-Z0-9.-]+):\d+/);
  if (directHostPort && directHostPort[1]) {
    return directHostPort[1];
  }

  // Formato URL/URI com protocolo (ex: "http://192.168.1.15:8081/index.bundle" ou "exp://192.168.1.15:8081")
  const urlMatch = trimmed.match(/^[a-zA-Z0-9+.-]+:\/\/([^/:?#]+)(?::\d+)?/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }

  return null;
}

/**
 * Detecta dinamicamente o IP da máquina host no React Native / Expo (SDK 54 / Bridgeless / Web).
 */
export function detectDynamicHostIp(): string | null {
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  if (isTest) return null;

  // 1. NativeModules.SourceCode ou TurboModuleRegistry (React Native Clássico & Bridgeless)
  try {
    const RN = require('react-native');
    const scriptURL: string | undefined =
      RN?.NativeModules?.SourceCode?.scriptURL ||
      RN?.TurboModuleRegistry?.get?.('SourceCode')?.getConstants?.()?.scriptURL;
    const host = extractHostFromUri(scriptURL);
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  } catch (_err) {}

  // 2. Expo Constants (expoConfig.hostUri / manifest2 / debuggerHost)
  try {
    const ConstantsModule = require('expo-constants');
    const Constants = ConstantsModule?.default || ConstantsModule;
    const rawHostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants?.manifest?.debuggerHost ||
      Constants?.experienceUrl;
    const host = extractHostFromUri(rawHostUri);
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  } catch (_err) {}

  // 3. Inspeção de URL do bundle via Error stack (funciona no Hermes em modo Bridgeless)
  try {
    const stack = new Error().stack || '';
    const ipMatch = stack.match(/https?:\/\/(\d{1,3}(?:\.\d{1,3}){3}):\d+/);
    if (ipMatch && ipMatch[1] && ipMatch[1] !== '127.0.0.1') {
      return ipMatch[1];
    }
  } catch (_err) {}

  // 4. Ambiente Web acessado via IP da rede local
  try {
    if (typeof window !== 'undefined' && (window as any)?.location?.hostname) {
      const webHost = String((window as any).location.hostname);
      if (webHost && webHost !== 'localhost' && webHost !== '127.0.0.1') {
        return webHost;
      }
    }
  } catch (_err) {}

  return null;
}

/**
 * Resolve dinamicamente a URL principal do Servidor de Sincronização (A4-15).
 * Prioriza variáveis de ambiente, detecção automática de IP em dispositivo físico,
 * IP da LAN do computador host e fallback para http://localhost:3333.
 */
export function resolveSyncServerUrl(): string {
  const envUrl =
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SYNC_SERVER_URL) ||
    (typeof process !== 'undefined' && process.env?.REACT_NATIVE_API_URL) ||
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL);

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  const dynamicHost = detectDynamicHostIp();
  if (dynamicHost) {
    return `http://${dynamicHost}:3333`;
  }

  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  if (!isTest && DETECTED_HOST_LAN_URL && DETECTED_HOST_LAN_URL.trim()) {
    return DETECTED_HOST_LAN_URL.trim().replace(/\/+$/, '');
  }

  return 'http://localhost:3333';
}

/**
 * Retorna a lista ordenada de URLs candidatas para failover automático entre
 * dispositivo físico (Wi-Fi LAN), emulador Android (10.0.2.2) e localhost.
 */
export function getCandidateServerUrls(): string[] {
  const primary = resolveSyncServerUrl();
  const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  if (isTest) {
    return [primary];
  }

  const candidates = new Set<string>([primary]);
  const dynamicHost = detectDynamicHostIp();
  if (dynamicHost) {
    candidates.add(`http://${dynamicHost}:3333`);
  }
  if (DETECTED_HOST_LAN_URL && DETECTED_HOST_LAN_URL.trim()) {
    candidates.add(DETECTED_HOST_LAN_URL.trim().replace(/\/+$/, ''));
  }
  candidates.add('http://localhost:3333');
  candidates.add('http://10.0.2.2:3333');
  candidates.add('http://127.0.0.1:3333');

  return Array.from(candidates);
}

/**
 * URL base do Servidor de Sincronização em Tempo Real EcoSmart.
 */
export const SYNC_SERVER_URL = resolveSyncServerUrl();

const TIMEOUT_MS = 2500;

export type SyncEventType =
  | 'NEW_DISCARD'
  | 'DISCARD_UPDATED'
  | 'DISCARD_COLLECTED'
  | 'DISCARD_DELETED'
  | 'USER_UPDATED'
  | 'REQUEST_DISCARDS_SYNC'
  | 'RESPONSE_DISCARDS_SYNC'
  | 'HEALTH_RESTORED';

export interface SyncEvent {
  type: SyncEventType;
  payload?: any;
  timestamp: string;
  senderApp?: string;
}

export interface SyncMutationResult {
  success: boolean;
  localSaved: boolean;
  remoteSynced: boolean;
  id: string;
  item?: CollectorDiscard;
  error?: string;
}

/**
 * Função auxiliar com timeout para chamadas HTTP seguras (A4-07).
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = TIMEOUT_MS
): Promise<Response> {
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
  private healthListeners: Set<(isHealthy: boolean, serverUrl: string) => void> = new Set();
  private activeServerUrl: string = SYNC_SERVER_URL;
  private serverHealthy = true;
  private healthTimer: any = null;
  private consecutiveFailures = 0;
  private isCheckingHealth = false;
  private activeSession: {
    userId: string;
    email?: string;
    role?: string;
    token: string;
  } | null = null;

  constructor() {
    this.initBroadcastChannel();
  }

  /**
   * Retorna a URL ativa do servidor de sincronização (atualizada dinamicamente após Health Check).
   */
  getActiveServerUrl(): string {
    return this.activeServerUrl;
  }

  /**
   * Retorna o último estado conhecido de saúde do servidor REST.
   */
  isServerHealthy(): boolean {
    return this.serverHealthy;
  }

  /**
   * Registra um ouvinte reativo para mudanças na saúde/conectividade com o servidor.
   */
  onHealthChange(listener: (isHealthy: boolean, serverUrl: string) => void): () => void {
    this.healthListeners.add(listener);
    return () => {
      this.healthListeners.delete(listener);
    };
  }

  private notifyHealthListeners(isHealthy: boolean) {
    this.healthListeners.forEach((listener) => {
      try {
        listener(isHealthy, this.activeServerUrl);
      } catch (_e) {}
    });
  }

  /**
   * Executa uma requisição HTTP ao servidor tentando automaticamente URLs candidatas alternativas
   * (IP dinâmico da LAN, 10.0.2.2 para emulador Android, localhost) caso a conexão de rede falhe.
   */
  private async requestServerWithFailover(
    endpointPath: string,
    options: RequestInit = {},
    timeout = TIMEOUT_MS
  ): Promise<Response> {
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    const candidates = isTest
      ? [this.activeServerUrl]
      : [
          this.activeServerUrl,
          ...getCandidateServerUrls().filter((u) => u !== this.activeServerUrl),
        ];

    let lastError: any = null;
    for (const baseUrl of candidates) {
      try {
        const res = await fetchWithTimeout(`${baseUrl}${endpointPath}`, options, timeout);
        if (res) {
          if (baseUrl !== this.activeServerUrl) {
            this.activeServerUrl = baseUrl;
          }
          if (!this.serverHealthy) {
            this.serverHealthy = true;
            this.consecutiveFailures = 0;
            this.notifyHealthListeners(true);
          }
          return res;
        }
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Servidor de sincronização inacessível');
  }

  /**
   * Verifica ativamente a saúde do servidor REST (/api/health) testando candidatos de IP dinâmico.
   * Quando a conexão é reestabelecida, emite evento HEALTH_RESTORED para disparo imediato da fila offline.
   */
  async checkServerHealth(timeoutMs = 1500): Promise<boolean> {
    if (this.isCheckingHealth) {
      return this.serverHealthy;
    }
    this.isCheckingHealth = true;
    const wasHealthy = this.serverHealthy;

    try {
      const res = await this.requestServerWithFailover(
        '/api/health',
        { method: 'GET' },
        timeoutMs
      );
      const isOk = Boolean(res && res.ok);
      this.serverHealthy = isOk;

      if (isOk) {
        this.consecutiveFailures = 0;
        if (!wasHealthy || autoSyncService.getPendingMutationCount() > 0) {
          this.notifyHealthListeners(true);
          this.broadcastEvent('HEALTH_RESTORED', { serverUrl: this.activeServerUrl }, 'system');
        }
      } else {
        this.consecutiveFailures += 1;
        if (wasHealthy) {
          this.notifyHealthListeners(false);
        }
      }
      return isOk;
    } catch (_err) {
      this.serverHealthy = false;
      this.consecutiveFailures += 1;
      if (wasHealthy) {
        this.notifyHealthListeners(false);
      }
      return false;
    } finally {
      this.isCheckingHealth = false;
    }
  }

  /**
   * Inicia o monitoramento ativo de conexão (Health Check com polling e backoff exponencial).
   */
  startHealthCheckPolling(options?: {
    baseIntervalMs?: number;
    maxIntervalMs?: number;
  }): () => void {
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    if (isTest) {
      return () => {};
    }

    const baseIntervalMs = options?.baseIntervalMs ?? 3000;
    const maxIntervalMs = options?.maxIntervalMs ?? 15000;

    this.stopHealthCheckPolling();

    let active = true;
    const scheduleNext = () => {
      if (!active) return;

      const hasPending = autoSyncService.getPendingMutationCount() > 0;
      let delayMs: number;
      if (!this.serverHealthy) {
        const factor = Math.pow(1.6, Math.min(this.consecutiveFailures, 5));
        delayMs = Math.min(Math.round(baseIntervalMs * factor), maxIntervalMs);
      } else if (hasPending) {
        delayMs = baseIntervalMs;
      } else {
        delayMs = 10000;
      }

      this.healthTimer = setTimeout(async () => {
        if (!active) return;
        await this.checkServerHealth();
        scheduleNext();
      }, delayMs);
    };

    // Dispara verificação inicial imediata
    this.checkServerHealth().finally(() => {
      scheduleNext();
    });

    return () => {
      active = false;
      this.stopHealthCheckPolling();
    };
  }

  /**
   * Interrompe o timer de Health Check ativo.
   */
  stopHealthCheckPolling(): void {
    if (this.healthTimer) {
      clearTimeout(this.healthTimer);
      this.healthTimer = null;
    }
  }

  /**
   * Configura a sessão autenticada ativa para assinar requisições mutáveis à API REST (A4-13).
   */
  setAuthSession(user: Usuario | null, token?: string): void {
    if (!user) {
      this.activeSession = null;
      return;
    }
    this.activeSession = {
      userId: user.id,
      email: user.email,
      role: user.perfil,
      token: token || securityService.generateSessionToken(user.id),
    };
  }

  /**
   * Constrói os cabeçalhos HTTP autenticados para chamadas ao servidor REST (A4-13).
   */
  private getAuthHeaders(
    fallbackUserId?: string,
    fallbackEmail?: string,
    fallbackRole = 'cidadao'
  ): Record<string, string> {
    const userId = this.activeSession?.userId || fallbackUserId || 'user-cidadao-1';
    const role = this.activeSession?.role || fallbackRole;
    const email = this.activeSession?.email || fallbackEmail || '';
    const token =
      this.activeSession?.token || securityService.generateSessionToken(userId);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId,
      'X-User-Role': role,
    };
    if (email) {
      headers['X-User-Email'] = email;
    }
    return headers;
  }

  private initBroadcastChannel() {
    const isTestEnvironment =
      typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    if (isTestEnvironment) return;

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('ecosmart_realtime_sync_bus');
        this.channel.onmessage = (event: MessageEvent) => {
          if (event && event.data && event.data.type) {
            this.notifyListeners(event.data);
          }
        };
      } catch (_err) {
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
      } catch (_e) {}
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
      } catch (_e) {}
    }
  }

  /**
   * Busca a lista mais atualizada de descartes pertencentes a um usuário específico,
   * respeitando tombstones de exclusão offline (A4-05 / A4-06).
   */
  async fetchDiscardsByUser(userId?: string, email?: string): Promise<CollectorDiscard[]> {
    if (!userId && !email) return [];

    const normalizedEmail = (email || '').trim().toLowerCase();
    const tombstones = autoSyncService.getTombstoneSet();

    // 1. Tenta obter do Servidor de Sincronização Local com filtro e failover de IP
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (normalizedEmail) params.append('email', normalizedEmail);
      const res = await this.requestServerWithFailover(
        `/api/discards?${params.toString()}`,
        { method: 'GET' }
      );
      if (res.ok) {
        const serverDiscards = await res.json();
        if (Array.isArray(serverDiscards)) {
          return serverDiscards
            .map((d) =>
              normalizeToCollectorDiscard({
                ...d,
                offline: false,
                syncPending: false,
                offlineSyncPending: false,
              })
            )
            .filter((d) => !tombstones.has(d.id));
        }
      }
    } catch (_err) {}

    // 2. Tenta obter do Cloud Firestore filtrado por usuário
    try {
      const cloudDiscards = await firebaseService.getDiscardsByCitizen(
        normalizedEmail,
        userId
      );
      if (Array.isArray(cloudDiscards) && cloudDiscards.length > 0) {
        return cloudDiscards
          .map((d) => normalizeToCollectorDiscard(d))
          .filter((d) => !tombstones.has(d.id));
      }
    } catch (_err) {}

    // 3. Mecanismo de contingência no armazenamento local específico do usuário (preservando flag offline)
    try {
      const userKey = userId
        ? `${STORAGE_KEYS.CIDADAO.DISCARDS}_${userId}`
        : STORAGE_KEYS.CIDADAO.DISCARDS;
      const stored = await AsyncStorage.getItem(userKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed
            .map((d) => normalizeToCollectorDiscard(d))
            .filter((d) => !tombstones.has(d.id));
        }
      }
    } catch (_err) {}

    return [];
  }

  /**
   * Busca a lista mais atualizada de descartes (combinando Servidor Sync, Cloud Firestore e Local Storage),
   * respeitando tombstones e ordenação por updatedAt (A4-05 / A4-06).
   */
  async fetchAllDiscards(): Promise<CollectorDiscard[]> {
    const map = new Map<string, CollectorDiscard>();
    const tombstones = autoSyncService.getTombstoneSet();

    // 1. Tenta obter do Servidor de Sincronização Local (em tempo real) com failover de IP
    try {
      const res = await this.requestServerWithFailover(
        '/api/discards',
        { method: 'GET' },
        3000
      );
      if (res.ok) {
        const serverDiscards = await res.json();
        if (Array.isArray(serverDiscards)) {
          serverDiscards.forEach((d) => {
            const normalized = normalizeToCollectorDiscard(d);
            if (!tombstones.has(normalized.id)) {
              map.set(normalized.id, normalized);
            }
          });
        }
      }
    } catch (_err) {
      // Servidor local não respondeu, continua para o Firestore
    }

    // 2. Tenta obter do Cloud Firestore (Nuvem oficial)
    try {
      const cloudDiscards = await firebaseService.getDiscards();
      if (Array.isArray(cloudDiscards)) {
        cloudDiscards.forEach((d) => {
          const normalized = normalizeToCollectorDiscard(d);
          if (tombstones.has(normalized.id)) return;
          const existing = map.get(normalized.id);
          if (existing) {
            const isCollected =
              existing.status === 'coletado' || normalized.status === 'coletado';
            const existingTime = Date.parse(existing.updatedAt || existing.createdAt || '') || 0;
            const cloudTime = Date.parse(normalized.updatedAt || normalized.createdAt || '') || 0;
            const newer = cloudTime > existingTime ? normalized : existing;
            map.set(normalized.id, {
              ...existing,
              ...newer,
              status: isCollected ? 'coletado' : newer.status,
            });
          } else {
            map.set(normalized.id, normalized);
          }
        });
      }
    } catch (_err) {
      // Mecanismo de contingência local
    }

    // 3. Mecanismo de contingência no armazenamento compartilhado local
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED.DISCARDS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((d: any) => {
            const normalized = normalizeToCollectorDiscard(d);
            if (!tombstones.has(normalized.id) && !map.has(normalized.id)) {
              map.set(normalized.id, normalized);
            }
          });
        }
      }
    } catch (_err) {}

    const result = Array.from(map.values());
    if (result.length > 0) {
      AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(result)).catch(
        () => {}
      );
      return result;
    }

    return [];
  }

  /**
   * Envia um novo descarte cadastrado para todos os aplicativos e nuvem com verificação real de resposta (A4-03 / A4-07).
   */
  async postNewDiscard(item: any, senderApp = 'cidadao'): Promise<SyncMutationResult> {
    const normalized = normalizeToCollectorDiscard({
      ...item,
      updatedAt: item.updatedAt || new Date().toISOString(),
    });

    // 1. Transmissão via Event Bus local
    this.broadcastEvent('NEW_DISCARD', normalized, senderApp);

    // 2. Atualiza o armazenamento compartilhado local
    let localSaved = false;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED.DISCARDS);
      const list = stored ? JSON.parse(stored) : [];
      const updated = [
        normalized,
        ...list.filter((x: any) => x.id !== normalized.id),
      ];
      await AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(updated));
      localSaved = true;
    } catch (_err) {}

    let remoteSynced = false;
    let errorMessage: string | undefined;

    // 3. Envia para o Servidor de Sincronização REST com failover de IP e validação response.ok
    try {
      const res = await this.requestServerWithFailover('/api/discards', {
        method: 'POST',
        headers: this.getAuthHeaders(
          normalized.userId,
          normalized.citizenEmail,
          senderApp === 'admin' ? 'admin' : 'cidadao'
        ),
        body: JSON.stringify(normalized),
      });
      if (res && res.ok) {
        remoteSynced = true;
      } else if (res) {
        const errData = await res.json().catch(() => ({}));
        errorMessage = errData?.error || `Erro HTTP ${res.status}`;
      }
    } catch (err: any) {
      errorMessage = err?.message || 'Servidor de sincronização inacessível';
    }

    // 4. Envia para o Cloud Firestore com await real
    try {
      const fbRes = await firebaseService.saveDiscardDocument(normalized);
      if (fbRes?.remoteSynced) {
        remoteSynced = true;
      }
    } catch (err: any) {
      if (!errorMessage) {
        errorMessage = err?.message;
      }
    }

    return {
      success: remoteSynced,
      localSaved,
      remoteSynced,
      id: normalized.id,
      item: normalized,
      error: remoteSynced ? undefined : errorMessage,
    };
  }

  /**
   * Atualiza um descarte existente por ID (PUT /api/discards/:id) mantendo o mesmo ID original (A4-01, A4-02, A4-07).
   */
  async updateDiscard(
    id: string,
    updates: any,
    senderApp = 'cidadao'
  ): Promise<SyncMutationResult> {
    const nowIso = new Date().toISOString();
    const normalized = normalizeToCollectorDiscard({
      ...updates,
      id,
      updatedAt: nowIso,
    });

    // 1. Transmissão via Event Bus local
    this.broadcastEvent('DISCARD_UPDATED', normalized, senderApp);

    // 2. Atualiza o armazenamento compartilhado local
    let localSaved = false;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED.DISCARDS);
      const list = stored ? JSON.parse(stored) : [];
      const exists = list.some((x: any) => x.id === id);
      const updated = exists
        ? list.map((x: any) => (x.id === id ? { ...x, ...normalized, id } : x))
        : [normalized, ...list];
      await AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(updated));
      localSaved = true;
    } catch (_err) {}

    let remoteSynced = false;
    let errorMessage: string | undefined;

    // 3. Envia PUT /api/discards/:id com failover de IP e validação de response.ok
    try {
      const res = await this.requestServerWithFailover(`/api/discards/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(
          normalized.userId,
          normalized.citizenEmail,
          senderApp === 'admin' ? 'admin' : 'cidadao'
        ),
        body: JSON.stringify(normalized),
      });
      if (res && res.ok) {
        remoteSynced = true;
      } else if (res) {
        const errData = await res.json().catch(() => ({}));
        errorMessage = errData?.error || `Erro HTTP ${res.status}`;
      }
    } catch (err: any) {
      errorMessage = err?.message || 'Servidor de sincronização inacessível';
    }

    // 4. Atualiza no Cloud Firestore
    try {
      const fbRes = await firebaseService.saveDiscardDocument(normalized);
      if (fbRes?.remoteSynced) {
        remoteSynced = true;
      }
    } catch (err: any) {
      if (!errorMessage) {
        errorMessage = err?.message;
      }
    }

    return {
      success: remoteSynced,
      localSaved,
      remoteSynced,
      id,
      item: normalized,
      error: remoteSynced ? undefined : errorMessage,
    };
  }

  /**
   * Marca um descarte como coletado e sincroniza a baixa com todos os aplicativos (A4-07).
   */
  async markAsCollected(
    id: string,
    coletorId?: string,
    senderApp = 'coletor'
  ): Promise<boolean> {
    const collectedDate = new Date().toISOString();

    // 1. Transmissão imediata da coleta via Event Bus
    this.broadcastEvent(
      'DISCARD_COLLECTED',
      { id, coletorId, collectedAt: collectedDate },
      senderApp
    );

    // 2. Atualiza o armazenamento compartilhado local
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED.DISCARDS);
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map((item: any) =>
          item.id === id
            ? {
                ...item,
                status: 'coletado',
                collectedAt: collectedDate,
                coletorId,
                updatedAt: collectedDate,
              }
            : item
        );
        await AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(updated));
      }
    } catch (_err) {}

    let remoteSynced = false;

    // 3. Envia para o Servidor de Sincronização Local com failover de IP
    try {
      const res = await this.requestServerWithFailover(
        `/api/discards/${id}/collect`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(coletorId || 'user-coletor-1', undefined, 'coletor'),
          body: JSON.stringify({ coletorId }),
        }
      );
      if (res && res.ok) {
        remoteSynced = true;
      }
    } catch (_err) {}

    // 4. Envia para o Cloud Firestore
    try {
      await firebaseService.markDiscardAsCollected(id, coletorId);
    } catch (_err) {}

    return remoteSynced;
  }

  /**
   * Apaga um descarte de todos os aplicativos, servidor e Firestore com confirmação real (A4-05 / A4-07).
   */
  async deleteDiscard(
    id: string,
    senderApp = 'cidadao',
    userId?: string
  ): Promise<boolean> {
    // 1. Transmissão da exclusão via Event Bus local
    this.broadcastEvent('DISCARD_DELETED', { id }, senderApp);

    // 2. Remove do armazenamento compartilhado local
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SHARED.DISCARDS);
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.filter((item: any) => item.id !== id);
        await AsyncStorage.setItem(STORAGE_KEYS.SHARED.DISCARDS, JSON.stringify(updated));
      }
    } catch (_err) {}

    let remoteConfirmed = false;

    // 3. Envia requisição DELETE para o Servidor de Sincronização Local com failover de IP
    try {
      const res = await this.requestServerWithFailover(`/api/discards/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(
          userId,
          undefined,
          senderApp === 'admin' ? 'admin' : 'cidadao'
        ),
      });
      if (res && res.ok) {
        remoteConfirmed = true;
      }
    } catch (_err) {}

    // 4. Remove do Cloud Firestore
    try {
      await firebaseService.deleteDiscardDocument(id);
    } catch (_err) {}

    return remoteConfirmed;
  }

  /**
   * Sincroniza o perfil do usuário atualizado entre os aplicativos.
   */
  async syncUserProfile(user: Usuario, senderApp = 'user'): Promise<boolean> {
    this.broadcastEvent('USER_UPDATED', user, senderApp);

    let remoteSynced = false;
    try {
      const res = await this.requestServerWithFailover('/api/users', {
        method: 'POST',
        headers: this.getAuthHeaders(user.id, user.email, user.perfil),
        body: JSON.stringify(user),
      });
      if (res && res.ok) {
        remoteSynced = true;
      }
    } catch (_err) {}

    try {
      await firebaseService.saveUserDocument(user);
    } catch (_err) {}

    return remoteSynced;
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
