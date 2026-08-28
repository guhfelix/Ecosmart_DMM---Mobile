import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ProfileScreen } from '../ProfileScreen';
import { Usuario } from '../../models';
import { initialDiscards } from '../../data/mockData';

jest.spyOn(Alert, 'alert');

describe('ProfileScreen Coletor', () => {
  const mockUser: Usuario = {
    id: 'user-coletor-1',
    nome: 'Lucas Coletor',
    email: 'lucas@gmail.com',
    perfil: 'coletor',
    telefone: '11988888888',
    veiculo: 'Caminhonete Utilitária',
    capacidadeCarga: 'Até 500 kg',
  };

  it('deve renderizar dados operacionais e métricas de coleta', () => {
    const onUpdateUser = jest.fn();
    const onBack = jest.fn();

    const { getByText, getByDisplayValue } = render(
      <ProfileScreen
        user={mockUser}
        discards={initialDiscards}
        onUpdateUser={onUpdateUser}
        onBack={onBack}
      />
    );

    expect(getByText('Resumo Operacional')).toBeTruthy();
    expect(getByText('Coletas realizadas')).toBeTruthy();
    expect(getByDisplayValue('Lucas Coletor')).toBeTruthy();
  });

  it('deve permitir editar e salvar dados operacionais e logísticos', () => {
    const onUpdateUser = jest.fn();
    const onBack = jest.fn();

    const { getByDisplayValue, getByTestId, getByText } = render(
      <ProfileScreen
        user={mockUser}
        discards={initialDiscards}
        onUpdateUser={onUpdateUser}
        onBack={onBack}
      />
    );

    fireEvent.changeText(getByDisplayValue('Lucas Coletor'), 'Cooperativa Recicla Lucas');
    fireEvent.press(getByTestId('save-profile-button'));

    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Cooperativa Recicla Lucas',
      })
    );
    expect(getByText('✓ Perfil atualizado com sucesso.')).toBeTruthy();
  });
});
