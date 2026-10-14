import { adminRepository } from '../../../database/repositories/adminRepository';
import { discardRepository } from '../../../database/repositories/discardRepository';

/**
 * Controlador de Operações Administrativas e Governança ESG.
 * Responsável por métricas consolidadas do dashboard, indicadores ecológicos
 * e operações de CRUD nos catálogos de resíduos, ecopontos e dicas educativas.
 */
export class AdminController {
  /**
   * Retorna os totais consolidados de descartes (pendentes, coletados e geral) para o dashboard.
   */
  async getDashboardMetrics() {
    const pending = await discardRepository.getAllPending();
    const collected = await discardRepository.getCollected();
    const total = pending.length + collected.length;
    return {
      totalPending: pending.length,
      totalCollected: collected.length,
      totalRecords: total,
    };
  }

  /**
   * Calcula indicadores ambientais e de sustentabilidade ESG (taxa de reciclagem, CO₂ evitado e água economizada).
   */
  async getEsgMetrics() {
    const pending = await discardRepository.getAllPending();
    const collected = await discardRepository.getCollected();
    const total = pending.length + collected.length;
    return {
      totalRecords: total,
      totalPending: pending.length,
      totalCollected: collected.length,
      recyclingRate: total > 0 ? Number(((collected.length / total) * 100).toFixed(1)) : 0,
      estimatedCarbonAvoidedKg: Number((collected.length * 2.8).toFixed(1)),
      estimatedWaterSavedLiters: collected.length * 18,
    };
  }

  // --- Tipos de Resíduos Recicláveis ---
  /** Obtém a lista de tipos de resíduos cadastrados */
  async getWasteTypes() { return adminRepository.getWasteTypes(); }
  /** Salva ou atualiza um tipo de resíduo */
  async saveWasteType(item: any) { return adminRepository.saveWasteType(item); }
  /** Exclui um tipo de resíduo pelo ID */
  async deleteWasteType(id: string) { return adminRepository.deleteWasteType(id); }

  // --- Pontos de Coleta e Ecopontos ---
  /** Obtém a lista de pontos de coleta cadastrados */
  async getPoints() { return adminRepository.getPoints(); }
  /** Salva ou atualiza um ponto de coleta */
  async savePoint(item: any) { return adminRepository.savePoint(item); }
  /** Exclui um ponto de coleta pelo ID */
  async deletePoint(id: string) { return adminRepository.deletePoint(id); }

  // --- Dicas Educativas de Sustentabilidade ---
  /** Obtém a lista de dicas educativas cadastradas */
  async getTips() { return adminRepository.getTips(); }
  /** Salva ou atualiza uma dica educativa */
  async saveTip(item: any) { return adminRepository.saveTip(item); }
  /** Exclui uma dica educativa pelo ID */
  async deleteTip(id: string) { return adminRepository.deleteTip(id); }

  // --- Credenciais e Perfis de Administradores (Isolados) ---
  /** Obtém o perfil de um administrador pelo e-mail na base isolada */
  async getAdminByEmail(email: string) { return adminRepository.getAdminByEmail(email); }
  /** Obtém o perfil de um administrador pelo ID */
  async getAdminById(id: string) { return adminRepository.getAdminById(id); }
  /** Lista todos os administradores cadastrados no banco isolado */
  async getAllAdmins() { return adminRepository.getAllAdmins(); }
  /** Cria um novo administrador no banco exclusivo */
  async createAdmin(data: any) { return adminRepository.createAdmin(data); }
  /** Atualiza o perfil de um administrador */
  async updateAdmin(id: string, updates: any) { return adminRepository.updateAdmin(id, updates); }

  // --- Logs de Auditoria Administrativa ---
  /** Registra uma ação administrativa para auditoria */
  async logAdminAction(adminId: string, adminEmail: string, acao: string, detalhes?: string) {
    return adminRepository.logAction({ admin_id: adminId, admin_email: adminEmail, acao, detalhes });
  }
  /** Obtém os logs de auditoria */
  async getAdminLogs(adminId?: string) { return adminRepository.getAdminLogs(adminId); }
}

export const adminController = new AdminController();
