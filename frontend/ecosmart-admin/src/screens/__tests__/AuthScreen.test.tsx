import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthScreen } from '../AuthScreen';

jest.spyOn(Alert, 'alert');

describe('AuthScreen Admin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar login com sucesso para usuário administrador padrão (João)', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByPlaceholderText, getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('email@exemplo.com'), 'joao@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), '1234');
    fireEvent.press(getByTestId('submit-button'));

    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'joao@gmail.com',
        perfil: 'admin',
      })
    );
  });

  it('deve exibir alerta de campos incompletos se tentar logar sem credenciais', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.press(getByTestId('submit-button'));
    expect(Alert.alert).toHaveBeenCalledWith('Dados incompletos', expect.any(String));
  });

  it('deve bloquear login de cidadão com mensagem instrutiva específica', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByPlaceholderText, getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('email@exemplo.com'), 'maria@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), '1234');
    fireEvent.press(getByTestId('submit-button'));

    expect(onLoginSuccess).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Acesso negado',
      expect.stringContaining('CIDADÃO')
    );
  });

  it('deve bloquear login de coletor com mensagem instrutiva específica', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByPlaceholderText, getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('email@exemplo.com'), 'lucas@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), '1234');
    fireEvent.press(getByTestId('submit-button'));

    expect(onLoginSuccess).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Acesso negado',
      expect.stringContaining('COLETOR')
    );
  });

  it('deve impedir cadastro de admin se o Código de Acesso não for informado ou for inválido', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByPlaceholderText, getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.press(getByTestId('tab-register'));

    fireEvent.changeText(getByPlaceholderText('Seu nome'), 'Novo Admin');
    fireEvent.changeText(getByPlaceholderText('email@exemplo.com'), 'novo@admin.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.changeText(getByTestId('access-code-input'), 'ERRADO123');
    fireEvent.press(getByTestId('submit-button'));

    expect(onRegisterSuccess).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Erro no cadastro',
      expect.stringContaining('Código de Acesso Administrativo inválido')
    );
  });

  it('deve permitir cadastro de admin com Código de Acesso válido (ADMIN2026)', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByPlaceholderText, getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.press(getByTestId('tab-register'));

    fireEvent.changeText(getByPlaceholderText('Seu nome'), 'Carlos Admin');
    fireEvent.changeText(getByPlaceholderText('email@exemplo.com'), 'carlos@admin.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.changeText(getByTestId('access-code-input'), 'ADMIN2026');
    fireEvent.press(getByTestId('submit-button'));

    expect(onRegisterSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Carlos Admin',
        email: 'carlos@admin.com',
        perfil: 'admin',
      }),
      expect.any(Array)
    );
  });

  it('deve abrir modal de recuperação de senha ao clicar em Esqueci minha senha', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByText } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.press(getByText('Esqueci minha senha'));
    expect(getByText('🔑 Recuperação de Senha Admin')).toBeTruthy();
  });

  it('deve realizar login com Google através do Firebase Auth', async () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByTestId, getByText } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    expect(getByText('Continuar com o Google')).toBeTruthy();
    await act(async () => {
      fireEvent.press(getByTestId('google-login-button'));
    });

    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        perfil: 'admin',
      })
    );
  });
});