import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
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
import { collectionPoints, tips, wasteTypes } from './src/data/mockData';
import { STORAGE_KEYS } from './src/services/storageKeys';
import { ALL_DEFAULT_USERS, RegisteredUser } from './src/services/authService';
import { AppNotification, DiscardItem, Usuario } from './src/models';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { OfflineBanner } from './src/components/OfflineBanner';
import { autoSyncService, normalizeToCitizenDiscard } from './src/services/syncService';
import { firebaseService } from './src/services/firebaseService';
import { crossAppSync } from './src/services/crossAppSync';
import {
  createNotification,
  getUnreadNotificationCount,
  INITIAL_NOTIFICATIONS,
  markAllNotificationsAsRead,
} from './src/services/notificationService';

/** Telas navegáveis disponíveis no fluxo do Cidadão */
type Screen = 'home' | 'register' | 'history' | 'details' | 'tips' | 'points' | 'profile';

/**
 * Componente Raiz do aplicativo EcoSmart Cidadão.
 * Gerencia autenticação, cadastro de descartes, histórico, pontos de coleta e dicas com sincronização em tempo real.
 */
export default function App() {
  // --- Estados de Navegação e Dados ---
  const [screen, setScreen] = useState<Screen>('home');
  const [items, setItems] = useState<DiscardItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    variant: 'success' | 'info' | 'warning' | 'danger';
  } | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Hook de detecção de conectividade
  const { isOffline } = useNetworkStatus();

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
          parsedUsers = JSON.parse(storedUsers);
          setRegisteredUsers(parsedUsers);
        }

        if (storedSession) {
          const session = JSON.parse(storedSession);
          if (session?.user && session.user.perfil === 'cidadao') {
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
                  bio: existingInUsers.bio || session.user.bio,
                  updatedAt: existingInUsers.updatedAt || session.user.updatedAt,
                }
              : session.user;

            setCurrentUser(activeUser);

            // Carrega exclusivamente os descartes do usuário ativo
            const [storedUserDiscards, userLiveDiscards] = await Promise.all([
              AsyncStorage.getItem(`${STORAGE_KEYS.CIDADAO.DISCARDS}_${activeUser.id}`),
              crossAppSync.fetchDiscardsByUser(activeUser.id, activeUser.email),
            ]);

            const liveList = Array.isArray(userLiveDiscards) ? userLiveDiscards.map(normalizeToCitizenDiscard) : null;
            const localList: DiscardItem[] = storedUserDiscards
              ? (JSON.parse(storedUserDiscards) as any[]).map(normalizeToCitizenDiscard)
              : [];
            const mergedDiscards = liveList !== null && liveList.length > 0 ? liveList : localList;
            setItems(mergedDiscards);

            firebaseService
              .getUserByEmail(activeUser.email)
              .then((cloudUser) => {
                if (cloudUser) {
                  setCurrentUser((prev) => (prev ? { ...prev, ...cloudUser } : cloudUser));
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
        console.log('Erro ao carregar dados locais do cidadão:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadAppData();
  }, []);

  // --- Efeito 2: Salvar descartes no AsyncStorage isolado por usuário ---
  useEffect(() => {
    if (!isReady || !currentUser) return;

    const saveDiscards = async () => {
      try {
        await AsyncStorage.setItem(
          `${STORAGE_KEYS.CIDADAO.DISCARDS}_${currentUser.id}`,
          JSON.stringify(items)
        );
        await AsyncStorage.setItem(STORAGE_KEYS.CIDADAO.DISCARDS, JSON.stringify(items));
      } catch (error) {
        console.log('Erro ao salvar descartes locais:', error);
      }
    };

    saveDiscards();
  }, [items, isReady, currentUser]);

  // --- Efeito: Barramento de Eventos em Tempo Real (0ms) ---
  useEffect(() => {
    const unsubscribe = crossAppSync.onSyncEvent((event) => {
      if (event.type === 'DISCARD_COLLECTED' && event.payload) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === event.payload.id ? { ...item, status: 'Coletado' } : item
          )
        );
        const notif = createNotification(
          'Descarte Recolhido!',
          'Seu descarte foi recolhido pelo coletor em Cáceres - MT.',
          'collection'
        );
        setNotifications((n) => [notif, ...n]);
      } else if (event.type === 'DISCARD_DELETED' && event.payload) {
        setItems((prev) => prev.filter((item) => item.id !== event.payload.id));
      }
    });

    return unsubscribe;
  }, []);

  // --- Efeito 3: Sincronização Periódica de Descartes Apenas do Cidadão Logado ---
  useEffect(() => {
    if (!isReady || !currentUser) return;

    const syncCrossApp = async () => {
      try {
        const liveDiscards = await crossAppSync.fetchDiscardsByUser(currentUser.id, currentUser.email);
        if (liveDiscards && Array.isArray(liveDiscards)) {
          setItems((prev) => {
            const map = new Map<string, DiscardItem>();
            prev.forEach((item) => map.set(item.id, item));
            let hasChanges = false;

            liveDiscards.map(normalizeToCitizenDiscard).forEach((remoteItem) => {
              if (!map.has(remoteItem.id)) {
                hasChanges = true;
                map.set(remoteItem.id, remoteItem);
              } else {
                const current = map.get(remoteItem.id)!;
                const isCollected = current.status === 'Coletado' || remoteItem.status === 'Coletado';
                const finalStatus = isCollected ? 'Coletado' : remoteItem.status;
                if (current.status !== finalStatus) {
                  hasChanges = true;
                  map.set(remoteItem.id, { ...current, status: finalStatus });
                }
              }
            });

            return hasChanges ? Array.from(map.values()) : prev;
          });
        }
      } catch (e) {}
    };

    const intervalId = setInterval(syncCrossApp, 1500);
    return () => clearInterval(intervalId);
  }, [isReady, currentUser]);

  // --- Efeito 4: Salvar lista de usuários cadastrados localmente ---
  useEffect(() => {
    if (!isReady) return;

    const saveUsers = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.CIDADAO.USERS, JSON.stringify(registeredUsers));
        await AsyncStorage.setItem(STORAGE_KEYS.SHARED.USERS, JSON.stringify(registeredUsers));
      } catch (error) {
        console.log('Erro ao salvar usuários locais:', error);
      }
    };

    saveUsers();
  }, [registeredUsers, isReady]);

  // --- Efeito 5: Auto-Sincronização em Segundo Plano ao Recuperar Conexão ---
  useEffect(() => {
    if (!isReady || isOffline) return;

    const { updatedDiscards, syncedCount } = autoSyncService.processAutoSyncCitizenDiscards(
      items,
      isOffline
    );

    if (syncedCount > 0) {
      setItems(updatedDiscards);
      const newNotif = createNotification(
        'Sincronização Concluída',
        `${syncedCount} ${syncedCount === 1 ? 'descarte foi sincronizado' : 'descartes foram sincronizados'} com sucesso com o servidor central.`,
        'sync'
      );
      setNotifications((prev) => [newNotif, ...prev]);
    }
  }, [isOffline, isReady]);

  /** Adiciona um novo descarte à lista em memória e transmite em tempo real para todos os apps e Firebase */
  const addDiscard = async (item: DiscardItem) => {
    const itemWithOwner: DiscardItem = {
      ...item,
      userId: currentUser?.id,
      citizenId: currentUser?.id,
      citizenEmail: currentUser?.email,
    };
    setItems((prev) => [itemWithOwner, ...prev]);
    setFeedback({
      message: item.offline
        ? '✓ Descarte salvo offline. Ele será sincronizado quando a conexão voltar.'
        : '✓ Descarte registrado com sucesso.',
      variant: item.offline ? 'warning' : 'success',
    });

    // 1. Persiste diretamente no Firebase Cloud Firestore com o dono correto
    await firebaseService.saveCitizenDiscard(itemWithOwner, currentUser || undefined).catch((err) => {
      console.log('Firebase discard save notice:', err);
    });

    // 2. Transmite através do canal de sincronização (Sync Server e Event Bus)
    await crossAppSync.postNewDiscard({
      ...itemWithOwner,
      userId: currentUser?.id,
      citizenId: currentUser?.id,
      citizenName: currentUser?.nome || 'Maria Cidadã Pantaneira',
      citizenEmail: currentUser?.email || 'maria@gmail.com',
      wasteType: item.type,
      createdAt: item.date,
      status: 'pendente',
    });

    const notifTitle = item.offline ? 'Descarte Salvo Offline' : 'Descarte Cadastrado';
    const notifMsg = item.offline
      ? `Seu descarte de ${item.type} (${item.quantity}) foi guardado localmente e sincronizará quando houver internet.`
      : `Seu descarte de ${item.type} (${item.quantity}) em Cáceres - MT foi registrado e já está visível para os coletores.`;

    const newNotif = createNotification(notifTitle, notifMsg, item.offline ? 'sync' : 'discard');
    setNotifications((prev) => [newNotif, ...prev]);
  };

  /** Apaga um descarte e propaga a exclusão em tempo real */
  const handleDeleteDiscard = async (id: string) => {
    const target = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    await crossAppSync.deleteDiscard(id);
    setSelectedItemId(null);
    setScreen('history');

    const notif = createNotification(
      'Descarte Excluído',
      `O registro de descarte de ${target?.type || 'material'} foi apagado com sucesso.`,
      'discard'
    );
    setNotifications((prev) => [notif, ...prev]);
    setFeedback({ message: '✓ Descarte excluído com sucesso.', variant: 'success' });
  };

  /** Atualiza o perfil do cidadão */
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
          bio: updatedUser.bio,
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    crossAppSync.syncUserProfile(updatedUser);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CIDADAO.SESSION,
        JSON.stringify({ user: updatedUser, loginAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Erro ao salvar usuário atualizado:', e);
    }
  };

  /** Callback de login bem-sucedido com reconstituição completa do perfil e carregamento de dados do usuário */
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
          bio: localUser.bio || user.bio,
        }
      : user;

    setCurrentUser(fullUser);
    setScreen('home');

    // Carrega apenas os descartes específicos desta conta
    try {
      const [storedUserDiscards, liveDiscards] = await Promise.all([
        AsyncStorage.getItem(`${STORAGE_KEYS.CIDADAO.DISCARDS}_${fullUser.id}`),
        crossAppSync.fetchDiscardsByUser(fullUser.id, fullUser.email),
      ]);
      const liveList = Array.isArray(liveDiscards) ? liveDiscards.map(normalizeToCitizenDiscard) : null;
      const localList: DiscardItem[] = storedUserDiscards
        ? (JSON.parse(storedUserDiscards) as any[]).map(normalizeToCitizenDiscard)
        : [];
      const userItems = liveList !== null && liveList.length > 0 ? liveList : localList;
      setItems(userItems);
    } catch (e) {
      setItems([]);
    }

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CIDADAO.SESSION,
        JSON.stringify({ user: fullUser, loginAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Erro ao salvar sessão:', e);
    }
  };

  /** Callback de cadastro bem-sucedido: inicializa conta com lista zerada de descartes */
  const handleRegisterSuccess = async (user: Usuario, updatedUsers: RegisteredUser[]) => {
    setRegisteredUsers(updatedUsers);
    setCurrentUser(user);
    // Novo usuário inicia com lista de descartes vazia (zero vazamento de dados de outras contas)
    setItems([]);
    setSelectedItemId(null);
    setScreen('home');

    try {
      await AsyncStorage.setItem(`${STORAGE_KEYS.CIDADAO.DISCARDS}_${user.id}`, JSON.stringify([]));
      await AsyncStorage.setItem(STORAGE_KEYS.CIDADAO.DISCARDS, JSON.stringify([]));
      await AsyncStorage.setItem(
        STORAGE_KEYS.CIDADAO.SESSION,
        JSON.stringify({ user, loginAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Erro ao salvar sessão:', e);
    }
  };

  /** Encerra a sessão e limpa integralmente os estados em memória e cache */
  const handleLogout = async () => {
    setCurrentUser(null);
    setItems([]); // Limpa os descartes em memória
    setSelectedItemId(null);
    setNotifications(INITIAL_NOTIFICATIONS);
    firebaseService.clearLocalMemoryCache(); // Limpa cache do Firebase Service
    setScreen('home');
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CIDADAO.SESSION);
      await AsyncStorage.removeItem(STORAGE_KEYS.CIDADAO.DISCARDS);
    } catch (e) {
      console.log('Erro ao remover sessão:', e);
    }
  };

  const unreadCount = useMemo(() => getUnreadNotificationCount(notifications), [notifications]);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  const openDiscardDetails = (item: DiscardItem) => {
    setSelectedItemId(item.id);
    setScreen('details');
  };

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
            defaultUserAddress={{
              cep: currentUser?.cep,
              endereco: currentUser?.endereco,
              numero: currentUser?.numero,
              bairro: currentUser?.bairro,
              cidade: currentUser?.cidade,
            }}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            items={items}
            onOpenDetails={openDiscardDetails}
            onRegister={() => setScreen('register')}
            onBack={() => setScreen('home')}
          />
        );
      case 'details':
        return selectedItem ? (
          <DiscardDetailsScreen
            item={selectedItem}
            onDelete={handleDeleteDiscard}
            onBack={() => setScreen('history')}
          />
        ) : (
          <HistoryScreen
            items={items}
            onOpenDetails={openDiscardDetails}
            onRegister={() => setScreen('register')}
            onBack={() => setScreen('home')}
          />
        );
      case 'tips':
        return (
          <TipsScreen
            onBack={() => setScreen('home')}
          />
        );
      case 'points':
        return (
          <CollectionPointsScreen
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
            onOpenDiscardDetails={openDiscardDetails}
            onLogout={handleLogout}
            onOpenNotifications={() => setShowNotificationsModal(true)}
            unreadNotificationsCount={unreadCount}
            currentUser={currentUser}
            items={items}
          />
        );
    }
  }, [screen, items, selectedItem, currentUser, registeredUsers, unreadCount, isOffline]);

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
      <FeedbackMessage
        message={feedback?.message}
        variant={feedback?.variant}
        onHide={() => setFeedback(null)}
      />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
