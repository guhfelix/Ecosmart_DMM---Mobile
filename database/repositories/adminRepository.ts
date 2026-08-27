import { DbWasteType, DbCollectionPoint, DbEducationalTip } from '../schemas/types';
import {
  SEED_WASTE_TYPES,
  SEED_COLLECTION_POINTS,
  SEED_EDUCATIONAL_TIPS,
} from '../seeds/initialData';
import { generateEntityId } from '../../shared/utils/idUtils';

export class AdminRepository {
  private wasteTypes: DbWasteType[] = [...SEED_WASTE_TYPES];
  private points: DbCollectionPoint[] = [...SEED_COLLECTION_POINTS];
  private tips: DbEducationalTip[] = [...SEED_EDUCATIONAL_TIPS];

  // Resíduos
  async getWasteTypes(): Promise<DbWasteType[]> {
    return [...this.wasteTypes];
  }
  async saveWasteType(item: Omit<DbWasteType, 'id'> & { id?: string }): Promise<DbWasteType> {
    if (item.id) {
      this.wasteTypes = this.wasteTypes.map((w) => (w.id === item.id ? { ...w, ...item, id: item.id } : w));
      return item as DbWasteType;
    }
    const newItem: DbWasteType = { ...item, id: generateEntityId('waste') };
    this.wasteTypes.unshift(newItem);
    return newItem;
  }
  async deleteWasteType(id: string): Promise<boolean> {
    const initialLen = this.wasteTypes.length;
    this.wasteTypes = this.wasteTypes.filter((w) => w.id !== id);
    return this.wasteTypes.length < initialLen;
  }

  // Pontos de Coleta
  async getPoints(): Promise<DbCollectionPoint[]> {
    return [...this.points];
  }
  async savePoint(item: Omit<DbCollectionPoint, 'id'> & { id?: string }): Promise<DbCollectionPoint> {
    if (item.id) {
      this.points = this.points.map((p) => (p.id === item.id ? { ...p, ...item, id: item.id } : p));
      return item as DbCollectionPoint;
    }
    const newItem: DbCollectionPoint = { ...item, id: generateEntityId('point') };
    this.points.unshift(newItem);
    return newItem;
  }
  async deletePoint(id: string): Promise<boolean> {
    const initialLen = this.points.length;
    this.points = this.points.filter((p) => p.id !== id);
    return this.points.length < initialLen;
  }

  // Dicas Educativas
  async getTips(): Promise<DbEducationalTip[]> {
    return [...this.tips];
  }
  async saveTip(item: Omit<DbEducationalTip, 'id'> & { id?: string }): Promise<DbEducationalTip> {
    if (item.id) {
      this.tips = this.tips.map((t) => (t.id === item.id ? { ...t, ...item, id: item.id } : t));
      return item as DbEducationalTip;
    }
    const newItem: DbEducationalTip = { ...item, id: generateEntityId('tip') };
    this.tips.unshift(newItem);
    return newItem;
  }
  async deleteTip(id: string): Promise<boolean> {
    const initialLen = this.tips.length;
    this.tips = this.tips.filter((t) => t.id !== id);
    return this.tips.length < initialLen;
  }
}

export const adminRepository = new AdminRepository();