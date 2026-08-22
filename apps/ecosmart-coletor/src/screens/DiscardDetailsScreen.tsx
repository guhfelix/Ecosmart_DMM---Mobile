import React from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CollectorDiscard } from '../data/mockData';
import { colors } from '../theme/colors';

type Props = {
  item: CollectorDiscard;
  onCollect: (id: string) => void;
  onBack: () => void;
};

export function DiscardDetailsScreen({ item, onCollect, onBack }: Props) {
  const handleCollect = () => {
    Alert.alert('Coleta registrada', 'O descarte foi marcado como coletado.');
    onCollect(item.id);
  };

  const isCollected = item.status === 'coletado';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Detalhes do descarte</Text>
          <Text style={styles.subtitle}>Confira as informações antes de realizar a coleta.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.wasteType}>{item.wasteType}</Text>
            <Text style={[styles.status, isCollected ? styles.statusDone : styles.statusPending]}>
              {isCollected ? 'Coletado' : 'Pendente'}
            </Text>
          </View>

          <Text style={styles.label}>Quantidade</Text>
          <Text style={styles.value}>{item.quantity}</Text>

          <Text style={styles.label}>Cidadão</Text>
          <Text style={styles.value}>{item.citizenName}</Text>

          <Text style={styles.label}>Endereço</Text>
          <Text style={styles.value}>{item.address}</Text>
          <Text style={styles.valueMuted}>{item.neighborhood}</Text>

          <Text style={styles.label}>Data do registro</Text>
          <Text style={styles.value}>{item.createdAt}</Text>

          {item.collectedAt ? (
            <>
              <Text style={styles.label}>Data da coleta</Text>
              <Text style={styles.value}>{item.collectedAt}</Text>
            </>
          ) : null}

          {item.observation ? (
            <>
              <Text style={styles.label}>Observação</Text>
              <Text style={styles.observation}>{item.observation}</Text>
            </>
          ) : null}

          {!isCollected ? (
            <Pressable style={styles.primaryButton} onPress={handleCollect}>
              <Text style={styles.primaryButtonText}>Marcar como coletado</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.secondaryButton} onPress={onBack}>
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    color: '#E3F2FD',
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  wasteType: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  status: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '800',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
    color: '#E65100',
  },
  statusDone: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  label: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    color: colors.text,
    fontSize: 16,
  },
  valueMuted: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  observation: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 22,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
});
