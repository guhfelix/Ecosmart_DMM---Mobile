import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
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
import { ALL_DEFAULT_USERS, RegisteredUser } from './src/services/authService';
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
 * Gerencia visualização e filtragem de descartes em Cáceres, rotas de coleta, perfil operacional, notificações e sincronização inter-aplicativos.
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
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Hook de detecção de conectividade
  const { isOffline } = useNetworkStatus();

  // --- Efeito 1: Carregar dados salvos no dispositivo e sincronizar com persistência completa ---
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [storedData, storedSession, storedUsers, liveDiscards] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.COLETOR.DATA),
          AsyncStorage.getItem(STORAGE_KEYS.COLETOR.SESSION),
          AsyncStorage.getItem(STORAGE_KEYS.COLETOR.USERS),
          crossAppSync.fetchAllDiscards(),
        ]);

        const liveList = Array.isArray(liveDiscards) ? liveDiscards.map(normalizeToCollectorDiscard) : null;
        const localList: CollectorDiscard[] = storedData ? (JSON.parse(storedData) as any[]).map(normalizeToCollectorDiscard) : [];
        const mergedDiscards = liveList !== null ? liveList : localList;
        setItems(mergedDiscards);

        let parsedUsers: RegisteredUser[] = [];
        if (storedUsers) {
          parsedUsers = JSON.parse(storedUsers);
          setRegisteredUsers(parsedUsers);
        }

        if (storedSession) {
          const session = JSON.parse(storedSession);
          if (session?.user && session.user.perfil === 'coletor') {
            const existingInUsers = parsedUsers.find(
              (u) => u.email.trim().toLowerCase() === session.user.email.trim().toLowerCase()
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
                  capacidadeCarga: existingInUsers.capacidadeCarga || session.user.capacidadeCarga,
                  bio: existingInUsers.bio || session.user.bio,
                  updatedAt: existingInUsers.updatedAt || session.user.updatedAt,
                }
              : session.user;

            setCurrentUser(activeUser);

            firebaseService.getUserByEmail(activeUser.email).then((cloudUser) => {
              if (cloudUser) {
                setCurrentUser((prev) => (prev ? { ...prev, ...cloudUser } : cloudUser));
              }
            }).catch(() => {});
          }
        }
      } catch (error) {
        console.log('Erro ao carregar dados locais do coletor:', error);
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
        await AsyncStorage.setItem(STORAGE_KEYS.COLETOR.DATA, JSON.stringify(items));
      } catch (error) {
        console.log('Erro ao salvar dados locais do coletor:', error);
      }
    };

    saveData();
  }, [items, isReady]);

  // --- Efeito: Barramento de Eventos em Tempo Real (0ms) ---
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
      } else if (event.type === 'DISCARD_COLLECTED' && event.payload) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === event.payload.id
              ? {
                  ...item,
                  status: 'coletado',
                  collectedAt: event.payload.collectedAt || item.collectedAt || new Date().toLocaleDateString('pt-BR'),
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

  // --- Efeito 3: Sincronização Periódica Inter-Aplicativos em Tempo Real (Loop a cada 1.5s) ---
  useEffect(() => {
    if (!isReady) return;

    const syncCrossApp = async () => {
      try {
        const liveDiscards = await crossAppSync.fetchAllDiscards();
        if (liveDiscards && Array.isArray(liveDiscards)) {
          setItems((prev) => {
            const map = new Map<string, CollectorDiscard>();
            prev.forEach((d) => map.set(d.id, d));
            let newDiscardsFound = 0;
            let hasChanges = false;

            liveDiscards.forEach((remoteItem) => {
              if (!map.has(remoteItem.id)) {
                newDiscardsFound++;
                hasChanges = true;
                map.set(remoteItem.id, remoteItem);
              } else {
                const existing = map.get(remoteItem.id)!;
                // NUNCA regride um descarte coletado para pendente
                const isCollected = existing.status === 'coletado' || remoteItem.status === 'coletado';
                const finalStatus = isCollected ? 'coletado' : remoteItem.status;
                if (existing.status !== finalStatus || existing.address !== remoteItem.address) {
                  hasChanges = true;
                  map.set(remoteItem.id, {
                    ...existing,
                    ...remoteItem,
                    status: finalStatus,
                    collectedAt: remoteItem.collectedAt || existing.collectedAt,
                    coletorId: remoteItem.coletorId || existing.coletorId,
                  });
                }
              }
            });

            if (newDiscardsFound > 0) {
              const notif = createNotification(
                'Novo Descarte em Cáceres',
                `${newDiscardsFound} novo(s) descarte(s) disponível(is) para coleta.`,
                'discard'
              );
              setNotifications((n) => [notif, ...n]);
            }

            return hasChanges ? Array.from(map.values()) : prev;
          });
        }
      } catch (e) {}
    };

    const intervalId = setInterval(syncCrossApp, 1500);
    return () => clearInterval(intervalId);
  }, [isReady]);

  // --- Efeito 4: Salvar usuários registrados localmente ---
  useEffect(() => {
    if (!isReady) return;

    const saveUsers = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.COLETOR.USERS, JSON.stringify(registeredUsers));
        await AsyncStorage.setItem(STORAGE_KEYS.SHARED.USERS, JSON.stringify(registeredUsers));
      } catch (error) {
        console.log('Erro ao salvar usuários locais do coletor:', error);
      }
    };

    saveUsers();
  }, [registeredUsers, isReady]);

  // --- Efeito 5: Auto-Sincronização ao Reconectar à Internet ---
  useEffect(() => {
    if (!isReady || isOffline) return;

    const { updatedDiscards, syncedCount } = autoSyncService.processAutoSyncCollectorDiscards(
      items,
      isOffline
    );

    if (syncedCount > 0) {
      setItems(updatedDiscards);
      const newNotif = createNotification(
        'Coletas Sincronizadas',
        `${syncedCount} ${syncedCount === 1 ? 'coleta realizada foi confirmada' : 'coletas realizadas foram confirmadas'} no servidor.`,
        'sync'
      );
      setNotifications((prev) => [newNotif, ...prev]);
    }
  }, [isOffline, isReady]);

  // --- Filtros e Seleções Computadas ---
  /** Lista de descartes pendentes filtrados pelo tipo de material selecionado */
  const pendingItems = useMemo(() => {
    return items.filter((item) => {
      const isPending = (item.status || '').toLowerCase() === 'pendente';
      const matchesFilter = selectedType === 'Todos' || item.wasteType === selectedType;
      return isPending && matchesFilter;
    });
  }, [items, selectedType]);

  /** Lista de descartes que já foram coletados pelo usuário */
  const collectedItems = useMemo(() => {
    return items.filter((item) => (item.status || '').toLowerCase() === 'coletado');
  }, [items]);

  /** Descarte selecionado para exibição na tela de detalhes */
  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  /** Abre a tela de detalhes de um descarte específico */
  const openDetails = (item: CollectorDiscard, backScreen: Screen) => {
    setSelectedItemId(item.id);
    setDetailsBackScreen(backScreen);
    setScreen('details');
  };

  /** Marca um descarte como coletado e sincroniza a baixa em tempo real */
  const markAsCollected = async (id: string) => {
    const target = items.find((i) => i.id === id);
    const collectedDate = new Date().toLocaleDateString('pt-BR');

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'coletado',
              collectedAt: collectedDate,
              coletorId: currentUser?.id || 'user-coletor-1',
              offlineSyncPending: isOffline,
            }
          : item
      )
    );

    await crossAppSync.markAsCollected(id, currentUser?.id || 'user-coletor-1');

    const newNotif = createNotification(
      'Coleta Concluída',
      `Você coletou ${target?.wasteType || 'resíduo'} (${target?.quantity || ''}) em ${target?.neighborhood || 'seu destino'}, Cáceres - MT.`,
      'collection'
    );
    setNotifications((prev) => [newNotif, ...prev]);
    setFeedback('✓ Coleta registrada com sucesso.');

    setScreen('collected');
  };

  /** Atualiza as informações do perfil do coletor com persistência total */
  const handleUpdateUser = async (updatedUser: Usuario) => {
    setCurrentUser(updatedUser);
    setRegisteredUsers((prev) => {
      const emailLower = updatedUser.email.trim().toLowerCase();
      const exists = prev.some((u) => u.email.trim().toLowerCase() === emailLower || u.id === updatedUser.id);
      if (exists) {
        return prev.map((u) =>
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
        );
      }
      return [
        {
          id: updatedUser.id,
          name: updatedUser.nome,
          email: updatedUser.email,
          password: '1234',
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
    });

    crossAppSync.syncUserProfile(updatedUser);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.COLETOR.SESSION,
        JSON.stringify({ user: updatedUser, loginAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Erro ao salvar usuário atualizado:', e);
    }
  };

  /** Callback de login bem-sucedido com reconstituição completa do perfil */
  const handleLoginSuccess = async (user: Usuario) => {
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

    setCurrentUser(fullUser);
    setScreen('home');
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.COLETOR.SESSION,
        JSON.stringify({ user: fullUser, loginAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Erro ao salvar sessão:', e);
    }
  };

  /** Callback de cadastro bem-sucedido */
  const handleRegisterSuccess = async (user: Usuario, updatedUsers: RegisteredUser[]) => {
    setRegisteredUsers(updatedUsers);
    setCurrentUser(user);
    setScreen('home');
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.COLETOR.SESSION,
        JSON.stringify({ user, loginAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Erro ao salvar sessão:', e);
    }
  };

  /** Encerra a sessão */
  const handleLogout = async () => {
    setCurrentUser(null);
    setScreen('home');
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.COLETOR.SESSION);
    } catch (e) {
      console.log('Erro ao remover sessão:', e);
    }
  };

  const unreadCount = useMemo(() => getUnreadNotificationCount(notifications), [notifications]);

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
            onOpenDetails={(item: CollectorDiscard) => openDetails(item, 'available')}
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
            onOpenDetails={(item: CollectorDiscard) => openDetails(item, 'available')}
            onCollect={markAsCollected}
            onBack={() => setScreen('home')}
          />
        );
      case 'collected':
        return (
          <CollectedDiscardsScreen
            items={collectedItems}
            onOpenDetails={(item: CollectorDiscard) => openDetails(item, 'collected')}
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
        onMarkAllAsRead={() => setNotifications((prev) => markAllNotificationsAsRead(prev))}
      />
      <FeedbackMessage message={feedback} onHide={() => setFeedback(null)} />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
