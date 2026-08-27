import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { EducationalTipsScreen } from '../EducationalTipsScreen';
import { EducationalTipItem } from '../../models';

jest.spyOn(Alert, 'alert');

describe('EducationalTipsScreen Admin', () => {
  const mockTips: EducationalTipItem[] = [
    {
      id: 'tip-1',
      title: 'Preservação do Rio Paraguai',
      category: 'Educação Ambiental',
      content: 'Não jogue lixo nas margens do rio.',
    },
  ];

  it('deve listar as dicas educativas cadastradas', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <EducationalTipsScreen
        items={mockTips}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    expect(getByText('Gerenciar dicas')).toBeTruthy();
    expect(getByText('Preservação do Rio Paraguai')).toBeTruthy();
    expect(getByText('Educação Ambiental')).toBeTruthy();
  });

  it('deve adicionar uma nova dica educativa com validação', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <EducationalTipsScreen
        items={mockTips}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    fireEvent.changeText(getByPlaceholderText('Ex.: Separação correta de plásticos'), 'Reciclagem de Plásticos');
    fireEvent.changeText(getByPlaceholderText('Ex.: Reciclagem, Reuso, Higienização'), 'Práticas Sustentáveis');
    fireEvent.changeText(getByPlaceholderText('Texto explicativo para orientar os cidadãos'), 'Lave as embalagens antes de descartar.');

    fireEvent.press(getByText('Cadastrar dica'));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Reciclagem de Plásticos',
        category: 'Práticas Sustentáveis',
      })
    );
  });

  it('deve permitir editar e excluir uma dica', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <EducationalTipsScreen
        items={mockTips}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('Editar'));
    expect(getByText('Salvar alterações')).toBeTruthy();

    fireEvent.press(getByText('Excluir'));
    expect(onDelete).toHaveBeenCalledWith('tip-1');
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onSave = jest.fn();
    const onDelete = jest.fn();
    const onBack = jest.fn();

    const { getByText } = render(
      <EducationalTipsScreen
        items={mockTips}
        onSave={onSave}
        onDelete={onDelete}
        onBack={onBack}
      />
    );

    fireEvent.press(getByText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
