import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { WasteTypesScreen } from './src/screens/WasteTypesScreen';
import { CollectionPointsScreen } from './src/screens/CollectionPointsScreen';
import { EducationalTipsScreen } from './src/screens/EducationalTipsScreen';
import { RecordsScreen } from './src/screens/RecordsScreen';
import { AuthScreen, AuthUserInput } from './src/screens/AuthScreen';
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

type Screen = 'home' | 'wasteTypes' | 'collectionPoints' | 'tips' | 'records';
type RecordFilter = 'todos' | AdminDiscardStatus;

type WasteTypeInput = Omit<WasteTypeItem, 'id'> & { id?: string };
type CollectionPointInput = Omit<CollectionPointItem, 'id'> & { id?: string };
type EducationalTipInput = Omit<EducationalTipItem, 'id'> & { id?: string };

const createId = () => `${Date.now()}`;
const TEST_USER: AuthUserInput = {
  name: 'João',
  email: 'joao@gmail.com',
  password: '1234',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [wasteTypes, setWasteTypes] = useState<WasteTypeItem[]>(initialWasteTypes);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPointItem[]>(initialCollectionPoints);
  const [educationalTips, setEducationalTips] = useState<EducationalTipItem[]>(initialEducationalTips);
  const [records] = useState<AdminDiscardRecord[]>(initialDiscardRecords);
  const [recordFilter, setRecordFilter] = useState<RecordFilter>('todos');
  const [currentUser, setCurrentUser] = useState<AuthUserInput | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<AuthUserInput[]>([]);

  const handleLogin = (email: string, password: string) => {
    const user = [TEST_USER, ...registeredUsers].find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
    );

    if (!user) {
      return false;
    }

    setCurrentUser(user);
    setScreen('home');
    return true;
  };

  const handleRegister = (user: AuthUserInput) => {
    const normalizedUser = { ...user, email: user.email.toLowerCase() };
    setRegisteredUsers((prev) => [
      normalizedUser,
      ...prev.filter((item) => item.email.toLowerCase() !== normalizedUser.email),
    ]);
    setCurrentUser(normalizedUser);
    setScreen('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen('home');
  };

  const saveWasteType = (input: WasteTypeInput) => {
    if (input.id) {
      setWasteTypes((prev) => prev.map((item) => (item.id === input.id ? { ...item, ...input, id: item.id } : item)));
      return;
    }

    setWasteTypes((prev) => [{ ...input, id: createId() }, ...prev]);
  };

  const saveCollectionPoint = (input: CollectionPointInput) => {
    if (input.id) {
      setCollectionPoints((prev) =>
        prev.map((item) => (item.id === input.id ? { ...item, ...input, id: item.id } : item)),
      );
      return;
    }

    setCollectionPoints((prev) => [{ ...input, id: createId() }, ...prev]);
  };

  const saveEducationalTip = (input: EducationalTipInput) => {
    if (input.id) {
      setEducationalTips((prev) =>
        prev.map((item) => (item.id === input.id ? { ...item, ...input, id: item.id } : item)),
      );
      return;
    }

    setEducationalTips((prev) => [{ ...input, id: createId() }, ...prev]);
  };

  const renderScreen = () => {
    if (!currentUser) {
      return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />;
    }

    if (screen === 'wasteTypes') {
      return (
        <WasteTypesScreen
          items={wasteTypes}
          onSave={saveWasteType}
          onDelete={(id) => setWasteTypes((prev) => prev.filter((item) => item.id !== id))}
          onBack={() => setScreen('home')}
        />
      );
    }

    if (screen === 'collectionPoints') {
      return (
        <CollectionPointsScreen
          items={collectionPoints}
          onSave={saveCollectionPoint}
          onDelete={(id) => setCollectionPoints((prev) => prev.filter((item) => item.id !== id))}
          onBack={() => setScreen('home')}
        />
      );
    }

    if (screen === 'tips') {
      return (
        <EducationalTipsScreen
          items={educationalTips}
          onSave={saveEducationalTip}
          onDelete={(id) => setEducationalTips((prev) => prev.filter((item) => item.id !== id))}
          onBack={() => setScreen('home')}
        />
      );
    }

    if (screen === 'records') {
      return (
        <RecordsScreen
          items={records}
          selectedFilter={recordFilter}
          onSelectFilter={setRecordFilter}
          onBack={() => setScreen('home')}
        />
      );
    }

    return <HomeScreen onNavigate={setScreen} onLogout={handleLogout} />;
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="light" />
    </>
  );
}
