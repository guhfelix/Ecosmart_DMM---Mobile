import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CollectionPointsScreen } from '../CollectionPointsScreen';
import { CollectionPointItem } from '../../models';

jest.spyOn(Alert, 'alert');

describe('CollectionPointsScreen Admin', () => {
  const mockPoints: CollectionPointItem[] = [
    {
      id: 'point-1',
      name: 'Ecoponto Central',
      address: 'Praça Barão do Rio Branco, s/n',
      neighborhood: 'Centro',
      acceptedWaste: 'Plástico, Vidro, Papel',
      schedule: 'Seg a Sex: 08h às 17h',
      latitude: -16.074,
      longitude: -57.678,
    },
  ];

  it('deve listar pontos de coleta existentes', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <CollectionPointsScreen
        items={mockPoints}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    expect(getByText('Gerenciar pontos')).toBeTruthy();
    expect(getByText('Ecoponto Central')).toBeTruthy();
    expect(getByText('Praça Barão do Rio Branco, s/n')).toBeTruthy();
  });

  it('deve salvar um novo ponto de coleta com validação', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <CollectionPointsScreen
        items={mockPoints}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Ex.: EcoPonto Centro'), 'PEV Cáceres Novo');
    fireEvent.changeText(getByPlaceholderText('Rua, número e bairro'), 'Rua dos Pantaneiros, 50');
    fireEvent.changeText(getByPlaceholderText('Ex.: Papel, plástico e metal'), 'Papelão e Metal');
    fireEvent.changeText(getByPlaceholderText('Ex.: Segunda a sexta, 8h às 17h'), '08:00 às 18:00');

    fireEvent.press(getByText('Cadastrar ponto'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'PEV Cáceres Novo',
        address: 'Rua dos Pantaneiros, 50',
      })
    );
  });

  it('deve permitir editar e excluir pontos de coleta', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <CollectionPointsScreen
        items={mockPoints}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('Editar'));
    expect(getByText('Salvar alterações')).toBeTruthy();

    fireEvent.press(getByText('Excluir'));
    expect(onDelete).toHaveBeenCalledWith('point-1');
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <CollectionPointsScreen
        items={mockPoints}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
