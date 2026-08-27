import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { RecordsScreen } from '../RecordsScreen';
import { AdminDiscardRecord } from '../../models';

jest.spyOn(Alert, 'alert');

describe('RecordsScreen Admin', () => {
  const mockItems: AdminDiscardRecord[] = [
    {
      id: '1',
      citizenName: 'Maria Cidadã',
      wasteType: 'Plástico',
      quantity: '3 sacolas',
      neighborhood: 'Centro',
      createdAt: '24/08/2026',
      status: 'pendente',
    },
    {
      id: '2',
      citizenName: 'João Santos',
      wasteType: 'Vidro',
      quantity: '1 caixa',
      neighborhood: 'Cavalhada',
      createdAt: '25/08/2026',
      status: 'coletado',
    },
  ];

  it('deve listar os registros gerais de descarte', () => {
    const onSelectFilter = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <RecordsScreen
        items={mockItems}
        selectedFilter="todos"
        onSelectFilter={onSelectFilter}
        onBack={onBack}
      />
    );

    expect(getByText('Registros gerais')).toBeTruthy();
    expect(getByText(/Maria Cidadã/)).toBeTruthy();
    expect(getByText(/João Santos/)).toBeTruthy();
  });

  it('deve permitir abrir o modal de Relatório ESG & Exportação', () => {
    const onSelectFilter = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <RecordsScreen
        items={mockItems}
        selectedFilter="todos"
        onSelectFilter={onSelectFilter}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('📊 Relatório ESG & Exportação (CSV)'));
    expect(getByText(/Relatório de Sustentabilidade ESG/i)).toBeTruthy();
    expect(getByText(/Exportar Relatório CSV/i)).toBeTruthy();

    fireEvent.press(getByText(/Exportar Relatório CSV/i));
    expect(Alert.alert).toHaveBeenCalledWith('CSV Exportado', expect.any(String));
  });

  it('deve permitir filtrar e buscar registros', () => {
    const onSelectFilter = jest.fn();
    const onBack = jest.fn();

    const { getAllByText, getByPlaceholderText } = render(
      <RecordsScreen
        items={mockItems}
        selectedFilter="todos"
        onSelectFilter={onSelectFilter}
        onBack={onBack}
      />
    );

    const pendingFilters = getAllByText('Pendentes');
    fireEvent.press(pendingFilters[pendingFilters.length - 1]);
    expect(onSelectFilter).toHaveBeenCalledWith('pendente');

    const searchInput = getByPlaceholderText('🔍 Buscar por cidadão, bairro, material...');
    fireEvent.changeText(searchInput, 'Centro');
    expect(searchInput.props.value).toBe('Centro');
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onSelectFilter = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <RecordsScreen
        items={mockItems}
        selectedFilter="todos"
        onSelectFilter={onSelectFilter}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
