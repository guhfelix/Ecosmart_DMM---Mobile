import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WasteTypeItem } from '../data/mockData';
import { colors } from '../theme/colors';

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
};

export function WasteTypesScreen({ items, onSave, onDelete, onBack }: Props) {
  const [editingId, setEditingId] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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
    resetForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Gerenciar resíduos</Text>
              <Text style={styles.subtitle}>Cadastre e atualize os tipos aceitos pelo ecossistema.</Text>
            </View>

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

              <Pressable style={styles.primaryButton} onPress={handleSave}>
                <Text style={styles.primaryButtonText}>{editingId ? 'Salvar alterações' : 'Cadastrar resíduo'}</Text>
              </Pressable>

              {editingId ? (
                <Pressable style={styles.secondaryButton} onPress={resetForm}>
                  <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
                </Pressable>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>Tipos cadastrados</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardText}>{item.description}</Text>

            <View style={styles.actions}>
              <Pressable style={styles.actionButton} onPress={() => handleEdit(item)}>
                <Text style={styles.actionButtonText}>Editar</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.dangerButton]} onPress={() => onDelete(item.id)}>
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
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
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
    marginBottom: 12,
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
