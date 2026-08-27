import { CollectionPointItem } from '../models';
import {
  CACERES_COLLECTION_POINTS,
  CACERES_EDUCATIONAL_TIPS,
  CACERES_WASTE_TYPE_NAMES,
} from './initialCaceresData';

export const homeItems = [
  { id: '1', titulo: 'Registrar descarte', descricao: 'Cadastrar tipo de resíduo, CEP e quantidade para coleta em Cáceres.' },
  { id: '2', titulo: 'Histórico', descricao: 'Consultar descartes registrados pelo cidadão.' },
  { id: '3', titulo: 'Dicas educativas', descricao: 'Orientações sobre descarte consciente e proteção do Pantanal.' },
  { id: '4', titulo: 'Pontos de coleta', descricao: 'Ecopontos e locais de entrega voluntária (PEV) em Cáceres - MT.' },
];

export const wasteTypes = CACERES_WASTE_TYPE_NAMES;

export const tips = CACERES_EDUCATIONAL_TIPS.map((t) => ({
  id: t.id,
  title: t.title,
  description: t.content,
  category: t.category,
}));

export const collectionPoints: CollectionPointItem[] = CACERES_COLLECTION_POINTS;
