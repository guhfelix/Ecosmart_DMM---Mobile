import {
  defaultFirebaseConfig,
  FIRESTORE_COLLECTIONS,
  getFirebaseApp,
  getFirebaseDb,
  getFirebaseAuth,
  getFirebaseStorage,
} from '../firebaseConfig';

describe('firebaseConfig (Inicialização e Instâncias Firebase)', () => {
  it('deve possuir configuração padrão válida com project-id do EcoSmart', () => {
    expect(defaultFirebaseConfig.projectId).toBe('ecosmart-mobile');
    expect(defaultFirebaseConfig.authDomain).toContain('firebaseapp.com');
  });

  it('deve listar os nomes corretos das coleções Firestore', () => {
    expect(FIRESTORE_COLLECTIONS.USERS).toBe('usuarios');
    expect(FIRESTORE_COLLECTIONS.DISCARDS).toBe('descartes');
    expect(FIRESTORE_COLLECTIONS.WASTE_TYPES).toBe('tipos_residuos');
    expect(FIRESTORE_COLLECTIONS.COLLECTION_POINTS).toBe('pontos_coleta');
    expect(FIRESTORE_COLLECTIONS.TIPS).toBe('dicas_educativas');
    expect(FIRESTORE_COLLECTIONS.NOTIFICATIONS).toBe('notificacoes');
    expect(FIRESTORE_COLLECTIONS.ESG_METRICS).toBe('metricas_esg');
  });

  it('deve obter instâncias sem lançar exceções não tratadas', () => {
    expect(() => getFirebaseApp()).not.toThrow();
    expect(() => getFirebaseDb()).not.toThrow();
    expect(() => getFirebaseAuth()).not.toThrow();
    expect(() => getFirebaseStorage()).not.toThrow();
  });
});
