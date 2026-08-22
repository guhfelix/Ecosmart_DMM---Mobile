import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../components/AppCard';
import { homeItems } from '../data/mockData';
import { colors } from '../theme/colors';

type Props = {
  onNavigate: (screen: 'register' | 'history' | 'tips' | 'points') => void;
  onLogout?: () => void;
};

export function HomeScreen({ onNavigate, onLogout }: Props) {
  const handlers = [
    { key: 'register', title: homeItems[0].titulo, description: homeItems[0].descricao },
    { key: 'history', title: homeItems[1].titulo, description: homeItems[1].descricao },
    { key: 'tips', title: homeItems[2].titulo, description: homeItems[2].descricao },
    { key: 'points', title: homeItems[3].titulo, description: homeItems[3].descricao },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.logo}>♻️</Text>
            {onLogout ? (
              <Pressable style={styles.logoutButton} onPress={onLogout}>
                <Text style={styles.logoutButtonText}>Sair</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.title}>EcoSmart Cidadão</Text>
          <Text style={styles.subtitle}>Perfil Cidadão</Text>
        </View>

        <Text style={styles.sectionTitle}>Funcionalidades do MVP</Text>

        {handlers.map((item) => (
          <Pressable key={item.key} onPress={() => onNavigate(item.key)}>
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
  subtitle: { fontSize: 16, color: '#E8F5E9', marginTop: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 14 },
});
