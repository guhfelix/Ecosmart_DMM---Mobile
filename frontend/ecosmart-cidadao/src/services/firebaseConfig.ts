/**
 * Configuração do Firebase para o ecossistema EcoSmart Mobile.
 * Suporta injeção de credenciais via variáveis de ambiente ou arquivo de configuração local.
 * Possui inicialização explícita do Firebase Auth com persistência via AsyncStorage
 * (initializeAuth + getReactNativePersistence) para eliminar o warning do @firebase/auth no React Native.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  // @ts-ignore - Exportado pelo bundle React Native de @firebase/auth
  getReactNativePersistence,
  getAuth,
  Auth,
} from 'firebase/auth';

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

export const FIRESTORE_DATABASE_ID = '(default)';
// Isolamento Arquitetural: Banco administrativo restrito ao EcoSmart Admin
export const ADMIN_DATABASE_ID = undefined;

export const FIRESTORE_COLLECTIONS = {
  USERS: 'usuarios',
  DISCARDS: 'descartes',
  WASTE_TYPES: 'tipos_residuos',
  COLLECTION_POINTS: 'pontos_coleta',
  TIPS: 'dicas_educativas',
  NOTIFICATIONS: 'notificacoes',
  ESG_METRICS: 'metricas_esg',
} as const;

// Coleções administrativas omitidas no aplicativo comum
export const ADMIN_FIRESTORE_COLLECTIONS = undefined;

let firebaseAppInstance: FirebaseApp | null = null;

/**
 * Inicializa ou obtém a instância do Firebase App.
 */
export function getFirebaseApp(config: FirebaseConfig = defaultFirebaseConfig): FirebaseApp | null {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return null;
  }
  try {
    if (!getApps || getApps().length === 0) {
      firebaseAppInstance = initializeApp(config);
    } else {
      firebaseAppInstance = getApp();
    }
    return firebaseAppInstance;
  } catch (_error) {
    return null;
  }
}

const firebaseApp = getFirebaseApp();
let authInstance: Auth | null = null;

if (firebaseApp) {
  try {
    authInstance = initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (_error) {
    // Fallback caso já tenha sido inicializado no ciclo de vida ou ambiente Node/Web
    try {
      authInstance = getAuth(firebaseApp);
    } catch (_fallbackError) {
      authInstance = null;
    }
  }
}

/**
 * Obtém a instância do Cloud Firestore para o Banco Padrão ((default)).
 * Instância única utilizada por todo o ecossistema com partições lógicas em nível de coleção raiz.
 */
export function getFirebaseDb() {
  try {
    const { getFirestore } = require('firebase/firestore');
    const app = getFirebaseApp();
    return app ? getFirestore(app) : null;
  } catch (_error) {
    return null;
  }
}

/**
 * Obtém a instância do Cloud Firestore para o Contexto Administrativo.
 * Opera sobre a mesma instância (default) do Firestore no projeto EcoSmart-Mobile,
 * com acesso total de leitura e escrita e direcionando dados de gestão para as coleções
 * raiz exclusivas e isoladas ('admins' e 'admin_logs').
 */
export function getAdminFirebaseDb(): never {
  throw new Error('Acesso Proibido: Este aplicativo conecta-se exclusivamente ao banco padrão ((default)) e não possui acesso ao banco de dados administrativo.');
}

/**
 * Obtém a instância do Firebase Auth inicializada com persistência via AsyncStorage.
 */
export function getFirebaseAuth(): Auth | null {
  if (authInstance) {
    return authInstance;
  }
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  try {
    authInstance = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (_error) {
    // Fallback caso já tenha sido inicializado no ciclo de vida
    try {
      authInstance = getAuth(app);
    } catch (_fallbackError) {
      authInstance = null;
    }
  }
  return authInstance;
}

/**
 * Obtém a instância do Firebase Storage.
 */
export function getFirebaseStorage() {
  try {
    const { getStorage } = require('firebase/storage');
    const app = getFirebaseApp();
    return app ? getStorage(app) : null;
  } catch (_error) {
    return null;
  }
}

let authInitPromise: Promise<any> | null = null;

/**
 * Garante que a sessão com o Firebase Auth esteja autenticada para leitura/escrita no Firestore.
 * Não vaza credenciais administrativas fixas.
 */
export async function ensureFirebaseAuth(): Promise<any> {
  if (authInitPromise) return authInitPromise;

  authInitPromise = (async () => {
    try {
      const auth = getFirebaseAuth();
      if (!auth) return null;
      if (auth.currentUser) return auth.currentUser;

      const email = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMAIL;
      const password = process.env.EXPO_PUBLIC_FIREBASE_AUTH_PASSWORD;
      if (email && password) {
        const { signInWithEmailAndPassword } = require('firebase/auth');
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return cred.user;
      }
      return null;
    } catch (_e) {
      return null;
    }
  })();

  return authInitPromise;
}
