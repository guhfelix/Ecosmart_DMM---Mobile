/**
 * Utilitários de Validação e Sanitização de Dados.
 * Fornece validação declarativa e proteção contra entradas malformadas.
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export const validationUtils = {
  /**
   * Valida formato de e-mail com regex RFC 5322 simplificada.
   */
  isValidEmail(email: string): ValidationResult {
    const trimmed = email.trim();
    if (!trimmed) {
      return { isValid: false, errorMessage: 'O e-mail é obrigatório.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, errorMessage: 'Informe um endereço de e-mail válido.' };
    }
    return { isValid: true };
  },

  /**
   * Valida requisitos mínimos de segurança de senha.
   */
  isValidPassword(password: string, minLength = 4): ValidationResult {
    if (!password || password.length < minLength) {
      return {
        isValid: false,
        errorMessage: `A senha deve possuir no mínimo ${minLength} caracteres.`,
      };
    }
    return { isValid: true };
  },

  /**
   * Valida nome completo ou razão social.
   */
  isValidName(name: string): ValidationResult {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 3) {
      return {
        isValid: false,
        errorMessage: 'O nome deve conter pelo menos 3 caracteres.',
      };
    }
    return { isValid: true };
  },

  /**
   * Valida formato de telefone / WhatsApp brasileiro (10 ou 11 dígitos numéricos).
   */
  isValidPhone(phone: string): ValidationResult {
    const digitsOnly = phone.replace(/\D/g, '');
    if (!digitsOnly) {
      return { isValid: true }; // Campo opcional
    }
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      return {
        isValid: false,
        errorMessage: 'Informe um telefone válido com DDD (10 ou 11 dígitos).',
      };
    }
    return { isValid: true };
  },

  /**
   * Sanitiza entradas de texto para prevenir caracteres de controle.
   */
  sanitizeText(input: string): string {
    return input.replace(/[<>]/g, '').trim();
  },
};
