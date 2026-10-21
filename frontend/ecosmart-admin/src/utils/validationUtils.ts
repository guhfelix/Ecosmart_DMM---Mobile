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

  /**
   * Valida se a quantidade informada é um número estritamente positivo (> 0),
   * bloqueando valores vazios, zero, negativos ou caracteres alfabéticos (A4-09).
   */
  isValidQuantity(input: string | number): ValidationResult & { numericValue?: number } {
    if (typeof input === 'number') {
      if (!Number.isFinite(input) || input <= 0) {
        return {
          isValid: false,
          errorMessage: 'A quantidade deve ser um número maior que zero.',
        };
      }
      return { isValid: true, numericValue: input };
    }

    const trimmed = (input || '').trim();
    if (!trimmed) {
      return {
        isValid: false,
        errorMessage: 'Informe a quantidade.',
      };
    }

    // Bloqueia letras/caracteres alfabéticos ou negativos
    if (/[a-zA-Z]/.test(trimmed)) {
      return {
        isValid: false,
        errorMessage: 'A quantidade deve conter apenas números (sem letras).',
      };
    }

    const normalized = trimmed.replace(',', '.');
    if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
      return {
        isValid: false,
        errorMessage: 'Informe um valor numérico válido.',
      };
    }

    const numericValue = parseFloat(normalized);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      return {
        isValid: false,
        errorMessage: 'A quantidade deve ser maior que zero.',
      };
    }

    return { isValid: true, numericValue };
  },

  /**
   * Extrai quantidade numérica e unidade de medida de registros novos ou legados (A4-09).
   */
  parseQuantityAndUnit(
    rawQuantity: number | string | undefined,
    rawUnit?: string
  ): { numericValue: number; unit: string; display: string } {
    if (typeof rawQuantity === 'number' && Number.isFinite(rawQuantity) && rawQuantity > 0) {
      const unit = (rawUnit || 'unidade').trim();
      return {
        numericValue: rawQuantity,
        unit,
        display: `${rawQuantity} ${unit}`,
      };
    }

    const str = String(rawQuantity ?? '').trim();
    const match = str.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      const extractedUnit = (rawUnit || match[2] || 'unidade').trim();
      const validNum = !Number.isNaN(num) && num > 0 ? num : 1;
      return {
        numericValue: validNum,
        unit: extractedUnit,
        display: `${validNum} ${extractedUnit}`,
      };
    }

    const fallbackUnit = (rawUnit || 'unidade').trim();
    return {
      numericValue: 1,
      unit: fallbackUnit,
      display: str || `1 ${fallbackUnit}`,
    };
  },

  /**
   * Formata a quantidade e unidade para exibição nas telas de histórico e detalhes (A4-09).
   */
  formatQuantityWithUnit(quantity: number | string | undefined, unit?: string): string {
    if (quantity === undefined || quantity === null || quantity === '') {
      return unit ? `1 ${unit}` : '1 unidade';
    }
    if (typeof quantity === 'number') {
      return unit ? `${quantity} ${unit}` : `${quantity} unidade`;
    }
    const trimmed = quantity.trim();
    if (unit && !trimmed.toLowerCase().includes(unit.toLowerCase())) {
      return `${trimmed} ${unit}`;
    }
    return trimmed;
  },
};
