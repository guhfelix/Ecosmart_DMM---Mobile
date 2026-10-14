import { DbWasteType, DbCollectionPoint, DbEducationalTip, DbAdmin, DbAdminLog } from '../schemas/types';
import {
  SEED_WASTE_TYPES,
  SEED_COLLECTION_POINTS,
  SEED_EDUCATIONAL_TIPS,
  SEED_ADMINS,
} from '../seeds/initialData';
import { generateEntityId } from '../../shared/utils/idUtils';

/**
 * Repositório de Acesso a Dados Administrativos Isolados.
 * Conecta-se à base de dados dedicada (ecosmart-admin-db).
 * Centraliza as operações de leitura, criação e auditoria para:
 * - Credenciais e perfis de administradores (coleção 'admins')
 * - Logs de auditoria administrativa (coleção 'admin_logs')
 * - Tipos de resíduos recicláveis, pontos de coleta e dicas educativas.
 */
export class AdminRepository {
  private wasteTypes: DbWasteType[] = [...SEED_WASTE_TYPES];
  private points: DbCollectionPoint[] = [...SEED_COLLECTION_POINTS];
  private tips: DbEducationalTip[] = [...SEED_EDUCATIONAL_TIPS];
  private admins: DbAdmin[] = [...SEED_ADMINS];
  private logs: DbAdminLog[] = [];

  // ==========================================
  // Credenciais e Perfis de Administradores (Isolados)
  // ==========================================

  /**
   * Busca um administrador pelo endereço de e-mail na base dedicada.
   */
  async getAdminByEmail(email: string): Promise<DbAdmin | null> {
    const normalized = email.trim().toLowerCase();
    return this.admins.find((a) => a.email.trim().toLowerCase() === normalized) ?? null;
  }

  /**
   * Busca um administrador pelo ID único.
   */
  async getAdminById(id: string): Promise<DbAdmin | null> {
    return this.admins.find((a) => a.id === id) ?? null;
  }

  /**
   * Registra um novo administrador na coleção exclusiva 'admins'.
   */
  async createAdmin(admin: Omit<DbAdmin, 'id' | 'criado_em'>): Promise<DbAdmin> {
    const newAdmin: DbAdmin = {
      ...admin,
      id: generateEntityId('admin'),
      perfil: 'admin',
      criado_em: new Date().toISOString(),
    };
    this.admins.push(newAdmin);
    return newAdmin;
  }

  /**
   * Atualiza os dados de um administrador existente.
   */
  async updateAdmin(id: string, updates: Partial<DbAdmin>): Promise<DbAdmin | null> {
    const index = this.admins.findIndex((a) => a.id === id);
    if (index < 0) return null;
    this.admins[index] = {
      ...this.admins[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.admins[index];
  }

  /**
   * Insere ou atualiza um administrador na base isolada.
   */
  async upsertAdmin(admin: DbAdmin): Promise<DbAdmin> {
    const index = this.admins.findIndex(
      (a) => a.id === admin.id || a.email.toLowerCase() === admin.email.toLowerCase()
    );
    if (index >= 0) {
      this.admins[index] = {
        ...this.admins[index],
        ...admin,
        atualizado_em: new Date().toISOString(),
      };
      return this.admins[index];
    }
    this.admins.push(admin);
    return admin;
  }

  /**
   * Retorna a lista exclusiva de administradores.
   */
  async getAllAdmins(): Promise<DbAdmin[]> {
    return [...this.admins];
  }

  // ==========================================
  // Auditoria e Logs Administrativos (admin_logs)
  // ==========================================

  /**
   * Registra um log de ação administrativa para auditoria de segurança.
   */
  async logAction(log: Omit<DbAdminLog, 'id' | 'criado_em'>): Promise<DbAdminLog> {
    const newLog: DbAdminLog = {
      ...log,
      id: generateEntityId('log'),
      criado_em: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
    return newLog;
  }

  /**
   * Recupera logs de auditoria administrativa.
   */
  async getAdminLogs(adminId?: string): Promise<DbAdminLog[]> {
    if (adminId) {
      return this.logs.filter((l) => l.admin_id === adminId);
    }
    return [...this.logs];
  }

  // ==========================================
  // Tipos de Resíduos Recicláveis
  // ==========================================

  /** Retorna todos os tipos de resíduos cadastrados */
  async getWasteTypes(): Promise<DbWasteType[]> {
    return [...this.wasteTypes];
  }

  /** Cria ou atualiza um tipo de resíduo */
  async saveWasteType(item: Omit<DbWasteType, 'id'> & { id?: string }): Promise<DbWasteType> {
    if (item.id) {
      this.wasteTypes = this.wasteTypes.map((w) => (w.id === item.id ? { ...w, ...item, id: item.id } : w));
      return item as DbWasteType;
    }
    const newItem: DbWasteType = { ...item, id: generateEntityId('waste') };
    this.wasteTypes.unshift(newItem);
    return newItem;
  }

  /** Exclui um tipo de resíduo pelo ID */
  async deleteWasteType(id: string): Promise<boolean> {
    const initialLen = this.wasteTypes.length;
    this.wasteTypes = this.wasteTypes.filter((w) => w.id !== id);
    return this.wasteTypes.length < initialLen;
  }

  // ==========================================
  // Pontos de Coleta e Ecopontos
  // ==========================================

  /** Retorna todos os pontos de coleta e PEVs cadastrados */
  async getPoints(): Promise<DbCollectionPoint[]> {
    return [...this.points];
  }

  /** Cria ou atualiza um ponto de coleta */
  async savePoint(item: Omit<DbCollectionPoint, 'id'> & { id?: string }): Promise<DbCollectionPoint> {
    if (item.id) {
      this.points = this.points.map((p) => (p.id === item.id ? { ...p, ...item, id: item.id } : p));
      return item as DbCollectionPoint;
    }
    const newItem: DbCollectionPoint = { ...item, id: generateEntityId('point') };
    this.points.unshift(newItem);
    return newItem;
  }

  /** Exclui um ponto de coleta pelo ID */
  async deletePoint(id: string): Promise<boolean> {
    const initialLen = this.points.length;
    this.points = this.points.filter((p) => p.id !== id);
    return this.points.length < initialLen;
  }

  // ==========================================
  // Dicas Educativas de Sustentabilidade
  // ==========================================

  /** Retorna todas as dicas educativas cadastradas */
  async getTips(): Promise<DbEducationalTip[]> {
    return [...this.tips];
  }

  /** Cria ou atualiza uma dica educativa */
  async saveTip(item: Omit<DbEducationalTip, 'id'> & { id?: string }): Promise<DbEducationalTip> {
    if (item.id) {
      this.tips = this.tips.map((t) => (t.id === item.id ? { ...t, ...item, id: item.id } : t));
      return item as DbEducationalTip;
    }
    const newItem: DbEducationalTip = { ...item, id: generateEntityId('tip') };
    this.tips.unshift(newItem);
    return newItem;
  }

  /** Exclui uma dica educativa pelo ID */
  async deleteTip(id: string): Promise<boolean> {
    const initialLen = this.tips.length;
    this.tips = this.tips.filter((t) => t.id !== id);
    return this.tips.length < initialLen;
  }
}

export const adminRepository = new AdminRepository();