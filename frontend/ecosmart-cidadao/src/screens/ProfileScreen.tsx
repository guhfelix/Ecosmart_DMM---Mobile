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
import { DiscardItem, Usuario } from '../models';
import { colors } from '../theme/colors';
import { fetchAddressByCep, formatCep } from '../services/cepService';

type Props = {
  user: Usuario;
  discards: DiscardItem[];
  onUpdateUser: (updatedUser: Usuario) => void;
  onBack: () => void;
};

export function ProfileScreen({ user, discards, onUpdateUser, onBack }: Props) {
  const [nome, setNome] = useState(user.nome || '');
  const [telefone, setTelefone] = useState(user.telefone || '');
  const [cep, setCep] = useState(user.cep || '78200-000');
  const [endereco, setEndereco] = useState(user.endereco || '');
  const [numero, setNumero] = useState(user.numero || '');
  const [bairro, setBairro] = useState(user.bairro || 'Centro');
  const [cidade, setCidade] = useState(user.cidade || 'Cáceres - MT');
  const [bio, setBio] = useState(user.bio || 'Compromissado com a preservação do Pantanal e a reciclagem em Cáceres - MT.');
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);

  // --- Estatísticas Pessoais de Descarte ---
  const totalDiscards = discards.length;
  const collectedDiscards = discards.filter((d) => d.status === 'Coletado').length;
  const pendingDiscards = discards.filter((d) => d.status !== 'Coletado').length;

  const handleCepChange = async (text: string) => {
    const formatted = formatCep(text);
    setCep(formatted);
    setCepFeedback(null);

    const clean = text.replace(/\D/g, '');
    if (clean.length === 8) {
      setIsSearchingCep(true);
      try {
        const res = await fetchAddressByCep(clean);
        if (res.success) {
          if (res.logradouro) setEndereco(res.logradouro);
          if (res.bairro) setBairro(res.bairro);
          if (res.localidade) setCidade(`${res.localidade} - ${res.uf || 'MT'}`);
          setCepFeedback(`📍 ${res.bairro || 'Cáceres'} - ${res.localidade || 'Cáceres'}/MT`);
        } else {
          setCepFeedback('⚠️ CEP não encontrado. Preencha os campos manualmente.');
        }
      } catch (e) {
        setCepFeedback('Modo offline: Preencha o endereço manualmente.');
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const handleSearchCepButton = () => {
    if (!cep.trim()) {
      Alert.alert('CEP', 'Digite um CEP válido para buscar o endereço.');
      return;
    }
    handleCepChange(cep);
  };

  const handleSave = () => {
    if (!nome.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, informe seu nome.');
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
      bio: bio.trim(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateUser(updated);
    Alert.alert(
      'Perfil Atualizado',
      'Suas informações e o endereço padrão de descarte foram salvos com sucesso!'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Cabeçalho do Perfil */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nome ? nome[0].toUpperCase() : 'C'}</Text>
            </View>
            <Text style={styles.userName}>{nome || 'Cidadão'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>🌱 Cidadão EcoSmart</Text>
            </View>
          </View>

          {/* Resumo de Descartes */}
          <Text style={styles.sectionTitle}>Resumo de Descartes</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{totalDiscards}</Text>
              <Text style={styles.metricLabel}>Total descartado</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#2E7D32' }]}>{collectedDiscards}</Text>
              <Text style={styles.metricLabel}>Coletados</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: '#E65100' }]}>{pendingDiscards}</Text>
              <Text style={styles.metricLabel}>Pendentes</Text>
            </View>
          </View>

          {/* Formulário de Edição de Dados Pessoais e Endereço Padrão */}
          <Text style={styles.sectionTitle}>Editar Informações Pessoais</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              💡 O CEP, endereço e número informados abaixo serão salvos e carregados automaticamente toda vez que você cadastrar um novo descarte.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Telefone / WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(65) 99999-9999"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
            />

            {/* CEP Padrão com Busca ViaCEP */}
            <Text style={styles.label}>CEP Padrão de Descarte</Text>
            <View style={styles.cepRow}>
              <TextInput
                style={[styles.input, styles.cepInput]}
                value={cep}
                onChangeText={handleCepChange}
                placeholder="78200-000"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
                maxLength={9}
              />
              <Pressable
                style={[styles.cepSearchButton, isSearchingCep && styles.buttonDisabled]}
                onPress={handleSearchCepButton}
                disabled={isSearchingCep}
              >
                {isSearchingCep ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.cepSearchButtonText}>🔍 Buscar CEP</Text>
                )}
              </Pressable>
            </View>

            {cepFeedback ? (
              <View style={styles.cepFeedbackBadge}>
                <Text style={styles.cepFeedbackText}>{cepFeedback}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Endereço / Logradouro</Text>
            <TextInput
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Rua, Avenida, Travessa"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Número</Text>
            <TextInput
              style={styles.input}
              value={numero}
              onChangeText={setNumero}
              placeholder="Ex: 210, 100, s/n, Apto 12"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={styles.input}
              value={bairro}
              onChangeText={setBairro}
              placeholder="Ex: Centro, Cavalhada, Santos Dumont, Cohab Nova"
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

            <Text style={styles.label}>Bio / Frase Ecológica</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Escreva uma frase sobre seus hábitos sustentáveis"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
            />

            <Pressable style={styles.primaryButton} onPress={handleSave} testID="save-profile-button">
              <Text style={styles.primaryButtonText}>Salvar Alterações</Text>
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
    paddingBottom: 40,
  },
  header: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#1B5E20',
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    elevation: 2,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  cepRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cepInput: {
    flex: 1,
  },
  cepSearchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cepSearchButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cepFeedbackBadge: {
    backgroundColor: '#E8F5E9',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  cepFeedbackText: {
    color: '#2E7D32',
    fontSize: 12,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#ECEFF1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
