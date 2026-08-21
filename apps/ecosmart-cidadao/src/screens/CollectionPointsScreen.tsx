import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import { collectionPoints } from '../data/mockData';
import { colors } from '../theme/colors';

type Props = {
  onBack: () => void;
};

export function CollectionPointsScreen({ onBack }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pontos de coleta</Text>
        <Text style={styles.subtitle}>Locais próximos para descarte responsável.</Text>
      </View>

      <FlatList
        data={collectionPoints}
        contentContainerStyle={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>{item.address}</Text>
            <Text style={styles.cardMeta}>Resíduos aceitos: {item.acceptedWaste}</Text>
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  cardText: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 6,
  },
  cardMeta: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
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
