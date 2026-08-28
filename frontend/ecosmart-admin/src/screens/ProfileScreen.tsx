import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedbackMessage } from '../components/FeedbackMessage';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { AdminDiscardRecord, CollectionPointItem, WasteTypeItem } from '../data/mockData';
import { Usuario } from '../models';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/layout';
import { cepService, formatCep } from '../services/cepService';

type Props = {
  user: Usuario;
  records: AdminDiscardRecord[];
  wasteTypes: WasteTypeItem[];
  collectionPoints: CollectionPointItem[];
  onUpdateUser: (updatedUser: Usuario) => void;
  onBack: () => void;
};

export function ProfileScreen({
  user,
  records,
  wasteTypes,
  collectionPoints,
  onUpdateUser,
  onBack,
}: Props) {
  const [nome, setNome] = useState(user.nome || '');
  const [telefone, setTelefone] = useState(user.telefone || '');
  const [cargo, setCargo] = useState(user.cargo || 'Secretário Municipal de Meio Ambiente');
  const [departamento, setDepartamento] = useState(
    user.departamento || 'SEMATUR - Prefeitura de Cáceres MT'
  );
  const [cep, setCep] = useState(user.cep || '78200-000');
  const [endereco, setEndereco] = useState(user.endereco || '');
  const [numero, setNumero] = useState(user.numero || '');
  const [bairro, setBairro] = useState(user.bairro || 'Centro');
  const [cidade, setCidade] = useState(user.cidade || 'Cáceres - MT');
  const [bio, setBio] = useState(
    user.bio || 'Gestão pública e governança ambiental voltada à preservação do Pantanal e fomento da reciclagem em Cáceres.'
  );
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- Métricas Gerais de Controle ---
  const totalRecords = records.length;
  const collectedRecords = records.filter((r) => r.status === 'coletado').length;
  const recyclingRate = totalRecords > 0 ? ((collectedRecords / totalRecords) * 100).toFixed(0) : '0';

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
      setNameError('Informe seu nome.');
      Alert.alert('Campo Obrigatório', 'Por favor, informe seu nome.');
      return;
    }
    setNameError(null);

    const updated: Usuario = {
      ...user,
      nome: nome.trim(),
      telefone: telefone.trim(),
      cargo: cargo.trim(),
      departamento: departamento.trim(),
      cep: cep.trim(),
      endereco: endereco.trim(),
      numero: numero.trim(),
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      bio: bio.trim(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateUser(updated);
    setFeedback('✓ Perfil atualizado com sucesso.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Perfil" subtitle="Gestor e governança do sistema." onBack={onBack} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Cabeçalho do Perfil Admin */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nome ? nome[0].toUpperCase() : 'A'}</Text>
            </View>
            <Text style={styles.userName}>{nome || 'Administrador'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>🛡️ Gestor Master EcoSmart</Text>
            </View>
          </View>

          {/* Painel de Controle e Governança */}
          <Text style={styles.sectionTitle}>Métricas de Governança do Ecossistema</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{totalRecords}</Text>
              <Text style={styles.metricLabel}>Total de registros</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: colors.primary }]}>{recyclingRate}%</Text>
              <Text style={styles.metricLabel}>Taxa de reciclagem</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: colors.primary }]}>{wasteTypes.length}</Text>
              <Text style={styles.metricLabel}>Tipos de resíduos</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: colors.secondary }]}>{collectionPoints.length}</Text>
              <Text style={styles.metricLabel}>Pontos cadastrados</Text>
            </View>
          </View>

          {/* Formulário de Edição de Dados do Administrador */}
          <Text style={styles.sectionTitle}>Editar Dados Administrativos</Text>
          <View style={styles.form}>
            <Text style={styles.label}>Nome do Administrador</Text>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                if (nameError) setNameError(null);
              }}
              placeholder="Seu nome"
              placeholderTextColor={colors.muted}
              returnKeyType="next"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <Text style={styles.label}>Telefone Institucional</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(65) 3223-5500"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Cargo / Função</Text>
            <TextInput
              style={styles.input}
              value={cargo}
              onChangeText={setCargo}
              placeholder="Ex: Secretário Municipal"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Órgão / Departamento</Text>
            <TextInput
              style={styles.input}
              value={departamento}
              onChangeText={setDepartamento}
              placeholder="Ex: SEMATUR"
              placeholderTextColor={colors.muted}
            />

            <View style={styles.labelRow}>
              <Text style={styles.label}>CEP da Secretaria / Sede</Text>
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

            <Text style={styles.label}>Endereço da Secretaria</Text>
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
              placeholder="Ex: 500 ou S/N"
              placeholderTextColor={colors.muted}
            />

            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={styles.input}
              value={bairro}
              onChangeText={setBairro}
              placeholder="Ex: Centro"
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

            <Text style={styles.label}>Descrição Institucional / Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder="Descrição das atividades e responsabilidades institucionais"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
            />

            <PrimaryButton
              title="Salvar alterações"
              onPress={handleSave}
              testID="save-profile-button"
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <FeedbackMessage message={feedback} onHide={() => setFeedback(null)} />
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
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 36,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  levelBadgeText: {
    color: colors.primary,
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
    gap: 8,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
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
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  cepFeedbackText: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 20,
  },
});
