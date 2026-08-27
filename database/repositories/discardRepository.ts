import { DbDiscard } from '../schemas/types';
import { SEED_DISCARDS } from '../seeds/initialData';
import { generateEntityId } from '../../shared/utils/idUtils';

export class DiscardRepository {
  private discards: DbDiscard[] = [...SEED_DISCARDS];

  async getAllPending(filterType?: string): Promise<DbDiscard[]> {
    return this.discards.filter((d) => {
      const isPending = d.status === 'pendente';
      const matches = !filterType || filterType === 'Todos' || d.tipo_residuo === filterType;
      return isPending && matches;
    });
  }

  async getCollected(): Promise<DbDiscard[]> {
    return this.discards.filter((d) => d.status === 'coletado');
  }

  async findById(id: string): Promise<DbDiscard | null> {
    return this.discards.find((d) => d.id === id) ?? null;
  }

  async create(discard: Omit<DbDiscard, 'id' | 'status'>): Promise<DbDiscard> {
    const newDiscard: DbDiscard = {
      ...discard,
      id: generateEntityId('disc'),
      status: 'pendente',
    };
    this.discards.unshift(newDiscard);
    return newDiscard;
  }

  async markAsCollected(id: string, coletorId?: string): Promise<DbDiscard | null> {
    const item = await this.findById(id);
    if (!item) return null;

    item.status = 'coletado';
    item.data_coleta = new Date().toLocaleDateString('pt-BR');
    item.coletor_id = coletorId;
    return item;
  }
}

export const discardRepository = new DiscardRepository();