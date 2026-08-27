import type {
  AdminDiscardRecord,
  AdminDiscardStatus,
  CollectionPointItem,
  EducationalTipItem,
  WasteTypeItem,
} from '../models';
import {
  CACERES_COLLECTION_POINTS,
  CACERES_DISCARDS_ADMIN,
  CACERES_EDUCATIONAL_TIPS,
  CACERES_WASTE_TYPES,
} from './initialCaceresData';

export type {
  AdminDiscardRecord,
  AdminDiscardStatus,
  CollectionPointItem,
  EducationalTipItem,
  WasteTypeItem,
};

export const homeItems = [
  { id: '1', titulo: 'Gerenciar resíduos', descricao: 'Cadastrar e editar tipos de resíduos aceitos em Cáceres.' },
  { id: '2', titulo: 'Gerenciar pontos', descricao: 'Cadastrar e atualizar ecopontos com geolocalização e CEP.' },
  { id: '3', titulo: 'Gerenciar dicas', descricao: 'Cadastrar conteúdos educativos sobre sustentabilidade no Pantanal.' },
  { id: '4', titulo: 'Registros gerais', descricao: 'Visualizar descartes e exportar relatórios ESG em CSV.' },
];

export const initialWasteTypes: WasteTypeItem[] = CACERES_WASTE_TYPES;

export const initialCollectionPoints: CollectionPointItem[] = CACERES_COLLECTION_POINTS;

export const initialEducationalTips: EducationalTipItem[] = CACERES_EDUCATIONAL_TIPS;

export const initialRecords: AdminDiscardRecord[] = CACERES_DISCARDS_ADMIN;
export const initialDiscardRecords: AdminDiscardRecord[] = CACERES_DISCARDS_ADMIN;
