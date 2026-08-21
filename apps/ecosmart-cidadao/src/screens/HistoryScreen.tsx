import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '../theme/colors';
import { DiscardItem } from './RegisterDiscardScreen';

type Props = {
  items: DiscardItem[];
  onBack: () => void;
};

export function HistoryScreen({ items, onBack }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <Text style={styles.subtitle}>Seus descartes registrados.</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum descarte registrado ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          contentContainerStyle={styles.list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemTop}>
                <Text style={styles.itemType}>{item.type}</Text>
                <Text style={[styles.status, item.status === 'Coletado' ? styles.statusDone : styles.statusPending]}>
                  {item.status}
                </Text>
              </View>
              <Text style={styles.itemMeta}>Quantidade: {item.quantity}</Text>
              <Text style={styles.itemMeta}>Data: {item.date}</Text>
              {item.observation ? <Text style={styles.itemObservation}>{item.observation}</Text> : null}
            </View>
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
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 6,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemType: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  statusDone: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  itemMeta: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 4,
  },
  itemObservation: {
    color: colors.text,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
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
