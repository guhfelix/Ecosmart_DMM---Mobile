import React from 'react';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { CollectorDiscard } from '../data/mockData';
import { colors } from '../theme/colors';

type Props = {
  items: CollectorDiscard[];
  onOpenDetails: (item: CollectorDiscard) => void;
  onBack: () => void;
};

export function CollectedDiscardsScreen({ items, onOpenDetails, onBack }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Coletas realizadas</Text>
        <Text style={styles.subtitle}>Histórico dos descartes marcados como coletados.</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhuma coleta realizada ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => onOpenDetails(item)}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.wasteType}</Text>
                <Text style={styles.status}>Coletado</Text>
              </View>
              <Text style={styles.cardText}>{item.quantity}</Text>
              <Text style={styles.cardMeta}>{item.neighborhood}</Text>
              <Text style={styles.cardFooter}>Coletado em {item.collectedAt}</Text>
            </Pressable>
          )}
        />
      )}

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
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#E3F2FD',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
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
