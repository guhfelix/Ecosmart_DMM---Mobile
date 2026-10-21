import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Telas do perfil Coletor
import { HomeScreen } from './src/screens/HomeScreen';
import { AvailableDiscardsScreen } from './src/screens/AvailableDiscardsScreen';
import { DiscardDetailsScreen } from './src/screens/DiscardDetailsScreen';
import { CollectedDiscardsScreen } from './src/screens/CollectedDiscardsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { NotificationModal } from './src/components/NotificationModal';
import { ScreenTransition } from './src/components/ScreenTransition';
import { LoadingScreen } from './src/components/LoadingScreen';
import { FeedbackMessage } from './src/components/FeedbackMessage';

// Modelos, Dados e Serviços
import { CollectorDiscard, initialDiscards } from './src/data/mockData';
import { STORAGE_KEYS } from './src/services/storageKeys';
import {
  RegisteredUser,
  sanitizeUsersForStorage,
} from './src/services/authService';
import { securityService } from './src/services/securityService';
import { AppNotification, Usuario } from './src/models';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { OfflineBanner } from './src/components/OfflineBanner';
import { autoSyncService, normalizeToCollectorDiscard } from './src/services/syncService';
import { firebaseService } from './src/services/firebaseService';
import { crossAppSync } from './src/services/crossAppSync';
import {
  createNotification,
  getUnreadNotificationCount,
  INITIAL_NOTIFICATIONS,
  markAllNotificationsAsRead,
} from './src/services/notificationService';

/** Telas navegáveis disponíveis no fluxo do Coletor */
type Screen = 'home' | 'available' | 'details' | 'collected' | 'profile';

/**
 * Componente Raiz do aplicativo EcoSmart Empresa/Catador.
 * Gerencia visualização e filtragem de descartes em Cáceres, rotas de coleta,
 * perfil operacional, notificações e sincronização inter-aplicativos.
 */
export default function App() {
  // --- Estados de Navegação e Dados ---
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedType, setSelectedType] = useState('Todos');
  const [items, setItems] = useState<CollectorDiscard[]>(initialDiscards);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [detailsBackScreen, setDetailsBackScreen] = useState<Screen>('available');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Hook reativo de detecção de conectividade
  const { isOffline } = useNetworkStatus();

  // --- Efeito 1: Carregar dados salvos no dispositivo e sincronizar com persistência completa ---
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [storedData, storedSession, storedUsers, liveDiscards] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.COLETOR.DATA),
            AsyncStorage.getItem(STORAGE_KEYS.COLETOR.SESSION),
            AsyncStorage.getItem(STORAGE_KEYS.COLETOR.USERS),
            crossAppSync.fetchAllDiscards(),
          ]);

        const liveList =
          Array.isArray(liveDiscards) && liveDiscards.length > 0
            ? liveDiscards.map(normalizeToCollectorDiscard)
            : null;
        const localList: CollectorDiscard[] = storedData
          ? (JSON.parse(storedData) as any[]).map(normalizeToCollectorDiscard)
          : [];

        let mergedDiscards: CollectorDiscard[] = [];
        if (liveList && liveList.length > 0) {
          const map = new Map<string, CollectorDiscard>();
          localList.forEach((d) => map.set(d.id, d));
          liveList.forEach((d) => {
            const existing = map.get(d.id);
            const isCollected =
              existing?.status === 'coletado' || d.status === 'coletado';
            map.set(d.id, {
              ...existing,
              ...d,
              status: isCollected ? 'coletado' : d.status,
              collectedAt: d.collectedAt || existing?.collectedAt,
              coletorId: d.coletorId || existing?.coletorId,
            });
          });
          mergedDiscards = Array.from(map.values());
        } else if (localList.length > 0) {
          mergedDiscards = localList;
        } else {
          mergedDiscards = [...initialDiscards];
        }
        setItems(mergedDiscards);

        let parsedUsers: RegisteredUser[] = [];
        if (storedUsers) {
          parsedUsers = sanitizeUsersForStorage(JSON.parse(storedUsers));
          setRegisteredUsers(parsedUsers);
        }

        if (storedSession) {
          const session = JSON.parse(storedSession);
          if (session?.user && session.user.perfil === 'coletor') {
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
                  veiculo: existingInUsers.veiculo || session.user.veiculo,
                  capacidadeCarga:
                    existingInUsers.capacidadeCarga ||
                    session.user.capacidadeCarga,
                  bio: existingInUsers.bio || session.user.bio,
                  updatedAt:
                    existingInUsers.updatedAt || session.user.updatedAt,
                }
              : session.user;

            crossAppSync.setAuthSession(activeUser, session.token);
            setCurrentUser(activeUser);

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
          }
        }
      } catch (error) {
        console.warn('Falha ao carregar dados locais do coletor:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadAppData();
  }, []);

  // --- Efeito 2: Salvar descartes/coletas no AsyncStorage ao alterar ---
  useEffect(() => {
    if (!isReady) return;

    const saveData = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.COLETOR.DATA,
          JSON.stringify(items)
        );
      } catch (error) {
        console.warn('Falha ao salvar dados locais do coletor:', error);
      }
    };

    saveData();
  }, [items, isReady]);

  // --- Efeito 3: Barramento de Eventos em Tempo Real (0ms) ---
  useEffect(() => {
    const unsubscribe = crossAppSync.onSyncEvent((event) => {
      if (event.type === 'NEW_DISCARD' && event.payload) {
        const newItem = normalizeToCollectorDiscard(event.payload);
        setItems((prev) => {
          if (prev.some((x) => x.id === newItem.id)) return prev;
          return [newItem, ...prev];
        });
        const notif = createNotification(
          'Novo Descarte em Cáceres',
          `Novo descarte de ${newItem.wasteType} disponível para coleta em ${newItem.neighborhood}.`,
          'discard'
        );
        setNotifications((n) => [notif, ...n]);
      } else if (event.type === 'DISCARD_UPDATED' && event.payload) {
        const updatedItem = normalizeToCollectorDiscard(event.payload);
        setItems((prev) =>
          prev.map((item) =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          )
        );
      } else if (event.type === 'DISCARD_COLLECTED' && event.payload) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === event.payload.id
              ? {
                  ...item,
                  status: 'coletado',
                  collectedAt:
                    event.payload.collectedAt ||
                    item.collectedAt ||
                    new Date().toLocaleDateString('pt-BR'),
                  coletorId: event.payload.coletorId || item.coletorId,
                }
              : item
          )
        );
      } else if (event.type === 'DISCARD_DELETED' && event.payload) {
        setItems((prev) => prev.filter((item) => item.id !== event.payload.id));
      }
    });

    return unsubscribe;
  }, []);

  // --- Efeito 4: Listener Nativo em Tempo Real do Cloud Firestore ---
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToDiscards(
      (firestoreDiscards) => {
        if (
          firestoreDiscards &&
          Array.isArray(firestoreDiscards) &&
          firestoreDiscards.length > 0
        ) {
          setItems((prev) => {
            const map = new Map<string, CollectorDiscard>();
            prev.forEach((d) => map.set(d.id, d));
            let hasChanges = false;
            let newFound = 0;

            firestoreDiscards.forEach((d) => {
              const normalized = normalizeToCollectorDiscard(d);
              if (!map.has(normalized.id)) {
                hasChanges = true;
                newFound++;
                map.set(normalized.id, normalized);
              } else {
                const existing = map.get(normalized.id)!;
                const isCollected =
                  existing.status === 'coletado' ||
                  normalized.status === 'coletado';
                const finalStatus = isCollected ? 'coletado' : normalized.status;
                if (
                  existing.status !== finalStatus ||
                  existing.address !== normalized.address
                ) {
                  hasChanges = true;
                  map.set(normalized.id, {
                    ...existing,
                    ...normalized,
                    status: finalStatus,
                    collectedAt: normalized.collectedAt || existing.collectedAt,
                    coletorId: normalized.coletorId || existing.coletorId,
                  });
                }
              }
            });

            if (newFound > 0) {
              const notif = createNotification(
                'Novo Descarte em Cáceres',
                `${newFound} novo(s) descarte(s) disponível(is) para coleta.`,
                'discard'
              );
              setNotifications((n) => [notif, ...n]);
            }

            return hasChanges ? Array.from(map.values()) : prev;
          });
        }
      }
    );

    return unsubscribe;
  }, []);

  // --- Efeito 5: Salvar usuários registrados localmente sem senhas em texto simples (A4-11) ---
  useEffect(() => {
    if (!isReady) return;

    const saveUsers = async () => {
      try {
        const safeUsers = sanitizeUsersForStorage(registeredUsers);
        const serialized = JSON.stringify(safeUsers);
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.COLETOR.USERS, serialized),
          AsyncStorage.setItem(STORAGE_KEYS.SHARED.USERS, serialized),
        ]);
      } catch (error) {
        console.warn('Falha ao salvar usuários locais do coletor:', error);
      }
    };

    saveUsers();
  }, [registeredUsers, isReady]);

  // --- Efeito 6: Auto-Sincronização ao Reconectar à Internet ou Recuperar Saúde do Servidor ---
  useEffect(() => {
    if (!isReady || isOffline) return;

    const { updatedDiscards, syncedCount } =
      autoSyncService.processAutoSyncCollectorDiscards(items, isOffline);

    if (syncedCount > 0) {
      setItems(updatedDiscards);
      const newNotif = createNotification(
        'Coletas Sincronizadas',
        `${syncedCount} ${
          syncedCount === 1
            ? 'coleta realizada foi confirmada'
            : 'coletas realizadas foram confirmadas'
        } no servidor.`,
        'sync'
      );
      setNotifications((prev) => [newNotif, ...prev]);
    }
  }, [isOffline, isReady]);

  useEffect(() => {
    if (!isReady) return;
    const unsubscribe = crossAppSync.onSyncEvent((event) => {
      if (event.type === 'HEALTH_RESTORED') {
        crossAppSync
          .fetchAllDiscards()
          .then((remoteDiscards) => {
            if (Array.isArray(remoteDiscards) && remoteDiscards.length > 0) {
              setItems((prev) => {
                const map = new Map<string, CollectorDiscard>();
                prev.forEach((d) => map.set(d.id, d));
                remoteDiscards.forEach((d) => {
                  const normalized = normalizeToCollectorDiscard(d);
                  const existing = map.get(normalized.id);
                  const isCollected =
                    existing?.status === 'coletado' ||
                    normalized.status === 'coletado';
                  map.set(normalized.id, {
                    ...existing,
                    ...normalized,
                    status: isCollected ? 'coletado' : normalized.status,
                  });
                });
                return Array.from(map.values());
              });
            }
          })
          .catch(() => {});
      }
    });
    return unsubscribe;
  }, [isReady]);

  // --- Filtros e Seleções Computadas ---
  /** Lista de descartes pendentes filtrados pelo tipo de material selecionado */
  const pendingItems = useMemo(() => {
    return items.filter((item) => {
      const statusLower = (item.status || '').toLowerCase();
      const isPending =
        statusLower.includes('pendente') && !statusLower.includes('coletado');
      const itemType = item.wasteType || (item as any).type || '';
      const matchesFilter =
        selectedType === 'Todos' || itemType === selectedType;
      return isPending && matchesFilter;
    });
  }, [items, selectedType]);

  /** Lista de descartes que já foram coletados pelo usuário */
  const collectedItems = useMemo(() => {
    return items.filter((item) =>
      (item.status || '').toLowerCase().includes('coletado')
    );
  }, [items]);

  /** Descarte selecionado para exibição na tela de detalhes */
  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  /** Abre a tela de detalhes de um descarte específico */
  const openDetails = useCallback(
    (item: CollectorDiscard, backScreen: Screen) => {
      setSelectedItemId(item.id);
      setDetailsBackScreen(backScreen);
      setScreen('details');
    },
    []
  );

  /** Marca um descarte como coletado e sincroniza a baixa em tempo real */
  const markAsCollected = useCallback(
    async (id: string) => {
      const target = items.find((i) => i.id === id);
      const collectedDate = new Date().toLocaleDateString('pt-BR');
      const collectorId = currentUser?.id || 'user-coletor-1';

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: 'coletado',
                collectedAt: collectedDate,
                coletorId: collectorId,
                offlineSyncPending: isOffline,
              }
            : item
        )
      );

      await crossAppSync.markAsCollected(id, collectorId);

      const newNotif = createNotification(
        'Coleta Concluída',
        `Você coletou ${target?.wasteType || 'resíduo'} (${
          target?.quantity || ''
        }) em ${target?.neighborhood || 'seu destino'}, Cáceres - MT.`,
        'collection'
      );
      setNotifications((prev) => [newNotif, ...prev]);
      setFeedback('✓ Coleta registrada com sucesso.');

      setScreen('collected');
    },
    [currentUser?.id, isOffline, items]
  );

  /** Atualiza as informações do perfil do coletor sem persistir senhas em texto puro */
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
                  veiculo: updatedUser.veiculo,
                  capacidadeCarga: updatedUser.capacidadeCarga,
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
              veiculo: updatedUser.veiculo,
              capacidadeCarga: updatedUser.capacidadeCarga,
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
        STORAGE_KEYS.COLETOR.SESSION,
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

  /** Callback de login bem-sucedido com reconstituição completa do perfil */
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
            veiculo: localUser.veiculo || user.veiculo,
            capacidadeCarga: localUser.capacidadeCarga || user.capacidadeCarga,
            bio: localUser.bio || user.bio,
          }
        : user;

      const sessionToken = securityService.generateSessionToken(fullUser.id);
      crossAppSync.setAuthSession(fullUser, sessionToken);
      setCurrentUser(fullUser);
      setScreen('home');
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.COLETOR.SESSION,
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
    [registeredUsers]
  );

  /** Callback de cadastro bem-sucedido */
  const handleRegisterSuccess = useCallback(
    async (user: Usuario, updatedUsers: RegisteredUser[]) => {
      const safeUsers = sanitizeUsersForStorage(updatedUsers);
      const sessionToken = securityService.generateSessionToken(user.id);
      crossAppSync.setAuthSession(user, sessionToken);
      setRegisteredUsers(safeUsers);
      setCurrentUser(user);
      setScreen('home');
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.COLETOR.SESSION,
          JSON.stringify({
            user,
            token: sessionToken,
            loginAt: new Date().toISOString(),
          })
        );
      } catch (e) {
        console.warn('Falha ao salvar sessão:', e);
      }
    },
    []
  );

  /** Encerra a sessão do Coletor */
  const handleLogout = useCallback(async () => {
    crossAppSync.setAuthSession(null);
    setCurrentUser(null);
    setScreen('home');
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.COLETOR.SESSION);
    } catch (e) {
      console.warn('Falha ao remover sessão:', e);
    }
  }, []);

  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications),
    [notifications]
  );

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
      case 'available':
        return (
          <AvailableDiscardsScreen
            items={pendingItems}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            onOpenDetails={(item: CollectorDiscard) =>
              openDetails(item, 'available')
            }
            onCollect={markAsCollected}
            onBack={() => setScreen('home')}
          />
        );
      case 'details':
        return selectedItem ? (
          <DiscardDetailsScreen
            item={selectedItem}
            onCollect={markAsCollected}
            onBack={() => setScreen(detailsBackScreen)}
            isOffline={isOffline}
          />
        ) : (
          <AvailableDiscardsScreen
            items={pendingItems}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            onOpenDetails={(item: CollectorDiscard) =>
              openDetails(item, 'available')
            }
            onCollect={markAsCollected}
            onBack={() => setScreen('home')}
          />
        );
      case 'collected':
        return (
          <CollectedDiscardsScreen
            items={collectedItems}
            onOpenDetails={(item: CollectorDiscard) =>
              openDetails(item, 'collected')
            }
            onBack={() => setScreen('home')}
          />
        );
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
            onLogout={handleLogout}
            onOpenNotifications={() => setShowNotificationsModal(true)}
            unreadNotificationsCount={unreadCount}
            currentUser={currentUser}
            availableCount={pendingItems.length}
            collectedCount={collectedItems.length}
          />
        );
    }
  }, [
    screen,
    pendingItems,
    collectedItems,
    selectedItem,
    detailsBackScreen,
    selectedType,
    currentUser,
    registeredUsers,
    unreadCount,
    items,
    isOffline,
    openDetails,
    markAsCollected,
    handleUpdateUser,
    handleLoginSuccess,
    handleRegisterSuccess,
    handleLogout,
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
      <OfflineBanner isOffline={isOffline} />
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
      <FeedbackMessage message={feedback} onHide={() => setFeedback(null)} />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
