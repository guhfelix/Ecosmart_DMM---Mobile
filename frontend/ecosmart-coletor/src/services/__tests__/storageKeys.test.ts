import { STORAGE_KEYS } from '../storageKeys';

describe('storageKeys (Constantes de AsyncStorage)', () => {
  it('deve possuir chaves isoladas para o Cidadão', () => {
    expect(STORAGE_KEYS.CIDADAO.SESSION).toBe('@ecosmart_cidadao_session');
    expect(STORAGE_KEYS.CIDADAO.USERS).toBe('@ecosmart_cidadao_users');
    expect(STORAGE_KEYS.CIDADAO.DISCARDS).toBe('@ecosmart_cidadao_discards');
  });

  it('deve possuir chaves isoladas para o Coletor', () => {
    expect(STORAGE_KEYS.COLETOR.SESSION).toBe('@ecosmart_coletor_session');
    expect(STORAGE_KEYS.COLETOR.USERS).toBe('@ecosmart_coletor_users');
    expect(STORAGE_KEYS.COLETOR.DISCARDS).toBe('@ecosmart_coletor_discards');
  });

  it('deve possuir chaves isoladas para o Admin', () => {
    expect(STORAGE_KEYS.ADMIN.SESSION).toBe('@ecosmart_admin_session');
    expect(STORAGE_KEYS.ADMIN.USERS).toBe('@ecosmart_admin_users');
    expect(STORAGE_KEYS.ADMIN.WASTE_TYPES).toBe('@ecosmart_admin_waste_types');
    expect(STORAGE_KEYS.ADMIN.COLLECTION_POINTS).toBe('@ecosmart_admin_collection_points');
    expect(STORAGE_KEYS.ADMIN.TIPS).toBe('@ecosmart_admin_tips');
    expect(STORAGE_KEYS.ADMIN.RECORDS).toBe('@ecosmart_admin_records');
  });

  it('deve possuir chaves compartilhadas', () => {
    expect(STORAGE_KEYS.SHARED.DISCARDS).toBe('@ecosmart_shared_discards');
    expect(STORAGE_KEYS.SHARED.USERS).toBe('@ecosmart_shared_users');
  });
});
