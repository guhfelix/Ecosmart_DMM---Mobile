import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ProfileScreen } from '../ProfileScreen';
import { Usuario } from '../../models';
import { initialCollectionPoints, initialDiscardRecords, initialWasteTypes } from '../../data/mockData';

jest.spyOn(Alert, 'alert');

describe('ProfileScreen Admin', () => {
  const mockUser: Usuario = {
    id: 'user-admin-1',
    nome: 'João Administrador',
    email: 'joao@gmail.com',
    perfil: 'admin',
    telefone: '11977777777',
    cargo: 'Gestor Master de Sustentabilidade',
  };

  it('deve renderizar dados do administrador e métricas de governança', () => {
    const onUpdateUser = jest.fn();
    const onBack = jest.fn();

    const { getByText, getByDisplayValue } = render(
      <ProfileScreen
        user={mockUser}
        records={initialDiscardRecords}
        wasteTypes={initialWasteTypes}
        collectionPoints={initialCollectionPoints}
        onUpdateUser={onUpdateUser}
        onBack={onBack}
      />
    );

    expect(getByText('Métricas de Governança do Ecossistema')).toBeTruthy();
    expect(getByText('Total de registros')).toBeTruthy();
    expect(getByDisplayValue('João Administrador')).toBeTruthy();
  });

  it('deve permitir editar e salvar dados do administrador', () => {
    const onUpdateUser = jest.fn();
    const onBack = jest.fn();

    const { getByDisplayValue, getByTestId, getByText } = render(
      <ProfileScreen
        user={mockUser}
        records={initialDiscardRecords}
        wasteTypes={initialWasteTypes}
        collectionPoints={initialCollectionPoints}
        onUpdateUser={onUpdateUser}
        onBack={onBack}
      />
    );

    fireEvent.changeText(getByDisplayValue('João Administrador'), 'João Gestor Atualizado');
    fireEvent.press(getByTestId('save-profile-button'));

    expect(onUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'João Gestor Atualizado',
      })
    );
    expect(getByText('✓ Perfil atualizado com sucesso.')).toBeTruthy();
  });
});
