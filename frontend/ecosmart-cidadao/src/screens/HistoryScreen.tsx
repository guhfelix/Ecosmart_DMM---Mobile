import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusBadge } from '../components/StatusBadge';
import type { DiscardItem } from '../models';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/layout';

type FilterType = 'todos' | 'pendente' | 'coletado' | 'offline';

type Props = {
  items: DiscardItem[];
  onOpenDetails?: (item: DiscardItem) => void;
  onRegister?: () => void;
  onBack: () => void;
};

export function HistoryScreen({ items, onOpenDetails, onRegister, onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('todos');

  const filteredItems = useMemo(() => {
    let result = items;

    if (statusFilter === 'pendente') {
      result = result.filter((i) => i.status === 'Pendente');
    } else if (statusFilter === 'coletado') {
      result = result.filter((i) => i.status === 'Coletado');
    } else if (statusFilter === 'offline') {
      result = result.filter((i) => i.status === 'Pendente (Offline)' || i.offline);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (i) =>
          i.type.toLowerCase().includes(q) ||
          i.quantity.toLowerCase().includes(q) ||
          (i.observation && i.observation.toLowerCase().includes(q)) ||
          (i.neighborhood && i.neighborhood.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, statusFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Histórico"
        subtitle="Seus descartes registrados e status de coleta."
        onBack={onBack}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Buscar descartes por tipo, bairro..."
          placeholderTextColor={colors.muted}
        />
        {searchQuery ? (
          <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {(
          [
            { label: 'Todos', value: 'todos' },
            { label: 'Pendentes', value: 'pendente' },
            { label: 'Coletados', value: 'coletado' },
            { label: 'Offline', value: 'offline' },
          ] as const
        ).map((f) => (
          <Pressable
            key={f.value}
            android_ripple={{ color: colors.primarySoft }}
            style={({ pressed }) => [
              styles.filterChip,
              statusFilter === f.value && styles.filterChipActive,
              pressed && styles.pressed,
            ]}
            onPress={() => setStatusFilter(f.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === f.value && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        contentContainerStyle={filteredItems.length === 0 ? styles.emptyList : styles.list}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            title={
              items.length === 0
                ? 'Você ainda não registrou nenhum descarte.'
                : 'Nenhum descarte encontrado.'
            }
            message={
              items.length === 0
                ? 'Quando registrar um descarte, ele aparecerá aqui.'
                : 'Ajuste os filtros ou a busca para encontrar outro registro.'
            }
            actionLabel={items.length === 0 ? 'Registrar descarte' : undefined}
            onAction={items.length === 0 ? onRegister : undefined}
          />
        }
        renderItem={({ item }) => {
          const isOffline = item.status === 'Pendente (Offline)' || item.offline;
          const isDone = item.status === 'Coletado';

          return (
            <Pressable
              android_ripple={{ color: colors.primarySoft }}
              onPress={() => onOpenDetails?.(item)}
              style={({ pressed }) => [styles.itemCard, pressed && styles.cardPressed]}
            >
              <View style={styles.itemTop}>
                <Text style={styles.itemType}>{item.type}</Text>
                <StatusBadge
                  label={item.status}
                  variant={isDone ? 'success' : isOffline ? 'danger' : 'warning'}
                />
              </View>

              <Text style={styles.itemQuantity}>{item.quantity}</Text>
              <View style={styles.itemFooter}>
                <Text style={styles.itemMeta}>{item.date}</Text>
                {item.neighborhood ? <Text style={styles.itemMeta}>{item.neighborhood}</Text> : null}
                <Text style={styles.chevron}>›</Text>
              </View>
            </Pressable>
          );
        }}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
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
    padding: spacing.xs,
  },
  clearButtonText: {
    color: colors.muted,
    fontWeight: '800',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.primarySoft,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 28,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 28,
    justifyContent: 'center',
  },
  itemCard: {
    ...shadow.card,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.primaryDark,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemType: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
    flex: 1,
  },
  itemQuantity: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  chevron: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
    marginLeft: 'auto',
  },
});
