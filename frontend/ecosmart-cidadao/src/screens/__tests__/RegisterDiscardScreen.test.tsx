import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { RegisterDiscardScreen } from '../RegisterDiscardScreen';

jest.spyOn(Alert, 'alert');

describe('RegisterDiscardScreen Cidadão', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve registrar descarte online com status Pendente e endereço em Cáceres-MT', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    fireEvent.changeText(getByPlaceholderText('Ex.: 4 caixas, 10 garrafas PET, 2 sacos'), '5 caixas');
    fireEvent.changeText(getByPlaceholderText('Ex.: Material seco, separado e embalado na calçada'), 'Embalados e secos');
    fireEvent.press(getByText('Salvar descarte'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: '5 caixas',
        observation: 'Embalados e secos',
        status: 'Pendente',
        city: 'Cáceres',
        offline: false,
      })
    );
    expect(Alert.alert).toHaveBeenCalledWith('Descarte Registrado', expect.any(String));
    expect(onBack).toHaveBeenCalled();
  });

  it('deve registrar descarte em modo offline com status Pendente (Offline) e alerta de sincronização posterior', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={true} />
    );

    fireEvent.changeText(getByPlaceholderText('Ex.: 4 caixas, 10 garrafas PET, 2 sacos'), '2 sacos');
    fireEvent.press(getByText('Salvar descarte'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: '2 sacos',
        status: 'Pendente (Offline)',
        offline: true,
      })
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Modo Offline',
      expect.stringContaining('sincronizada com o Firebase')
    );
    expect(onBack).toHaveBeenCalled();
  });

  it('deve capturar GPS de Cáceres-MT ao clicar no botão de localização', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    fireEvent.press(getByText('📍 Usar minha localização atual (GPS)'));
    expect(Alert.alert).toHaveBeenCalledWith('GPS Conectado', expect.any(String));
    expect(getByText(/Coordenadas de Cáceres - MT/)).toBeTruthy();
  });

  it('deve permitir digitar CEP de Cáceres e acionar busca', async () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getAllByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    const cepInput = getByPlaceholderText('78200-000');
    fireEvent.changeText(cepInput, '78200000');

    await waitFor(() => {
      expect(getAllByText(/Cáceres - MT/).length).toBeGreaterThan(0);
    });
  });

  it('deve permitir selecionar material clicando nas opções', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    fireEvent.press(getByText('Vidro'));
    expect(getByText('Vidro')).toBeTruthy();
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    fireEvent.press(getByText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
