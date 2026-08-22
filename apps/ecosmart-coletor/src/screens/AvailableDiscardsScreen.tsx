import React from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CollectorDiscard, wasteTypes } from '../data/mockData';
import { colors } from '../theme/colors';

type Props = {
  items: CollectorDiscard[];
  selectedType: string;
  onSelectType: (type: string) => void;
  onOpenDetails: (item: CollectorDiscard) => void;
  onBack: () => void;
};

export function AvailableDiscardsScreen({
  items,
  selectedType,
  onSelectType,
  onOpenDetails,
  onBack,
}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Descartes disponíveis</Text>
        <Text style={styles.subtitle}>Escolha um descarte para consultar detalhes e marcar coleta.</Text>
      </View>

      <FlatList
        data={items}
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
          <Pressable style={styles.card} onPress={() => onOpenDetails(item)}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.wasteType}</Text>
              <Text style={styles.status}>Pendente</Text>
            </View>
            <Text style={styles.cardText}>{item.quantity}</Text>
            <Text style={styles.cardMeta}>{item.neighborhood}</Text>
            <Text style={styles.cardFooter}>Registrado por {item.citizenName} em {item.createdAt}</Text>
          </Pressable>
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
  status: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '800',
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
    lineHeight: 18,
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
