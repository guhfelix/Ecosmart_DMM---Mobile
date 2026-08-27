/**
 * Configuração do Firebase para o ecossistema EcoSmart Mobile.
 * Suporta injeção de credenciais via variáveis de ambiente ou arquivo de configuração local.
 * Possui modo de fallback (Mock/Offline) para desenvolvimento e testes automatizados.
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Credenciais oficiais do projeto Firebase EcoSmart Mobile.
 */
export const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDgw9lpCdYbnGeAA98-q-LgN4BjL6xTspU',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'ecosmart-mobile.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'ecosmart-mobile',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ecosmart-mobile.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '105163046365',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:105163046365:web:271e4c6d0ecec7f17a8a34',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-KPNJWGPF8R',
};

export const FIRESTORE_COLLECTIONS = {
  USERS: 'usuarios',
  DISCARDS: 'descartes',
  WASTE_TYPES: 'tipos_residuos',
  COLLECTION_POINTS: 'pontos_coleta',
  TIPS: 'dicas_educativas',
  NOTIFICATIONS: 'notificacoes',
  ESG_METRICS: 'metricas_esg',
} as const;

let firebaseAppInstance: any = null;

/**
 * Inicializa ou obtém a instância do Firebase App
 */
export function getFirebaseApp(config: FirebaseConfig = defaultFirebaseConfig) {
  try {
    const { initializeApp, getApps, getApp } = require('firebase/app');
    if (!getApps || getApps().length === 0) {
      firebaseAppInstance = initializeApp(config);
    } else {
      firebaseAppInstance = getApp();
    }
    return firebaseAppInstance;
  } catch (error) {
    return null;
  }
}

/**
 * Obtém a instância do Cloud Firestore
 */
export function getFirebaseDb() {
  try {
    const { getFirestore } = require('firebase/firestore');
    const app = getFirebaseApp();
    return app ? getFirestore(app) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Obtém a instância do Firebase Auth
 */
export function getFirebaseAuth() {
  try {
    const { getAuth } = require('firebase/auth');
    const app = getFirebaseApp();
    return app ? getAuth(app) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Obtém a instância do Firebase Storage
 */
export function getFirebaseStorage() {
  try {
    const { getStorage } = require('firebase/storage');
    const app = getFirebaseApp();
    return app ? getStorage(app) : null;
  } catch (error) {
    return null;
  }
}

let authInitPromise: Promise<any> | null = null;

/**
 * Garante que a sessão com o Firebase Auth esteja autenticada para leitura/escrita no Firestore.
 */
export async function ensureFirebaseAuth(): Promise<any> {
  if (authInitPromise) return authInitPromise;

  authInitPromise = (async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) return null;
      if (auth.currentUser) return auth.currentUser;

      const { signInWithEmailAndPassword } = require('firebase/auth');
      const cred = await signInWithEmailAndPassword(
        auth,
        process.env.EXPO_PUBLIC_FIREBASE_ADMIN_EMAIL || 'admin.caceres@ecosmart.com',
        process.env.EXPO_PUBLIC_FIREBASE_ADMIN_PASSWORD || 'Password@1234'
      );
      return cred.user;
    } catch (e) {
      return null;
    }
  })();

  return authInitPromise;
}


