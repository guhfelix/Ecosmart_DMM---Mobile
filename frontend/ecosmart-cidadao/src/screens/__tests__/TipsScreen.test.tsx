import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TipsScreen } from '../TipsScreen';

describe('TipsScreen Cidadão', () => {
  it('deve listar as dicas educativas disponíveis', () => {
    const onBack = jest.fn();
    const { getByText } = render(<TipsScreen onBack={onBack} />);

    expect(getByText('Dicas educativas')).toBeTruthy();
    expect(getByText('Boas práticas para separar e descartar seus resíduos.')).toBeTruthy();
  });

  it('deve permitir buscar dicas por palavra-chave e limpar busca', () => {
    const onBack = jest.fn();
    const { getByPlaceholderText, getByText, queryByText } = render(<TipsScreen onBack={onBack} />);

    const searchInput = getByPlaceholderText('🔍 Buscar dicas por assunto, material...');
    fireEvent.changeText(searchInput, 'Óleo');

    expect(getByText('✕')).toBeTruthy();
    fireEvent.press(getByText('✕'));
    expect(searchInput.props.value).toBe('');
  });

  it('deve acionar onBack ao clicar em Voltar', () => {
    const onBack = jest.fn();
    const { getByText } = render(<TipsScreen onBack={onBack} />);

    fireEvent.press(getByText('Voltar'));
    expect(onBack).toHaveBeenCalled();
  });
});
