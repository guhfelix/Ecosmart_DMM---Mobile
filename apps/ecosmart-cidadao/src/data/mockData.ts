export const homeItems = [
  { id: '1', titulo: 'Registrar descarte', descricao: 'Cadastrar tipo de resíduo, quantidade aproximada e observação.' },
  { id: '2', titulo: 'Histórico', descricao: 'Consultar descartes registrados pelo cidadão.' },
  { id: '3', titulo: 'Dicas educativas', descricao: 'Acessar orientações simples sobre descarte correto.' },
  { id: '4', titulo: 'Pontos de coleta', descricao: 'Visualizar locais cadastrados para descarte de resíduos.' },
];

export const wasteTypes = ['Papel', 'Plástico', 'Vidro', 'Metal', 'Eletrônico', 'Orgânico'];

export const tips = [
  {
    id: '1',
    title: 'Separe por material',
    description: 'Papel, plástico, vidro e metal devem ser separados antes do descarte para facilitar a reciclagem.',
  },
  {
    id: '2',
    title: 'Evite resíduos misturados',
    description: 'Itens limpos e secos têm mais valor para coleta e reciclagem. Evite misturar com restos orgânicos.',
  },
  {
    id: '3',
    title: 'Descarte eletrônico com cuidado',
    description: 'Pilhas, cabos e eletrônicos devem ser entregues em pontos específicos para evitar contaminação.',
  },
  {
    id: '4',
    title: 'Reduza o volume',
    description: 'Amassar garrafas e compactar materiais ajuda a otimizar o transporte e o espaço de coleta.',
  },
];

export const collectionPoints = [
  {
    id: '1',
    name: 'Ponto Verde Centro',
    address: 'Rua da Esperança, 120 - Centro',
    acceptedWaste: 'Papel, plástico, vidro e metal',
  },
  {
    id: '2',
    name: 'Recicla Bairro Novo',
    address: 'Avenida das Flores, 300 - Bairro Novo',
    acceptedWaste: 'Eletrônicos e baterias',
  },
  {
    id: '3',
    name: 'Coleta Comunitária',
    address: 'Praça da Paz, 45 - Vila Alegre',
    acceptedWaste: 'Orgânicos e recicláveis',
  },
];
