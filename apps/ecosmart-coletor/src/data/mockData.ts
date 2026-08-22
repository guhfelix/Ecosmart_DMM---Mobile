export const homeItems = [
  { id: '1', titulo: 'Descartes disponíveis', descricao: 'Visualizar resíduos cadastrados pelos cidadãos.' },
  { id: '2', titulo: 'Filtro por tipo', descricao: 'Filtrar descartes por categoria de resíduo.' },
  { id: '3', titulo: 'Detalhes do descarte', descricao: 'Consultar tipo, quantidade e status do resíduo.' },
  { id: '4', titulo: 'Marcar como coletado', descricao: 'Atualizar o status da coleta quando realizada.' },
];

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

export const wasteTypes = ['Todos', 'Papel', 'Plástico', 'Vidro', 'Metal', 'Eletrônico', 'Orgânico'];

export const initialDiscards: CollectorDiscard[] = [
  {
    id: '1',
    citizenName: 'Maria Santos',
    wasteType: 'Papel',
    quantity: '4 caixas desmontadas',
    address: 'Rua das Acácias, 120',
    neighborhood: 'Centro',
    observation: 'Material seco, separado em sacolas.',
    createdAt: '22/08/2026',
    status: 'pendente',
  },
  {
    id: '2',
    citizenName: 'João Pereira',
    wasteType: 'Eletrônico',
    quantity: '1 monitor e 2 carregadores',
    address: 'Avenida Brasil, 455',
    neighborhood: 'Jardim Universitário',
    observation: 'Retirar na portaria do prédio.',
    createdAt: '21/08/2026',
    status: 'pendente',
  },
  {
    id: '3',
    citizenName: 'Ana Souza',
    wasteType: 'Vidro',
    quantity: '10 garrafas',
    address: 'Rua Verde, 32',
    neighborhood: 'Cavalhada',
    createdAt: '20/08/2026',
    status: 'pendente',
  },
  {
    id: '4',
    citizenName: 'Carlos Lima',
    wasteType: 'Metal',
    quantity: '2 sacos pequenos',
    address: 'Travessa São José, 89',
    neighborhood: 'DNER',
    observation: 'Latas higienizadas.',
    createdAt: '19/08/2026',
    status: 'coletado',
    collectedAt: '22/08/2026',
  },
];
