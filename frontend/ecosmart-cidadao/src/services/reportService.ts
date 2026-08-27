import { AdminDiscardRecord } from '../models';

export type SustainabilityMetrics = {
  totalRecords: number;
  totalCollected: number;
  totalPending: number;
  totalViewed: number;
  recyclingRate: number; // Porcentagem (0 a 100)
  estimatedCarbonAvoidedKg: number;
  estimatedWaterSavedLiters: number;
  categoryDistribution: Record<string, number>;
};

/**
 * Calcula métricas e indicadores de sustentabilidade ESG com base nos registros do ecossistema.
 */
export function generateSustainabilityMetrics(
  records: AdminDiscardRecord[]
): SustainabilityMetrics {
  const totalRecords = records.length;
  const totalCollected = records.filter((r) => r.status === 'coletado').length;
  const totalPending = records.filter((r) => r.status === 'pendente').length;
  const totalViewed = records.filter((r) => r.status === 'visualizado').length;

  const recyclingRate =
    totalRecords > 0 ? Number(((totalCollected / totalRecords) * 100).toFixed(1)) : 0;

  // Fator médio ESG: ~2.8 kg CO2 evitado e ~18 L de água economizados por lote coletado
  const estimatedCarbonAvoidedKg = Number((totalCollected * 2.8).toFixed(1));
  const estimatedWaterSavedLiters = totalCollected * 18;

  const categoryDistribution: Record<string, number> = {};
  for (const item of records) {
    const cat = item.wasteType || 'Outros';
    categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
  }

  return {
    totalRecords,
    totalCollected,
    totalPending,
    totalViewed,
    recyclingRate,
    estimatedCarbonAvoidedKg,
    estimatedWaterSavedLiters,
    categoryDistribution,
  };
}

/**
 * Gera relatório formatado em formato CSV pronto para exportação e análise em planilhas.
 */
export function generateCsvReport(records: AdminDiscardRecord[]): string {
  const headers = 'ID;Cidadão;Tipo de Resíduo;Quantidade;Bairro;Data do Registro;Status;Impacto CO2 Estimado (kg)\n';

  const rows = records
    .map((r) => {
      const co2Impact = r.status === 'coletado' ? '2.80' : '0.00';
      return `${r.id};"${r.citizenName}";"${r.wasteType}";"${r.quantity}";"${r.neighborhood}";${r.createdAt};${r.status};${co2Impact}`;
    })
    .join('\n');

  const metrics = generateSustainabilityMetrics(records);
  const summaryFooter = `\n\n--- RESUMO EXECUTIVO ESG ---\nTotal de descartes cadastrados:;${metrics.totalRecords}\nTotal de coletas concluídas:;${metrics.totalCollected}\nTaxa de reciclagem (%):;${metrics.recyclingRate}%\nCarbono evitado total (kg CO2):;${metrics.estimatedCarbonAvoidedKg} kg\nÁgua preservada estimada (L):;${metrics.estimatedWaterSavedLiters} L`;

  return headers + rows + summaryFooter;
}
