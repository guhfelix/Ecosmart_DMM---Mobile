import {
  formatCep,
  cleanCepDigits,
  getCoordinatesForNeighborhood,
  fetchAddressByCep,
  CACERES_DEFAULTS,
} from '../cepService';

describe('cepService (Integração ViaCEP e Coordenadas de Cáceres - MT)', () => {
  describe('formatCep e cleanCepDigits', () => {
    it('deve formatar CEPs de 8 dígitos para o padrão 00000-000', () => {
      expect(formatCep('78200000')).toBe('78200-000');
      expect(formatCep('78200-000')).toBe('78200-000');
    });

    it('deve limpar caracteres não numéricos', () => {
      expect(cleanCepDigits('78.200-000')).toBe('78200000');
      expect(cleanCepDigits('abc-12345-678')).toBe('12345678');
    });
  });

  describe('getCoordinatesForNeighborhood', () => {
    it('deve retornar coordenadas conhecidas para bairros mapeados de Cáceres', () => {
      const centro = getCoordinatesForNeighborhood('Centro');
      expect(centro.latitude).toBeCloseTo(-16.0725);
      expect(centro.longitude).toBeCloseTo(-57.6798);

      const cavalhada = getCoordinatesForNeighborhood('Cavalhada');
      expect(cavalhada.latitude).toBeCloseTo(-16.0645);
    });

    it('deve retornar coordenadas padrão de Cáceres para bairro não mapeado ou vazio', () => {
      const coords = getCoordinatesForNeighborhood('Bairro Inexistente');
      expect(coords.latitude).toBe(CACERES_DEFAULTS.LATITUDE);
      expect(coords.longitude).toBe(CACERES_DEFAULTS.LONGITUDE);
    });
  });

  describe('fetchAddressByCep', () => {
    it('deve retornar erro para CEP com menos de 8 dígitos', async () => {
      const result = await fetchAddressByCep('123');
      expect(result.success).toBe(false);
      expect(result.message).toContain('8 dígitos');
    });

    it('deve processar resposta de sucesso da API ViaCEP', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          cep: '78200-000',
          logradouro: 'Rua das Flores',
          bairro: 'Centro',
          localidade: 'Cáceres',
          uf: 'MT',
          ddd: '65',
        }),
      } as any);

      const result = await fetchAddressByCep('78200000');
      expect(result.success).toBe(true);
      expect(result.logradouro).toBe('Rua das Flores');
      expect(result.bairro).toBe('Centro');
      expect(result.localidade).toBe('Cáceres');
    });

    it('deve lidar com CEP inexistente (erro retornado pela ViaCEP)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          erro: true,
        }),
      } as any);

      const result = await fetchAddressByCep('99999999');
      expect(result.success).toBe(false);
      expect(result.message).toContain('não encontrado');
    });

    it('deve ativar fallback gracioso offline em caso de falha de rede/timeout', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await fetchAddressByCep('78200000');
      expect(result.success).toBe(true);
      expect(result.localidade).toBe('Cáceres');
      expect(result.message).toContain('Modo offline');
    });
  });
});
