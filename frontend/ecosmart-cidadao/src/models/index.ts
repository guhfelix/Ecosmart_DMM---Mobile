export type PerfilUsuario = 'cidadao' | 'coletor' | 'admin';

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

export type AuthUserInput = {
  name: string;
  email: string;
  password: string;
  accessCode?: string;
};

export type AuthSession = {
  user: Usuario;
  token?: string;
  loginAt: string;
};

export type StatusDescarte = 'pendente' | 'visualizado' | 'coletado';

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

export type CitizenDiscardStatus = 'Pendente' | 'Coletado' | 'Pendente (Offline)';

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

export type DiscardStatus = 'pendente' | 'coletado';

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

export type WasteTypeItem = {
  id: string;
  name: string;
  description: string;
};

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

export type EducationalTipItem = {
  id: string;
  title: string;
  category: string;
  content: string;
};

export type AdminDiscardStatus = StatusDescarte;

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

export type NotificationType = 'discard' | 'collection' | 'sync' | 'system';

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: NotificationType;
};

export type ResetCodeResult = {
  success: boolean;
  message: string;
  code?: string;
};

export type ResetPasswordResult = {
  success: boolean;
  message: string;
};
