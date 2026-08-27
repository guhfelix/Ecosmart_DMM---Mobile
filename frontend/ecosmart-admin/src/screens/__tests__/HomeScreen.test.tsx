import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

describe('HomeScreen Admin', () => {
  it('deve renderizar as opções principais do app admin', () => {
    const onNavigate = jest.fn();

    const { getByText } = render(<HomeScreen onNavigate={onNavigate} />);

    expect(getByText('EcoSmart Admin')).toBeTruthy();
    expect(getByText('Perfil Administrador')).toBeTruthy();
    expect(getByText('Registros gerais')).toBeTruthy();
  });

  it('deve acionar logout quando o botão sair for pressionado', () => {
    const onNavigate = jest.fn();
    const onLogout = jest.fn();

    const { getByTestId } = render(<HomeScreen onNavigate={onNavigate} onLogout={onLogout} />);

    fireEvent.press(getByTestId('logout-button'));
    expect(onLogout).toHaveBeenCalled();
  });
});