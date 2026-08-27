import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppCard } from '../components/AppCard';
import { homeItems } from '../data/mockData';
import { colors } from '../theme/colors';

type Props = {
  onNavigate: (screen: 'available' | 'collected' | 'profile') => void;
  onLogout?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
};

export function HomeScreen({
  onNavigate,
  onLogout,
  onOpenNotifications,
  unreadNotificationsCount = 0,
}: Props) {
  const actions = [
    {
      key: 'available',
      title: '📦 Descartes disponíveis',
      description: 'Visualizar resíduos em Cáceres com distâncias GPS, rotas e coleta rápida.',
    },
    {
      key: 'collected',
      title: '🚛 Coletas realizadas',
      description: 'Visualizar histórico de descartes já marcados como coletados.',
    },
    {
      key: 'profile',
      title: '👤 Meu Perfil e Logística',
      description: 'Edite seus dados cadastrais, veículo, capacidade de carga e área de atuação.',
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
                style={styles.iconButton}
                onPress={() => onNavigate('profile')}
                testID="profile-button"
              >
                <Text style={styles.iconButtonText}>👤</Text>
              </Pressable>

              {onOpenNotifications ? (
                <Pressable
                  style={styles.iconButton}
                  onPress={onOpenNotifications}
                  testID="notifications-button"
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
                <Pressable style={styles.logoutButton} onPress={onLogout} testID="logout-button">
                  <Text style={styles.logoutButtonText}>Sair</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <Text style={styles.title}>EcoSmart Empresa/Catador</Text>
          <Text style={styles.subtitle}>Perfil Empresa/Catador</Text>
        </View>

        <Text style={styles.sectionTitle}>Funcionalidades</Text>

        {actions.map((item, index) => (
          <Pressable key={`${item.key}-${index}`} onPress={() => onNavigate(item.key)}>
            <AppCard title={item.title} description={item.description} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20 },
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
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
    backgroundColor: '#D32F2F',
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
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#E3F2FD', marginTop: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 14 },
});