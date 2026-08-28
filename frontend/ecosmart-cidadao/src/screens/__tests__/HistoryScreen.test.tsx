import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HistoryScreen } from '../HistoryScreen';
import { DiscardItem } from '../../models';

describe('HistoryScreen Cidadão', () => {
  const mockItems: DiscardItem[] = [
    {
      id: '1',
      type: 'Plástico',
      quantity: '3 sacolas',
      neighborhood: 'Centro',
      observation: 'Reciclável',
      date: '24/08/2026',
      status: 'Pendente',
    },
    {
      id: '2',
      type: 'Vidro',
      quantity: '2 garrafas',
      neighborhood: 'Cavalhada',
      observation: 'Cuidado',
      date: '25/08/2026',
      status: 'Coletado',
    },
    {
      id: '3',
      type: 'Papel',
      quantity: '1 caixa',
      neighborhood: 'DNER',
      observation: '',
      date: '26/08/2026',
      status: 'Pendente (Offline)',
      offline: true,
    },
  ];

  it('deve listar todos os descartes por padrão', () => {
    const onBack = jest.fn();
    const { getByText } = render(<HistoryScreen items={mockItems} onBack={onBack} />);

    expect(getByText('Histórico')).toBeTruthy();
    expect(getByText('Plástico')).toBeTruthy();
    expect(getByText('Vidro')).toBeTruthy();
    expect(getByText('Papel')).toBeTruthy();
  });

  it('deve filtrar por status (Pendente, Coletado, Offline)', () => {
    const onBack = jest.fn();
    const { getByText, queryByText } = render(<HistoryScreen items={mockItems} onBack={onBack} />);

    fireEvent.press(getByText('Coletados'));
    expect(getByText('Vidro')).toBeTruthy();
    expect(queryByText('Plástico')).toBeNull();

    fireEvent.press(getByText('Pendentes'));
    expect(getByText('Plástico')).toBeTruthy();
    expect(queryByText('Vidro')).toBeNull();

    fireEvent.press(getByText('Offline'));
    expect(getByText('Papel')).toBeTruthy();
    expect(queryByText('Plástico')).toBeNull();
  });

  it('deve realizar busca textual em tempo real', () => {
    const onBack = jest.fn();
    const { getByPlaceholderText, getByText, queryByText } = render(
      <HistoryScreen items={mockItems} onBack={onBack} />
    );

    const searchInput = getByPlaceholderText('🔍 Buscar descartes por tipo, bairro...');
    fireEvent.changeText(searchInput, 'Cavalhada');

    expect(getByText('Vidro')).toBeTruthy();
    expect(queryByText('Plástico')).toBeNull();
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onBack = jest.fn();
    const { getByLabelText } = render(<HistoryScreen items={mockItems} onBack={onBack} />);

    fireEvent.press(getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
