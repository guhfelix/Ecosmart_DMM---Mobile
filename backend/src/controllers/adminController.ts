import { adminRepository } from '../../database/repositories/adminRepository';
import { discardRepository } from '../../database/repositories/discardRepository';

export class AdminController {
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

  // Waste Types
  async getWasteTypes() { return adminRepository.getWasteTypes(); }
  async saveWasteType(item: any) { return adminRepository.saveWasteType(item); }
  async deleteWasteType(id: string) { return adminRepository.deleteWasteType(id); }

  // Collection Points
  async getPoints() { return adminRepository.getPoints(); }
  async savePoint(item: any) { return adminRepository.savePoint(item); }
  async deletePoint(id: string) { return adminRepository.deletePoint(id); }

  // Tips
  async getTips() { return adminRepository.getTips(); }
  async saveTip(item: any) { return adminRepository.saveTip(item); }
  async deleteTip(id: string) { return adminRepository.deleteTip(id); }
}

export const adminController = new AdminController();