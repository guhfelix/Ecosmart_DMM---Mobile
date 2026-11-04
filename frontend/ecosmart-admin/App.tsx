import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Telas do perfil Administrador
import { HomeScreen } from './src/screens/HomeScreen';
import { WasteTypesScreen } from './src/screens/WasteTypesScreen';
import { CollectionPointsScreen } from './src/screens/CollectionPointsScreen';
import { EducationalTipsScreen } from './src/screens/EducationalTipsScreen';
import { RecordsScreen } from './src/screens/RecordsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { NotificationModal } from './src/components/NotificationModal';
import { ScreenTransition } from './src/components/ScreenTransition';
import { LoadingScreen } from './src/components/LoadingScreen';
import { FeedbackMessage } from './src/components/FeedbackMessage';

// Modelos, Serviços e Hooks
import { STORAGE_KEYS } from './src/services/storageKeys';
import {
  RegisteredUser,
  sanitizeUsersForStorage,
} from './src/services/authService';
import { securityService } from './src/services/securityService';
import { AppNotification, Usuario } from './src/models';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import { OfflineBanner } from './src/components/OfflineBanner';
import { autoSyncService, normalizeToAdminDiscard } from './src/services/syncService';
import { firebaseService } from './src/services/firebaseService';
import { crossAppSync } from './src/services/crossAppSync';
import {
  createNotification,
  getUnreadNotificationCount,
  INITIAL_NOTIFICATIONS,
  markAllNotificationsAsRead,
} from './src/services/notificationService';
import {
  AdminDiscardRecord,
  AdminDiscardStatus,
  CollectionPointItem,
  EducationalTipItem,
  initialCollectionPoints,
  initialDiscardRecords,
  initialEducationalTips,
  initialWasteTypes,
  WasteTypeItem,
} from './src/data/mockData';
import { generateEntityId } from './src/utils/idUtils';

/** Telas gerenciadas pelo perfil Administrador */
type Screen =
  | 'home'
  | 'wasteTypes'
  | 'collectionPoints'
  | 'tips'
  | 'records'
  | 'profile';

const createId = () => generateEntityId('adm');

/**
 * Componente Raiz do aplicativo EcoSmart Admin.
 * Gerencia autenticação restrita, CRUDs com busca e persistência,
 * perfil/governança, relatórios ESG, auto-sync e notificações.
 */
export default function App() {
  // --- Estados de Navegação e Entidades Gerenciadas ---
  const [screen, setScreen] = useState<Screen>('home');
  const [wasteTypes, setWasteTypes] =
    useState<WasteTypeItem[]>(initialWasteTypes);
  const [collectionPoints, setCollectionPoints] =
    useState<CollectionPointItem[]>(initialCollectionPoints);
  const [educationalTips, setEducationalTips] = useState<EducationalTipItem[]>(
    initialEducationalTips
  );
  const [records, setRecords] = useState<AdminDiscardRecord[]>(
    initialDiscardRecords
  );
  const [recordFilter, setRecordFilter] = useState<
    'todos' | AdminDiscardStatus
  >('todos');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    INITIAL_NOTIFICATIONS
  );
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Hook reativo de conectividade
  const { isOffline, isServerReachable } = useNetworkStatus();
  const wasOfflineRef = useRef(isOffline);

  // --- Efeito de Alerta Imediato ao Ficar Offline / Reconectar ---
  useEffect(() => {
    if (!isReady) {
      wasOfflineRef.current = isOffline;
      return;
    }
    if (isOffline && !wasOfflineRef.current) {
      wasOfflineRef.current = true;
      setFeedback(
        '⚠️ Você está offline. Suas alterações e registros serão salvos no dispositivo e sincronizados automaticamente ao reconectar.'
      );
      const offlineNotif = createNotification(
        'Modo Offline Ativado',
        'Sem conexão com a internet. Os dados administrativos continuam salvos localmente.',
        'sync'
      );
      setNotifications((prev) => [offlineNotif, ...prev]);
    } else if (!isOffline && wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setFeedback('🔄 Conexão restabelecida! Sincronizando dados administrativos com a nuvem...');
    }
  }, [isOffline, isReady]);

  // --- Efeito 1: Carregar todos os dados salvos localmente e da nuvem com persistência de perfil ---
  useEffect(() => {
    const loadAppData = async () => {
      try {
        const [
          storedWasteTypes,
          storedPoints,
          storedTips,
          storedRecords,
          storedSession,
          storedUsers,
          liveDiscards,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ADMIN.WASTE_TYPES),
          AsyncStorage.getItem(STORAGE_KEYS.ADMIN.COLLECTION_POINTS),
          AsyncStorage.getItem(STORAGE_KEYS.ADMIN.TIPS),
          AsyncStorage.getItem(STORAGE_KEYS.ADMIN.RECORDS),
          AsyncStorage.getItem(STORAGE_KEYS.ADMIN.SESSION),
          AsyncStorage.getItem(STORAGE_KEYS.ADMIN.USERS),
          crossAppSync.fetchAllDiscards(),
        ]);

        if (storedWasteTypes) setWasteTypes(JSON.parse(storedWasteTypes));
        if (storedPoints) setCollectionPoints(JSON.parse(storedPoints));
        if (storedTips) setEducationalTips(JSON.parse(storedTips));

        const liveList = Array.isArray(liveDiscards)
          ? liveDiscards.map(normalizeToAdminDiscard)
          : null;
        const localList: AdminDiscardRecord[] = storedRecords
          ? (JSON.parse(storedRecords) as any[]).map(normalizeToAdminDiscard)
          : [];
        const mergedRecords = liveList !== null ? liveList : localList;
        setRecords(mergedRecords);

        let parsedUsers: RegisteredUser[] = [];
        if (storedUsers) {
          parsedUsers = sanitizeUsersForStorage(JSON.parse(storedUsers));
          setRegisteredUsers(parsedUsers);
        }

        if (storedSession) {
          const session = JSON.parse(storedSession);
          if (session?.user && session.user.perfil === 'admin') {
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
                  cargo: existingInUsers.cargo || session.user.cargo,
                  departamento:
                    existingInUsers.departamento || session.user.departamento,
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
        console.warn('Falha ao carregar dados locais do admin:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadAppData();
  }, []);

  // --- Efeito 2: Barramento de Eventos em Tempo Real (0ms) ---
  useEffect(() => {
    const unsubscribe = crossAppSync.onSyncEvent((event) => {
      if (event.type === 'NEW_DISCARD' && event.payload) {
        const newRecord = normalizeToAdminDiscard(event.payload);
        setRecords((prev) => {
          if (prev.some((x) => x.id === newRecord.id)) return prev;
          return [newRecord, ...prev];
        });
      } else if (event.type === 'DISCARD_UPDATED' && event.payload) {
        const updatedRecord = normalizeToAdminDiscard(event.payload);
        setRecords((prev) =>
          prev.map((r) =>
            r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r
          )
        );
      } else if (event.type === 'DISCARD_COLLECTED' && event.payload) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === event.payload.id
              ? {
                  ...r,
                  status: 'coletado',
                  collectedAt:
                    event.payload.collectedAt ||
                    r.collectedAt ||
                    new Date().toLocaleDateString('pt-BR'),
                  coletorId: event.payload.coletorId || r.coletorId,
                }
              : r
          )
        );
      } else if (event.type === 'DISCARD_DELETED' && event.payload) {
        setRecords((prev) => prev.filter((r) => r.id !== event.payload.id));
      }
    });

    return unsubscribe;
  }, []);

  // --- Efeito 3: Auto-Sincronização ao Reconectar à Internet ou Recuperar Saúde do Servidor ---
  useEffect(() => {
    if (!isReady || isOffline) return;

    const { updatedRecords, syncedCount } =
      autoSyncService.processAutoSyncAdminRecords(records, isOffline);
    if (syncedCount > 0) {
      setRecords(updatedRecords);
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
              setRecords((prev) => {
                const map = new Map<string, AdminDiscardRecord>();
                prev.forEach((r) => map.set(r.id, r));
                remoteDiscards.forEach((d) => {
                  const normalized = normalizeToAdminDiscard(d);
                  map.set(normalized.id, {
                    ...map.get(normalized.id),
                    ...normalized,
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

  // --- Efeitos de Persistência para cada CRUD ---
  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(
      STORAGE_KEYS.ADMIN.WASTE_TYPES,
      JSON.stringify(wasteTypes)
    ).catch((e) => console.warn('Falha ao salvar tipos de resíduos:', e));
  }, [wasteTypes, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(
      STORAGE_KEYS.ADMIN.COLLECTION_POINTS,
      JSON.stringify(collectionPoints)
    ).catch((e) => console.warn('Falha ao salvar pontos de coleta:', e));
  }, [collectionPoints, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(
      STORAGE_KEYS.ADMIN.TIPS,
      JSON.stringify(educationalTips)
    ).catch((e) => console.warn('Falha ao salvar dicas educativas:', e));
  }, [educationalTips, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(
      STORAGE_KEYS.ADMIN.RECORDS,
      JSON.stringify(records)
    ).catch((e) => console.warn('Falha ao salvar registros:', e));
  }, [records, isReady]);

  useEffect(() => {
    if (!isReady) return;
    const safeUsers = sanitizeUsersForStorage(registeredUsers);
    const serialized = JSON.stringify(safeUsers);
    Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ADMIN.USERS, serialized),
      AsyncStorage.setItem(STORAGE_KEYS.SHARED.USERS, serialized),
    ]).catch((e) => console.warn('Falha ao salvar usuários:', e));
  }, [registeredUsers, isReady]);

  // --- Manipuladores de Autenticação e Usuário ---
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
                  cargo: updatedUser.cargo,
                  departamento: updatedUser.departamento,
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
              cargo: updatedUser.cargo,
              departamento: updatedUser.departamento,
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
        STORAGE_KEYS.ADMIN.SESSION,
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
            cargo: localUser.cargo || user.cargo,
            departamento: localUser.departamento || user.departamento,
            bio: localUser.bio || user.bio,
          }
        : user;

      const sessionToken = securityService.generateSessionToken(fullUser.id);
      crossAppSync.setAuthSession(fullUser, sessionToken);
      setCurrentUser(fullUser);
      setScreen('home');
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ADMIN.SESSION,
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
          STORAGE_KEYS.ADMIN.SESSION,
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

  const handleLogout = useCallback(async () => {
    crossAppSync.setAuthSession(null);
    setCurrentUser(null);
    setScreen('home');
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ADMIN.SESSION);
    } catch (e) {
      console.warn('Falha ao remover sessão:', e);
    }
  }, []);

  // --- Funções de Mutação de CRUDs ---
  const saveWasteType = useCallback(
    (input: { id?: string; name: string; description: string }) => {
      if (input.id) {
        setWasteTypes((prev) =>
          prev.map((item) =>
            item.id === input.id ? { ...item, ...input, id: item.id } : item
          )
        );
        return;
      }
      setWasteTypes((prev) => [{ ...input, id: createId() }, ...prev]);
      const notif = createNotification(
        'Tipo de Resíduo Cadastrado',
        `Novo material adicionado: ${input.name}.`,
        'system'
      );
      setNotifications((prev) => [notif, ...prev]);
    },
    []
  );

  const saveCollectionPoint = useCallback(
    (input: {
      id?: string;
      name: string;
      address: string;
      acceptedWaste: string;
      schedule: string;
      neighborhood?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      if (input.id) {
        setCollectionPoints((prev) =>
          prev.map((item) =>
            item.id === input.id ? { ...item, ...input, id: item.id } : item
          )
        );
        return;
      }
      setCollectionPoints((prev) => [{ ...input, id: createId() }, ...prev]);
      const notif = createNotification(
        'Ecoponto Cadastrado',
        `Novo local disponível: ${input.name}.`,
        'system'
      );
      setNotifications((prev) => [notif, ...prev]);
    },
    []
  );

  const saveEducationalTip = useCallback(
    (input: { id?: string; title: string; category: string; content: string }) => {
      if (input.id) {
        setEducationalTips((prev) =>
          prev.map((item) =>
            item.id === input.id ? { ...item, ...input, id: item.id } : item
          )
        );
        return;
      }
      setEducationalTips((prev) => [{ ...input, id: createId() }, ...prev]);
      const notif = createNotification(
        'Dica Publicada',
        `Novo conteúdo educativo: ${input.title}.`,
        'system'
      );
      setNotifications((prev) => [notif, ...prev]);
    },
    []
  );

  const deleteWasteType = useCallback((id: string) => {
    setWasteTypes((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const deleteCollectionPoint = useCallback((id: string) => {
    setCollectionPoints((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const deleteEducationalTip = useCallback((id: string) => {
    setEducationalTips((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleDeleteRecord = useCallback(
    async (id: string) => {
      const target = records.find((r) => r.id === id);
      setRecords((prev) => prev.filter((item) => item.id !== id));
      await crossAppSync.deleteDiscard(id, 'admin', currentUser?.id);
      const notif = createNotification(
        'Registro Excluído',
        `O registro de ${target?.wasteType || 'descarte'} foi removido.`,
        'system'
      );
      setNotifications((prev) => [notif, ...prev]);
      setFeedback('✓ Registro excluído com sucesso.');
    },
    [currentUser?.id, records]
  );

  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications),
    [notifications]
  );

  const pendingRecordsCount = useMemo(
    () => records.filter((item) => item.status === 'pendente').length,
    [records]
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
      case 'wasteTypes':
        return (
          <WasteTypesScreen
            items={wasteTypes}
            onSave={saveWasteType}
            onDelete={deleteWasteType}
            onBack={() => setScreen('home')}
            isOffline={isOffline}
          />
        );
      case 'collectionPoints':
        return (
          <CollectionPointsScreen
            items={collectionPoints}
            onSave={saveCollectionPoint}
            onDelete={deleteCollectionPoint}
            onBack={() => setScreen('home')}
            isOffline={isOffline}
          />
        );
      case 'tips':
        return (
          <EducationalTipsScreen
            items={educationalTips}
            onSave={saveEducationalTip}
            onDelete={deleteEducationalTip}
            onBack={() => setScreen('home')}
            isOffline={isOffline}
          />
        );
      case 'records':
        return (
          <RecordsScreen
            items={records}
            selectedFilter={recordFilter}
            onSelectFilter={setRecordFilter}
            onDelete={handleDeleteRecord}
            onBack={() => setScreen('home')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={currentUser}
            records={records}
            wasteTypes={wasteTypes}
            collectionPoints={collectionPoints}
            onUpdateUser={handleUpdateUser}
            onBack={() => setScreen('home')}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen
            onNavigate={(nextScreen) => setScreen(nextScreen)}
            onLogout={handleLogout}
            onOpenNotifications={() => setShowNotificationsModal(true)}
            unreadNotificationsCount={unreadCount}
            wasteTypesCount={wasteTypes.length}
            collectionPointsCount={collectionPoints.length}
            recordsCount={records.length}
            pendingRecordsCount={pendingRecordsCount}
          />
        );
    }
  }, [
    screen,
    wasteTypes,
    collectionPoints,
    educationalTips,
    records,
    recordFilter,
    currentUser,
    registeredUsers,
    unreadCount,
    pendingRecordsCount,
    isOffline,
    saveWasteType,
    saveCollectionPoint,
    saveEducationalTip,
    deleteWasteType,
    deleteCollectionPoint,
    deleteEducationalTip,
    handleDeleteRecord,
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
      <OfflineBanner
        isOffline={isOffline}
        isServerReachable={isServerReachable}
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
      <FeedbackMessage message={feedback} onHide={() => setFeedback(null)} />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
