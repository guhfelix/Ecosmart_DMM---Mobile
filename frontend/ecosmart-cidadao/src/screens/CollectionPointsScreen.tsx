import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collectionPoints } from '../data/mockData';
import { colors } from '../theme/colors';
import { formatDistance } from '../utils/geoUtils';
import { CollectionPointItem } from '../models';

type Props = {
  onBack: () => void;
};

export function CollectionPointsScreen({ onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPoints = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return collectionPoints;
    return collectionPoints.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.acceptedWaste.toLowerCase().includes(q) ||
        (p.neighborhood && p.neighborhood.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleOpenRoute = (item: CollectionPointItem) => {
    Alert.alert(
      '🗺️ Rota de Navegação GPS',
      `Iniciando rota até ${item.name} (${item.address}). Distância estimada: ${
        item.distanceKm ? formatDistance(item.distanceKm) : '1.2 km'
      }.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pontos de coleta</Text>
        <Text style={styles.subtitle}>Locais próximos com geolocalização para descarte responsável.</Text>
      </View>

      {/* Barra de Busca em Tempo Real */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Buscar por nome, endereço ou resíduo..."
          placeholderTextColor={colors.muted}
        />
        {searchQuery ? (
          <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={filteredPoints}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum ponto de coleta encontrado para a busca.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              {item.distanceKm ? (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeText}>📍 {formatDistance(item.distanceKm)}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.cardText}>{item.address}</Text>
            {item.neighborhood ? (
              <Text style={styles.cardNeighborhood}>Bairro: {item.neighborhood}</Text>
            ) : null}

            <Text style={styles.cardMeta}>Resíduos aceitos: {item.acceptedWaste}</Text>
            {item.schedule ? (
              <Text style={styles.cardSchedule}>Horário: {item.schedule}</Text>
            ) : null}

            <Pressable style={styles.routeButton} onPress={() => handleOpenRoute(item)}>
              <Text style={styles.routeButtonText}>🗺️ Ver no Mapa / Rota GPS</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 6,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  clearButtonText: {
    color: colors.muted,
    fontWeight: '800',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  distanceBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  cardText: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  cardNeighborhood: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  cardMeta: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSchedule: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 10,
  },
  routeButton: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  routeButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#DADCE0',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
});
