import { adminController } from '../controllers/adminController';

/**
 * Definição de Rotas Administrativas e Governança ESG.
 * Endpoints:
 * - GET /api/admin/metrics
 * - GET /api/admin/esg-report
 * - GET / POST / DELETE /api/admin/waste-types
 * - GET / POST / DELETE /api/admin/collection-points
 * - GET / POST / DELETE /api/admin/tips
 */
export const adminRoutes = {
  getDashboardMetrics: async () => adminController.getDashboardMetrics(),
  getEsgMetrics: async () => adminController.getEsgMetrics(),

  // Waste Types
  getWasteTypes: async () => adminController.getWasteTypes(),
  saveWasteType: async (item: any) => adminController.saveWasteType(item),
  deleteWasteType: async (id: string) => adminController.deleteWasteType(id),

  // Points
  getPoints: async () => adminController.getPoints(),
  savePoint: async (item: any) => adminController.savePoint(item),
  deletePoint: async (id: string) => adminController.deletePoint(id),

  // Tips
  getTips: async () => adminController.getTips(),
  saveTip: async (item: any) => adminController.saveTip(item),
  deleteTip: async (id: string) => adminController.deleteTip(id),
};
