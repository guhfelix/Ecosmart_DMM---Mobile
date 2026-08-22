export type PerfilUsuario = 'cidadao' | 'coletor' | 'admin';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
};

export type AuthUserInput = {
  name: string;
  email: string;
  password: string;
};

export type StatusDescarte = 'pendente' | 'visualizado' | 'coletado';

export type Descarte = {
  id: string;
  usuarioId?: string;
  nomeCidadao?: string;
  tipoResiduo: string;
  quantidade: string;
  endereco?: string;
  bairro?: string;
  observacao?: string;
  status: StatusDescarte;
  dataCadastro: string;
  dataColeta?: string;
};

export type CitizenDiscardStatus = 'Pendente' | 'Coletado';

export type DiscardItem = {
  id: string;
  type: string;
  quantity: string;
  observation: string;
  date: string;
  status: CitizenDiscardStatus;
};

export type DiscardStatus = 'pendente' | 'coletado';

export type CollectorDiscard = {
  id: string;
  citizenName: string;
  wasteType: string;
  quantity: string;
  address: string;
  neighborhood: string;
  observation?: string;
  createdAt: string;
  status: DiscardStatus;
  collectedAt?: string;
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
  createdAt: string;
  status: AdminDiscardStatus;
};
