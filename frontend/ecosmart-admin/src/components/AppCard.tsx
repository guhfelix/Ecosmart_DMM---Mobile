import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  /** Título principal do cartão */
  title: string;
  /** Descrição detalhada da funcionalidade ou item */
  description: string;
};

/**
 * Componente visual de cartão reutilizável para listagens e menus do ecossistema EcoSmart.
 */
export function AppCard({ title, description }: Props) {
  return (
    <View style={styles.card} testID="app-card">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
});
