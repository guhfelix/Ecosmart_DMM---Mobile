import { discardRepository } from '../../database/repositories/discardRepository';

/**
 * Controlador de Descartes e Coletas.
 * Responsável por listar materiais disponíveis, criar solicitações de descarte
 * e registrar a confirmação de coletas realizadas.
 */
export class DiscardController {
  /**
   * Lista todos os descartes com status 'pendente', opcionalmente filtrados por tipo de material.
   * @param filterType Tipo de resíduo para filtro (ex: 'Plástico', 'Vidro', 'Todos')
   */
  async listAvailable(filterType?: string) {
    return discardRepository.getAllPending(filterType);
  }

  /**
   * Lista todos os descartes já coletados no ecossistema.
   */
  async listCollected() {
    return discardRepository.getCollected();
  }

  /**
   * Lista todos os descartes pertencentes a um usuário específico.
   * @param userId ID do usuário/cidadão autenticado
   */
  async listByUser(userId: string) {
    return discardRepository.getByUserId(userId);
  }

  /**
   * Cria uma nova solicitação de descarte de resíduos.
   */
  async create(data: {
    usuarioId?: string;
    userId?: string;
    nomeCidadao: string;
    tipoResiduo: string;
    quantidade: string;
    endereco?: string;
    bairro?: string;
    observacao?: string;
    fotoUrl?: string;
    latitude?: number;
    longitude?: number;
  }) {
    return discardRepository.create({
      usuario_id: data.usuarioId || data.userId,
      nome_cidadao: data.nomeCidadao,
      tipo_residuo: data.tipoResiduo,
      quantidade: data.quantidade,
      endereco: data.endereco,
      bairro: data.bairro,
      observacao: data.observacao,
      foto_url: data.fotoUrl,
      latitude: data.latitude,
      longitude: data.longitude,
      data_cadastro: new Date().toLocaleDateString('pt-BR'),
    });
  }

  /**
   * Marca um descarte pendente como coletado.
   * @param id ID do descarte
   * @param coletorId ID do coletor responsável
   */
  async markAsCollected(id: string, coletorId?: string) {
    return discardRepository.markAsCollected(id, coletorId);
  }
}

export const discardController = new DiscardController();