import type { CollectorDiscard, DiscardStatus } from '../models';
import {
  CACERES_DISCARDS_COLETOR,
  CACERES_WASTE_TYPE_NAMES,
} from './initialCaceresData';

export type { CollectorDiscard, DiscardStatus };

export const homeItems = [
  { id: '1', titulo: 'Descartes disponíveis', descricao: 'Visualizar resíduos cadastrados pelos cidadãos em Cáceres com distâncias e CEP.' },
  { id: '2', titulo: 'Filtro por tipo', descricao: 'Filtrar descartes por categoria de resíduo e proximidade.' },
  { id: '3', titulo: 'Detalhes do descarte', descricao: 'Consultar tipo, quantidade, endereço e rotas de coleta.' },
  { id: '4', titulo: 'Marcar como coletado', descricao: 'Atualizar o status da coleta com sincronização no Firestore.' },
];

export const wasteTypes = ['Todos', ...CACERES_WASTE_TYPE_NAMES];

export const initialDiscards: CollectorDiscard[] = CACERES_DISCARDS_COLETOR;
