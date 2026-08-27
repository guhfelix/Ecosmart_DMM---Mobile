export const STORAGE_KEYS = {
  CIDADAO: {
    SESSION: '@ecosmart_cidadao_session',
    USERS: '@ecosmart_cidadao_users',
    DISCARDS: '@ecosmart_cidadao_discards',
  },
  COLETOR: {
    SESSION: '@ecosmart_coletor_session',
    USERS: '@ecosmart_coletor_users',
    DATA: '@ecosmart_coletor_data',
    DISCARDS: '@ecosmart_coletor_discards',
  },
  ADMIN: {
    SESSION: '@ecosmart_admin_session',
    USERS: '@ecosmart_admin_users',
    DATA: '@ecosmart_admin_data',
    WASTE_TYPES: '@ecosmart_admin_waste_types',
    COLLECTION_POINTS: '@ecosmart_admin_collection_points',
    TIPS: '@ecosmart_admin_tips',
    RECORDS: '@ecosmart_admin_records',
  },
  SHARED: {
    DISCARDS: '@ecosmart_shared_discards',
    USERS: '@ecosmart_shared_users',
  },
} as const;
