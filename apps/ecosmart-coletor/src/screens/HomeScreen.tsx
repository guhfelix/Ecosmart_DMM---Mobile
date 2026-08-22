import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppCard } from '../components/AppCard';
import { homeItems } from '../data/mockData';
import { colors } from '../theme/colors';

type Props = {
  onNavigate: (screen: 'available' | 'collected') => void;
};

export function HomeScreen({ onNavigate }: Props) {
  const actions = [
    { key: 'available', title: homeItems[0].titulo, description: homeItems[0].descricao },
    { key: 'available', title: homeItems[1].titulo, description: homeItems[1].descricao },
    { key: 'available', title: homeItems[2].titulo, description: homeItems[2].descricao },
    { key: 'collected', title: 'Coletas realizadas', description: 'Visualizar descartes já marcados como coletados.' },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>♻️</Text>
          <Text style={styles.title}>EcoSmart Empresa/Catador</Text>
          <Text style={styles.subtitle}>Perfil Empresa/Catador</Text>
        </View>

        <Text style={styles.sectionTitle}>Funcionalidades do MVP</Text>

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
  logo: { fontSize: 38, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 16, color: '#E8F5E9', marginTop: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 14 },
});
