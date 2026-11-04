import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Telas do perfil Cidadão
import { HomeScreen } from './src/screens/HomeScreen';
import { RegisterDiscardScreen } from './src/screens/RegisterDiscardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { DiscardDetailsScreen } from './src/screens/DiscardDetailsScreen';
import { TipsScreen } from './src/screens/TipsScreen';
import { CollectionPointsScreen } from './src/screens/CollectionPointsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { NotificationModal } from './src/components/NotificationModal';
import { ScreenTransition } from './src/components/ScreenTransition';
import { LoadingScreen } from './src/components/LoadingScreen';
import { FeedbackMessage } from './src/components/FeedbackMessage';

// Modelos, Dados e Serviços
import { STORAGE_KEYS } from './src/services/storageKeys';
import {
  RegisteredUser,
  sanitizeUsersForStorage,
} from './src/services/authService';
import { securityService } from './src/services/securityService';
import { AppNotification, DiscardItem, Usuario } from './src/models';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { OfflineBanner } from './src/components/OfflineBanner';
import {
  autoSyncService,
  normalizeToCitizenDiscard,
  reconcileCitizenDiscards,
} from './src/services/syncService';
import { firebaseService } from './src/services/firebaseService';
import { crossAppSync } from './src/services/crossAppSync';
import { validationUtils } from './src/utils/validationUtils';
import {
  createNotification,
  getUnreadNotificationCount,
  INITIAL_NOTIFICATIONS,
  markAllNotificationsAsRead,
} from './src/services/notificationService';

/** Telas navegáveis disponíveis no fluxo do Cidadão (incluindo rota 'edit' para A4-01) */
type Screen =
  | 'home'
  | 'register'
  | 'edit'
  | 'history'
  | 'details'
  | 'tips'
  | 'points'
  | 'profile';

/**
 * Componente Raiz do aplicativo EcoSmart Cidadão.
 * Gerencia autenticação segura, CRUD completo de descartes (Create, Read, Update, Delete),
 * fila offline persistente (Outbox + Tombstones) e conciliação sem sobrescrita (Last-Write-Wins).
 */
export default function App() {
  // --- Estados de Navegação e Dados ---
  const [screen, setScreen] = useState<Screen>('home');
  const [items, setItems] = useState<DiscardItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: 'success' | 'info' | 'warning' | 'danger';
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const wasOfflineRef = useRef<boolean | null>(null);

  // Hook reativo de detecção de conectividade e saúde do servidor (Health Check ativo)
  const { isOffline, isServerReachable } = useNetworkStatus();

  /**
   * Persiste imediatamente e de forma atômica os descartes do usuário no AsyncStorage,
   * garantindo que nenhuma operação seja perdida caso o app seja encerrado abruptamente.
   */
  const persistUserDiscardsLocally = useCallback(
    async (userId: string | undefined, list: DiscardItem[]) => {
      try {
        const serialized = JSON.stringify(list);
        const writes: Promise<void>[] = [
          AsyncStorage.setItem(STORAGE_KEYS.CIDADAO.DISCARDS, serialized),
        ];
        if (userId) {
          writes.push(
            AsyncStorage.setItem(
              `${STORAGE_KEYS.CIDADAO.DISCARDS}_${userId}`,
              serialized
            )
          );
        }
        await Promise.all(writes);
      } catch (error) {
        console.warn('Falha ao persistir descartes localmente:', error);
      }
    },
    []
  );

  /**
   * Concilia descartes locais e remotos respeitando a fila offline persistente e tombstones (A4-05 / A4-06).
   * Dá precedência a mutações locais pendentes sobre versões remotas desatualizadas.
   */
  const syncAndReconcileUserDiscards = useCallback(
    async (user: Usuario, currentLocalItems?: DiscardItem[]) => {
      try {
        const outbox = await autoSyncService.loadOutboxQueue(user.id);
        const tombstones = autoSyncService.getTombstoneSet();

        let localList: DiscardItem[] = currentLocalItems || [];
        if (!currentLocalItems) {
          const [storedUserDiscards, storedFallbackDiscards] = await Promise.all([
            AsyncStorage.getItem(`${STORAGE_KEYS.CIDADAO.DISCARDS}_${user.id}`),
            AsyncStorage.getItem(STORAGE_KEYS.CIDADAO.DISCARDS),
          ]);
          if (storedUserDiscards) {
            localList = (JSON.parse(storedUserDiscards) as any[]).map(
              normalizeToCitizenDiscard
            );
          } else if (storedFallbackDiscards) {
            const parsedFallback = JSON.parse(storedFallbackDiscards);
            if (Array.isArray(parsedFallback)) {
              const lowerEmail = user.email.trim().toLowerCase();
              localList = parsedFallback
                .filter(
                  (d: any) =>
                    d.userId === user.id ||
                    d.citizenId === user.id ||
                    (d.citizenEmail || '').trim().toLowerCase() === lowerEmail
                )
                .map(normalizeToCitizenDiscard);
            }
          }
        }

        const remoteRaw = await crossAppSync.fetchDiscardsByUser(user.id, user.email);
        const remoteList = Array.isArray(remoteRaw)
          ? remoteRaw.map(normalizeToCitizenDiscard)
          : [];

        const reconciled = reconcileCitizenDiscards(
          localList,
          remoteList,
          outbox,
          tombstones
        );
        setItems(reconciled);
        await persistUserDiscardsLocally(user.id, reconciled);
        return reconciled;
      } catch (e) {
        return currentLocalItems || [];
      }
    },
    [persistUserDiscardsLocally]
  );

  // --- Efeito 1: Carregar dados salvos no dispositivo e restaurar sessão do Cidadão ---
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [storedSession, storedUsers] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.CIDADAO.SESSION),
          AsyncStorage.getItem(STORAGE_KEYS.CIDADAO.USERS),
        ]);

        let parsedUsers: RegisteredUser[] = [];
        if (storedUsers) {
          parsedUsers = sanitizeUsersForStorage(JSON.parse(storedUsers));
          setRegisteredUsers(parsedUsers);
        }

        if (storedSession) {
          const session = JSON.parse(storedSession);
          if (session?.user && session.user.perfil === 'cidadao') {
            const existingInUsers = parsedUsers.find(
              (u) =>
                u.email.trim().toLowerCase() ===
                session.user.email.trim().toLowerCase()
            );

            const activeUser: Usuario = existingInUsers
              ? {
                  id: existingInUsers.id,
                  nome: existingInUsers.name,
                  email: existingInUsers.email,
                  perfil: existingInUsers.perfil,
                  telefone: existingInUsers.telefone || session.user.telefone,
                  cep: existingInUsers.cep || session.user.cep,
                  endereco: existingInUsers.endereco || session.user.endereco,
                  numero: existingInUsers.numero || session.user.numero,
                  bairro: existingInUsers.bairro || session.user.bairro,
                  cidade: existingInUsers.cidade || session.user.cidade,
                  bio: existingInUsers.bio || session.user.bio,
                  updatedAt: existingInUsers.updatedAt || session.user.updatedAt,
                }
              : session.user;

            crossAppSync.setAuthSession(activeUser, session.token);
            setCurrentUser(activeUser);

            await syncAndReconcileUserDiscards(activeUser);

            firebaseService
              .getUserByEmail(activeUser.email)
              .then((cloudUser) => {
                if (cloudUser) {
                  setCurrentUser((prev) =>
                    prev ? { ...prev, ...cloudUser } : cloudUser
                  );
                }
              })
              .catch(() => {});
          } else {
            setItems([]);
          }
        } else {
          setItems([]);
        }
      } catch (error) {
        console.warn('Falha ao carregar dados locais do cidadão:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadAppData();
  }, [syncAndReconcileUserDiscards]);

  // --- Efeito 2: Salvar descartes no AsyncStorage isolado por usuário ---
  useEffect(() => {
    if (!isReady || !currentUser) return;
    persistUserDiscardsLocally(currentUser.id, items);
  }, [items, isReady, currentUser, persistUserDiscardsLocally]);

  // --- Efeito 3: Barramento de Eventos em Tempo Real (0ms) ---
  useEffect(() => {
    const unsubscribe = crossAppSync.onSyncEvent((event) => {
      if (event.type === 'DISCARD_COLLECTED' && event.payload) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === event.payload.id
              ? { ...item, status: 'Coletado', offline: false, syncPending: false }
              : item
          )
        );
        const notif = createNotification(
          'Descarte Recolhido!',
          'Seu descarte foi recolhido pelo coletor em Cáceres - MT.',
          'collection'
        );
        setNotifications((n) => [notif, ...n]);
      } else if (
        event.type === 'DISCARD_UPDATED' &&
        event.payload &&
        event.senderApp !== 'cidadao'
      ) {
        const updated = normalizeToCitizenDiscard(event.payload);
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
        );
      } else if (event.type === 'DISCARD_DELETED' && event.payload) {
        setItems((prev) => prev.filter((item) => item.id !== event.payload.id));
      }
    });

    return unsubscribe;
  }, []);

  // --- Efeito 4: Salvar lista de usuários cadastrados localmente sem senhas em texto simples (A4-11) ---
  useEffect(() => {
    if (!isReady) return;

    const saveUsers = async () => {
      try {
        const safeUsers = sanitizeUsersForStorage(registeredUsers);
        const serialized = JSON.stringify(safeUsers);
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.CIDADAO.USERS, serialized),
          AsyncStorage.setItem(STORAGE_KEYS.SHARED.USERS, serialized),
        ]);
      } catch (error) {
        console.warn('Falha ao salvar usuários locais:', error);
      }
    };

    saveUsers();
  }, [registeredUsers, isReady]);

  // --- Efeito 5: Sincronização Real e Reenvio Automático da Fila Offline ao Reestabelecer Conexão / Saúde da API (A4-03, A4-04, A4-06, A4-07) ---
  const pendingOfflineCount = useMemo(() => {
    const pendingInList = items.filter(
      (item) =>
        item.syncPending || item.offline || item.status === 'Pendente (Offline)'
    ).length;
    const outboxCount = autoSyncService.getPendingMutationCount();
    return Math.max(pendingInList, outboxCount);
  }, [items]);

  const hasPendingOfflineItems = pendingOfflineCount > 0;

  const flushOfflineQueueAndReconcile = useCallback(async () => {
    if (!isReady || isOffline || isServerReachable === false || !currentUser) {
      return;
    }

    setIsSyncing(true);
    try {
      const { updatedDiscards, syncedCount, failedCount } =
        await autoSyncService.processAutoSyncCitizenDiscards(items, isOffline, {
          userId: currentUser.id,
        });

      if (syncedCount > 0) {
        setItems(updatedDiscards);
        await persistUserDiscardsLocally(currentUser.id, updatedDiscards);
        const newNotif = createNotification(
          'Sincronização Concluída',
          `${syncedCount} ${
            syncedCount === 1
              ? 'operação pendente foi sincronizada'
              : 'operações pendentes foram sincronizadas'
          } com sucesso na nuvem.`,
          'sync'
        );
        setNotifications((prev) => [newNotif, ...prev]);
        setFeedback({
          message: `✓ Conexão restabelecida: ${syncedCount} ${
            syncedCount === 1 ? 'registro sincronizado' : 'registros sincronizados'
          } na nuvem com sucesso.`,
          variant: 'success',
        });
      } else if (failedCount > 0) {
        setFeedback({
          message:
            '⏳ Salvo localmente (offline): servidor indisponível, tentativa agendada na fila.',
          variant: 'warning',
        });
      }

      await syncAndReconcileUserDiscards(currentUser, updatedDiscards);
    } finally {
      setIsSyncing(false);
    }
  }, [
    currentUser,
    isOffline,
    isReady,
    isServerReachable,
    items,
    persistUserDiscardsLocally,
    syncAndReconcileUserDiscards,
  ]);

  // --- Efeito 4.9: Aviso imediato ao ficar offline e ao recuperar a conexão ---
  useEffect(() => {
    if (!isReady) return;

    if (wasOfflineRef.current === null) {
      wasOfflineRef.current = isOffline;
      if (isOffline) {
        setFeedback({
          message:
            '⚠️ Você está offline: todas as alterações serão salvas localmente no dispositivo e sincronizadas quando a conexão voltar.',
          variant: 'warning',
        });
      }
      return;
    }

    if (!wasOfflineRef.current && isOffline) {
      wasOfflineRef.current = true;
      setFeedback({
        message:
          '⚠️ Conexão interrompida: modo offline ativado. Seus dados estão seguros no dispositivo e serão sincronizados ao reconectar.',
        variant: 'warning',
      });
      const offlineNotif = createNotification(
        'Modo Offline Ativado',
        'A conexão com a internet foi interrompida. Você pode continuar cadastrando e editando descartes normalmente; tudo será salvo no celular e sincronizado automaticamente quando a rede voltar.',
        'sync'
      );
      setNotifications((prev) => [offlineNotif, ...prev]);
    } else if (wasOfflineRef.current && !isOffline) {
      wasOfflineRef.current = false;
      if (!hasPendingOfflineItems) {
        setFeedback({
          message: '✓ Conexão restabelecida: aplicativo online e sincronizado.',
          variant: 'info',
        });
      }
    }
  }, [isOffline, isReady, hasPendingOfflineItems]);

  useEffect(() => {
    if (!isReady || isOffline || isServerReachable === false || !currentUser) {
      return;
    }

    let cancelled = false;
    const runSync = async () => {
      if (cancelled) return;
      await flushOfflineQueueAndReconcile();
    };

    runSync();

    return () => {
      cancelled = true;
    };
  }, [
    isOffline,
    isServerReachable,
    isReady,
    currentUser?.id,
    hasPendingOfflineItems,
  ]);

  // --- Efeito 5.1: Reenvio imediato quando o Health Check do servidor emite HEALTH_RESTORED ---
  useEffect(() => {
    if (!isReady || !currentUser) return;
    const unsubscribe = crossAppSync.onSyncEvent((event) => {
      if (event.type === 'HEALTH_RESTORED') {
        flushOfflineQueueAndReconcile().catch(() => {});
      }
    });
    return unsubscribe;
  }, [isReady, currentUser, flushOfflineQueueAndReconcile]);

  /** Pull-to-refresh manual da lista de descartes (A4-06) */
  const handleRefreshDiscards = useCallback(async () => {
    if (!currentUser) return;
    setIsRefreshing(true);
    try {
      if (!isOffline) {
        const { updatedDiscards } =
          await autoSyncService.processAutoSyncCitizenDiscards(items, isOffline, {
            userId: currentUser.id,
          });
        await syncAndReconcileUserDiscards(currentUser, updatedDiscards);
      } else {
        await syncAndReconcileUserDiscards(currentUser, items);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [currentUser, isOffline, items, syncAndReconcileUserDiscards]);

  /**
   * Adiciona um novo descarte com confirmação real de persistência local e remota (A4-03, A4-04, A4-07, A4-08).
   */
  const addDiscard = useCallback(
    async (item: DiscardItem) => {
      const nowIso = new Date().toISOString();
      const formattedQty = validationUtils.formatQuantityWithUnit(
        item.quantity,
        item.unit
      );
      const initialPendingItem: DiscardItem = {
        ...item,
        userId: currentUser?.id,
        citizenId: currentUser?.id,
        citizenEmail: currentUser?.email,
        citizenName: currentUser?.nome,
        createdAt: item.createdAt || nowIso,
        updatedAt: nowIso,
        offline: true,
        syncPending: true,
        status: 'Pendente (Offline)',
      };

      // 1. Grava primeiro localmente no AsyncStorage e enfileira no Outbox persistente (A4-04)
      const listWithPending = [
        initialPendingItem,
        ...items.filter((existing) => existing.id !== initialPendingItem.id),
      ];
      setItems(listWithPending);
      autoSyncService.enqueueMutation(
        'CREATE',
        initialPendingItem,
        currentUser?.id,
        initialPendingItem.id
      );
      await Promise.all([
        persistUserDiscardsLocally(currentUser?.id, listWithPending),
        autoSyncService.saveOutboxQueue(currentUser?.id),
      ]);

      let remoteConfirmed = false;
      if (!isOffline) {
        const syncRes = await crossAppSync.postNewDiscard(
          {
            ...initialPendingItem,
            userId: currentUser?.id,
            citizenId: currentUser?.id,
            citizenName: currentUser?.nome || 'Maria Cidadã Pantaneira',
            citizenEmail: currentUser?.email || 'maria@gmail.com',
            wasteType: item.type,
            createdAt: initialPendingItem.createdAt,
            status: 'pendente',
          },
          'cidadao'
        );
        remoteConfirmed = Boolean(syncRes.remoteSynced || syncRes.success);
      }

      if (remoteConfirmed) {
        await autoSyncService.removeMutationsByDiscardId(
          initialPendingItem.id,
          undefined,
          currentUser?.id
        );
      }

      const finalItem: DiscardItem = {
        ...initialPendingItem,
        status: remoteConfirmed ? 'Pendente' : 'Pendente (Offline)',
        offline: !remoteConfirmed,
        syncPending: !remoteConfirmed,
      };

      const finalList = [
        finalItem,
        ...items.filter((existing) => existing.id !== finalItem.id),
      ];
      setItems(finalList);
      await persistUserDiscardsLocally(currentUser?.id, finalList);

      setFeedback({
        message: remoteConfirmed
          ? '✓ Sincronizado na nuvem: descarte registrado com sucesso.'
          : '⏳ Salvo localmente (offline): será sincronizado quando houver conexão com o servidor.',
        variant: remoteConfirmed ? 'success' : 'warning',
      });

      const notifTitle = remoteConfirmed
        ? 'Sincronizado na nuvem'
        : 'Salvo localmente (offline)';
      const notifMsg = remoteConfirmed
        ? `Seu descarte de ${item.type} (${formattedQty}) em Cáceres - MT foi sincronizado na nuvem e já está visível para os coletores.`
        : `Seu descarte de ${item.type} (${formattedQty}) foi salvo localmente (offline) na fila persistente e sincronizará assim que o servidor responder.`;

      const newNotif = createNotification(
        notifTitle,
        notifMsg,
        remoteConfirmed ? 'discard' : 'sync'
      );
      setNotifications((prev) => [newNotif, ...prev]);
    },
    [currentUser, isOffline, items, persistUserDiscardsLocally]
  );

  /**
   * Atualiza um descarte existente preservando o mesmo ID original e sincronizando com PUT /api/discards/:id (A4-01, A4-02, A4-04, A4-07).
   */
  const handleUpdateDiscard = useCallback(
    async (updatedItem: DiscardItem) => {
      const nowIso = new Date().toISOString();
      const formattedQty = validationUtils.formatQuantityWithUnit(
        updatedItem.quantity,
        updatedItem.unit
      );
      const pendingUpdated: DiscardItem = {
        ...updatedItem,
        id: updatedItem.id, // Preserva estritamente o ID original (A4-01)
        userId: currentUser?.id || updatedItem.userId,
        citizenId: currentUser?.id || updatedItem.citizenId,
        citizenEmail: currentUser?.email || updatedItem.citizenEmail,
        citizenName: currentUser?.nome || updatedItem.citizenName,
        updatedAt: nowIso,
        offline: true,
        syncPending: true,
        status:
          updatedItem.status === 'Coletado' ? 'Coletado' : 'Pendente (Offline)',
      };

      // 1. Persiste imediatamente a alteração localmente e na fila Outbox antes da tentativa remota
      const listWithPendingUpdate = items.map((item) =>
        item.id === pendingUpdated.id ? pendingUpdated : item
      );
      setItems(listWithPendingUpdate);
      autoSyncService.enqueueMutation(
        'UPDATE',
        pendingUpdated,
        currentUser?.id,
        pendingUpdated.id
      );
      await Promise.all([
        persistUserDiscardsLocally(currentUser?.id, listWithPendingUpdate),
        autoSyncService.saveOutboxQueue(currentUser?.id),
      ]);

      let remoteConfirmed = false;
      if (!isOffline) {
        const updateRes = await crossAppSync.updateDiscard(
          pendingUpdated.id,
          {
            ...pendingUpdated,
            wasteType: pendingUpdated.type,
          },
          'cidadao'
        );
        remoteConfirmed = Boolean(updateRes.remoteSynced || updateRes.success);
      }

      if (remoteConfirmed) {
        await autoSyncService.removeMutationsByDiscardId(
          pendingUpdated.id,
          undefined,
          currentUser?.id
        );
      }

      const finalUpdated: DiscardItem = {
        ...pendingUpdated,
        status:
          pendingUpdated.status === 'Coletado'
            ? 'Coletado'
            : remoteConfirmed
            ? 'Pendente'
            : 'Pendente (Offline)',
        offline: !remoteConfirmed,
        syncPending: !remoteConfirmed,
      };

      const finalList = items.map((item) =>
        item.id === finalUpdated.id ? finalUpdated : item
      );
      setItems(finalList);
      await persistUserDiscardsLocally(currentUser?.id, finalList);
      setSelectedItemId(finalUpdated.id);

      setFeedback({
        message: remoteConfirmed
          ? '✓ Sincronizado na nuvem: descarte atualizado com sucesso.'
          : '⏳ Salvo localmente (offline): edição aguardando sincronização.',
        variant: remoteConfirmed ? 'success' : 'warning',
      });

      const notif = createNotification(
        remoteConfirmed ? 'Descarte Atualizado' : 'Edição Salva Offline',
        remoteConfirmed
          ? `As alterações no descarte de ${finalUpdated.type} (${formattedQty}) foram sincronizadas na nuvem.`
          : `As alterações no descarte de ${finalUpdated.type} (${formattedQty}) foram salvas localmente na fila offline.`,
        remoteConfirmed ? 'discard' : 'sync'
      );
      setNotifications((prev) => [notif, ...prev]);
    },
    [currentUser, isOffline, items, persistUserDiscardsLocally]
  );

  /**
   * Apaga um descarte com Tombstone offline e só remove a pendência após confirmação do servidor (A4-05, A4-07).
   */
  const handleDeleteDiscard = useCallback(
    async (id: string) => {
      const target = items.find((i) => i.id === id);

      // 1. Oculta imediatamente da listagem e persiste Tombstone + mutação DELETE no AsyncStorage (A4-05)
      const nextList = items.filter((i) => i.id !== id);
      setItems(nextList);
      autoSyncService.enqueueMutation('DELETE', { id }, currentUser?.id, id);
      await Promise.all([
        persistUserDiscardsLocally(currentUser?.id, nextList),
        autoSyncService.addTombstone(id, currentUser?.id),
        autoSyncService.saveOutboxQueue(currentUser?.id),
      ]);

      let remoteDeleted = false;
      if (!isOffline) {
        remoteDeleted = await crossAppSync.deleteDiscard(
          id,
          'cidadao',
          currentUser?.id
        );
      }

      if (remoteDeleted) {
        await autoSyncService.removeMutationsByDiscardId(
          id,
          'DELETE',
          currentUser?.id
        );
        await autoSyncService.removeTombstone(id, currentUser?.id);
      }

      setSelectedItemId(null);
      setScreen('history');

      const notif = createNotification(
        remoteDeleted ? 'Descarte Excluído' : 'Exclusão Pendente (Offline)',
        remoteDeleted
          ? `O registro de descarte de ${target?.type || 'material'} foi excluído e sincronizado na nuvem.`
          : `O descarte de ${target?.type || 'material'} foi ocultado localmente e será removido da nuvem ao reconectar.`,
        remoteDeleted ? 'discard' : 'sync'
      );
      setNotifications((prev) => [notif, ...prev]);
      setFeedback({
        message: remoteDeleted
          ? '✓ Sincronizado na nuvem: descarte excluído com sucesso.'
          : '⏳ Salvo localmente (offline): exclusão registrada na fila pendente.',
        variant: remoteDeleted ? 'success' : 'warning',
      });
    },
    [currentUser?.id, isOffline, items, persistUserDiscardsLocally]
  );

  /** Atualiza o perfil do cidadão sem armazenar senha em texto puro (A4-11) */
  const handleUpdateUser = useCallback(async (updatedUser: Usuario) => {
    setCurrentUser(updatedUser);
    setRegisteredUsers((prev) => {
      const emailLower = updatedUser.email.trim().toLowerCase();
      const exists = prev.some(
        (u) =>
          u.email.trim().toLowerCase() === emailLower || u.id === updatedUser.id
      );
      const nextList = exists
        ? prev.map((u) =>
            u.email.trim().toLowerCase() === emailLower || u.id === updatedUser.id
              ? {
                  ...u,
                  name: updatedUser.nome,
                  telefone: updatedUser.telefone,
                  cep: updatedUser.cep,
                  endereco: updatedUser.endereco,
                  numero: updatedUser.numero,
                  bairro: updatedUser.bairro,
                  cidade: updatedUser.cidade,
                  bio: updatedUser.bio,
                  updatedAt: new Date().toISOString(),
                }
              : u
          )
        : [
            {
              id: updatedUser.id,
              name: updatedUser.nome,
              email: updatedUser.email,
              perfil: updatedUser.perfil,
              telefone: updatedUser.telefone,
              cep: updatedUser.cep,
              endereco: updatedUser.endereco,
              numero: updatedUser.numero,
              bairro: updatedUser.bairro,
              cidade: updatedUser.cidade,
              bio: updatedUser.bio,
              updatedAt: new Date().toISOString(),
            },
            ...prev,
          ];
      return sanitizeUsersForStorage(nextList);
    });

    await crossAppSync.syncUserProfile(updatedUser);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CIDADAO.SESSION,
        JSON.stringify({
          user: updatedUser,
          token: securityService.generateSessionToken(updatedUser.id),
          loginAt: new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('Falha ao salvar usuário atualizado:', e);
    }
  }, []);

  /** Callback de login bem-sucedido com reconstituição completa do perfil e conciliação de dados */
  const handleLoginSuccess = useCallback(
    async (user: Usuario) => {
      const localUser = registeredUsers.find(
        (u) => u.email.trim().toLowerCase() === user.email.trim().toLowerCase()
      );

      const fullUser: Usuario = localUser
        ? {
            ...user,
            nome: localUser.name || user.nome,
            telefone: localUser.telefone || user.telefone,
            cep: localUser.cep || user.cep,
            endereco: localUser.endereco || user.endereco,
            numero: localUser.numero || user.numero,
            bairro: localUser.bairro || user.bairro,
            cidade: localUser.cidade || user.cidade,
            bio: localUser.bio || user.bio,
          }
        : user;

      const sessionToken = securityService.generateSessionToken(fullUser.id);
      crossAppSync.setAuthSession(fullUser, sessionToken);
      setCurrentUser(fullUser);
      setScreen('home');

      await syncAndReconcileUserDiscards(fullUser);

      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.CIDADAO.SESSION,
          JSON.stringify({
            user: fullUser,
            token: sessionToken,
            loginAt: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.warn('Falha ao salvar sessão:', e);
      }
    },
    [registeredUsers, syncAndReconcileUserDiscards]
  );

  /** Callback de cadastro bem-sucedido: inicializa conta com lista zerada de descartes e sem senha em texto puro */
  const handleRegisterSuccess = useCallback(
    async (user: Usuario, updatedUsers: RegisteredUser[]) => {
      const safeUsers = sanitizeUsersForStorage(updatedUsers);
      const sessionToken = securityService.generateSessionToken(user.id);
      crossAppSync.setAuthSession(user, sessionToken);
      setRegisteredUsers(safeUsers);
      setCurrentUser(user);
      setItems([]);
      setSelectedItemId(null);
      setScreen('home');

      try {
        await Promise.all([
          AsyncStorage.setItem(
            `${STORAGE_KEYS.CIDADAO.DISCARDS}_${user.id}`,
            JSON.stringify([])
          ),
          AsyncStorage.setItem(STORAGE_KEYS.CIDADAO.DISCARDS, JSON.stringify([])),
          AsyncStorage.setItem(
            STORAGE_KEYS.CIDADAO.SESSION,
            JSON.stringify({
              user,
              token: sessionToken,
              loginAt: new Date().toISOString(),
            })
          ),
        ]);
      } catch (e) {
        console.warn('Falha ao salvar sessão de cadastro:', e);
      }
    },
    []
  );

  /** Encerra a sessão e limpa integralmente os estados em memória e cache */
  const handleLogout = useCallback(async () => {
    crossAppSync.setAuthSession(null);
    setCurrentUser(null);
    setItems([]);
    setSelectedItemId(null);
    setNotifications(INITIAL_NOTIFICATIONS);
    firebaseService.clearLocalMemoryCache();
    setScreen('home');
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CIDADAO.SESSION),
        AsyncStorage.removeItem(STORAGE_KEYS.CIDADAO.DISCARDS),
      ]);
    } catch (e) {
      console.warn('Falha ao remover sessão:', e);
    }
  }, []);

  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications),
    [notifications]
  );

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  const defaultUserAddress = useMemo(
    () => ({
      cep: currentUser?.cep,
      endereco: currentUser?.endereco,
      numero: currentUser?.numero,
      bairro: currentUser?.bairro,
      cidade: currentUser?.cidade,
    }),
    [
      currentUser?.cep,
      currentUser?.endereco,
      currentUser?.numero,
      currentUser?.bairro,
      currentUser?.cidade,
    ]
  );

  const openDiscardDetails = useCallback((item: DiscardItem) => {
    setSelectedItemId(item.id);
    setScreen('details');
  }, []);

  const openEditDiscard = useCallback((item: DiscardItem) => {
    setSelectedItemId(item.id);
    setScreen('edit');
  }, []);

  // --- Renderização Dinâmica de Telas ---
  const renderScreen = useMemo(() => {
    if (!currentUser) {
      return (
        <AuthScreen
          registeredUsers={registeredUsers}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }

    switch (screen) {
      case 'register':
        return (
          <RegisterDiscardScreen
            onSave={addDiscard}
            onBack={() => setScreen('home')}
            isOffline={isOffline}
            defaultUserAddress={defaultUserAddress}
          />
        );
      case 'edit':
        return selectedItem ? (
          <RegisterDiscardScreen
            initialItem={selectedItem}
            isEditing={true}
            onSave={handleUpdateDiscard}
            onBack={() => setScreen('details')}
            isOffline={isOffline}
            defaultUserAddress={defaultUserAddress}
          />
        ) : (
          <HistoryScreen
            items={items}
            onOpenDetails={openDiscardDetails}
            onRegister={() => setScreen('register')}
            onRefresh={handleRefreshDiscards}
            refreshing={isRefreshing}
            onBack={() => setScreen('home')}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            items={items}
            onOpenDetails={openDiscardDetails}
            onRegister={() => setScreen('register')}
            onRefresh={handleRefreshDiscards}
            refreshing={isRefreshing}
            onBack={() => setScreen('home')}
          />
        );
      case 'details':
        return selectedItem ? (
          <DiscardDetailsScreen
            item={selectedItem}
            onEdit={openEditDiscard}
            onDelete={handleDeleteDiscard}
            onBack={() => setScreen('history')}
          />
        ) : (
          <HistoryScreen
            items={items}
            onOpenDetails={openDiscardDetails}
            onRegister={() => setScreen('register')}
            onRefresh={handleRefreshDiscards}
            refreshing={isRefreshing}
            onBack={() => setScreen('home')}
          />
        );
      case 'tips':
        return <TipsScreen onBack={() => setScreen('home')} />;
      case 'points':
        return <CollectionPointsScreen onBack={() => setScreen('home')} />;
      case 'profile':
        return (
          <ProfileScreen
            user={currentUser}
            discards={items}
            onUpdateUser={handleUpdateUser}
            onBack={() => setScreen('home')}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            onNavigate={setScreen}
            onOpenDiscardDetails={openDiscardDetails}
            onLogout={handleLogout}
            onOpenNotifications={() => setShowNotificationsModal(true)}
            unreadNotificationsCount={unreadCount}
            currentUser={currentUser}
            items={items}
          />
        );
    }
  }, [
    screen,
    items,
    selectedItem,
    currentUser,
    registeredUsers,
    unreadCount,
    isOffline,
    isRefreshing,
    defaultUserAddress,
    addDiscard,
    handleUpdateDiscard,
    handleDeleteDiscard,
    handleUpdateUser,
    handleLoginSuccess,
    handleRegisterSuccess,
    handleLogout,
    handleRefreshDiscards,
    openDiscardDetails,
    openEditDiscard,
  ]);

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <OfflineBanner
        isOffline={isOffline}
        isServerReachable={isServerReachable}
        pendingCount={pendingOfflineCount}
        isSyncing={isSyncing}
        onRetrySync={() => flushOfflineQueueAndReconcile()}
      />
      {currentUser ? (
        <ScreenTransition screenKey={screen}>{renderScreen}</ScreenTransition>
      ) : (
        renderScreen
      )}
      <NotificationModal
        visible={showNotificationsModal}
        notifications={notifications}
        onClose={() => setShowNotificationsModal(false)}
        onMarkAllAsRead={() =>
          setNotifications((prev) => markAllNotificationsAsRead(prev))
        }
      />
      <FeedbackMessage
        message={feedback?.message}
        variant={feedback?.variant}
        onHide={() => setFeedback(null)}
      />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
