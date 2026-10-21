import React, { useRef, useState } from 'react';
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
import type { DiscardItem, DiscardUnit } from '../models';

export type { DiscardItem };

export const DISCARD_UNITS: readonly DiscardUnit[] = ['kg', 'unidade', 'saco', 'litro'] as const;

type Props = {
  /** Callback para salvar ou atualizar o descarte na lista global do App */
  onSave: (item: DiscardItem) => void | Promise<void>;
  /** Callback para retornar à tela anterior */
  onBack: () => void;
  /** Indicador de conexão (se offline, salva com status pendente offline) */
  isOffline?: boolean;
  /** Item existente para preenchimento no modo de edição (A4-01) */
  initialItem?: DiscardItem | null;
  /** Flag explícita indicando modo de edição (A4-01) */
  isEditing?: boolean;
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
 * Tela de Registro e Edição de Descarte do Cidadão em Cáceres - MT (A4-01, A4-08, A4-09, A4-17).
 * Permite selecionar categoria, quantidade numérica validada (> 0), unidade de medida,
 * observação, preenchimento automático por CEP (ViaCEP) e coordenadas de referência de Cáceres.
 */
export function RegisterDiscardScreen({
  onSave,
  onBack,
  isOffline = false,
  initialItem = null,
  isEditing = false,
  defaultUserAddress,
}: Props) {
  const editMode = Boolean(isEditing || initialItem);
  const parsedInitialQty = initialItem
    ? validationUtils.parseQuantityAndUnit(initialItem.quantity, initialItem.unit)
    : null;

  const [selectedType, setSelectedType] = useState(
    initialItem?.type || initialItem?.wasteType || wasteTypes[0]
  );
  const [quantity, setQuantity] = useState(
    parsedInitialQty ? String(parsedInitialQty.numericValue) : ''
  );
  const [selectedUnit, setSelectedUnit] = useState<DiscardUnit>(
    parsedInitialQty?.unit || initialItem?.unit || 'unidade'
  );
  const [observation, setObservation] = useState(initialItem?.observation || '');
  const [errors, setErrors] = useState<{ quantity?: string; type?: string }>({});
  const [saving, setSaving] = useState(false);
  const isSubmittingRef = useRef(false);

  // Extrai logradouro sem número caso venha concatenado na edição
  const initialStreet = initialItem?.address
    ? initialItem.address.split(',')[0].trim()
    : defaultUserAddress?.endereco || '';
  const initialNumber =
    initialItem?.numero || initialItem?.number || defaultUserAddress?.numero || '';

  const hasDefaultAddress = Boolean(defaultUserAddress?.endereco) && !editMode;
  const [showAddressFields, setShowAddressFields] = useState(!hasDefaultAddress);
  const [cep, setCep] = useState(
    initialItem?.cep || defaultUserAddress?.cep || '78200-000'
  );
  const [address, setAddress] = useState(initialStreet);
  const [numero, setNumero] = useState(initialNumber);
  const [neighborhood, setNeighborhood] = useState(
    initialItem?.neighborhood || defaultUserAddress?.bairro || 'Centro'
  );
  const [city, setCity] = useState(
    initialItem?.city || defaultUserAddress?.cidade || CACERES_DEFAULTS.CITY
  );
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFoundMessage, setCepFoundMessage] = useState<string | null>(null);

  // Estados de Coordenadas de Referência (A4-17)
  const [hasReferenceCoords, setHasReferenceCoords] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    initialItem?.latitude && initialItem?.longitude
      ? { latitude: initialItem.latitude, longitude: initialItem.longitude }
      : null
  );

  const locationSummary = [
    address ? `${address}${numero ? ', ' + numero : ''}` : null,
    neighborhood,
    city,
  ]
    .filter(Boolean)
    .join(' • ');

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
          setCepFoundMessage(
            `📍 ${result.bairro || 'Cáceres'} - ${result.localidade || 'Cáceres'}/MT`
          );
        } else {
          setCepFoundMessage(
            '⚠️ ' + (result.message || 'CEP não encontrado. Preencha manualmente.')
          );
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

  /** Aplica coordenadas de referência de Cáceres - MT sem simular captura falsa de GPS (A4-17) */
  const handleUseReferenceCoordinates = () => {
    setHasReferenceCoords(true);
    setCoordinates(DEFAULT_USER_COORDINATES);
    setCep('78200-000');
    setAddress('Praça Barão do Rio Branco');
    setNumero('s/n');
    setNeighborhood('Centro');
    setCity('Cáceres');
    setCepFoundMessage('📍 Coordenadas de referência (Cáceres - MT) aplicadas.');
    Alert.alert(
      'Coordenadas de Referência',
      'Coordenadas de referência definidas: Centro, Cáceres - MT.'
    );
  };

  /** Valida e submete o descarte (criação ou edição) com proteção contra clique duplo (A4-01, A4-08, A4-09) */
  const handleSave = async () => {
    if (saving || isSubmittingRef.current) {
      return;
    }

    const nextErrors: { quantity?: string; type?: string } = {};
    if (!selectedType) {
      nextErrors.type = 'Selecione uma categoria.';
    }

    const qtyValidation = validationUtils.isValidQuantity(quantity);
    if (!qtyValidation.isValid || qtyValidation.numericValue === undefined) {
      nextErrors.quantity = qtyValidation.errorMessage || 'Informe uma quantidade válida maior que zero.';
    }

    setErrors(nextErrors);

    if (nextErrors.type || nextErrors.quantity || qtyValidation.numericValue === undefined) {
      Alert.alert(
        'Dados inválidos',
        nextErrors.quantity || nextErrors.type || 'Selecione o tipo e informe uma quantidade numérica maior que zero.'
      );
      return;
    }

    isSubmittingRef.current = true;
    setSaving(true);

    try {
      const cleanAddress = address.trim();
      const cleanNumber = numero.trim();
      const fullStreetAddress = cleanAddress
        ? `${cleanAddress}${cleanNumber && !cleanAddress.includes(cleanNumber) ? ', ' + cleanNumber : ''}`
        : 'Cáceres - MT';

      const nowIso = new Date().toISOString();
      const preservedId = initialItem?.id || generateEntityId('disc');

      const discardPayload: DiscardItem = {
        ...(initialItem || {}),
        id: preservedId,
        type: selectedType,
        wasteType: selectedType,
        quantity: qtyValidation.numericValue,
        unit: selectedUnit || 'unidade',
        observation:
          validationUtils.sanitizeText(observation) ||
          'Material reciclável pronto para coleta.',
        date: initialItem?.date || nowIso,
        createdAt: initialItem?.createdAt || nowIso,
        updatedAt: nowIso,
        status:
          initialItem?.status === 'Coletado'
            ? 'Coletado'
            : isOffline
            ? 'Pendente (Offline)'
            : 'Pendente',
        cep: cep.trim() || '78200-000',
        address: fullStreetAddress,
        number: cleanNumber,
        numero: cleanNumber,
        neighborhood: validationUtils.sanitizeText(neighborhood) || 'Centro',
        city: city || 'Cáceres',
        latitude: coordinates?.latitude || DEFAULT_USER_COORDINATES.latitude,
        longitude: coordinates?.longitude || DEFAULT_USER_COORDINATES.longitude,
        offline: isOffline,
        syncPending: isOffline,
      };

      const savePromise = onSave(discardPayload);
      if (savePromise && typeof (savePromise as Promise<void>).then === 'function') {
        await savePromise;
      }

      if (isOffline) {
        Alert.alert(
          'Salvo localmente (offline)',
          'Você está offline. Sua solicitação foi salva no dispositivo e será sincronizada com a nuvem ao reconectar.'
        );
      }

      onBack();
    } finally {
      isSubmittingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={editMode ? 'Editar descarte' : 'Registrar descarte'}
        subtitle={
          editMode
            ? 'Atualize os dados do seu registro.'
            : 'Informe os dados do resíduo.'
        }
        onBack={onBack}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
                <Text
                  style={[styles.tagText, selectedType === type && styles.tagTextSelected]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.type ? <Text style={styles.errorText}>{errors.type}</Text> : null}

          <Text style={styles.label}>Quantidade (numérica &gt; 0)</Text>
          <TextInput
            testID="quantity-input"
            style={[styles.input, errors.quantity && styles.inputError]}
            value={quantity}
            onChangeText={(text) => {
              setQuantity(text);
              if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
            }}
            placeholder="Ex.: 2, 5, 10"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            returnKeyType="next"
          />
          {errors.quantity ? <Text style={styles.errorText}>{errors.quantity}</Text> : null}

          <Text style={styles.label}>Unidade de medida</Text>
          <View style={styles.unitRow}>
            {DISCARD_UNITS.map((unitOption) => (
              <Pressable
                key={unitOption}
                testID={`unit-option-${unitOption}`}
                android_ripple={{ color: colors.primarySoft }}
                style={({ pressed }) => [
                  styles.unitChip,
                  selectedUnit === unitOption && styles.unitChipSelected,
                  pressed && styles.tagPressed,
                ]}
                onPress={() => setSelectedUnit(unitOption)}
              >
                <Text
                  style={[
                    styles.unitChipText,
                    selectedUnit === unitOption && styles.unitChipTextSelected,
                  ]}
                >
                  {unitOption}
                </Text>
              </Pressable>
            ))}
          </View>

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

              {/* Botão de Coordenadas de Referência (A4-17) */}
              <Pressable
                testID="reference-coordinates-button"
                style={({ pressed }) => [styles.gpsButton, pressed && styles.tagPressed]}
                onPress={handleUseReferenceCoordinates}
              >
                <Text style={styles.gpsButtonText}>
                  {hasReferenceCoords
                    ? '📍 Coordenadas de referência aplicadas (Cáceres - MT)'
                    : '📍 Usar coordenadas de referência (Cáceres - MT)'}
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

          <PrimaryButton
            testID="save-discard-button"
            title={editMode ? 'Salvar alterações' : 'Salvar descarte'}
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.primaryButton}
          />
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
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  unitChip: {
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  unitChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  unitChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
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
