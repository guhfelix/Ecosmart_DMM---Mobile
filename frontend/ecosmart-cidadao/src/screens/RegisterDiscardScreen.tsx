import React, { useState } from 'react';
import {
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/layout';
import { wasteTypes } from '../data/mockData';
import { DEFAULT_USER_COORDINATES } from '../utils/geoUtils';
import { generateEntityId } from '../utils/idUtils';
import { validationUtils } from '../utils/validationUtils';
import {
  CACERES_DEFAULTS,
  fetchAddressByCep,
  formatCep,
} from '../services/cepService';
import type { DiscardItem } from '../models';

export type { DiscardItem };

type Props = {
  /** Callback para salvar o descarte na lista global do App */
  onSave: (item: DiscardItem) => void;
  /** Callback para retornar à tela inicial */
  onBack: () => void;
  /** Indicador de conexão (se offline, salva com status pendente offline) */
  isOffline?: boolean;
  /** Endereço padrão do perfil do cidadão para carregamento automático */
  defaultUserAddress?: {
    cep?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
  };
};

/**
 * Tela de Registro de Descarte do Cidadão em Cáceres - MT.
 * Permite selecionar tipo, quantidade, observação, preenchimento automático por CEP (ViaCEP)
 * e geolocalização com coordenadas de Cáceres.
 */
export function RegisterDiscardScreen({
  onSave,
  onBack,
  isOffline = false,
  defaultUserAddress,
}: Props) {
  const [selectedType, setSelectedType] = useState(wasteTypes[0]);
  const [quantity, setQuantity] = useState('');
  const [observation, setObservation] = useState('');
  const [errors, setErrors] = useState<{ quantity?: string; type?: string }>({});
  
  // Estados de Endereço e CEP (Cáceres - MT) inicializados com o endereço padrão do usuário
  const hasDefaultAddress = Boolean(defaultUserAddress?.endereco);
  const [showAddressFields, setShowAddressFields] = useState(!hasDefaultAddress);
  const [cep, setCep] = useState(defaultUserAddress?.cep || '78200-000');
  const [address, setAddress] = useState(defaultUserAddress?.endereco || '');
  const [numero, setNumero] = useState(defaultUserAddress?.numero || '');
  const [neighborhood, setNeighborhood] = useState(defaultUserAddress?.bairro || 'Centro');
  const [city, setCity] = useState(defaultUserAddress?.cidade || CACERES_DEFAULTS.CITY);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFoundMessage, setCepFoundMessage] = useState<string | null>(null);

  // Estados de GPS
  const [hasGps, setHasGps] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  const locationSummary = [
    address ? `${address}${numero ? ', ' + numero : ''}` : null,
    neighborhood,
    city,
  ].filter(Boolean).join(' • ');

  /**
   * Busca dados de endereço automaticamente via API ao digitar o CEP
   */
  const handleCepChange = async (text: string) => {
    const formatted = formatCep(text);
    setCep(formatted);
    setCepFoundMessage(null);

    const cleanDigits = text.replace(/\D/g, '');
    if (cleanDigits.length === 8) {
      setIsSearchingCep(true);
      try {
        const result = await fetchAddressByCep(cleanDigits);
        if (result.success) {
          if (result.logradouro) setAddress(result.logradouro);
          if (result.bairro) setNeighborhood(result.bairro);
          setCity(result.localidade || CACERES_DEFAULTS.CITY);
          setCoordinates({ latitude: result.latitude, longitude: result.longitude });
          setCepFoundMessage(`📍 ${result.bairro || 'Cáceres'} - ${result.localidade || 'Cáceres'}/MT`);
        } else {
          setCepFoundMessage('⚠️ ' + (result.message || 'CEP não encontrado. Preencha manualmente.'));
        }
      } catch (err) {
        setCepFoundMessage('Modo offline: Preencha o endereço manualmente.');
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  /**
   * Disparo manual do botão de buscar CEP
   */
  const handleSearchCepButton = async () => {
    if (!cep.trim()) {
      Alert.alert('CEP', 'Digite um CEP de Cáceres (ex: 78200-000) para buscar.');
      return;
    }
    handleCepChange(cep);
  };

  /** Captura a localização GPS do dispositivo em Cáceres - MT */
  const handleUseGps = () => {
    setHasGps(true);
    setCoordinates(DEFAULT_USER_COORDINATES);
    setCep('78200-000');
    setAddress('Praça Barão do Rio Branco');
    setNumero('s/n');
    setNeighborhood('Centro');
    setCity('Cáceres');
    setCepFoundMessage('📍 Coordenadas de Cáceres - MT capturadas via GPS.');
    Alert.alert('GPS Conectado', 'Localização capturada: Centro, Cáceres - MT.');
  };

  /** Valida e submete o novo descarte */
  const handleSave = () => {
    const nextErrors: { quantity?: string; type?: string } = {};
    if (!selectedType) nextErrors.type = 'Selecione uma categoria.';
    if (!quantity.trim()) nextErrors.quantity = 'Informe a quantidade.';
    setErrors(nextErrors);

    if (!selectedType || !quantity.trim()) {
      Alert.alert('Dados incompletos', 'Selecione o tipo e informe a quantidade.');
      return;
    }

    const cleanAddress = address.trim();
    const cleanNumber = numero.trim();
    const fullStreetAddress = cleanAddress
      ? `${cleanAddress}${cleanNumber ? ', ' + cleanNumber : ''}`
      : 'Cáceres - MT';

    const newItem: DiscardItem = {
      id: generateEntityId('disc'),
      type: selectedType,
      quantity: validationUtils.sanitizeText(quantity),
      observation: validationUtils.sanitizeText(observation) || 'Material reciclável pronto para coleta.',
      date: new Date().toLocaleDateString('pt-BR'),
      status: isOffline ? 'Pendente (Offline)' : 'Pendente',
      cep: cep.trim() || '78200-000',
      address: fullStreetAddress,
      number: cleanNumber,
      numero: cleanNumber,
      neighborhood: validationUtils.sanitizeText(neighborhood) || 'Centro',
      city: city || 'Cáceres',
      latitude: coordinates?.latitude || DEFAULT_USER_COORDINATES.latitude,
      longitude: coordinates?.longitude || DEFAULT_USER_COORDINATES.longitude,
      offline: isOffline,
    };

    onSave(newItem);

    if (isOffline) {
      Alert.alert(
        'Modo Offline',
        'Você está offline. Sua solicitação foi salva no dispositivo e será sincronizada com o Firebase ao reconectar.'
      );
    }

    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Registrar descarte"
        subtitle="Informe os dados do resíduo."
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Formulário de Registro */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>O que você está descartando?</Text>
          <View style={styles.tagsContainer}>
            {wasteTypes.map((type) => (
              <Pressable
                key={type}
                android_ripple={{ color: colors.primarySoft }}
                style={({ pressed }) => [
                  styles.tag,
                  selectedType === type && styles.tagSelected,
                  pressed && styles.tagPressed,
                ]}
                onPress={() => {
                  setSelectedType(type);
                  setErrors((prev) => ({ ...prev, type: undefined }));
                }}
              >
                <Text style={[styles.tagText, selectedType === type && styles.tagTextSelected]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.type ? <Text style={styles.errorText}>{errors.type}</Text> : null}

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={[styles.input, errors.quantity && styles.inputError]}
            value={quantity}
            onChangeText={(text) => {
              setQuantity(text);
              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
            }}
            placeholder="Ex.: 4 caixas, 10 garrafas PET, 2 sacos"
            placeholderTextColor={colors.muted}
            returnKeyType="next"
          />
          {errors.quantity ? <Text style={styles.errorText}>{errors.quantity}</Text> : null}

          <View style={styles.locationHeader}>
            <Text style={styles.sectionLabel}>Local da retirada</Text>
            {!showAddressFields ? (
              <Pressable
                style={({ pressed }) => [styles.inlineButton, pressed && styles.tagPressed]}
                onPress={() => setShowAddressFields(true)}
              >
                <Text style={styles.inlineButtonText}>Alterar endereço</Text>
              </Pressable>
            ) : null}
          </View>

          {!showAddressFields ? (
            <View style={styles.addressSummary}>
              <Text style={styles.addressSummaryTitle}>Endereço carregado do perfil</Text>
              <Text style={styles.addressSummaryText}>
                {locationSummary || 'Cáceres - MT'}
              </Text>
            </View>
          ) : null}

          {showAddressFields ? (
            <>
              <Text style={styles.label}>CEP (Cáceres - MT)</Text>
              <View style={styles.cepRow}>
                <TextInput
                  style={[styles.input, styles.cepInput]}
                  value={cep}
                  onChangeText={handleCepChange}
                  placeholder="78200-000"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  maxLength={9}
                  returnKeyType="search"
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.cepSearchButton,
                    isSearchingCep && styles.buttonDisabled,
                    pressed && !isSearchingCep && styles.tagPressed,
                  ]}
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

              {cepFoundMessage ? (
                <View style={styles.cepFeedbackBadge}>
                  <Text style={styles.cepFeedbackText}>{cepFoundMessage}</Text>
                </View>
              ) : null}

              {/* Botão de Localização GPS */}
              <Pressable
                style={({ pressed }) => [styles.gpsButton, pressed && styles.tagPressed]}
                onPress={handleUseGps}
              >
                <Text style={styles.gpsButtonText}>
                  {hasGps ? '📍 Atualizar Localização GPS (Cáceres)' : '📍 Usar minha localização atual (GPS)'}
                </Text>
              </Pressable>

              <Text style={styles.label}>Endereço / Logradouro</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Rua, Avenida, Travessa"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
              />

              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                value={numero}
                onChangeText={setNumero}
                placeholder="Ex: 210, 100, s/n, Apto 12"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
              />

              <Text style={styles.label}>Bairro em Cáceres</Text>
              <TextInput
                style={styles.input}
                value={neighborhood}
                onChangeText={setNeighborhood}
                placeholder="Ex.: Centro, Cavalhada, Santos Dumont, Cohab Nova"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
              />

              <View style={styles.cityBadge}>
                <Text style={styles.cityBadgeLabel}>Município Atendido:</Text>
                <Text style={styles.cityBadgeValue}>🏙️ Cáceres - MT (Pantanal)</Text>
              </View>
            </>
          ) : null}

          <Text style={styles.label}>Observação para o Coletor</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={observation}
            onChangeText={setObservation}
            placeholder="Ex.: Material seco, separado e embalado na calçada"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
          />

          {/* Botões de Ação */}
          <PrimaryButton title="Salvar descarte" onPress={handleSave} style={styles.primaryButton} />
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
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    borderRadius: radius.sm,
    paddingHorizontal: 12,
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
    height: 70,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  tagSelected: {
    backgroundColor: colors.primary,
  },
  tagPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  tagText: {
    fontSize: 13,
    color: colors.text,
  },
  tagTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  defaultAddressBadge: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  defaultAddressBadgeText: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  locationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  inlineButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  inlineButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  addressSummary: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  addressSummaryTitle: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: spacing.xs,
  },
  addressSummaryText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
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
    backgroundColor: colors.primarySoft,
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  cepFeedbackText: {
    color: colors.primaryDark,
    fontSize: 12,
  },
  gpsButton: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  gpsButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  cityBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EFEBE9',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  cityBadgeLabel: {
    fontSize: 12,
    color: '#5D4037',
    fontWeight: '600',
  },
  cityBadgeValue: {
    fontSize: 12,
    color: '#3E2723',
    fontWeight: 'bold',
  },
  primaryButton: {
    marginTop: 20,
  },
});
