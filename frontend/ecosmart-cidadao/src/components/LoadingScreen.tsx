import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/layout';

type Props = {
  label?: string;
};

export function LoadingScreen({ label = 'Carregando...' }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>EcoSmart</Text>
        <Text style={styles.logo}>♻️</Text>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.label}>{label}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  brand: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: spacing.sm,
  },
  logo: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing.md,
  },
});
