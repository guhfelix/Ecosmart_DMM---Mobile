import { DbWasteType, DbCollectionPoint, DbEducationalTip } from '../schemas/types';
import {
  SEED_WASTE_TYPES,
  SEED_COLLECTION_POINTS,
  SEED_EDUCATIONAL_TIPS,
} from '../seeds/initialData';
import { generateEntityId } from '../../shared/utils/idUtils';

/**
 * Repositório de Acesso a Dados Administrativos.
 * Centraliza as operações de leitura, inclusão, atualização e exclusão (CRUD)
 * para tipos de resíduos recicláveis, pontos de coleta e dicas educativas.
 */
export class AdminRepository {
  private wasteTypes: DbWasteType[] = [...SEED_WASTE_TYPES];
  private points: DbCollectionPoint[] = [...SEED_COLLECTION_POINTS];
  private tips: DbEducationalTip[] = [...SEED_EDUCATIONAL_TIPS];

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