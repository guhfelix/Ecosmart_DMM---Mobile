import React, { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { RegisterDiscardScreen, DiscardItem } from './src/screens/RegisterDiscardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { TipsScreen } from './src/screens/TipsScreen';
import { CollectionPointsScreen } from './src/screens/CollectionPointsScreen';

const STORAGE_KEY = '@ecosmart_cidadao_discards';

type Screen = 'home' | 'register' | 'history' | 'tips' | 'points';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [items, setItems] = useState<DiscardItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch (error) {
        console.log('Erro ao carregar dados locais:', error);
      } finally {
        setIsReady(true);
      }
    };

    loadItems();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const saveItems = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.log('Erro ao salvar dados locais:', error);
      }
    };

    saveItems();
  }, [items, isReady]);

  const addDiscard = (item: DiscardItem) => {
    setItems((prev) => [item, ...prev]);
  };

  const renderScreen = useMemo(() => {
    switch (screen) {
      case 'register':
        return <RegisterDiscardScreen onSave={addDiscard} onBack={() => setScreen('home')} />;
      case 'history':
        return <HistoryScreen items={items} onBack={() => setScreen('home')} />;
      case 'tips':
        return <TipsScreen onBack={() => setScreen('home')} />;
      case 'points':
        return <CollectionPointsScreen onBack={() => setScreen('home')} />;
      case 'home':
      default:
        return <HomeScreen onNavigate={setScreen} />;
    }
  }, [screen, items]);

  return (
    <>
      {renderScreen}
      <StatusBar style="light" />
    </>
  );
}
