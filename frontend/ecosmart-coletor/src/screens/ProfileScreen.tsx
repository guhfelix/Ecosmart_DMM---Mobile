import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectorDiscard } from '../data/mockData';
import { Usuario } from '../models';
import { colors } from '../theme/colors';
import { cepService, formatCep } from '../services/cepService';

type Props = {
  user: Usuario;
  discards: CollectorDiscard[];
  onUpdateUser: (updatedUser: Usuario) => void;
  onBack: () => void;
};

export function ProfileScreen({ user, discards, onUpdateUser, onBack }: Props) {
  const [nome, setNome] = useState(user.nome || '');
  const [telefone, setTelefone] = useState(user.telefone || '');
  const [cep, setCep] = useState(user.cep || '78205-100');
  const [endereco, setEndereco] = useState(user.endereco || '');
  const [numero, setNumero] = useState(user.numero || '');
  const [bairro, setBairro] = useState(user.bairro || 'Santos Dumont');
  const [cidade, setCidade] = useState(user.cidade || 'Cáceres - MT');
  const [veiculo, setVeiculo] = useState(user.veiculo || 'Caminhonete de Coleta Seletiva');
  const [capacidadeCarga, setCapacidadeCarga] = useState(user.capacidadeCarga || '1.200 kg');
  const [bio, setBio] = useState(
    user.bio || 'Coletor credenciado da Cooperativa dos Catadores de Cáceres (COOPERCÁCERES).'
  );
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);

  // --- Estatísticas Operacionais do Coletor ---
  const collectedCount = discards.filter((d) => (d.status || '').toLowerCase() === 'coletado').length;
  const availableCount = discards.filter((d) => (d.status || '').toLowerCase() === 'pendente').length;

  const handleCepChange = async (text: string) => {
    const formatted = formatCep(text);
    setCep(formatted);
    setCepFeedback(null);

    const clean = text.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsSearchingCep(true);
      try {
        const res = await cepService.fetchAddressByCep(clean);
        if (res.success) {
          setEndereco(res.logradouro || endereco);
          setBairro(res.bairro || bairro);
          setCidade(`${res.localidade} - ${res.uf}`);
          setCepFeedback(`✓ Endereço localizado: ${res.bairro}, ${res.localidade}/${res.uf}`);
        } else {
          setCepFeedback('⚠️ CEP não localizado automaticamente no ViaCEP.');
        }
      } catch (err) {
        setCepFeedback('⚠️ Não foi possível consultar o CEP.');
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const handleSave = () => {
    if (!nome.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, informe o nome ou razão social.');
      return;
    }

    const updated: Usuario = {
      ...user,
      nome: nome.trim(),
      telefone: telefone.trim(),
      cep: cep.trim(),
      endereco: endereco.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      veiculo: veiculo.trim(),
      capacidadeCarga: capacidadeCarga.trim(),
      bio: bio.trim(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateUser(updated);
    Alert.alert('Perfil Atualizado', 'As informações operacionais e de base foram salvas com sucesso!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Cabeçalho do Perfil Coletor */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nome ? nome[0].toUpperCase() : 'C'}</Text>
            </View>
            <Text style={styles.userName}>{nome || 'Empresa/Catador'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>🚛 Coletor Credenciado EcoSmart</Text>
            </View>
          </View>

          {/* Painel Operacional */}
          <Text style={styles.sectionTitle}>Resumo Operacional</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#2E7D32' }]}>{collectedCount}</Text>
              <Text style={styles.metricLabel}>Coletas realizadas</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#1565C0' }]}>{availableCount}</Text>
              <Text style={styles.metricLabel}>Disponíveis na região</Text>
            </View>
          </View>

          {/* Formulário de Edição de Dados Operacionais */}
          <Text style={styles.sectionTitle}>Editar Perfil e Logística</Text>
          <View style={styles.form}>
            <Text style={styles.label}>Nome do Catador / Razão Social</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome ou empresa"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Telefone / WhatsApp de Contato</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(65) 99999-9999"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
            />

            <View style={styles.labelRow}>
              <Text style={styles.label}>CEP da Base Operacional</Text>
              {isSearchingCep ? <ActivityIndicator size="small" color={colors.primary} /> : null}
            </View>
            <TextInput
              style={styles.input}
              value={cep}
              onChangeText={handleCepChange}
              placeholder="Ex: 78200-000"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
              maxLength={9}
            />
            {cepFeedback ? <Text style={styles.cepFeedbackText}>{cepFeedback}</Text> : null}

            <Text style={styles.label}>Endereço da Base / Galpão</Text>
            <TextInput
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Rua, Avenida"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Número</Text>
            <TextInput
              style={styles.input}
              value={numero}
              onChangeText={setNumero}
              placeholder="Ex: 1420 ou S/N"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={styles.input}
              value={bairro}
              onChangeText={setBairro}
              placeholder="Ex: Santos Dumont"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Cidade / Estado</Text>
            <TextInput
              style={styles.input}
              value={cidade}
              onChangeText={setCidade}
              placeholder="Ex: Cáceres - MT"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Tipo de Veículo / Transporte</Text>
            <TextInput
              style={styles.input}
              value={veiculo}
              onChangeText={setVeiculo}
              placeholder="Ex: Caminhonete, Carreto, Triciclo"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Capacidade de Carga Estimada</Text>
            <TextInput
              style={styles.input}
              value={capacidadeCarga}
              onChangeText={setCapacidadeCarga}
              placeholder="Ex: 1.200 kg"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Sobre a Cooperativa / Catador</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Informações operacionais, rotas e materiais atendidos"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
            />

            <Pressable testID="save-profile-button" style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>💾 Salvar Alterações</Text>
            </Pressable>
          </View>

          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
    marginBottom: 10,
  },
  levelBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  levelBadgeText: {
    color: '#1565C0',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 10,
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  cepFeedbackText: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 4,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  backButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
});
