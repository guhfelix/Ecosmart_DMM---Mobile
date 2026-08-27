import { generateSustainabilityMetrics, generateCsvReport } from '../reportService';
import { AdminDiscardRecord } from '../../models';

describe('reportService (Métricas ESG e Exportação CSV)', () => {
  const mockRecords: AdminDiscardRecord[] = [
    {
      id: 'rec-1',
      citizenName: 'Maria Cidadã',
      wasteType: 'Plástico',
      quantity: '3 sacolas',
      neighborhood: 'Centro',
      createdAt: '24/08/2026',
      status: 'coletado',
    },
    {
      id: 'rec-2',
      citizenName: 'João Santos',
      wasteType: 'Vidro',
      quantity: '5 garrafas',
      neighborhood: 'Cavalhada',
      createdAt: '25/08/2026',
      status: 'pendente',
    },
    {
      id: 'rec-3',
      citizenName: 'Lucas Silva',
      wasteType: 'Plástico',
      quantity: '1 caixa',
      neighborhood: 'DNER',
      createdAt: '26/08/2026',
      status: 'visualizado',
    },
  ];

  describe('generateSustainabilityMetrics', () => {
    it('deve calcular métricas com base na lista de registros', () => {
      const metrics = generateSustainabilityMetrics(mockRecords);
      expect(metrics.totalRecords).toBe(3);
      expect(metrics.totalCollected).toBe(1);
      expect(metrics.totalPending).toBe(1);
      expect(metrics.totalViewed).toBe(1);
      expect(metrics.recyclingRate).toBe(33.3);
      expect(metrics.estimatedCarbonAvoidedKg).toBe(2.8);
      expect(metrics.estimatedWaterSavedLiters).toBe(18);
      expect(metrics.categoryDistribution['Plástico']).toBe(2);
      expect(metrics.categoryDistribution['Vidro']).toBe(1);
    });

    it('deve retornar métricas zeradas para lista vazia sem quebrar divisão por zero', () => {
      const metrics = generateSustainabilityMetrics([]);
      expect(metrics.totalRecords).toBe(0);
      expect(metrics.recyclingRate).toBe(0);
      expect(metrics.estimatedCarbonAvoidedKg).toBe(0);
      expect(metrics.estimatedWaterSavedLiters).toBe(0);
    });
  });

  describe('generateCsvReport', () => {
    it('deve formatar cabeçalhos, linhas e rodapé executivo ESG em formato CSV com ponto-e-vírgula', () => {
      const csv = generateCsvReport(mockRecords);
      expect(csv).toContain('ID;Cidadão;Tipo de Resíduo;Quantidade;Bairro;Data do Registro;Status;Impacto CO2 Estimado (kg)');
      expect(csv).toContain('rec-1;"Maria Cidadã";"Plástico";"3 sacolas";"Centro";24/08/2026;coletado;2.80');
      expect(csv).toContain('--- RESUMO EXECUTIVO ESG ---');
      expect(csv).toContain('Taxa de reciclagem (%):;33.3%');
      expect(csv).toContain('Carbono evitado total (kg CO2):;2.8 kg');
    });
  });
});
