import React, { useEffect, useMemo, useState } from 'react';
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

// Modelos, Serviços e Hooks
import { STORAGE_KEYS } from './src/services/storageKeys';
import { RegisteredUser } from './src/services/authService';
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
type Screen = 'home' | 'wasteTypes' | 'collectionPoints' | 'tips' | 'records' | 'profile';

const createId = () => generateEntityId('adm');

/**
 * Componente Raiz do aplicativo EcoSmart Admin.
 * Gerencia autenticação restrita, CRUDs com busca e persistência, perfil/governança, relatórios ESG, auto-sync e notificações.
 */
export default function App() {
  // --- Estados de Navegação e Entidades Gerenciadas ---
  const [screen, setScreen] = useState<Screen>('home');
  const [wasteTypes, setWasteTypes] = useState<WasteTypeItem[]>(initialWasteTypes);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPointItem[]>(initialCollectionPoints);
  const [educationalTips, setEducationalTips] = useState<EducationalTipItem[]>(initialEducationalTips);
  const [records, setRecords] = useState<AdminDiscardRecord[]>(initialDiscardRecords);
  const [recordFilter, setRecordFilter] = useState<'todos' | AdminDiscardStatus>('todos');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Hook de conectividade
  const { isOffline } = useNetworkStatus();

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
        
        const liveList = Array.isArray(liveDiscards) ? liveDiscards.map(normalizeToAdminDiscard) : null;
        const localList: AdminDiscardRecord[] = storedRecords ? (JSON.parse(storedRecords) as any[]).map(normalizeToAdminDiscard) : [];
        const mergedRecords = liveList !== null ? liveList : localList;
        setRecords(mergedRecords);

        let parsedUsers: RegisteredUser[] = [];
        if (storedUsers) {
          parsedUsers = JSON.parse(storedUsers);
          setRegisteredUsers(parsedUsers);
        }

        if (storedSession) {
          const session = JSON.parse(storedSession);
          if (session?.user && session.user.perfil === 'admin') {
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
                  cargo: existingInUsers.cargo || session.user.cargo,
                  departamento: existingInUsers.departamento || session.user.departamento,
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
        console.log('Erro ao carregar dados locais do admin:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadAppData();
  }, []);

  // --- Efeito: Barramento de Eventos em Tempo Real (0ms) ---
  useEffect(() => {
    const unsubscribe = crossAppSync.onSyncEvent((event) => {
      if (event.type === 'NEW_DISCARD' && event.payload) {
        const newRecord = normalizeToAdminDiscard(event.payload);
        setRecords((prev) => {
          if (prev.some((x) => x.id === newRecord.id)) return prev;
          return [newRecord, ...prev];
        });
      } else if (event.type === 'DISCARD_COLLECTED' && event.payload) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === event.payload.id
              ? {
                  ...r,
                  status: 'coletado',
                  collectedAt: event.payload.collectedAt || (r as any).collectedAt || new Date().toLocaleDateString('pt-BR'),
                  coletorId: event.payload.coletorId || (r as any).coletorId,
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

  // --- Efeito: Sincronização Periódica Inter-Aplicativos no Admin em Tempo Real ---
  useEffect(() => {
    if (!isReady) return;

    const syncCrossApp = async () => {
      try {
        const liveDiscards = await crossAppSync.fetchAllDiscards();
        if (liveDiscards && Array.isArray(liveDiscards)) {
          setRecords((prev) => {
            const map = new Map<string, AdminDiscardRecord>();
            prev.forEach((r) => map.set(r.id, r));
            let hasChanges = false;

            liveDiscards.map(normalizeToAdminDiscard).forEach((d) => {
              if (!map.has(d.id)) {
                hasChanges = true;
                map.set(d.id, d);
              } else {
                const existing = map.get(d.id)!;
                const isCollected = existing.status === 'coletado' || d.status === 'coletado';
                const finalStatus = isCollected ? 'coletado' : d.status;
                if (existing.status !== finalStatus) {
                  hasChanges = true;
                  map.set(d.id, {
                    ...existing,
                    ...d,
                    status: finalStatus,
                    collectedAt: d.collectedAt || (existing as any).collectedAt,
                    coletorId: d.coletorId || (existing as any).coletorId,
                  });
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
  }, [isReady]);

  // --- Efeitos de Persistência para cada CRUD ---
  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.ADMIN.WASTE_TYPES, JSON.stringify(wasteTypes)).catch(console.log);
  }, [wasteTypes, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.ADMIN.COLLECTION_POINTS, JSON.stringify(collectionPoints)).catch(console.log);
  }, [collectionPoints, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.ADMIN.TIPS, JSON.stringify(educationalTips)).catch(console.log);
  }, [educationalTips, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.ADMIN.RECORDS, JSON.stringify(records)).catch(console.log);
  }, [records, isReady]);

  useEffect(() => {
    if (!isReady) return;
    AsyncStorage.setItem(STORAGE_KEYS.ADMIN.USERS, JSON.stringify(registeredUsers)).catch(console.log);
    AsyncStorage.setItem(STORAGE_KEYS.SHARED.USERS, JSON.stringify(registeredUsers)).catch(console.log);
  }, [registeredUsers, isReady]);

  // --- Handlers de Autenticação e Usuário ---
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
                cargo: updatedUser.cargo,
                departamento: updatedUser.departamento,
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
          cargo: updatedUser.cargo,
          departamento: updatedUser.departamento,
          bio: updatedUser.bio,
          updatedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    crossAppSync.syncUserProfile(updatedUser);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ADMIN.SESSION,
        JSON.stringify({ user: updatedUser, loginAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Erro ao salvar usuário atualizado:', e);
    }
  };

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
          cargo: localUser.cargo || user.cargo,
          departamento: localUser.departamento || user.departamento,
          bio: localUser.bio || user.bio,
        }
      : user;

    setCurrentUser(fullUser);
    setScreen('home');
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ADMIN.SESSION,
        JSON.stringify({ user: fullUser, loginAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Erro ao salvar sessão:', e);
    }
  };

  const handleRegisterSuccess = async (user: Usuario, updatedUsers: RegisteredUser[]) => {
    setRegisteredUsers(updatedUsers);
    setCurrentUser(user);
    setScreen('home');
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ADMIN.SESSION,
        JSON.stringify({ user, loginAt: new Date().toISOString() })
      );
    } catch (e) {
      console.log('Erro ao salvar sessão:', e);
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setScreen('home');
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ADMIN.SESSION);
    } catch (e) {
      console.log('Erro ao remover sessão:', e);
    }
  };

  // --- Funções de Mutação de CRUDs ---
  const saveWasteType = (input: { id?: string; name: string; description: string }) => {
    if (input.id) {
      setWasteTypes((prev) => prev.map((item) => (item.id === input.id ? { ...item, ...input, id: item.id } : item)));
      return;
    }
    setWasteTypes((prev) => [{ ...input, id: createId() }, ...prev]);
    const notif = createNotification('Tipo de Resíduo Cadastrado', `Novo material adicionado: ${input.name}.`, 'system');
    setNotifications((prev) => [notif, ...prev]);
  };

  const saveCollectionPoint = (input: {
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
        prev.map((item) => (item.id === input.id ? { ...item, ...input, id: item.id } : item)),
      );
      return;
    }
    setCollectionPoints((prev) => [{ ...input, id: createId() }, ...prev]);
    const notif = createNotification('Ecoponto Cadastrado', `Novo local disponível: ${input.name}.`, 'system');
    setNotifications((prev) => [notif, ...prev]);
  };

  const saveEducationalTip = (input: { id?: string; title: string; category: string; content: string }) => {
    if (input.id) {
      setEducationalTips((prev) =>
        prev.map((item) => (item.id === input.id ? { ...item, ...input, id: item.id } : item)),
      );
      return;
    }
    setEducationalTips((prev) => [{ ...input, id: createId() }, ...prev]);
    const notif = createNotification('Dica Publicada', `Novo conteúdo educativo: ${input.title}.`, 'system');
    setNotifications((prev) => [notif, ...prev]);
  };

  const deleteWasteType = (id: string) => {
    setWasteTypes((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteCollectionPoint = (id: string) => {
    setCollectionPoints((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteEducationalTip = (id: string) => {
    setEducationalTips((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteRecord = async (id: string) => {
    const target = records.find((r) => r.id === id);
    setRecords((prev) => prev.filter((item) => item.id !== id));
    await crossAppSync.deleteDiscard(id);
    const notif = createNotification('Registro Excluído', `O registro de ${target?.wasteType || 'descarte'} foi removido.`, 'system');
    setNotifications((prev) => [notif, ...prev]);
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
    isOffline,
  ]);

  return (
    <SafeAreaProvider>
      <OfflineBanner isOffline={isOffline} />
      {renderScreen}
      <NotificationModal
        visible={showNotificationsModal}
        notifications={notifications}
        onClose={() => setShowNotificationsModal(false)}
        onMarkAllAsRead={() => setNotifications((prev) => markAllNotificationsAsRead(prev))}
      />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}