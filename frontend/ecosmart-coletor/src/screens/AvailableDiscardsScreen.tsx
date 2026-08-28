import React, { useMemo, useState } from 'react';
import {
  Pressable,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { CollectorDiscard, wasteTypes } from '../data/mockData';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/layout';
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
      <ScreenHeader
        title="Descartes disponíveis"
        subtitle="Consulte detalhes, trace rotas e realize coletas."
        onBack={onBack}
      />

      {/* Busca em tempo real */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Buscar descartes..."
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {wasteTypes.map((type) => (
              <Pressable
                key={type}
                android_ripple={{ color: colors.primarySoft }}
                style={({ pressed }) => [
                  styles.filter,
                  selectedType === type && styles.filterSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => onSelectType(type)}
              >
                <Text style={[styles.filterText, selectedType === type && styles.filterTextSelected]}>{type}</Text>
              </Pressable>
            ))}
          </ScrollView>
        }
        ListEmptyComponent={<EmptyState title="Nenhum descarte pendente." message="Quando houver registros para esse filtro, eles aparecerão aqui." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable
              android_ripple={{ color: colors.primarySoft }}
              onPress={() => onOpenDetails(item)}
              style={({ pressed }) => [styles.cardTouchArea, pressed && styles.cardPressed]}
            >
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
              <Text style={styles.cardMeta}>{item.neighborhood} - {item.city || 'Cáceres'}/MT</Text>
              <Text style={styles.cardAddress}>{item.address}</Text>
              <Text style={styles.cardFooter}>{item.citizenName} • {item.createdAt}</Text>
            </Pressable>

            {/* Ações Rápidas no Card */}
            <View style={styles.cardActionsRow}>
              <Pressable
                style={({ pressed }) => [styles.cardRouteButton, pressed && styles.cardPressed]}
                onPress={() => handleStartRoute(item)}
              >
                <Text style={styles.cardRouteButtonText}>Ver rota</Text>
              </Pressable>

              {onCollect ? (
                <Pressable
                  style={({ pressed }) => [styles.cardCollectButton, pressed && styles.cardPressed]}
                  onPress={() => handleDirectCollect(item)}
                >
                  <Text style={styles.cardCollectButtonText}>Confirmar coleta</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.82,
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
    color: colors.primarySoft,
    marginTop: 6,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: 8,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
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
    marginHorizontal: spacing.lg,
    marginBottom: 10,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  sortChip: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
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
    paddingHorizontal: spacing.lg,
    paddingBottom: 28,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  filter: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    ...shadow.card,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.primaryDark,
  },
  cardTouchArea: {
    borderRadius: radius.sm,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
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
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceBadgeText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '700',
  },
  status: {
    backgroundColor: colors.warningSoft,
    color: colors.warning,
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
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
    marginTop: spacing.sm,
  },
  cardRouteButton: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRouteButtonText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },
  cardCollectButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
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
