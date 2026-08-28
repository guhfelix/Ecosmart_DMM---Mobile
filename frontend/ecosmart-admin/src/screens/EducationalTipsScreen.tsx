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
import { EducationalTipItem } from '../data/mockData';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/layout';

type EducationalTipForm = {
  id?: string;
  title: string;
  category: string;
  content: string;
};

type Props = {
  items: EducationalTipItem[];
  onSave: (item: EducationalTipForm) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  isOffline?: boolean;
};

export function EducationalTipsScreen({ items, onSave, onDelete, onBack, isOffline = false }: Props) {
  const [editingId, setEditingId] = useState<string | undefined>();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const resetForm = () => {
    setEditingId(undefined);
    setTitle('');
    setCategory('');
    setContent('');
  };

  const handleEdit = (item: EducationalTipItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setContent(item.content);
  };

  const handleSave = () => {
    if (!title.trim() || !category.trim() || !content.trim()) {
      Alert.alert('Dados incompletos', 'Informe título, categoria e conteúdo da dica.');
      return;
    }

    onSave({
      id: editingId,
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
    });

    if (isOffline) {
      Alert.alert('Modo Offline', 'Dica educativa salva localmente no dispositivo.');
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
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
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
              title="Gerenciar dicas"
              subtitle="Cadastre conteúdos educativos sobre sustentabilidade."
              onBack={onBack}
            />

            <View style={styles.form}>
              <Text style={styles.formTitle}>{editingId ? 'Editar dica educativa' : 'Nova dica educativa'}</Text>

              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex.: Separação correta de plásticos"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Categoria</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Ex.: Reciclagem, Reuso, Higienização"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.label}>Conteúdo</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={content}
                onChangeText={setContent}
                placeholder="Texto explicativo para orientar os cidadãos"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
              />

              <PrimaryButton
                title={editingId ? 'Salvar alterações' : 'Cadastrar dica'}
                onPress={handleSave}
                style={styles.primaryButton}
              />

              {editingId ? (
                <Pressable style={styles.secondaryButton} onPress={resetForm}>
                  <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>Dicas cadastradas</Text>

            {/* Busca em tempo real */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="🔍 Buscar dicas por título, categoria..."
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
        ListEmptyComponent={<EmptyState title="Nenhuma dica encontrada." message="Cadastre uma dica ou ajuste a busca." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.cardText}>{item.content}</Text>

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
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
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
