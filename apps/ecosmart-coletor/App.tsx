import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { AvailableDiscardsScreen } from './src/screens/AvailableDiscardsScreen';
import { CollectedDiscardsScreen } from './src/screens/CollectedDiscardsScreen';
import { DiscardDetailsScreen } from './src/screens/DiscardDetailsScreen';
import { CollectorDiscard, initialDiscards } from './src/data/mockData';

type Screen = 'home' | 'available' | 'details' | 'collected';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedType, setSelectedType] = useState('Todos');
  const [items, setItems] = useState<CollectorDiscard[]>(initialDiscards);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [detailsBackScreen, setDetailsBackScreen] = useState<Screen>('available');

  const pendingItems = useMemo(() => {
    return items.filter((item) => {
      const isPending = item.status === 'pendente';
      const matchesFilter = selectedType === 'Todos' || item.wasteType === selectedType;

      return isPending && matchesFilter;
    });
  }, [items, selectedType]);

  const collectedItems = useMemo(() => {
    return items.filter((item) => item.status === 'coletado');
  }, [items]);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.id === selectedItemId) ?? null;
  }, [items, selectedItemId]);

  const openDetails = (item: CollectorDiscard, backScreen: Screen) => {
    setSelectedItemId(item.id);
    setDetailsBackScreen(backScreen);
    setScreen('details');
  };

  const markAsCollected = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'coletado',
              collectedAt: new Date().toLocaleDateString('pt-BR'),
            }
          : item,
      ),
    );
    setScreen('collected');
  };

  const renderScreen = () => {
    if (screen === 'available') {
      return (
        <AvailableDiscardsScreen
          items={pendingItems}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          onOpenDetails={(item) => openDetails(item, 'available')}
          onBack={() => setScreen('home')}
        />
      );
    }

    if (screen === 'collected') {
      return (
        <CollectedDiscardsScreen
          items={collectedItems}
          onOpenDetails={(item) => openDetails(item, 'collected')}
          onBack={() => setScreen('home')}
        />
      );
    }

    if (screen === 'details' && selectedItem) {
      return (
        <DiscardDetailsScreen
          item={selectedItem}
          onCollect={markAsCollected}
          onBack={() => setScreen(detailsBackScreen)}
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
