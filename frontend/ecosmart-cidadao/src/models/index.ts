/**
 * Modelos de Domínio Compartilhados do EcoSmart Mobile.
 * Centraliza os contratos de tipagem para Cidadão, Coletor e Administrador.
 */

/** Perfis de usuário aceitos no ecossistema */
export type PerfilUsuario = 'cidadao' | 'coletor' | 'admin';

/** Entidade de Usuário autenticado e seus dados de perfil */
export type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  veiculo?: string;
  capacidadeCarga?: string;
  cargo?: string;
  departamento?: string;
  avatarUri?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
};

/** Entrada de dados para cadastro de usuário */
export type AuthUserInput = {
  name: string;
  email: string;
  password: string;
  accessCode?: string;
};

/** Sessão autenticada ativa */
export type AuthSession = {
  user: Usuario;
  token?: string;
  loginAt: string;
};

/** Status canônico de descarte */
export type StatusDescarte = 'pendente' | 'visualizado' | 'coletado';

/** Modelo genérico de descarte */
export type Descarte = {
  id: string;
  usuarioId?: string;
  nomeCidadao?: string;
  tipoResiduo: string;
  quantidade: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  observacao?: string;
  status: StatusDescarte;
  dataCadastro: string;
  dataColeta?: string;
  photoUri?: string;
  latitude?: number;
  longitude?: number;
  offline?: boolean;
};

/** Status de descarte na visão do Cidadão */
export type CitizenDiscardStatus = 'Pendente' | 'Coletado' | 'Pendente (Offline)';

/** Item de descarte na interface do Cidadão */
export type DiscardItem = {
  id: string;
  type: string;
  quantity: string;
  observation: string;
  date: string;
  status: CitizenDiscardStatus;
  cep?: string;
  address?: string;
  number?: string;
  numero?: string;
  neighborhood?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  offline?: boolean;
  photoUri?: string;
};

/** Status de descarte na visão do Coletor */
export type DiscardStatus = 'pendente' | 'coletado';

/** Item de descarte com geolocalização para o Coletor */
export type CollectorDiscard = {
  id: string;
  citizenName: string;
  wasteType: string;
  quantity: string;
  cep?: string;
  address: string;
  number?: string;
  numero?: string;
  neighborhood: string;
  city?: string;
  observation?: string;
  createdAt: string;
  status: DiscardStatus;
  collectedAt?: string;
  coletorId?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  offlineSyncPending?: boolean;
  photoUri?: string;
};

/** Tipo de resíduo reciclável */
export type WasteTypeItem = {
  id: string;
  name: string;
  description: string;
};

/** Ponto de entrega voluntária (PEV) / Ecoponto */
export type CollectionPointItem = {
  id: string;
  name: string;
  address: string;
  acceptedWaste: string;
  schedule: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
};

/** Dica educativa ambiental */
export type EducationalTipItem = {
  id: string;
  title: string;
  category: string;
  content: string;
};

/** Status de descarte na visão administrativa */
export type AdminDiscardStatus = StatusDescarte;

/** Registro consolidado para auditoria e relatórios ESG do Administrador */
export type AdminDiscardRecord = {
  id: string;
  citizenName: string;
  wasteType: string;
  quantity: string;
  neighborhood: string;
  cep?: string;
  address?: string;
  number?: string;
  numero?: string;
  city?: string;
  createdAt: string;
  status: AdminDiscardStatus;
  collectedAt?: string;
  coletorId?: string;
  latitude?: number;
  longitude?: number;
  offline?: boolean;
  photoUri?: string;
};

/** Tipo de notificação no sistema */
export type NotificationType = 'discard' | 'collection' | 'sync' | 'system';

/** Notificação do ecossistema */
export type AppNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: NotificationType;
};

/** Resultado da solicitação de código de recuperação */
export type ResetCodeResult = {
  success: boolean;
  message: string;
  code?: string;
};

/** Resultado da redefinição de senha */
export type ResetPasswordResult = {
  success: boolean;
  message: string;
};

