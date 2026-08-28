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
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBadge } from '../components/StatusBadge';
import { homeItems } from '../data/mockData';
import type { DiscardItem, Usuario } from '../models';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/layout';

type Props = {
  onNavigate: (screen: 'register' | 'history' | 'tips' | 'points' | 'profile') => void;
  onOpenDiscardDetails?: (item: DiscardItem) => void;
  onLogout?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  currentUser?: Usuario | null;
  items?: DiscardItem[];
};

export function HomeScreen({
  onNavigate,
  onOpenDiscardDetails,
  onLogout,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  currentUser,
  items = [],
}: Props) {
  const firstName = currentUser?.nome?.trim().split(' ')[0] || 'cidadão';
  const totalDiscards = items.length;
  const pendingDiscards = items.filter((item) => item.status !== 'Coletado').length;
  const latestDiscards = items.slice(0, 3);

  const handlers = [
    { key: 'history', title: homeItems[1].titulo, description: homeItems[1].descricao },
    { key: 'tips', title: homeItems[2].titulo, description: homeItems[2].descricao },
    { key: 'points', title: homeItems[3].titulo, description: homeItems[3].descricao },
    {
      key: 'profile',
      title: '👤 Meu Perfil',
      description: 'Edite suas informações pessoais e consulte o resumo de seus descartes.',
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
          <Text style={styles.title}>EcoSmart Cidadão</Text>
          <Text style={styles.greeting}>Olá, {firstName}</Text>
          <Text style={styles.subtitle}>Organize seus descartes de forma simples.</Text>
        </View>

        <PrimaryButton
          title="Registrar novo descarte"
          onPress={() => onNavigate('register')}
          style={styles.mainAction}
        />

        <Text style={styles.sectionTitle}>Seu resumo</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalDiscards}</Text>
            <Text style={styles.summaryLabel}>Total de registros</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>{pendingDiscards}</Text>
            <Text style={styles.summaryLabel}>Pendentes</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Últimos descartes</Text>
        {latestDiscards.length > 0 ? (
          <View style={styles.latestList}>
            {latestDiscards.map((item) => {
              const isCollected = item.status === 'Coletado';
              const isOffline = item.status === 'Pendente (Offline)' || item.offline;

              return (
                <Pressable
                  key={item.id}
                  android_ripple={{ color: colors.primarySoft }}
                  onPress={() => onOpenDiscardDetails?.(item)}
                  style={({ pressed }) => [styles.discardCard, pressed && styles.cardPressed]}
                >
                  <View style={styles.discardTop}>
                    <Text style={styles.discardType}>{item.type}</Text>
                    <StatusBadge
                      label={item.status}
                      variant={isCollected ? 'success' : isOffline ? 'danger' : 'warning'}
                    />
                  </View>
                  <Text style={styles.discardQuantity}>{item.quantity}</Text>
                  <View style={styles.discardFooter}>
                    <Text style={styles.discardMeta}>
                      {item.date}{item.neighborhood ? ` • ${item.neighborhood}` : ''}
                    </Text>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <EmptyState
            title="Você ainda não registrou nenhum descarte."
            message="Quando registrar um descarte, ele aparecerá aqui."
            actionLabel="Registrar descarte"
            onAction={() => onNavigate('register')}
          />
        )}

        <Text style={styles.sectionTitle}>Acessos rápidos</Text>

        {handlers.map((item) => (
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
    borderColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  title: { fontSize: 24, fontWeight: '900', color: colors.white },
  greeting: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  subtitle: { fontSize: 14, color: colors.primarySoft, marginTop: 6 },
  mainAction: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    ...shadow.card,
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    shadowColor: colors.primaryDark,
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  latestList: {
    marginBottom: spacing.lg,
  },
  discardCard: {
    ...shadow.card,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
    padding: spacing.md,
    shadowColor: colors.primaryDark,
  },
  discardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  discardType: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  discardQuantity: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  discardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  discardMeta: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
  },
  chevron: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
    marginLeft: spacing.sm,
  },
});
