import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import type { AuthUserInput, Usuario } from '../models';
import {
  authenticateUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  signInWithGoogle,
  RegisteredUser,
} from '../services/authService';

export type { AuthUserInput };

type AuthMode = 'login' | 'register';

type Props = {
  registeredUsers?: RegisteredUser[];
  onLoginSuccess: (user: Usuario) => void;
  onRegisterSuccess: (user: Usuario, updatedUsers: RegisteredUser[]) => void;
};

/**
 * Tela de Autenticação do Administrador.
 * Oferece autenticação via Google (Firebase Auth), E-mail/Senha, Cadastro com Chave Mestre e Recuperação de Senha.
 * Possui validação estrita de RBAC e exige o Código de Acesso Mestre (ADMIN2026) no cadastro.
 */
export function AuthScreen({
  registeredUsers = [],
  onLoginSuccess,
  onRegisterSuccess,
}: Props) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  // Estados do Modal de Recuperação de Senha
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isRegister = mode === 'register';

  /** Login com Google usando Firebase Auth */
  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    try {
      const result = await signInWithGoogle('admin', registeredUsers);
      if (!result.success || !result.user) {
        Alert.alert('Acesso negado', result.message || 'Não foi possível autenticar com o Google.');
        return;
      }
      Alert.alert('Login com Google', `Bem-vindo(a), ${result.user.nome}!`);
      onLoginSuccess(result.user);
      if (result.updatedUsers) {
        onRegisterSuccess(result.user, result.updatedUsers);
      }
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Falha ao conectar com o Google.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  /** Submissão do formulário de autenticação */
  const handleSubmit = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password.trim()) {
      Alert.alert('Dados incompletos', 'Informe e-mail e senha.');
      return;
    }

    // --- Fluxo de Login ---
    if (!isRegister) {
      const authResult = authenticateUser(
        normalizedEmail,
        password,
        'admin',
        registeredUsers
      );

      if (!authResult.success || !authResult.user) {
        Alert.alert('Acesso negado', authResult.message || 'Verifique o e-mail e a senha informados.');
        return;
      }

      onLoginSuccess(authResult.user);
      return;
    }

    // --- Fluxo de Cadastro com Código de Segurança ---
    if (!name.trim()) {
      Alert.alert('Dados incompletos', 'Informe seu nome para concluir o cadastro.');
      return;
    }

    if (!accessCode.trim()) {
      Alert.alert(
        'Código obrigatório',
        'Código de Acesso Administrativo inválido ou não informado. Apenas administradores autorizados podem criar contas neste app.'
      );
      return;
    }

    const regResult = registerUser(
      name.trim(),
      normalizedEmail,
      password,
      'admin',
      accessCode.trim(),
      registeredUsers
    );

    if (!regResult.success || !regResult.user) {
      Alert.alert('Erro no cadastro', regResult.message || 'Não foi possível cadastrar.');
      return;
    }

    Alert.alert('Cadastro realizado', 'Você entrou no app EcoSmart Admin.');
    onRegisterSuccess(regResult.user, regResult.updatedUsers || []);
  };

  /** Etapa 1: Solicitar código de verificação */
  const handleRequestCode = () => {
    const res = requestPasswordReset(forgotEmail, 'admin', registeredUsers);
    if (!res.success || !res.code) {
      Alert.alert('Erro', res.message);
      return;
    }
    setExpectedCode(res.code);
    setForgotStep(2);
    Alert.alert('Código Enviado', `Seu código de verificação é: ${res.code}`);
  };

  /** Etapa 2: Validar código e redefinir senha */
  const handleResetPassword = () => {
    const res = resetPassword(
      forgotEmail,
      verificationCode,
      expectedCode,
      newPassword,
      registeredUsers
    );

    if (!res.success) {
      Alert.alert('Erro', res.message);
      return;
    }

    Alert.alert('Sucesso', res.message);
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail('');
    setVerificationCode('');
    setExpectedCode('');
    setNewPassword('');
    setMode('login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>♻️</Text>
            <Text style={styles.title}>EcoSmart Admin</Text>
            <Text style={styles.subtitle}>Acesse sua conta para gerenciar dados do ecossistema.</Text>
          </View>

          <View style={styles.card}>
            {/* Botão de Login com Google via Firebase Auth */}
            <Pressable
              testID="google-login-button"
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={isLoadingGoogle}
            >
              <View style={styles.googleIconCircle}>
                <Text style={styles.googleIconLetter}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>
                {isLoadingGoogle ? 'Conectando...' : 'Continuar com o Google'}
              </Text>
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou acesse com e-mail</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.tabs}>
              <Pressable
                testID="tab-login"
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Entrar</Text>
              </Pressable>
              <Pressable
                testID="tab-register"
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Cadastrar</Text>
              </Pressable>
            </View>

            {isRegister ? (
              <>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.muted}
                />

                <Text style={styles.label}>Código de Acesso Administrativo</Text>
                <TextInput
                  testID="access-code-input"
                  style={styles.input}
                  value={accessCode}
                  onChangeText={setAccessCode}
                  placeholder="Informe a chave de segurança (ex: ADMIN2026)"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="characters"
                />
              </>
            ) : null}

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Sua senha"
              placeholderTextColor={colors.muted}
              secureTextEntry
            />

            <Pressable
              testID="submit-button"
              style={styles.primaryButton}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>{isRegister ? 'Criar conta' : 'Entrar'}</Text>
            </Pressable>

            {!isRegister ? (
              <Pressable
                style={styles.forgotButton}
                onPress={() => {
                  setForgotEmail(email);
                  setForgotStep(1);
                  setShowForgotModal(true);
                }}
              >
                <Text style={styles.forgotButtonText}>Esqueci minha senha</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Recuperação de Senha */}
      <Modal visible={showForgotModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>🔑 Recuperação de Senha Admin</Text>

            {forgotStep === 1 ? (
              <>
                <Text style={styles.modalSubtitle}>
                  Informe seu e-mail de administrador para receber o código de autorização.
                </Text>
                <Text style={styles.label}>E-mail cadastrado</Text>
                <TextInput
                  style={styles.input}
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  placeholder="seuemail@exemplo.com"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                />
                <Pressable style={styles.primaryButton} onPress={handleRequestCode}>
                  <Text style={styles.primaryButtonText}>Enviar código</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  Insira o código enviado ({expectedCode}) e digite sua nova senha.
                </Text>
                <Text style={styles.label}>Código de verificação</Text>
                <TextInput
                  style={styles.input}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="Ex: ECO-1234"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="characters"
                />
                <Text style={styles.label}>Nova senha</Text>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Mínimo 4 caracteres"
                  placeholderTextColor={colors.muted}
                  secureTextEntry
                />
                <Pressable style={styles.primaryButton} onPress={handleResetPassword}>
                  <Text style={styles.primaryButtonText}>Redefinir senha</Text>
                </Pressable>
              </>
            )}

            <Pressable
              style={styles.secondaryButton}
              onPress={() => setShowForgotModal(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  logo: {
    fontSize: 38,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#F3E5F5',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleIconLetter: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  googleButtonText: {
    color: '#3C4043',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.text,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    color: colors.text,
    fontSize: 15,
    padding: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  forgotButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: '700',
  },
});