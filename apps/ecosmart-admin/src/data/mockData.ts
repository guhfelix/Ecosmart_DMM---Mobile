import type {
  AdminDiscardRecord,
  AdminDiscardStatus,
  CollectionPointItem,
  EducationalTipItem,
  WasteTypeItem,
} from '../../../../shared/models';

export type {
  AdminDiscardRecord,
  AdminDiscardStatus,
  CollectionPointItem,
  EducationalTipItem,
  WasteTypeItem,
};

export const homeItems = [
  { id: '1', titulo: 'Gerenciar resíduos', descricao: 'Cadastrar e editar tipos de resíduos.' },
  { id: '2', titulo: 'Gerenciar pontos', descricao: 'Cadastrar e atualizar pontos de coleta.' },
  { id: '3', titulo: 'Gerenciar dicas', descricao: 'Cadastrar conteúdos educativos sobre sustentabilidade.' },
  { id: '4', titulo: 'Registros gerais', descricao: 'Visualizar descartes registrados no ecossistema.' },
];

export const initialWasteTypes: WasteTypeItem[] = [
  {
    id: '1',
    name: 'Papel',
    description: 'Jornais, caixas, folhas e embalagens de papel limpas e secas.',
  },
  {
    id: '2',
    name: 'Plástico',
    description: 'Garrafas PET, potes, sacolas e embalagens plásticas higienizadas.',
  },
  {
    id: '3',
    name: 'Eletrônico',
    description: 'Cabos, baterias, periféricos e pequenos equipamentos eletrônicos.',
  },
];

export const initialCollectionPoints: CollectionPointItem[] = [
  {
    id: '1',
    name: 'Ponto Verde Centro',
    address: 'Rua da Esperança, 120 - Centro',
    acceptedWaste: 'Papel, plástico, vidro e metal',
    schedule: 'Segunda a sexta, 8h às 17h',
  },
  {
    id: '2',
    name: 'EcoPonto Universitário',
    address: 'Avenida Brasil, 455 - Jardim Universitário',
    acceptedWaste: 'Eletrônicos e baterias',
    schedule: 'Terça e quinta, 9h às 16h',
  },
];

export const initialEducationalTips: EducationalTipItem[] = [
  {
    id: '1',
    title: 'Separe materiais recicláveis',
    category: 'Reciclagem',
    content: 'Mantenha papel, plástico, vidro e metal separados para facilitar a triagem.',
  },
  {
    id: '2',
    title: 'Cuide do descarte eletrônico',
    category: 'Eletrônicos',
    content: 'Pilhas, cabos e aparelhos devem ir para pontos específicos de coleta.',
  },
];

export const initialDiscardRecords: AdminDiscardRecord[] = [
  {
    id: '1',
    citizenName: 'Maria Santos',
    wasteType: 'Papel',
    quantity: '4 caixas desmontadas',
    neighborhood: 'Centro',
    createdAt: '22/08/2026',
    status: 'pendente',
  },
  {
    id: '2',
    citizenName: 'João Pereira',
    wasteType: 'Eletrônico',
    quantity: '1 monitor e 2 carregadores',
    neighborhood: 'Jardim Universitário',
    createdAt: '21/08/2026',
    status: 'visualizado',
  },
  {
    id: '3',
    citizenName: 'Carlos Lima',
    wasteType: 'Metal',
    quantity: '2 sacos pequenos',
    neighborhood: 'DNER',
    createdAt: '19/08/2026',
    status: 'coletado',
  },
];
