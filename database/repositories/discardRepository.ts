import { DbDiscard } from '../schemas/types';
import { SEED_DISCARDS } from '../seeds/initialData';
import { generateEntityId } from '../../shared/utils/idUtils';

/**
 * Repositório de Acesso a Dados de Descartes e Coletas.
 * Responsável por consultas filtradas por status/material, criação, edição (update),
 * exclusão e confirmação de baixas de coleta.
 */
export class DiscardRepository {
  private discards: DbDiscard[] = [...SEED_DISCARDS];

  /**
   * Retorna todos os descartes com status 'pendente', com suporte a filtro opcional por tipo de resíduo.
   * @param filterType Tipo de material reciclável para filtrar (ex.: 'Plástico e PET' ou 'Todos')
   * @returns Lista de descartes pendentes
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
   * @returns Lista de descartes coletados
   */
  async getCollected(): Promise<DbDiscard[]> {
    return this.discards.filter((d) => d.status === 'coletado');
  }

  /**
   * Busca um descarte específico pelo ID.
   * @param id ID único do descarte
   * @returns Descarte localizado ou null
   */
  async findById(id: string): Promise<DbDiscard | null> {
    return this.discards.find((d) => d.id === id) ?? null;
  }

  /**
   * Retorna os descartes pertencentes a um usuário específico.
   * @param userId ID do usuário/cidadão proprietário
   * @returns Lista de descartes do usuário
   */
  async getByUserId(userId: string): Promise<DbDiscard[]> {
    return this.discards.filter(
      (d) => d.usuario_id === userId || (d as any).userId === userId || (d as any).citizenId === userId
    );
  }

  /**
   * Registra um novo descarte com status inicial 'pendente'.
   * @param discard Dados do descarte a cadastrar
   * @returns Descarte criado com ID gerado
   */
  async create(discard: Omit<DbDiscard, 'id' | 'status'>): Promise<DbDiscard> {
    const newDiscard: DbDiscard = {
      ...discard,
      id: generateEntityId('disc'),
      status: 'pendente',
      criado_em: new Date().toISOString(),
    };
    this.discards.unshift(newDiscard);
    return newDiscard;
  }

  /**
   * Atualiza os campos editáveis de um descarte existente preservando seu ID e status de coleta (A4-01 / A4-02).
   * @param id ID do descarte a atualizar
   * @param updates Campos atualizados (tipo_residuo, quantidade, endereco, bairro, observacao, etc.)
   * @returns Descarte atualizado ou null caso não encontrado
   */
  async update(id: string, updates: Partial<Omit<DbDiscard, 'id'>>): Promise<DbDiscard | null> {
    const index = this.discards.findIndex((d) => d.id === id);
    if (index < 0) return null;

    const current = this.discards[index];
    this.discards[index] = {
      ...current,
      ...updates,
      id: current.id,
      status: current.status === 'coletado' ? 'coletado' : updates.status || current.status,
    };
    return this.discards[index];
  }

  /**
   * Remove um descarte pelo ID.
   * @param id ID do descarte a excluir
   * @returns true se removido com sucesso, false caso não encontrado
   */
  async delete(id: string): Promise<boolean> {
    const initialLen = this.discards.length;
    this.discards = this.discards.filter((d) => d.id !== id);
    return this.discards.length < initialLen;
  }

  /**
   * Marca um descarte pendente como 'coletado', vinculando o coletor e a data da coleta.
   * @param id ID do descarte
   * @param coletorId ID do coletor responsável
   * @returns Descarte atualizado como coletado ou null caso não encontrado
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
