import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';

describe('HomeScreen Coletor', () => {
  it('deve renderizar as opções principais do app coletor', () => {
    const onNavigate = jest.fn();

    const { getByText } = render(<HomeScreen onNavigate={onNavigate} />);

    expect(getByText('EcoSmart Empresa/Catador')).toBeTruthy();
    expect(getByText(/Meu Perfil/)).toBeTruthy();
    expect(getByText(/descartes disponíveis/i)).toBeTruthy();
    expect(getByText(/Coletas realizadas/)).toBeTruthy();
  });

  it('deve acionar logout quando o botão sair for pressionado', () => {
    const onNavigate = jest.fn();
    const onLogout = jest.fn();

    const { getByTestId } = render(<HomeScreen onNavigate={onNavigate} onLogout={onLogout} />);

    fireEvent.press(getByTestId('logout-button'));
    expect(onLogout).toHaveBeenCalled();
  });
});
