import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { wasteTypes } from '../data/mockData';

export type DiscardItem = {
  id: string;
  type: string;
  quantity: string;
  observation: string;
  date: string;
  status: 'Pendente' | 'Coletado';
};

type Props = {
  onSave: (item: DiscardItem) => void;
  onBack: () => void;
};

export function RegisterDiscardScreen({ onSave, onBack }: Props) {
  const [selectedType, setSelectedType] = useState(wasteTypes[0]);
  const [quantity, setQuantity] = useState('');
  const [observation, setObservation] = useState('');

  const handleSave = () => {
    if (!selectedType || !quantity.trim()) {
      Alert.alert('Dados incompletos', 'Selecione o tipo e informe a quantidade.');
      return;
    }

    const newItem: DiscardItem = {
      id: String(Date.now()),
      type: selectedType,
      quantity: quantity.trim(),
      observation: observation.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente',
    };

    onSave(newItem);
    Alert.alert('Descarte registrado', 'Seu registro foi salvo com sucesso.');
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Registrar descarte</Text>
          <Text style={styles.subtitle}>Informe os resíduos que você deseja descartar.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Tipo de resíduo</Text>
          <View style={styles.tagsContainer}>
            {wasteTypes.map((type) => (
              <Pressable
                key={type}
                style={[styles.tag, selectedType === type && styles.tagSelected]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.tagText, selectedType === type && styles.tagTextSelected]}>{type}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Ex.: 3 sacos, 2 garrafas"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={observation}
            onChangeText={setObservation}
            placeholder="Detalhes extras do material"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
          />

          <Pressable style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Salvar descarte</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onBack}>
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  tagSelected: {
    backgroundColor: colors.primary,
  },
  tagText: {
    color: colors.text,
    fontWeight: '600',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
});
