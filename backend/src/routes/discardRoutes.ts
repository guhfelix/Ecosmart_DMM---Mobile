import { discardController } from '../controllers/discardController';

/**
 * Definição de Rotas de Descartes e Coletas.
 * Endpoints:
 * - GET /api/discards/available?type=Plastico
 * - GET /api/discards/collected
 * - POST /api/discards
 * - PUT /api/discards/:id
 * - DELETE /api/discards/:id
 * - PATCH /api/discards/:id/collect
 */
export const discardRoutes = {
  listAvailable: async (queryParams?: { type?: string }) => {
    return discardController.listAvailable(queryParams?.type);
  },
  listCollected: async () => {
    return discardController.listCollected();
  },
  listByUser: async (userId: string) => {
    return discardController.listByUser(userId);
  },
  create: async (body: {
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
  }) => {
    return discardController.create(body);
  },
  update: async (
    id: string,
    body: {
      tipoResiduo?: string;
      quantidade?: string;
      endereco?: string;
      bairro?: string;
      observacao?: string;
      latitude?: number;
      longitude?: number;
    }
  ) => {
    return discardController.update(id, body);
  },
  delete: async (id: string) => {
    return discardController.delete(id);
  },
  markAsCollected: async (id: string, coletorId?: string) => {
    return discardController.markAsCollected(id, coletorId);
  },
};
