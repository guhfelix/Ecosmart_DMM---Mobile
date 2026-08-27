import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
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
  
  // Estados de Endereço e CEP (Cáceres - MT) inicializados com o endereço padrão do usuário
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
    } else {
      Alert.alert(
        'Descarte Registrado',
        'Seu descarte em Cáceres foi registrado com sucesso e já está disponível para os coletores.'
      );
    }

    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Cabeçalho informativo */}
        <View style={styles.header}>
          <Text style={styles.title}>Registrar descarte</Text>
          <Text style={styles.subtitle}>
            Cadastre os materiais recicláveis para coleta em Cáceres - MT.
          </Text>
        </View>

        {/* Formulário de Registro */}
        <View style={styles.card}>
          <Text style={styles.label}>Tipo de resíduo</Text>
          <View style={styles.tagsContainer}>
            {wasteTypes.map((type) => (
              <Pressable
                key={type}
                style={[styles.tag, selectedType === type && styles.tagSelected]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.tagText, selectedType === type && styles.tagTextSelected]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Ex.: 4 caixas, 10 garrafas PET, 2 sacos"
            placeholderTextColor={colors.muted}
          />

          {/* Aviso de Endereço Padrão */}
          {defaultUserAddress?.endereco ? (
            <View style={styles.defaultAddressBadge}>
              <Text style={styles.defaultAddressBadgeText}>
                🏠 Endereço padrão carregado do seu perfil ({defaultUserAddress.endereco}{defaultUserAddress.numero ? ', ' + defaultUserAddress.numero : ''})
              </Text>
            </View>
          ) : null}

          {/* Seção de Endereço com CEP Automático */}
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

          {cepFoundMessage ? (
            <View style={styles.cepFeedbackBadge}>
              <Text style={styles.cepFeedbackText}>{cepFoundMessage}</Text>
            </View>
          ) : null}

          {/* Botão de Localização GPS */}
          <Pressable style={styles.gpsButton} onPress={handleUseGps}>
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
          />

          <Text style={styles.label}>Número</Text>
          <TextInput
            style={styles.input}
            value={numero}
            onChangeText={setNumero}
            placeholder="Ex: 210, 100, s/n, Apto 12"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Bairro em Cáceres</Text>
          <TextInput
            style={styles.input}
            value={neighborhood}
            onChangeText={setNeighborhood}
            placeholder="Ex.: Centro, Cavalhada, Santos Dumont, Cohab Nova"
            placeholderTextColor={colors.muted}
          />

          <View style={styles.cityBadge}>
            <Text style={styles.cityBadgeLabel}>Município Atendido:</Text>
            <Text style={styles.cityBadgeValue}>🏙️ Cáceres - MT (Pantanal)</Text>
          </View>

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
    padding: 16,
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
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
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
    borderRadius: 20,
  },
  tagSelected: {
    backgroundColor: colors.primary,
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
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  defaultAddressBadgeText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
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
  gpsButton: {
    backgroundColor: '#E8F5E9',
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
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#ECEFF1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});