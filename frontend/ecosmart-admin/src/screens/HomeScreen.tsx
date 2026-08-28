import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../components/AppCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { homeItems } from '../data/mockData';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/layout';

type Props = {
  onNavigate: (screen: 'wasteTypes' | 'collectionPoints' | 'tips' | 'records' | 'profile') => void;
  onLogout?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  wasteTypesCount?: number;
  collectionPointsCount?: number;
  recordsCount?: number;
  pendingRecordsCount?: number;
};

export function HomeScreen({
  onNavigate,
  onLogout,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  wasteTypesCount = 0,
  collectionPointsCount = 0,
  recordsCount = 0,
  pendingRecordsCount = 0,
}: Props) {
  const actions = [
    { key: 'wasteTypes', title: homeItems[0].titulo, description: homeItems[0].descricao },
    { key: 'collectionPoints', title: homeItems[1].titulo, description: homeItems[1].descricao },
    { key: 'tips', title: homeItems[2].titulo, description: homeItems[2].descricao },
    { key: 'records', title: homeItems[3].titulo, description: homeItems[3].descricao },
    {
      key: 'profile',
      title: '👤 Meu Perfil de Gestor',
      description: 'Edite dados cadastrais do administrador e monitore a governança geral.',
    },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.logo}>♻️</Text>
            <View style={styles.headerActions}>
              <Pressable
                style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                onPress={() => onNavigate('profile')}
                testID="profile-button"
                hitSlop={8}
              >
                <Text style={styles.iconButtonText}>👤</Text>
              </Pressable>

              {onOpenNotifications ? (
                <Pressable
                  style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
                  onPress={onOpenNotifications}
                  testID="notifications-button"
                  hitSlop={8}
                >
                  <Text style={styles.iconButtonText}>🔔</Text>
                  {unreadNotificationsCount > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadNotificationsCount}</Text>
                    </View>
                  ) : null}
                </Pressable>
              ) : null}

              {onLogout ? (
                <Pressable
                  style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
                  onPress={onLogout}
                  testID="logout-button"
                >
                  <Text style={styles.logoutButtonText}>Sair</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <Text style={styles.title}>EcoSmart Admin</Text>
          <Text style={styles.subtitle}>Gestão ambiental e governança do ecossistema.</Text>
        </View>

        <PrimaryButton
          title="Ver registros gerais"
          onPress={() => onNavigate('records')}
          style={styles.mainAction}
        />

        <Text style={styles.sectionTitle}>Resumo do ecossistema</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{recordsCount}</Text>
            <Text style={styles.summaryLabel}>Registros</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>{pendingRecordsCount}</Text>
            <Text style={styles.summaryLabel}>Pendentes</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{wasteTypesCount}</Text>
            <Text style={styles.summaryLabel}>Resíduos</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.info }]}>{collectionPointsCount}</Text>
            <Text style={styles.summaryLabel}>Pontos</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acessos administrativos</Text>

        {actions.map((item) => (
          <Pressable
            key={item.key}
            android_ripple={{ color: colors.primarySoft }}
            style={({ pressed }) => [pressed && styles.cardPressed]}
            onPress={() => onNavigate(item.key)}
          >
            <AppCard title={item.title} description={item.description} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pressed: {
    opacity: 0.72,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 36,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: { fontSize: 38 },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconButtonText: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: colors.primarySoft, marginTop: 6 },
  mainAction: {
    marginBottom: spacing.lg,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    ...shadow.card,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexBasis: '48%',
    padding: spacing.md,
    shadowColor: colors.primaryDark,
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: '900',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
});
