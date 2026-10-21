declare const process: {
  env: {
    NODE_ENV?: string;
    PORT?: string;
    ADMIN_SERVER_CLAIM_TOKEN?: string;
    EXPO_PUBLIC_FIREBASE_API_KEY?: string;
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
    EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
    EXPO_PUBLIC_FIREBASE_APP_ID?: string;
    EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
    EXPO_PUBLIC_FIREBASE_ADMIN_EMAIL?: string;
    EXPO_PUBLIC_FIREBASE_ADMIN_PASSWORD?: string;
    EXPO_PUBLIC_FIREBASE_AUTH_EMAIL?: string;
    EXPO_PUBLIC_FIREBASE_AUTH_PASSWORD?: string;
    EXPO_PUBLIC_SYNC_SERVER_URL?: string;
    EXPO_PUBLIC_API_URL?: string;
    REACT_NATIVE_API_URL?: string;
    [key: string]: string | undefined;
  };
};

declare function require(moduleName: string): any;

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: any;
  export default AsyncStorage;
}

declare module 'firebase/app' {
  export type FirebaseApp = any;
  export function initializeApp(config: any): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(): FirebaseApp;
}

declare module 'firebase/auth' {
  export type Auth = any;
  export function initializeAuth(app: any, deps?: any): Auth;
  export function getReactNativePersistence(storage: any): any;
  export function getAuth(app?: any): Auth;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
}
