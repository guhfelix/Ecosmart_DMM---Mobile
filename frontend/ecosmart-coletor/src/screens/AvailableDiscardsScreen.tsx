import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectorDiscard, wasteTypes } from '../data/mockData';
import { colors } from '../theme/colors';
import { formatDistance } from '../utils/geoUtils';

type SortOption = 'recentes' | 'antigos' | 'proximos';

type Props = {
  items: CollectorDiscard[];
  selectedType: string;
  onSelectType: (type: string) => void;
  onOpenDetails: (item: CollectorDiscard) => void;
  onCollect?: (id: string) => void;
  onBack: () => void;
};

export function AvailableDiscardsScreen({
  items,
  selectedType,
  onSelectType,
  onOpenDetails,
  onCollect,
  onBack,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recentes');

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Busca em tempo real
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (i) =>
          i.citizenName.toLowerCase().includes(q) ||
          i.neighborhood.toLowerCase().includes(q) ||
          i.address.toLowerCase().includes(q) ||
          i.wasteType.toLowerCase().includes(q) ||
          (i.observation && i.observation.toLowerCase().includes(q))
      );
    }

    // Ordenação
    if (sortBy === 'proximos') {
      result.sort((a, b) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
    } else if (sortBy === 'antigos') {
      result.sort((a, b) => a.id.localeCompare(b.id));
    } else {
      // Recentes
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [items, searchQuery, sortBy]);

  const handleStartRoute = (item: CollectorDiscard) => {
    Alert.alert(
      '🗺️ Navegação GPS',
      `Traçando melhor trajeto até: ${item.address} (${item.neighborhood}). Distância estimada: ${
        item.distanceKm ? formatDistance(item.distanceKm) : '1.4 km'
      }.`
    );
  };

  const handleDirectCollect = (item: CollectorDiscard) => {
    Alert.alert(
      'Confirmar Coleta',
      `Deseja registrar o recolhimento de ${item.quantity} (${item.wasteType}) no endereço ${item.address}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Coleta',
          onPress: () => {
            if (onCollect) {
              onCollect(item.id);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Descartes disponíveis</Text>
        <Text style={styles.subtitle}>Consulte detalhes, trace rotas e realize a coleta em um só lugar.</Text>
      </View>

      {/* Busca em tempo real */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Buscar por cidadão, bairro, endereço..."
          placeholderTextColor={colors.muted}
        />
        {searchQuery ? (
          <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Ordenação */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Ordenar:</Text>
        {(
          [
            { label: 'Mais recentes', value: 'recentes' },
            { label: 'Mais próximos (GPS)', value: 'proximos' },
            { label: 'Mais antigos', value: 'antigos' },
          ] as const
        ).map((s) => (
          <Pressable
            key={s.value}
            style={[styles.sortChip, sortBy === s.value && styles.sortChipActive]}
            onPress={() => setSortBy(s.value)}
          >
            <Text style={[styles.sortChipText, sortBy === s.value && styles.sortChipTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredAndSortedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.filters}>
            {wasteTypes.map((type) => (
              <Pressable
                key={type}
                style={[styles.filter, selectedType === type && styles.filterSelected]}
                onPress={() => onSelectType(type)}
              >
                <Text style={[styles.filterText, selectedType === type && styles.filterTextSelected]}>{type}</Text>
              </Pressable>
            ))}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum descarte pendente para este filtro.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable onPress={() => onOpenDetails(item)}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.wasteType}</Text>
                <View style={styles.badgesRow}>
                  {item.distanceKm ? (
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceBadgeText}>📍 {formatDistance(item.distanceKm)}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.status}>Pendente</Text>
                </View>
              </View>

              <Text style={styles.cardText}>{item.quantity}</Text>
              {item.cep ? <Text style={styles.cardMeta}>CEP: {item.cep}</Text> : null}
              <Text style={styles.cardMeta}>Bairro: {item.neighborhood} - {item.city || 'Cáceres'}/MT</Text>
              <Text style={styles.cardAddress}>Endereço: {item.address}</Text>
              <Text style={styles.cardFooter}>Registrado por {item.citizenName} em {item.createdAt}</Text>
            </Pressable>

            {/* Ações Rápidas no Card */}
            <View style={styles.cardActionsRow}>
              <Pressable
                style={styles.cardRouteButton}
                onPress={() => handleStartRoute(item)}
              >
                <Text style={styles.cardRouteButtonText}>🗺️ Rota GPS</Text>
              </Pressable>

              {onCollect ? (
                <Pressable
                  style={styles.cardCollectButton}
                  onPress={() => handleDirectCollect(item)}
                >
                  <Text style={styles.cardCollectButtonText}>✅ Coletar</Text>
                </Pressable>
              ) : null}

              <Pressable
                style={styles.cardDetailsButton}
                onPress={() => onOpenDetails(item)}
              >
                <Text style={styles.cardDetailsButtonText}>📋 Detalhes</Text>
              </Pressable>
            </View>
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
    color: '#E3F2FD',
    marginTop: 6,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
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
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  sortChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  sortChipTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filter: {
    backgroundColor: '#E3F2FD',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  filterSelected: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distanceBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceBadgeText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '700',
  },
  status: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '800',
  },
  cardPhoto: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
    color: colors.text,
    fontSize: 15,
    marginBottom: 6,
  },
  cardMeta: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardAddress: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  cardFooter: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  cardRouteButton: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRouteButtonText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '800',
  },
  cardCollectButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCollectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cardDetailsButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#F1F3F4',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetailsButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    padding: 28,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
});