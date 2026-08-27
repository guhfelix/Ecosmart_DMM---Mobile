import { defaultFirebaseConfig, ensureFirebaseAuth, FirebaseConfig, FIRESTORE_COLLECTIONS, getFirebaseDb } from './firebaseConfig';
import {
  AdminDiscardRecord,
  AppNotification,
  CitizenDiscardStatus,
  CollectionPointItem,
  CollectorDiscard,
  DiscardItem,
  EducationalTipItem,
  Usuario,
  WasteTypeItem,
} from '../models';
import { generateEntityId } from '../utils/idUtils';

import {
  CACERES_COLLECTION_POINTS,
  CACERES_DISCARDS_COLETOR,
  CACERES_EDUCATIONAL_TIPS,
  CACERES_INITIAL_USERS,
  CACERES_WASTE_TYPES,
} from '../data/initialCaceresData';

/**
 * Helper para garantir que operações no Firestore possuam timeout adequado
 */
async function withFirestoreTimeout<T = any>(promise: Promise<T>, timeoutMs = 7000): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Firestore timeout')), timeoutMs);
  });
  try {
    const res = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Serviço de Integração com Firebase (Cloud Firestore, Auth & Storage).
 * Oferece operações completas de banco de dados com suporte híbrido:
 * - Gravação e Leitura no Cloud Firestore em tempo real
 * - Cache resiliente em memória para fallback quando sem conexão
 */
export class FirebaseService {
  private config: FirebaseConfig;
  private isInitialized = false;
  private memoryCache: Record<string, any[]> = {
    [FIRESTORE_COLLECTIONS.USERS]: [...CACERES_INITIAL_USERS],
    [FIRESTORE_COLLECTIONS.DISCARDS]: [...CACERES_DISCARDS_COLETOR],
    [FIRESTORE_COLLECTIONS.WASTE_TYPES]: [...CACERES_WASTE_TYPES],
    [FIRESTORE_COLLECTIONS.COLLECTION_POINTS]: [...CACERES_COLLECTION_POINTS],
    [FIRESTORE_COLLECTIONS.TIPS]: [...CACERES_EDUCATIONAL_TIPS],
    [FIRESTORE_COLLECTIONS.NOTIFICATIONS]: [],
  };

  constructor(config: FirebaseConfig = defaultFirebaseConfig) {
    this.config = config;
    ensureFirebaseAuth().catch(() => {});
  }

  /**
   * Inicializa o cliente do Firebase.
   */
  async initializeApp(customConfig?: Partial<FirebaseConfig>): Promise<boolean> {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }
    this.isInitialized = true;
    ensureFirebaseAuth().catch(() => {});
    return true;
  }


  /**
   * Retorna a configuração ativa do Firebase.
   */
  getConfig(): FirebaseConfig {
    return this.config;
  }

  /**
   * Limpa os dados em memória (cache local)
   */
  clearLocalMemoryCache() {
    this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS] = [];
    this.memoryCache[FIRESTORE_COLLECTIONS.NOTIFICATIONS] = [];
  }

  // ==========================================
  // COLEÇÃO: DESCARTES (Cloud Firestore)
  // ==========================================

  /**
   * Cria ou sincroniza um documento de descarte no Firestore.
   */
  async saveDiscardDocument(discard: DiscardItem | CollectorDiscard | AdminDiscardRecord): Promise<{ success: boolean; id: string }> {
    const id = discard.id || generateEntityId('disc');
    const docData = {
      ...discard,
      id,
      updatedAt: new Date().toISOString(),
    };

    // Armazena no cache local
    const list = this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS];
    const index = list.findIndex((item) => item.id === id);
    if (index >= 0) {
      list[index] = docData;
    } else {
      list.unshift(docData);
    }

    // Persiste no Firestore
    try {
      const db = getFirebaseDb();
      if (db) {
        const { doc, setDoc } = require('firebase/firestore');
        await withFirestoreTimeout<any>(setDoc(doc(db, FIRESTORE_COLLECTIONS.DISCARDS, id), docData, { merge: true }));
      }
    } catch (err) {
      // Fallback em cache local
    }

    return { success: true, id };
  }

  /**
   * Salva explicitamente um novo descarte cadastrado pelo Cidadão no Cloud Firestore.
   */
  async saveCitizenDiscard(discard: DiscardItem, citizen?: Partial<Usuario>): Promise<{ success: boolean; id: string }> {
    const id = discard.id || generateEntityId('disc');
    const docData = {
      id,
      citizenName: citizen?.nome || 'Maria Cidadã Pantaneira',
      citizenEmail: citizen?.email || 'maria@gmail.com',
      citizenId: citizen?.id || 'user-cidadao-1',
      wasteType: discard.type,
      type: discard.type,
      quantity: discard.quantity,
      observation: discard.observation || '',
      cep: discard.cep || '78200-000',
      address: discard.address || 'Cáceres - MT',
      number: discard.number || discard.numero || '',
      numero: discard.numero || discard.number || '',
      neighborhood: discard.neighborhood || 'Centro',
      city: discard.city || 'Cáceres',
      status: (discard.status || 'pendente').toLowerCase() === 'coletado' ? 'coletado' : 'pendente',
      latitude: typeof discard.latitude === 'number' ? discard.latitude : -16.0725,
      longitude: typeof discard.longitude === 'number' ? discard.longitude : -57.6798,
      photoUri: discard.photoUri || null,
      createdAt: discard.date || new Date().toLocaleDateString('pt-BR'),
      date: discard.date || new Date().toLocaleDateString('pt-BR'),
      updatedAt: new Date().toISOString(),
    };

    return this.saveDiscardDocument(docData as any);
  }

  /**
   * Obtém os descartes cadastrados por um cidadão específico (Firestore / cache).
   */
  async getDiscardsByCitizen(citizenEmail: string): Promise<DiscardItem[]> {
    const normalized = (citizenEmail || '').trim().toLowerCase();
    try {
      const db = getFirebaseDb();
      if (db && normalized) {
        const { collection, getDocs, query, where } = require('firebase/firestore');
        const colRef = collection(db, FIRESTORE_COLLECTIONS.DISCARDS);
        const q = query(colRef, where('citizenEmail', '==', normalized));
        const snapshot: any = await withFirestoreTimeout<any>(getDocs(q));
        if (snapshot && !snapshot.empty) {
          const items: DiscardItem[] = [];
          snapshot.forEach((d: any) => {
            const data = d.data();
            items.push({
              id: data.id,
              type: data.wasteType || data.type,
              quantity: data.quantity,
              observation: data.observation,
              date: data.createdAt || data.date,
              status: (data.status || '').toLowerCase() === 'coletado' ? 'Coletado' : 'Pendente',
              cep: data.cep,
              address: data.address,
              number: data.number,
              numero: data.numero,
              neighborhood: data.neighborhood,
              city: data.city,
              latitude: data.latitude,
              longitude: data.longitude,
              photoUri: data.photoUri,
              offline: false,
            });
          });
          return items;
        }
      }
    } catch (err) {}

    const all = await this.getDiscards();
    return all
      .filter((d: any) => (d.citizenEmail || '').trim().toLowerCase() === normalized)
      .map((d: any) => ({
        id: d.id,
        type: d.wasteType || d.type,
        quantity: d.quantity,
        observation: d.observation,
        date: d.createdAt || d.date,
        status: (d.status || '').toLowerCase() === 'coletado' ? 'Coletado' : 'Pendente',
        cep: d.cep,
        address: d.address,
        number: d.number,
        numero: d.numero,
        neighborhood: d.neighborhood,
        city: d.city,
        latitude: d.latitude,
        longitude: d.longitude,
        photoUri: d.photoUri,
        offline: false,
      }));
  }

  /**
   * Ouvinte em tempo real para os descartes de um cidadão específico.
   */
  subscribeToCitizenDiscards(citizenEmail: string, callback: (discards: DiscardItem[]) => void): () => void {
    const normalized = (citizenEmail || '').trim().toLowerCase();
    try {
      const db = getFirebaseDb();
      if (db && normalized) {
        const { collection, onSnapshot, query, where } = require('firebase/firestore');
        const colRef = collection(db, FIRESTORE_COLLECTIONS.DISCARDS);
        const q = query(colRef, where('citizenEmail', '==', normalized));
        const unsubscribe = onSnapshot(
          q,
          (snapshot: any) => {
            const items: DiscardItem[] = [];
            snapshot.forEach((d: any) => {
              const data = d.data();
              items.push({
                id: data.id,
                type: data.wasteType || data.type,
                quantity: data.quantity,
                observation: data.observation,
                date: data.createdAt || data.date,
                status: (data.status || '').toLowerCase() === 'coletado' ? 'Coletado' : 'Pendente',
                cep: data.cep,
                address: data.address,
                number: data.number,
                numero: data.numero,
                neighborhood: data.neighborhood,
                city: data.city,
                latitude: data.latitude,
                longitude: data.longitude,
                photoUri: data.photoUri,
                offline: false,
              });
            });
            callback(items);
          },
          () => {
            this.getDiscardsByCitizen(citizenEmail).then(callback).catch(() => callback([]));
          }
        );
        return unsubscribe;
      }
    } catch (err) {}

    this.getDiscardsByCitizen(citizenEmail).then(callback).catch(() => callback([]));
    return () => {};
  }

  /**
   * Obtém todos os descartes cadastrados no sistema (Firestore / cache).
   */
  async getDiscards(): Promise<CollectorDiscard[]> {
    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, getDocs, orderBy, query } = require('firebase/firestore');
        const colRef = collection(db, FIRESTORE_COLLECTIONS.DISCARDS);
        const q = query(colRef, orderBy('updatedAt', 'desc'));
        const snapshot: any = await withFirestoreTimeout<any>(getDocs(q));
        if (snapshot) {
          const items: CollectorDiscard[] = [];
          snapshot.forEach((d: any) => items.push(d.data() as CollectorDiscard));
          this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS] = items;
          return items;
        }
      }
    } catch (err) {
      // Fallback em cache local
    }

    return (this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS] as CollectorDiscard[]) || [];
  }

  /**
   * Obtém todos os descartes disponíveis (status pendente) filtrados.
   */
  async getAvailableDiscards(filterType?: string): Promise<CollectorDiscard[]> {
    const all = await this.getDiscards();
    return all.filter((d) => {
      const isPending = (d.status || '').toLowerCase() === 'pendente';
      const matchesType =
        !filterType ||
        filterType === 'Todos' ||
        d.wasteType === filterType ||
        (d as any).type === filterType;
      return isPending && matchesType;
    });
  }

  /**
   * Marca um descarte como coletado no Firestore.
   */
  async markDiscardAsCollected(id: string, coletorId?: string): Promise<boolean> {
    const list = this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS];
    const item = list.find((d) => d.id === id);
    if (item) {
      item.status = 'coletado';
      item.collectedAt = new Date().toLocaleDateString('pt-BR');
      item.coletorId = coletorId;
      item.updatedAt = new Date().toISOString();
    }

    try {
      const db = getFirebaseDb();
      if (db) {
        const { doc, updateDoc } = require('firebase/firestore');
        await withFirestoreTimeout<any>(
          updateDoc(doc(db, FIRESTORE_COLLECTIONS.DISCARDS, id), {
            status: 'coletado',
            collectedAt: new Date().toLocaleDateString('pt-BR'),
            coletorId: coletorId || null,
            updatedAt: new Date().toISOString(),
          })
        );
      }
    } catch (err) {
      // Mantém cache local
    }

    return item ? true : false;
  }

  /**
   * Remove um descarte do Firestore e do cache local.
   */
  async deleteDiscardDocument(id: string): Promise<boolean> {
    const list = this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS] as CollectorDiscard[];
    const initialLen = list.length;
    this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS] = list.filter((d) => d.id !== id);

    try {
      const db = getFirebaseDb();
      if (db) {
        const { doc, deleteDoc } = require('firebase/firestore');
        await withFirestoreTimeout<any>(deleteDoc(doc(db, FIRESTORE_COLLECTIONS.DISCARDS, id)));
      }
    } catch (err) {}

    return this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS].length < initialLen;
  }

  /**
   * Registra um ouvinte em tempo real (onSnapshot) para a coleção de descartes.
   * Conecta diretamente aos listeners nativos do Cloud Firestore.
   */
  subscribeToDiscards(callback: (discards: CollectorDiscard[]) => void): () => void {
    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, onSnapshot, query, orderBy } = require('firebase/firestore');
        const colRef = collection(db, FIRESTORE_COLLECTIONS.DISCARDS);
        const q = query(colRef, orderBy('updatedAt', 'desc'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot: any) => {
            const items: CollectorDiscard[] = [];
            snapshot.forEach((d: any) => items.push(d.data() as CollectorDiscard));
            this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS] = items;
            callback(items);
          },
          (error: any) => {
            console.warn('⚠️ Erro no listener em tempo real do Firestore (discards):', error);
            callback((this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS] as CollectorDiscard[]) || []);
          }
        );
        return unsubscribe;
      }
    } catch (err) {}

    callback((this.memoryCache[FIRESTORE_COLLECTIONS.DISCARDS] as CollectorDiscard[]) || []);
    return () => {};
  }

  /**
   * Registra um ouvinte em tempo real (onSnapshot) para tipos de resíduos.
   */
  subscribeToWasteTypes(callback: (types: WasteTypeItem[]) => void): () => void {
    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, onSnapshot } = require('firebase/firestore');
        const unsubscribe = onSnapshot(
          collection(db, FIRESTORE_COLLECTIONS.WASTE_TYPES),
          (snapshot: any) => {
            const items: WasteTypeItem[] = [];
            snapshot.forEach((d: any) => items.push(d.data() as WasteTypeItem));
            this.memoryCache[FIRESTORE_COLLECTIONS.WASTE_TYPES] = items;
            callback(items);
          },
          () => {
            callback((this.memoryCache[FIRESTORE_COLLECTIONS.WASTE_TYPES] as WasteTypeItem[]) || []);
          }
        );
        return unsubscribe;
      }
    } catch (err) {}

    callback((this.memoryCache[FIRESTORE_COLLECTIONS.WASTE_TYPES] as WasteTypeItem[]) || []);
    return () => {};
  }

  /**
   * Registra um ouvinte em tempo real (onSnapshot) para pontos de coleta.
   */
  subscribeToCollectionPoints(callback: (points: CollectionPointItem[]) => void): () => void {
    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, onSnapshot } = require('firebase/firestore');
        const unsubscribe = onSnapshot(
          collection(db, FIRESTORE_COLLECTIONS.COLLECTION_POINTS),
          (snapshot: any) => {
            const items: CollectionPointItem[] = [];
            snapshot.forEach((d: any) => items.push(d.data() as CollectionPointItem));
            this.memoryCache[FIRESTORE_COLLECTIONS.COLLECTION_POINTS] = items;
            callback(items);
          },
          () => {
            callback((this.memoryCache[FIRESTORE_COLLECTIONS.COLLECTION_POINTS] as CollectionPointItem[]) || []);
          }
        );
        return unsubscribe;
      }
    } catch (err) {}

    callback((this.memoryCache[FIRESTORE_COLLECTIONS.COLLECTION_POINTS] as CollectionPointItem[]) || []);
    return () => {};
  }

  /**
   * Registra um ouvinte em tempo real (onSnapshot) para dicas educativas.
   */
  subscribeToTips(callback: (tips: EducationalTipItem[]) => void): () => void {
    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, onSnapshot } = require('firebase/firestore');
        const unsubscribe = onSnapshot(
          collection(db, FIRESTORE_COLLECTIONS.TIPS),
          (snapshot: any) => {
            const items: EducationalTipItem[] = [];
            snapshot.forEach((d: any) => items.push(d.data() as EducationalTipItem));
            this.memoryCache[FIRESTORE_COLLECTIONS.TIPS] = items;
            callback(items);
          },
          () => {
            callback((this.memoryCache[FIRESTORE_COLLECTIONS.TIPS] as EducationalTipItem[]) || []);
          }
        );
        return unsubscribe;
      }
    } catch (err) {}

    callback((this.memoryCache[FIRESTORE_COLLECTIONS.TIPS] as EducationalTipItem[]) || []);
    return () => {};
  }

  // ==========================================
  // COLEÇÃO: USUÁRIOS (Cloud Firestore)
  // ==========================================

  /**
   * Salva ou atualiza os dados cadastrais do usuário no Firestore.
   */
  async saveUserDocument(user: Usuario): Promise<boolean> {
    const users = this.memoryCache[FIRESTORE_COLLECTIONS.USERS] as Usuario[];
    const index = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    const userData: Usuario = { ...user, updatedAt: new Date().toISOString() };

    if (index >= 0) {
      users[index] = { ...users[index], ...userData };
    } else {
      users.push(userData);
    }

    try {
      const db = getFirebaseDb();
      if (db && user.id) {
        const { doc, setDoc } = require('firebase/firestore');
        await withFirestoreTimeout<any>(setDoc(doc(db, FIRESTORE_COLLECTIONS.USERS, user.id), userData, { merge: true }));
      }
    } catch (err) {
      // Fallback em memória
    }

    return true;
  }

  /**
   * Busca um usuário pelo e-mail no Firestore.
   */
  async getUserByEmail(email: string): Promise<Usuario | null> {
    const normalized = email.trim().toLowerCase();

    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, getDocs, query, where } = require('firebase/firestore');
        const q = query(collection(db, FIRESTORE_COLLECTIONS.USERS), where('email', '==', normalized));
        const snapshot: any = await withFirestoreTimeout<any>(getDocs(q));
        if (snapshot && !snapshot.empty) {
          return snapshot.docs[0].data() as Usuario;
        }
      }
    } catch (err) {
      // Fallback
    }

    const users = this.memoryCache[FIRESTORE_COLLECTIONS.USERS] as Usuario[];
    return users.find((u) => u.email.trim().toLowerCase() === normalized) || null;
  }

  // ==========================================
  // COLEÇÃO: TIPOS DE RESÍDUOS, PONTOS E DICAS
  // ==========================================

  async getWasteTypes(): Promise<WasteTypeItem[]> {
    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, getDocs } = require('firebase/firestore');
        const snapshot = await withFirestoreTimeout<any>(getDocs(collection(db, FIRESTORE_COLLECTIONS.WASTE_TYPES)));
        if (snapshot && !snapshot.empty) {
          const list: WasteTypeItem[] = [];
          snapshot.forEach((d: any) => list.push(d.data() as WasteTypeItem));
          this.memoryCache[FIRESTORE_COLLECTIONS.WASTE_TYPES] = list;
          return list;
        }
      }
    } catch (e) {}

    return (this.memoryCache[FIRESTORE_COLLECTIONS.WASTE_TYPES] as WasteTypeItem[]) || [];
  }

  async saveWasteType(wasteType: WasteTypeItem): Promise<WasteTypeItem> {
    const id = wasteType.id || generateEntityId('waste');
    const item = { ...wasteType, id };
    const list = this.memoryCache[FIRESTORE_COLLECTIONS.WASTE_TYPES];
    const index = list.findIndex((w) => w.id === id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }

    try {
      const db = getFirebaseDb();
      if (db) {
        const { doc, setDoc } = require('firebase/firestore');
        await withFirestoreTimeout<any>(setDoc(doc(db, FIRESTORE_COLLECTIONS.WASTE_TYPES, id), item, { merge: true }));
      }
    } catch (e) {}

    return item;
  }

  async getCollectionPoints(): Promise<CollectionPointItem[]> {
    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, getDocs } = require('firebase/firestore');
        const snapshot = await withFirestoreTimeout<any>(getDocs(collection(db, FIRESTORE_COLLECTIONS.COLLECTION_POINTS)));
        if (snapshot && !snapshot.empty) {
          const list: CollectionPointItem[] = [];
          snapshot.forEach((d: any) => list.push(d.data() as CollectionPointItem));
          this.memoryCache[FIRESTORE_COLLECTIONS.COLLECTION_POINTS] = list;
          return list;
        }
      }
    } catch (e) {}

    return (this.memoryCache[FIRESTORE_COLLECTIONS.COLLECTION_POINTS] as CollectionPointItem[]) || [];
  }

  async saveCollectionPoint(point: CollectionPointItem): Promise<CollectionPointItem> {
    const id = point.id || generateEntityId('point');
    const item = { ...point, id };
    const list = this.memoryCache[FIRESTORE_COLLECTIONS.COLLECTION_POINTS];
    const index = list.findIndex((p) => p.id === id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }

    try {
      const db = getFirebaseDb();
      if (db) {
        const { doc, setDoc } = require('firebase/firestore');
        await withFirestoreTimeout<any>(setDoc(doc(db, FIRESTORE_COLLECTIONS.COLLECTION_POINTS, id), item, { merge: true }));
      }
    } catch (e) {}

    return item;
  }

  async getEducationalTips(): Promise<EducationalTipItem[]> {
    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, getDocs } = require('firebase/firestore');
        const snapshot = await withFirestoreTimeout<any>(getDocs(collection(db, FIRESTORE_COLLECTIONS.TIPS)));
        if (snapshot && !snapshot.empty) {
          const list: EducationalTipItem[] = [];
          snapshot.forEach((d: any) => list.push(d.data() as EducationalTipItem));
          this.memoryCache[FIRESTORE_COLLECTIONS.TIPS] = list;
          return list;
        }
      }
    } catch (e) {}

    return (this.memoryCache[FIRESTORE_COLLECTIONS.TIPS] as EducationalTipItem[]) || [];
  }

  async saveEducationalTip(tip: EducationalTipItem): Promise<EducationalTipItem> {
    const id = tip.id || generateEntityId('tip');
    const item = { ...tip, id };
    const list = this.memoryCache[FIRESTORE_COLLECTIONS.TIPS];
    const index = list.findIndex((t) => t.id === id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }

    try {
      const db = getFirebaseDb();
      if (db) {
        const { doc, setDoc } = require('firebase/firestore');
        await withFirestoreTimeout<any>(setDoc(doc(db, FIRESTORE_COLLECTIONS.TIPS, id), item, { merge: true }));
      }
    } catch (e) {}

    return item;
  }

  async uploadWastePhoto(localUri: string, discardId: string): Promise<string> {
    if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
      return localUri;
    }
    return `https://firebasestorage.googleapis.com/v0/b/ecosmart-mobile.firebasestorage.app/o/waste_photos%2F${discardId}.jpg?alt=media`;
  }

  async saveNotification(notification: AppNotification): Promise<void> {
    const list = this.memoryCache[FIRESTORE_COLLECTIONS.NOTIFICATIONS];
    list.unshift(notification);

    try {
      const db = getFirebaseDb();
      if (db) {
        const { doc, setDoc } = require('firebase/firestore');
        await withFirestoreTimeout<any>(
          setDoc(doc(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS, notification.id), notification, { merge: true })
        );
      }
    } catch (e) {}
  }

  async getNotifications(): Promise<AppNotification[]> {
    try {
      const db = getFirebaseDb();
      if (db) {
        const { collection, getDocs, orderBy, query } = require('firebase/firestore');
        const colRef = collection(db, FIRESTORE_COLLECTIONS.NOTIFICATIONS);
        const q = query(colRef, orderBy('id', 'desc'));
        const snapshot = await withFirestoreTimeout<any>(getDocs(q));
        if (snapshot && !snapshot.empty) {
          const list: AppNotification[] = [];
          snapshot.forEach((d: any) => list.push(d.data() as AppNotification));
          return list;
        }
      }
    } catch (e) {}

    return (this.memoryCache[FIRESTORE_COLLECTIONS.NOTIFICATIONS] as AppNotification[]) || [];
  }
}

export const firebaseService = new FirebaseService();

