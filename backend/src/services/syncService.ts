import { discardRepository } from '../../database/repositories/discardRepository';

/**
 * Serviço de Sincronização Offline.
 * Recebe lotes de descartes e coletas registrados offline no dispositivo
 * e os processa na base de dados central.
 */
export class SyncService {
  /**
   * Sincroniza um lote de descartes criados em modo offline.
   * @param offlineItems Array de itens criados localmente com status pendente offline
   * @returns Status da sincronização e lista de registros persistidos
   */
  async syncOfflineDiscards(offlineItems: any[]) {
    const synced = [];
    for (const item of offlineItems) {
      const created = await discardRepository.create({
        nome_cidadao: item.citizenName || item.nomeCidadao || 'Cidadão Offline',
        tipo_residuo: item.wasteType || item.type,
        quantidade: item.quantity,
        endereco: item.address,
        bairro: item.neighborhood,
        observacao: item.observation,
        data_cadastro: item.date || new Date().toLocaleDateString('pt-BR'),
      });
      synced.push(created);
    }
    return { success: true, count: synced.length, items: synced };
  }
}

export const syncService = new SyncService();