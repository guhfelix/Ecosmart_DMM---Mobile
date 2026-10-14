/**
 * Definição dos Tipos e Modelos de Banco de Dados do EcoSmart Mobile.
 */

/** Entidade de Usuário Comum no Banco de Dados Principal ((default)) */
export interface DbUser {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: 'cidadao' | 'coletor';
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  veiculo?: string;
  capacidade_carga?: string;
  bio?: string;
  avatar_url?: string;
  codigo_recuperacao?: string;
  criado_em: string;
  atualizado_em?: string;
}

/** Entidade de Administrador no Banco de Dados Dedicado e Isolado (ecosmart-admin-db) */
export interface DbAdmin {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  perfil: 'admin';
  telefone?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  cargo?: string;
  departamento?: string;
  bio?: string;
  avatar_url?: string;
  codigo_recuperacao?: string;
  criado_em: string;
  atualizado_em?: string;
}

/** Entidade de Log de Auditoria no Banco Administrativo */
export interface DbAdminLog {
  id: string;
  admin_id: string;
  admin_email: string;
  acao: string;
  detalhes?: string;
  ip?: string;
  criado_em: string;
}

/** Entidade de Descarte de Resíduos no Banco de Dados */
export interface DbDiscard {
  id: string;
  usuario_id?: string;
  nome_cidadao: string;
  tipo_residuo: string;
  quantidade: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  latitude?: number;
  longitude?: number;
  foto_url?: string;
  observacao?: string;
  status: 'pendente' | 'visualizado' | 'coletado';
  offline_sync_pending?: boolean;
  data_cadastro: string;
  data_coleta?: string;
  coletor_id?: string;
  criado_em?: string;
}

/** Entidade de Tipo de Resíduo Reciclável */
export interface DbWasteType {
  id: string;
  nome: string;
  descricao: string;
  criado_em?: string;
}

/** Entidade de Ponto de Coleta / Ecoponto */
export interface DbCollectionPoint {
  id: string;
  nome: string;
  cep?: string;
  endereco: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  residuos_aceitos: string;
  horario: string;
  latitude?: number;
  longitude?: number;
  criado_em?: string;
}

/** Entidade de Dica Educativa e Preservação Ambiental */
export interface DbEducationalTip {
  id: string;
  titulo: string;
  categoria: string;
  conteudo: string;
  criado_em?: string;
}