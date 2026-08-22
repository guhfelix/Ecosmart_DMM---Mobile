import React from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AdminDiscardRecord, AdminDiscardStatus } from '../data/mockData';
import { colors } from '../theme/colors';

type RecordFilter = 'todos' | AdminDiscardStatus;

type Props = {
  items: AdminDiscardRecord[];
  selectedFilter: RecordFilter;
  onSelectFilter: (filter: RecordFilter) => void;
  onBack: () => void;
};

const filters: { label: string; value: RecordFilter }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Visualizados', value: 'visualizado' },
  { label: 'Coletados', value: 'coletado' },
];

export function RecordsScreen({ items, selectedFilter, onSelectFilter, onBack }: Props) {
  const totalPending = items.filter((item) => item.status === 'pendente').length;
  const totalViewed = items.filter((item) => item.status === 'visualizado').length;
  const totalCollected = items.filter((item) => item.status === 'coletado').length;
  const visibleItems = selectedFilter === 'todos'
    ? items
    : items.filter((item) => item.status === selectedFilter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registros gerais</Text>
        <Text style={styles.subtitle}>Acompanhe os descartes registrados no ecossistema.</Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalPending}</Text>
          <Text style={styles.summaryLabel}>Pendentes</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalViewed}</Text>
          <Text style={styles.summaryLabel}>Visualizados</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalCollected}</Text>
          <Text style={styles.summaryLabel}>Coletados</Text>
        </View>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.filters}>
            {filters.map((filter) => (
              <Pressable
                key={filter.value}
                style={[styles.filter, selectedFilter === filter.value && styles.filterSelected]}
                onPress={() => onSelectFilter(filter.value)}
              >
                <Text style={[styles.filterText, selectedFilter === filter.value && styles.filterTextSelected]}>
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum registro encontrado para este filtro.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.wasteType}</Text>
              <Text style={[styles.status, styles[`status_${item.status}`]]}>{statusLabel[item.status]}</Text>
            </View>
            <Text style={styles.cardText}>{item.quantity}</Text>
            <Text style={styles.cardMeta}>{item.citizenName} - {item.neighborhood}</Text>
            <Text style={styles.cardFooter}>Registrado em {item.createdAt}</Text>
          </View>
        )}
        ListFooterComponent={
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        }
      />
    </SafeAreaView>
  );
}

const statusLabel: Record<AdminDiscardStatus, string> = {
  pendente: 'Pendente',
  visualizado: 'Visualizado',
  coletado: 'Coletado',
};

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
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#F3E5F5',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  summary: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  summaryNumber: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
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
    backgroundColor: '#F3E5F5',
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
    fontSize: 13,
    fontWeight: '800',
  },
  filterTextSelected: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
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
  status: {
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  status_pendente: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  status_visualizado: {
    backgroundColor: '#E3F2FD',
    color: '#1565C0',
  },
  status_coletado: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
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
    marginBottom: 8,
  },
  cardFooter: {
    color: colors.muted,
    fontSize: 13,
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
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
});
