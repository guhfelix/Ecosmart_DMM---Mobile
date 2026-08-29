import { DbDiscard } from '../schemas/types';
import { SEED_DISCARDS } from '../seeds/initialData';
import { generateEntityId } from '../../shared/utils/idUtils';

/**
 * Repositório de Acesso a Dados de Descartes e Coletas.
 * Responsável por consultas filtradas por status/material, criação e confirmação de baixas de coleta.
 */
export class DiscardRepository {
  private discards: DbDiscard[] = [...SEED_DISCARDS];

  /**
   * Retorna todos os descartes com status 'pendente', com suporte a filtro opcional por tipo de resíduo.
   * @param filterType Tipo de material reciclável para filtrar
   */
  async getAllPending(filterType?: string): Promise<DbDiscard[]> {
    return this.discards.filter((d) => {
      const isPending = d.status === 'pendente';
      const matches = !filterType || filterType === 'Todos' || d.tipo_residuo === filterType;
      return isPending && matches;
    });
  }

  /**
   * Retorna todos os descartes que já foram recolhidos (status 'coletado').
   */
  async getCollected(): Promise<DbDiscard[]> {
    return this.discards.filter((d) => d.status === 'coletado');
  }

  /**
   * Busca um descarte específico pelo ID.
   * @param id ID do descarte
   */
  async findById(id: string): Promise<DbDiscard | null> {
    return this.discards.find((d) => d.id === id) ?? null;
  }

  /**
   * Retorna os descartes pertencentes a um usuário específico.
   * @param userId ID do usuário/cidadão
   */
  async getByUserId(userId: string): Promise<DbDiscard[]> {
    return this.discards.filter(
      (d) => d.usuario_id === userId || (d as any).userId === userId || (d as any).citizenId === userId
    );
  }

  /**
   * Registra um novo descarte com status inicial 'pendente'.
   * @param discard Dados do descarte
   */
  async create(discard: Omit<DbDiscard, 'id' | 'status'>): Promise<DbDiscard> {
    const newDiscard: DbDiscard = {
      ...discard,
      id: generateEntityId('disc'),
      status: 'pendente',
    };
    this.discards.unshift(newDiscard);
    return newDiscard;
  }

  /**
   * Marca um descarte pendente como 'coletado', vinculando o coletor e a data da coleta.
   * @param id ID do descarte
   * @param coletorId ID do coletor responsável
   */
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