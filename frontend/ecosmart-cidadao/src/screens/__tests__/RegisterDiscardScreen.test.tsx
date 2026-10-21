import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { RegisterDiscardScreen } from '../RegisterDiscardScreen';

jest.spyOn(Alert, 'alert');

describe('RegisterDiscardScreen Cidadão (Cadastro, Edição A4-01, Validação A4-09 e Coordenadas A4-17)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve registrar descarte online com quantidade numérica > 0, unidade selecionada e endereço em Cáceres-MT', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByTestId, getByPlaceholderText, getByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    fireEvent.changeText(getByTestId('quantity-input'), '5');
    fireEvent.press(getByTestId('unit-option-kg'));
    fireEvent.changeText(
      getByPlaceholderText('Ex.: Material seco, separado e embalado na calçada'),
      'Embalados e secos'
    );
    fireEvent.press(getByText('Salvar descarte'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 5,
        unit: 'kg',
        observation: 'Embalados e secos',
        status: 'Pendente',
        city: 'Cáceres',
        offline: false,
      })
    );
    expect(onBack).toHaveBeenCalled();
  });

  it('deve bloquear valores vazios, zero, negativos ou alfabéticos no campo de quantidade (A4-09)', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByTestId, getByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    // 1. Vazio
    fireEvent.press(getByText('Salvar descarte'));
    expect(onSave).not.toHaveBeenCalled();

    // 2. Zero
    fireEvent.changeText(getByTestId('quantity-input'), '0');
    fireEvent.press(getByText('Salvar descarte'));
    expect(onSave).not.toHaveBeenCalled();

    // 3. Negativo
    fireEvent.changeText(getByTestId('quantity-input'), '-3');
    fireEvent.press(getByText('Salvar descarte'));
    expect(onSave).not.toHaveBeenCalled();

    // 4. Caracteres alfabéticos
    fireEvent.changeText(getByTestId('quantity-input'), 'abc');
    fireEvent.press(getByText('Salvar descarte'));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('deve suportar modo edição preservando o mesmo ID original do descarte (A4-01)', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const existingItem = {
      id: 'disc-original-999',
      type: 'Vidro',
      quantity: 3,
      unit: 'saco',
      observation: 'Garrafas limpas',
      date: '2026-08-26T10:00:00.000Z',
      status: 'Pendente' as const,
      cep: '78200-000',
      address: 'Rua Cel. Faria',
      numero: '210',
      neighborhood: 'Centro',
      city: 'Cáceres',
    };

    const { getByTestId, getByText } = render(
      <RegisterDiscardScreen
        initialItem={existingItem}
        isEditing={true}
        onSave={onSave}
        onBack={onBack}
        isOffline={false}
      />
    );

    fireEvent.changeText(getByTestId('quantity-input'), '8');
    fireEvent.press(getByTestId('unit-option-kg'));
    fireEvent.press(getByText('Salvar alterações'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'disc-original-999',
        type: 'Vidro',
        quantity: 8,
        unit: 'kg',
      })
    );
    expect(onBack).toHaveBeenCalled();
  });

  it('deve registrar descarte em modo offline com status Pendente (Offline) e alerta de sincronização posterior', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByTestId, getByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={true} />
    );

    fireEvent.changeText(getByTestId('quantity-input'), '2');
    fireEvent.press(getByTestId('unit-option-saco'));
    fireEvent.press(getByText('Salvar descarte'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 2,
        unit: 'saco',
        status: 'Pendente (Offline)',
        offline: true,
        syncPending: true,
      })
    );
    expect(Alert.alert).toHaveBeenCalledWith(
      'Salvo localmente (offline)',
      expect.stringContaining('sincronizada com a nuvem')
    );
    expect(onBack).toHaveBeenCalled();
  });

  it('deve aplicar coordenadas de referência de Cáceres-MT sem afirmar GPS real (A4-17)', () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    fireEvent.press(getByText('📍 Usar coordenadas de referência (Cáceres - MT)'));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Coordenadas de Referência',
      expect.any(String)
    );
    expect(getByText(/Coordenadas de referência \(Cáceres - MT\)/)).toBeTruthy();
  });

  it('deve permitir digitar CEP de Cáceres e acionar busca', async () => {
    const onSave = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getAllByText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    const cepInput = getByPlaceholderText('78200-000');
    await act(async () => {
      fireEvent.changeText(cepInput, '78200000');
    });

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

    const { getByLabelText } = render(
      <RegisterDiscardScreen onSave={onSave} onBack={onBack} isOffline={false} />
    );

    fireEvent.press(getByLabelText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
