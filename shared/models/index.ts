export type PerfilUsuario = 'cidadao' | 'coletor' | 'admin';

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
};

export type StatusDescarte = 'pendente' | 'visualizado' | 'coletado';

export type Descarte = {
  id: string;
  usuarioId: string;
  tipoResiduo: string;
  quantidade: string;
  observacao?: string;
  status: StatusDescarte;
  dataCadastro: string;
  dataColeta?: string;
};
