import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { DiscardDetailsScreen } from '../DiscardDetailsScreen';
import { CollectorDiscard } from '../../models';

jest.spyOn(Alert, 'alert');

describe('DiscardDetailsScreen Coletor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockItem: CollectorDiscard = {
    id: 'disc-1',
    citizenName: 'Maria Cidadã',
    wasteType: 'Plástico',
    quantity: '3 sacolas',
    address: 'Rua das Flores, 100',
    neighborhood: 'Centro',
    city: 'Cáceres - MT',
    observation: 'Ao lado do portão preto',
    createdAt: '24/08/2026',
    status: 'pendente',
    distanceKm: 0.8,
  };

  it('deve renderizar os detalhes completos do descarte', () => {
    const onCollect = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <DiscardDetailsScreen
        item={mockItem}
        onCollect={onCollect}
        onBack={onBack}
      />
    );

    expect(getByText('Detalhes do descarte')).toBeTruthy();
    expect(getByText('Plástico')).toBeTruthy();
    expect(getByText('Maria Cidadã')).toBeTruthy();
    expect(getByText('Rua das Flores, 100')).toBeTruthy();
    expect(getByText('Ao lado do portão preto')).toBeTruthy();
  });

  it('deve permitir iniciar navegação GPS', () => {
    const onCollect = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <DiscardDetailsScreen
        item={mockItem}
        onCollect={onCollect}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('🗺️ Iniciar Navegação / Ver Rota GPS'));
    expect(Alert.alert).toHaveBeenCalledWith(
      '🗺️ Navegação GPS',
      expect.stringContaining('Traçando melhor trajeto')
    );
  });

  it('deve marcar descarte como coletado e acionar onCollect', () => {
    const onCollect = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <DiscardDetailsScreen
        item={mockItem}
        onCollect={onCollect}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('Confirmar coleta'));
    expect(onCollect).toHaveBeenCalledWith('disc-1');
    expect(Alert.alert).not.toHaveBeenCalledWith('Coleta registrada', expect.any(String));
  });

  it('deve exibir aviso offline ao marcar coleta sem internet', () => {
    const onCollect = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <DiscardDetailsScreen
        item={mockItem}
        onCollect={onCollect}
        onBack={onBack}
        isOffline={true}
      />
    );

    fireEvent.press(getByText('Confirmar coleta'));
    expect(onCollect).toHaveBeenCalledWith('disc-1');
    expect(Alert.alert).toHaveBeenCalledWith('Modo Offline', expect.stringContaining('localmente'));
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onCollect = jest.fn();
    const onBack = jest.fn();

    const { getByLabelText } = render(
      <DiscardDetailsScreen
        item={mockItem}
        onCollect={onCollect}
        onBack={onBack}
      />
    );

    fireEvent.press(getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
