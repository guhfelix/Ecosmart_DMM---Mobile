/**
 * Serviço de Integração com API de CEP (ViaCEP) e Georreferenciamento de Cáceres - MT.
 * Permite autocompletar Logradouro, Bairro, Cidade e Coordenadas ao digitar o CEP.
 */

export interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  ibge?: string;
  ddd?: string;
  erro?: boolean;
}

export interface CepLookupResult {
  success: boolean;
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  ddd: string;
  latitude: number;
  longitude: number;
  message?: string;
}

export const CACERES_DEFAULTS = {
  CITY: 'Cáceres',
  STATE: 'MT',
  DDD: '65',
  DEFAULT_CEP: '78200-000',
  LATITUDE: -16.0766,
  LONGITUDE: -57.6816,
};

/** Coordenadas aproximadas por bairro de Cáceres - MT */
const CACERES_NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  centro: { lat: -16.0725, lng: -57.6798 },
  'santos dumont': { lat: -16.085, lng: -57.6912 },
  cavalhada: { lat: -16.0645, lng: -57.672 },
  'cohab nova': { lat: -16.091, lng: -57.665 },
  'jardim guanabara': { lat: -16.058, lng: -57.689 },
  dner: { lat: -16.0815, lng: -57.684 },
  'jardim paraiso': { lat: -16.069, lng: -57.695 },
  'jardim paraíso': { lat: -16.069, lng: -57.695 },
  maracanazinho: { lat: -16.078, lng: -57.668 },
  maracanãzinho: { lat: -16.078, lng: -57.668 },
  'vila mariana': { lat: -16.083, lng: -57.675 },
  'sao lourenco': { lat: -16.061, lng: -57.683 },
  'são lourenço': { lat: -16.061, lng: -57.683 },
  empa: { lat: -16.095, lng: -57.678 },
  'cidade nova': { lat: -16.088, lng: -57.686 },
};

/**
 * Formata um CEP para o padrão 00000-000
 */
export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/**
 * Limpa o CEP deixando apenas dígitos
 */
export function cleanCepDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Obtém coordenadas aproximadas com base no bairro em Cáceres - MT
 */
export function getCoordinatesForNeighborhood(bairro: string): { latitude: number; longitude: number } {
  const normalized = (bairro || '').trim().toLowerCase();
  const match = CACERES_NEIGHBORHOOD_COORDS[normalized];
  if (match) {
    return { latitude: match.lat, longitude: match.lng };
  }
  return { latitude: CACERES_DEFAULTS.LATITUDE, longitude: CACERES_DEFAULTS.LONGITUDE };
}

/**
 * Consulta o endereço completo a partir do CEP usando a API ViaCEP
 * com fallback inteligente configurado para Cáceres - MT.
 */
export async function fetchAddressByCep(cepInput: string): Promise<CepLookupResult> {
  const cleanCep = cleanCepDigits(cepInput);

  if (cleanCep.length !== 8) {
    return {
      success: false,
      cep: formatCep(cepInput),
      logradouro: '',
      bairro: '',
      localidade: CACERES_DEFAULTS.CITY,
      uf: CACERES_DEFAULTS.STATE,
      ddd: CACERES_DEFAULTS.DDD,
      latitude: CACERES_DEFAULTS.LATITUDE,
      longitude: CACERES_DEFAULTS.LONGITUDE,
      message: 'CEP deve conter 8 dígitos numéricos.',
    };
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      signal: controller ? controller.signal : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      return {
        success: false,
        cep: formatCep(cleanCep),
        logradouro: '',
        bairro: '',
        localidade: CACERES_DEFAULTS.CITY,
        uf: CACERES_DEFAULTS.STATE,
        ddd: CACERES_DEFAULTS.DDD,
        latitude: CACERES_DEFAULTS.LATITUDE,
        longitude: CACERES_DEFAULTS.LONGITUDE,
        message: 'CEP não encontrado na base dos Correios.',
      };
    }

    const localidade = data.localidade || CACERES_DEFAULTS.CITY;
    const uf = data.uf || CACERES_DEFAULTS.STATE;
    const bairro = data.bairro || '';
    const logradouro = data.logradouro || '';
    const coords = getCoordinatesForNeighborhood(bairro);

    return {
      success: true,
      cep: data.cep || formatCep(cleanCep),
      logradouro,
      bairro,
      localidade,
      uf,
      ddd: data.ddd || CACERES_DEFAULTS.DDD,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
  } catch (error) {
    // Fallback gracioso offline
    return {
      success: true, // Permite uso offline com defaults de Cáceres
      cep: formatCep(cleanCep),
      logradouro: '',
      bairro: 'Centro',
      localidade: CACERES_DEFAULTS.CITY,
      uf: CACERES_DEFAULTS.STATE,
      ddd: CACERES_DEFAULTS.DDD,
      latitude: CACERES_DEFAULTS.LATITUDE,
      longitude: CACERES_DEFAULTS.LONGITUDE,
      message: 'Modo offline: Preenchido com dados padrão de Cáceres - MT.',
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export const cepService = {
  fetchAddressByCep,
  formatCep,
  cleanCepDigits,
  getCoordinatesForNeighborhood,
};

export default cepService;
