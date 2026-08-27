import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectionPointItem } from '../data/mockData';
import { colors } from '../theme/colors';

type CollectionPointForm = {
  id?: string;
  name: string;
  address: string;
  acceptedWaste: string;
  schedule: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
};

type Props = {
  items: CollectionPointItem[];
  onSave: (item: CollectionPointForm) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  isOffline?: boolean;
};

export function CollectionPointsScreen({ items, onSave, onDelete, onBack, isOffline = false }: Props) {
  const [editingId, setEditingId] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [acceptedWaste, setAcceptedWaste] = useState('');
  const [schedule, setSchedule] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setEditingId(undefined);
    setName('');
    setAddress('');
    setNeighborhood('');
    setAcceptedWaste('');
    setSchedule('');
  };

  const handleEdit = (item: CollectionPointItem) => {
    setEditingId(item.id);
    setName(item.name);
    setAddress(item.address);
    setNeighborhood(item.neighborhood || '');
    setAcceptedWaste(item.acceptedWaste);
    setSchedule(item.schedule);
  };

  const handleSave = () => {
    if (!name.trim() || !address.trim() || !acceptedWaste.trim() || !schedule.trim()) {
      Alert.alert('Dados incompletos', 'Preencha nome, endereço, resíduos aceitos e horário.');
      return;
    }

    onSave({
      id: editingId,
      name: name.trim(),
      address: address.trim(),
      neighborhood: neighborhood.trim() || undefined,
      acceptedWaste: acceptedWaste.trim(),
      schedule: schedule.trim(),
    });

    if (isOffline) {
      Alert.alert('Modo Offline', 'Ponto de coleta salvo localmente no dispositivo.');
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    if (isOffline) {
      Alert.alert('Modo Offline', 'Exclusão registrada localmente.');
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.acceptedWaste.toLowerCase().includes(q) ||
        (item.neighborhood && item.neighborhood.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Gerenciar pontos</Text>
              <Text style={styles.subtitle}>Cadastre locais de entrega e os resíduos aceitos em cada ponto.</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.formTitle}>{editingId ? 'Editar ponto de coleta' : 'Novo ponto de coleta'}</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex.: EcoPonto Centro"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Endereço</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Rua, número e bairro"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Bairro (Opcional)</Text>
              <TextInput
                style={styles.input}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="Ex.: Centro"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Resíduos aceitos</Text>
              <TextInput
                style={styles.input}
                value={acceptedWaste}
                onChangeText={setAcceptedWaste}
                placeholder="Ex.: Papel, plástico e metal"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Horário</Text>
              <TextInput
                style={styles.input}
                value={schedule}
                onChangeText={setSchedule}
                placeholder="Ex.: Segunda a sexta, 8h às 17h"
                placeholderTextColor={colors.muted}
              />

              <Pressable style={styles.primaryButton} onPress={handleSave}>
                <Text style={styles.primaryButtonText}>{editingId ? 'Salvar alterações' : 'Cadastrar ponto'}</Text>
              </Pressable>

              {editingId ? (
                <Pressable style={styles.secondaryButton} onPress={resetForm}>
                  <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>Pontos cadastrados</Text>

            {/* Busca em tempo real */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="🔍 Buscar pontos por nome, bairro, resíduos..."
                placeholderTextColor={colors.muted}
              />
              {searchQuery ? (
                <Pressable style={styles.clearButton} onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </Pressable>
              ) : null}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nenhum ponto de coleta encontrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>{item.address}</Text>
            {item.neighborhood ? (
              <Text style={styles.cardMeta}>Bairro: {item.neighborhood}</Text>
            ) : null}
            <Text style={styles.cardMeta}>Aceita: {item.acceptedWaste}</Text>
            <Text style={styles.cardMeta}>Horário: {item.schedule}</Text>

            <View style={styles.actions}>
              <Pressable style={styles.actionButton} onPress={() => handleEdit(item)}>
                <Text style={styles.actionButtonText}>Editar</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.dangerButton]} onPress={() => handleDelete(item.id)}>
                <Text style={styles.dangerButtonText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListFooterComponent={
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        }
      />
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
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#F3E5F5',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  form: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  formTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    color: colors.text,
    fontSize: 15,
    padding: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  clearButtonText: {
    color: colors.muted,
    fontWeight: '800',
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardText: {
    color: colors.text,
    fontSize: 15,
    marginBottom: 6,
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  actionButtonText: {
    color: colors.primary,
    fontWeight: '800',
  },
  dangerButton: {
    borderColor: '#C62828',
  },
  dangerButtonText: {
    color: '#C62828',
    fontWeight: '800',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
  backButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '800',
  },
});