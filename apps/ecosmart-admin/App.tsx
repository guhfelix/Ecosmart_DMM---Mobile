import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { WasteTypesScreen } from './src/screens/WasteTypesScreen';
import { CollectionPointsScreen } from './src/screens/CollectionPointsScreen';
import { EducationalTipsScreen } from './src/screens/EducationalTipsScreen';
import { RecordsScreen } from './src/screens/RecordsScreen';
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

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [wasteTypes, setWasteTypes] = useState<WasteTypeItem[]>(initialWasteTypes);
  const [collectionPoints, setCollectionPoints] = useState<CollectionPointItem[]>(initialCollectionPoints);
  const [educationalTips, setEducationalTips] = useState<EducationalTipItem[]>(initialEducationalTips);
  const [records] = useState<AdminDiscardRecord[]>(initialDiscardRecords);
  const [recordFilter, setRecordFilter] = useState<RecordFilter>('todos');

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

    return <HomeScreen onNavigate={setScreen} />;
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="light" />
    </>
  );
}
