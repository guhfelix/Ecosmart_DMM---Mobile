import { validationUtils } from '../validationUtils';

describe('validationUtils (Validação e Sanitização)', () => {
  describe('isValidEmail', () => {
    it('deve aceitar e-mails válidos', () => {
      expect(validationUtils.isValidEmail('maria@gmail.com').isValid).toBe(true);
      expect(validationUtils.isValidEmail('usuario.teste@empresa.com.br').isValid).toBe(true);
    });

    it('deve rejeitar e-mails vazios ou com espaços', () => {
      const resultEmpty = validationUtils.isValidEmail('');
      expect(resultEmpty.isValid).toBe(false);
      expect(resultEmpty.errorMessage).toBe('O e-mail é obrigatório.');

      const resultSpaces = validationUtils.isValidEmail('   ');
      expect(resultSpaces.isValid).toBe(false);
    });

    it('deve rejeitar e-mails em formato inválido', () => {
      expect(validationUtils.isValidEmail('emailsemdominio').isValid).toBe(false);
      expect(validationUtils.isValidEmail('email@dominio').isValid).toBe(false);
      expect(validationUtils.isValidEmail('@dominio.com').isValid).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('deve aceitar senhas com o comprimento mínimo', () => {
      expect(validationUtils.isValidPassword('1234').isValid).toBe(true);
      expect(validationUtils.isValidPassword('senhaForte2026', 8).isValid).toBe(true);
    });

    it('deve rejeitar senhas menores que o comprimento mínimo', () => {
      const result = validationUtils.isValidPassword('123', 4);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('no mínimo 4 caracteres');
    });
  });

  describe('isValidName', () => {
    it('deve aceitar nomes válidos com 3 ou mais caracteres', () => {
      expect(validationUtils.isValidName('Ana').isValid).toBe(true);
      expect(validationUtils.isValidName('Maria Oliveira').isValid).toBe(true);
    });

    it('deve rejeitar nomes vazios ou com menos de 3 caracteres', () => {
      expect(validationUtils.isValidName('').isValid).toBe(false);
      expect(validationUtils.isValidName('Zé').isValid).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('deve aceitar telefone vazio como opcional', () => {
      expect(validationUtils.isValidPhone('').isValid).toBe(true);
    });

    it('deve aceitar telefones com 10 ou 11 dígitos com ou sem máscara', () => {
      expect(validationUtils.isValidPhone('65999998888').isValid).toBe(true);
      expect(validationUtils.isValidPhone('(65) 99999-8888').isValid).toBe(true);
      expect(validationUtils.isValidPhone('(65) 3223-1122').isValid).toBe(true);
    });

    it('deve rejeitar telefones com quantidade inválida de dígitos', () => {
      expect(validationUtils.isValidPhone('12345').isValid).toBe(false);
      expect(validationUtils.isValidPhone('65999998888000').isValid).toBe(false);
    });
  });

  describe('sanitizeText', () => {
    it('deve remover tags e caracteres potencialmente inseguros (< e >)', () => {
      expect(validationUtils.sanitizeText('<b>Resíduo Plástico</b>')).toBe('bResíduo Plástico/b');
      expect(validationUtils.sanitizeText('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    });

    it('deve fazer trim de espaços nas extremidades', () => {
      expect(validationUtils.sanitizeText('   Texto Limpo   ')).toBe('Texto Limpo');
    });
  });
});
