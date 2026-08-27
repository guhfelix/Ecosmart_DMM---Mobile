import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CollectedDiscardsScreen } from '../CollectedDiscardsScreen';
import { CollectorDiscard } from '../../models';

describe('CollectedDiscardsScreen Coletor', () => {
  const mockItems: CollectorDiscard[] = [
    {
      id: '1',
      citizenName: 'Maria Cidadã',
      wasteType: 'Plástico',
      quantity: '3 sacolas',
      address: 'Rua das Flores, 100',
      neighborhood: 'Centro',
      city: 'Cáceres - MT',
      createdAt: '24/08/2026',
      status: 'coletado',
    },
    {
      id: '2',
      citizenName: 'João Santos',
      wasteType: 'Vidro',
      quantity: '1 caixa',
      address: 'Av. Brasil, 200',
      neighborhood: 'Cavalhada',
      city: 'Cáceres - MT',
      createdAt: '25/08/2026',
      status: 'coletado',
    },
  ];

  it('deve listar as coletas realizadas com sucesso', () => {
    const onOpenDetails = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <CollectedDiscardsScreen
        items={mockItems}
        onOpenDetails={onOpenDetails}
        onBack={onBack}
      />
    );

    expect(getByText('Coletas realizadas')).toBeTruthy();
    expect(getByText('Plástico')).toBeTruthy();
    expect(getByText('Vidro')).toBeTruthy();
  });

  it('deve permitir buscar coletas por tipo ou bairro', () => {
    const onOpenDetails = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getByText, queryByText } = render(
      <CollectedDiscardsScreen
        items={mockItems}
        onOpenDetails={onOpenDetails}
        onBack={onBack}
      />
    );

    const searchInput = getByPlaceholderText('🔍 Buscar coletas por tipo, bairro...');
    fireEvent.changeText(searchInput, 'Cavalhada');

    expect(getByText('Vidro')).toBeTruthy();
    expect(queryByText('Plástico')).toBeNull();
  });

  it('deve abrir detalhes ao clicar no card de coleta', () => {
    const onOpenDetails = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <CollectedDiscardsScreen
        items={mockItems}
        onOpenDetails={onOpenDetails}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('Plástico'));
    expect(onOpenDetails).toHaveBeenCalledWith(mockItems[0]);
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onOpenDetails = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <CollectedDiscardsScreen
        items={mockItems}
        onOpenDetails={onOpenDetails}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
