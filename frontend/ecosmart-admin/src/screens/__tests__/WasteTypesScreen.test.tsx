import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { WasteTypesScreen } from '../WasteTypesScreen';
import { initialWasteTypes } from '../../data/mockData';

describe('WasteTypesScreen Admin', () => {
  it('deve renderizar os tipos cadastrados', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <WasteTypesScreen
        items={initialWasteTypes}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    expect(getByText('Gerenciar resíduos')).toBeTruthy();
    expect(getByText(initialWasteTypes[0].name)).toBeTruthy();
  });

  it('deve permitir cadastrar um novo tipo de resíduo', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getByTestId } = render(
      <WasteTypesScreen
        items={initialWasteTypes}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Ex.: Vidro'), 'Óleo de Cozinha Usado');
    fireEvent.changeText(getByPlaceholderText('Explique quais materiais entram nesse tipo'), 'Óleo vegetal usado em garrafas PET');
    fireEvent.press(getByTestId('save-waste-button'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Óleo de Cozinha Usado',
        description: 'Óleo vegetal usado em garrafas PET',
      })
    );
  });

  it('deve permitir editar e excluir um tipo de resíduo', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getAllByText, getByText } = render(
      <WasteTypesScreen
        items={initialWasteTypes}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    const editButtons = getAllByText('Editar');
    fireEvent.press(editButtons[0]);
    expect(getByText('Salvar alterações')).toBeTruthy();

    const deleteButtons = getAllByText('Excluir');
    fireEvent.press(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(initialWasteTypes[0].id);
  });

  it('deve permitir buscar tipos de resíduo em tempo real', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <WasteTypesScreen
        items={initialWasteTypes}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    fireEvent.changeText(getByPlaceholderText('🔍 Buscar tipos de resíduo...'), 'Papel');
    expect(getByText('Papel e Papelão')).toBeTruthy();
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <WasteTypesScreen
        items={initialWasteTypes}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});