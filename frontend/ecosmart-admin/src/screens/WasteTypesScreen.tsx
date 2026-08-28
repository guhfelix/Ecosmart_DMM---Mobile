import React, { useMemo, useState } from 'react';
import {
  Pressable,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { WasteTypeItem } from '../data/mockData';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/layout';

type WasteTypeForm = {
  id?: string;
  name: string;
  description: string;
};

type Props = {
  items: WasteTypeItem[];
  onSave: (item: WasteTypeForm) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  isOffline?: boolean;
};

export function WasteTypesScreen({ items, onSave, onDelete, onBack, isOffline = false }: Props) {
  const [editingId, setEditingId] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setEditingId(undefined);
    setName('');
    setDescription('');
  };

  const handleEdit = (item: WasteTypeItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
  };

  const handleSave = () => {
    if (!name.trim() || !description.trim()) {
      Alert.alert('Dados incompletos', 'Informe o nome e a descrição do tipo de resíduo.');
      return;
    }

    onSave({
      id: editingId,
      name: name.trim(),
      description: description.trim(),
    });

    if (isOffline) {
      Alert.alert('Modo Offline', 'Alteração salva localmente no dispositivo.');
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
      (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
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
            <ScreenHeader
              title="Gerenciar resíduos"
              subtitle="Cadastre e atualize os tipos aceitos."
              onBack={onBack}
            />

            <View style={styles.form}>
              <Text style={styles.formTitle}>{editingId ? 'Editar tipo de resíduo' : 'Novo tipo de resíduo'}</Text>

              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex.: Vidro"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Explique quais materiais entram nesse tipo"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
              />

              <PrimaryButton
                title={editingId ? 'Salvar alterações' : 'Cadastrar resíduo'}
                onPress={handleSave}
                testID="save-waste-button"
                style={styles.primaryButton}
              />

              {editingId ? (
                <Pressable style={styles.secondaryButton} onPress={resetForm}>
                  <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>Tipos cadastrados</Text>

            {/* Busca em tempo real */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="🔍 Buscar tipos de resíduo..."
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
        ListEmptyComponent={<EmptyState title="Nenhum tipo encontrado." message="Cadastre um tipo ou ajuste a busca." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>{item.description}</Text>

            <View style={styles.actions}>
              <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]} onPress={() => handleEdit(item)}>
                <Text style={styles.actionButtonText}>Editar</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.actionButton, styles.dangerButton, pressed && styles.pressed]} onPress={() => handleDelete(item.id)}>
                <Text style={styles.dangerButtonText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
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
    paddingBottom: 28,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
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
    color: colors.primarySoft,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  form: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: 18,
    marginHorizontal: spacing.lg,
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
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    fontSize: 15,
    padding: 12,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 18,
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
    marginHorizontal: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginHorizontal: spacing.lg,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
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
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
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
