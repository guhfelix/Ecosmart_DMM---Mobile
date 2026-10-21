/**
 * Constantes e Namespaces de Armazenamento Local Isolado (AsyncStorage).
 * Garante que cada aplicativo acesse exclusivamente suas próprias chaves,
 * prevenindo contaminação cruzada de dados entre Cidadão, Coletor e Admin.
 */
export const STORAGE_KEYS = {
  /** Chaves de armazenamento do EcoSmart Cidadão */
  CIDADAO: {
    SESSION: '@ecosmart_cidadao_session',
    USERS: '@ecosmart_cidadao_users',
    DISCARDS: '@ecosmart_cidadao_discards',
    OUTBOX: '@ecosmart_cidadao_outbox',
    TOMBSTONES: '@ecosmart_cidadao_tombstones',
  },
  /** Chaves de armazenamento do EcoSmart Coletor */
  COLETOR: {
    SESSION: '@ecosmart_coletor_session',
    USERS: '@ecosmart_coletor_users',
    DATA: '@ecosmart_coletor_data',
    DISCARDS: '@ecosmart_coletor_discards',
    OUTBOX: '@ecosmart_coletor_outbox',
  },
  /** Chaves de armazenamento do EcoSmart Admin */
  ADMIN: {
    SESSION: '@ecosmart_admin_session',
    USERS: '@ecosmart_admin_users',
    DATA: '@ecosmart_admin_data',
    WASTE_TYPES: '@ecosmart_admin_waste_types',
    COLLECTION_POINTS: '@ecosmart_admin_collection_points',
    TIPS: '@ecosmart_admin_tips',
    RECORDS: '@ecosmart_admin_records',
    OUTBOX: '@ecosmart_admin_outbox',
  },
  /** Chaves de armazenamento compartilhado (Fallback) */
  SHARED: {
    DISCARDS: '@ecosmart_shared_discards',
    USERS: '@ecosmart_shared_users',
    OUTBOX: '@ecosmart_shared_outbox',
  },
} as const;

/**
 * Gera chave de armazenamento da fila outbox isolada por usuário (A4-04).
 */
export function getOutboxStorageKey(userId?: string): string {
  return userId
    ? `${STORAGE_KEYS.CIDADAO.OUTBOX}_${userId}`
    : STORAGE_KEYS.CIDADAO.OUTBOX;
}

/**
 * Gera chave de armazenamento de exclusões pendentes (tombstones) isolada por usuário (A4-05).
 */
export function getTombstonesStorageKey(userId?: string): string {
  return userId
    ? `${STORAGE_KEYS.CIDADAO.TOMBSTONES}_${userId}`
    : STORAGE_KEYS.CIDADAO.TOMBSTONES;
}

/**
 * Gera chave de armazenamento de descartes isolada por usuário.
 */
export function getUserDiscardsStorageKey(userId?: string): string {
  return userId
    ? `${STORAGE_KEYS.CIDADAO.DISCARDS}_${userId}`
    : STORAGE_KEYS.CIDADAO.DISCARDS;
}

