import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

describe('HomeScreen Cidadão', () => {
  it('deve navegar para registrar descarte quando o card for pressionado', () => {
    const onNavigate = jest.fn();

    const { getByText } = render(<HomeScreen onNavigate={onNavigate} />);

    fireEvent.press(getByText('Registrar descarte'));

    expect(onNavigate).toHaveBeenCalledWith('register');
  });

  it('deve renderizar as opções principais do app', () => {
    const onNavigate = jest.fn();

    const { getByText } = render(<HomeScreen onNavigate={onNavigate} />);

    expect(getByText('EcoSmart Cidadão')).toBeTruthy();
    expect(getByText('Histórico')).toBeTruthy();
    expect(getByText('Dicas educativas')).toBeTruthy();
    expect(getByText('Pontos de coleta')).toBeTruthy();
  });

  it('deve acionar logout quando o botão sair for pressionado', () => {
    const onNavigate = jest.fn();
    const onLogout = jest.fn();

    const { getByTestId } = render(<HomeScreen onNavigate={onNavigate} onLogout={onLogout} />);

    fireEvent.press(getByTestId('logout-button'));
    expect(onLogout).toHaveBeenCalled();
  });
});
