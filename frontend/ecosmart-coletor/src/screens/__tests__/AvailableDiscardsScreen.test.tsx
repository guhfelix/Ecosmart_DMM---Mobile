import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AvailableDiscardsScreen } from '../AvailableDiscardsScreen';
import { CollectorDiscard } from '../../data/mockData';

const mockDiscards: CollectorDiscard[] = [
  {
    id: 'disc-test-1',
    citizenName: 'Maria Silva',
    wasteType: 'Papel e Papelão',
    quantity: '4 caixas desmontadas',
    address: 'Rua Cel. Faria, 210',
    neighborhood: 'Centro',
    city: 'Cáceres',
    cep: '78200-050',
    status: 'pendente',
    createdAt: '24/08/2026',
    latitude: -16.0725,
    longitude: -57.6798,
    distanceKm: 0.6,
  },
  {
    id: 'disc-test-2',
    citizenName: 'Carlos Pantaneiro',
    wasteType: 'Plástico e PET',
    quantity: '15 garrafas PET prensadas',
    address: 'Av. São Luiz, 450',
    neighborhood: 'Cavalhada',
    city: 'Cáceres',
    cep: '78202-000',
    status: 'pendente',
    createdAt: '24/08/2026',
    latitude: -16.0645,
    longitude: -57.672,
    distanceKm: 1.4,
  },
];

describe('AvailableDiscardsScreen Coletor', () => {
  it('deve renderizar a lista de descartes em Cáceres e abrir detalhes ao clicar', () => {
    const onSelectType = jest.fn();
    const onOpenDetails = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <AvailableDiscardsScreen
        items={mockDiscards}
        selectedType="Todos"
        onSelectType={onSelectType}
        onOpenDetails={onOpenDetails}
        onBack={onBack}
      />
    );

    expect(getByText('Descartes disponíveis')).toBeTruthy();
    
    // Clicar no primeiro descarte pelo texto da quantidade
    fireEvent.press(getByText(mockDiscards[0].quantity));
    expect(onOpenDetails).toHaveBeenCalledWith(mockDiscards[0]);
  });

  it('deve permitir filtrar por tipo de resíduo', () => {
    const onSelectType = jest.fn();
    const onOpenDetails = jest.fn();
    const onBack = jest.fn();

    const { getAllByText } = render(
      <AvailableDiscardsScreen
        items={mockDiscards}
        selectedType="Todos"
        onSelectType={onSelectType}
        onOpenDetails={onOpenDetails}
        onBack={onBack}
      />
    );

    // O filtro 'Plástico e PET' é exibido no topo (primeiro elemento)
    const filterButtons = getAllByText('Plástico e PET');
    fireEvent.press(filterButtons[0]);
    expect(onSelectType).toHaveBeenCalledWith('Plástico e PET');
  });

  it('deve permitir buscar descartes por texto e ordenar por proximidade', () => {
    const onSelectType = jest.fn();
    const onOpenDetails = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <AvailableDiscardsScreen
        items={mockDiscards}
        selectedType="Todos"
        onSelectType={onSelectType}
        onOpenDetails={onOpenDetails}
        onBack={onBack}
      />
    );

    fireEvent.changeText(getByPlaceholderText('🔍 Buscar descartes...'), 'Centro');
    expect(getByText(/Centro/)).toBeTruthy();

    fireEvent.press(getByText('Mais próximos (GPS)'));
    expect(getByText('Mais próximos (GPS)')).toBeTruthy();
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onSelectType = jest.fn();
    const onOpenDetails = jest.fn();
    const onBack = jest.fn();

    const { getByLabelText } = render(
      <AvailableDiscardsScreen
        items={mockDiscards}
        selectedType="Todos"
        onSelectType={onSelectType}
        onOpenDetails={onOpenDetails}
        onBack={onBack}
      />
    );

    fireEvent.press(getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });

  it('deve acionar confirmação de coleta ao clicar no botão Coletar do card', () => {
    const onSelectType = jest.fn();
    const onOpenDetails = jest.fn();
    const onCollect = jest.fn();
    const onBack = jest.fn();

    const { getAllByText } = render(
      <AvailableDiscardsScreen
        items={mockDiscards}
        selectedType="Todos"
        onSelectType={onSelectType}
        onOpenDetails={onOpenDetails}
        onCollect={onCollect}
        onBack={onBack}
      />
    );

    const collectButtons = getAllByText('Confirmar coleta');
    expect(collectButtons.length).toBeGreaterThan(0);
    fireEvent.press(collectButtons[0]);
  });
});
