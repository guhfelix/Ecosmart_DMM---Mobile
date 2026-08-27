import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthScreen } from '../AuthScreen';

jest.spyOn(Alert, 'alert');

describe('AuthScreen Cidadão', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve realizar login com sucesso para usuário cidadão padrão (Maria)', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByPlaceholderText, getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('email@exemplo.com'), 'maria@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), '1234');
    fireEvent.press(getByTestId('submit-button'));

    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'maria@gmail.com',
        perfil: 'cidadao',
      })
    );
  });

  it('deve exibir alerta caso tente submeter com campos vazios', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.press(getByTestId('submit-button'));
    expect(Alert.alert).toHaveBeenCalledWith('Dados incompletos', expect.any(String));
  });

  it('deve bloquear login de administrador com mensagem instrutiva específica', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByPlaceholderText, getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.changeText(getByPlaceholderText('email@exemplo.com'), 'joao@gmail.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), '1234');
    fireEvent.press(getByTestId('submit-button'));

    expect(onLoginSuccess).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith(
      'Acesso negado',
      expect.stringContaining('ADMINISTRADOR')
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

  it('deve cadastrar um novo cidadão com sucesso', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByPlaceholderText, getByTestId } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.press(getByTestId('tab-register'));

    fireEvent.changeText(getByPlaceholderText('Seu nome'), 'Ana Cidadã');
    fireEvent.changeText(getByPlaceholderText('email@exemplo.com'), 'ana@exemplo.com');
    fireEvent.changeText(getByPlaceholderText('Sua senha'), 'senha123');
    fireEvent.press(getByTestId('submit-button'));

    expect(onRegisterSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Ana Cidadã',
        email: 'ana@exemplo.com',
        perfil: 'cidadao',
      }),
      expect.any(Array)
    );
  });

  it('deve abrir modal de recuperação de senha ao clicar em Esqueci minha senha e fechar', () => {
    const onLoginSuccess = jest.fn();
    const onRegisterSuccess = jest.fn();

    const { getByText } = render(
      <AuthScreen onLoginSuccess={onLoginSuccess} onRegisterSuccess={onRegisterSuccess} />
    );

    fireEvent.press(getByText('Esqueci minha senha'));
    expect(getByText('🔑 Recuperação de Senha')).toBeTruthy();
    expect(getByText('Enviar código')).toBeTruthy();

    fireEvent.press(getByText('Cancelar'));
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
        perfil: 'cidadao',
      })
    );
  });
});