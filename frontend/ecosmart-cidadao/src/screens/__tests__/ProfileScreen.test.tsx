import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ProfileScreen } from '../ProfileScreen';
import { Usuario, DiscardItem } from '../../models';

describe('ProfileScreen Cidadão', () => {
  const mockUser: Usuario = {
    id: 'user-1',
    nome: 'Maria Cidadã',
    email: 'maria@gmail.com',
    perfil: 'cidadao',
    telefone: '(65) 99988-1234',
    cep: '78200-050',
    endereco: 'Rua Cel. Faria',
    numero: '210',
    bairro: 'Centro',
    cidade: 'Cáceres - MT',
  };

  const mockDiscards: DiscardItem[] = [
    {
      id: '1',
      type: 'Plástico',
      quantity: '3 sacolas',
      observation: '',
      date: '24/08/2026',
      status: 'Coletado',
    },
    {
      id: '2',
      type: 'Vidro',
      quantity: '2 garrafas',
      observation: '',
      date: '24/08/2026',
      status: 'Pendente',
    },
  ];

  beforeEach(() => {
    jest.spyOn(Alert, 'alert');
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            cep: '78200-000',
            logradouro: 'Rua Cel. José Dulce',
            bairro: 'Centro',
            localidade: 'Cáceres',
            uf: 'MT',
          }),
      })
    ) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar dados do usuário e resumo de descartes', () => {
    const onUpdateUser = jest.fn();
    const onBack = jest.fn();

    const { getByText, getByDisplayValue } = render(
      <ProfileScreen
        user={mockUser}
        discards={mockDiscards}
        onUpdateUser={onUpdateUser}
        onBack={onBack}
      />
    );

    expect(getByText('Resumo de Descartes')).toBeTruthy();
    expect(getByText('Total descartado')).toBeTruthy();
    expect(getByDisplayValue('Maria Cidadã')).toBeTruthy();
    expect(getByDisplayValue('78200-050')).toBeTruthy();
    expect(getByDisplayValue('210')).toBeTruthy();
  });

  it('deve permitir editar e salvar informações pessoais com CEP e número', () => {
    const onUpdateUser = jest.fn();
    const onBack = jest.fn();

    const { getByDisplayValue, getByTestId, getByText } = render(
      <ProfileScreen
        user={mockUser}
        discards={mockDiscards}
        onUpdateUser={onUpdateUser}
        onBack={onBack}
      />
    );

    fireEvent.changeText(getByDisplayValue('Maria Cidadã'), 'Maria Silva Atualizada');
    fireEvent.changeText(getByDisplayValue('210'), '550');
    fireEvent.press(getByTestId('save-profile-button'));

    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Maria Silva Atualizada',
        numero: '550',
        cep: '78200-050',
      })
    );
    expect(getByText('✓ Perfil atualizado com sucesso.')).toBeTruthy();
  });

  it('deve autocompletar endereço ao digitar CEP de 8 dígitos', async () => {
    const onUpdateUser = jest.fn();
    const onBack = jest.fn();

    const { getByDisplayValue, getByText } = render(
      <ProfileScreen
        user={mockUser}
        discards={mockDiscards}
        onUpdateUser={onUpdateUser}
        onBack={onBack}
      />
    );

    fireEvent.changeText(getByDisplayValue('78200-050'), '78200000');

    await waitFor(() => {
      expect(getByText(/Cáceres/)).toBeTruthy();
    });
  });
});
