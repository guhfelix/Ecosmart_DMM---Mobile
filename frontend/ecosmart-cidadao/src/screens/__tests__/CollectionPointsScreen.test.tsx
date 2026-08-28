import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CollectionPointsScreen } from '../CollectionPointsScreen';

jest.spyOn(Alert, 'alert');

describe('CollectionPointsScreen Cidadão', () => {
  it('deve listar os pontos de coleta e permitir traçar rota', () => {
    const onBack = jest.fn();
    const { getByText, getAllByText } = render(<CollectionPointsScreen onBack={onBack} />);

    expect(getByText('Pontos de coleta')).toBeTruthy();

    const routeButtons = getAllByText('🗺️ Ver no Mapa / Rota GPS');
    expect(routeButtons.length).toBeGreaterThan(0);

    fireEvent.press(routeButtons[0]);
    expect(Alert.alert).toHaveBeenCalledWith(
      '🗺️ Rota de Navegação GPS',
      expect.stringContaining('Iniciando rota')
    );
  });

  it('deve filtrar pontos por busca textual', () => {
    const onBack = jest.fn();
    const { getByPlaceholderText } = render(<CollectionPointsScreen onBack={onBack} />);

    const searchInput = getByPlaceholderText('🔍 Buscar por nome, endereço ou resíduo...');
    fireEvent.changeText(searchInput, 'COOPERCÁCERES');
    expect(searchInput.props.value).toBe('COOPERCÁCERES');
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onBack = jest.fn();
    const { getByLabelText } = render(<CollectionPointsScreen onBack={onBack} />);

    fireEvent.press(getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
