import React, { useMemo, useState } from 'react';
import {
  Pressable,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { ScreenHeader } from '../components/ScreenHeader';
import { CollectorDiscard } from '../data/mockData';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/layout';

type Props = {
  items: CollectorDiscard[];
  onOpenDetails: (item: CollectorDiscard) => void;
  onBack: () => void;
};

export function CollectedDiscardsScreen({ items, onOpenDetails, onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.citizenName.toLowerCase().includes(q) ||
        i.wasteType.toLowerCase().includes(q) ||
        i.neighborhood.toLowerCase().includes(q) ||
        i.address.toLowerCase().includes(q) ||
        (i.observation && i.observation.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Coletas realizadas"
        subtitle="Histórico dos descartes marcados como coletados."
        onBack={onBack}
      />

      {/* Busca em tempo real */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="🔍 Buscar coletas por tipo, bairro..."
          placeholderTextColor={colors.muted}
        />
        {searchQuery ? (
          <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {filteredItems.length === 0 ? (
        <EmptyState title="Nenhuma coleta encontrada." message="As coletas confirmadas aparecerão aqui." />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              android_ripple={{ color: colors.primarySoft }}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => onOpenDetails(item)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.wasteType}</Text>
                <View style={styles.badgeContainer}>
                  {item.offlineSyncPending ? (
                    <Text style={styles.offlineBadge}>Sincronização Pendente</Text>
                  ) : null}
                  <Text style={styles.status}>Coletado</Text>
                </View>
              </View>

              {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.cardPhoto} />
              ) : null}

              <Text style={styles.cardText}>{item.quantity}</Text>
              <Text style={styles.cardMeta}>{item.citizenName} • {item.neighborhood}</Text>
              <Text style={styles.cardFooter}>Coletado em {item.collectedAt || item.createdAt}</Text>
            </Pressable>
          )}
        />
      )}
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
    color: colors.primarySoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: 12,
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 28,
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
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  status: {
    backgroundColor: colors.successSoft,
    color: colors.success,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '800',
  },
  offlineBadge: {
    backgroundColor: colors.warningSoft,
    color: colors.warning,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  cardPhoto: {
    width: '100%',
    height: 120,
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
    marginBottom: 6,
  },
  cardFooter: {
    color: colors.muted,
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16,
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
