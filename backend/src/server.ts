import { authController } from './controllers/authController';
import { discardController } from './controllers/discardController';
import { adminController } from './controllers/adminController';
import { syncService } from './services/syncService';
import { routes } from './routes';

/**
 * Ponto de Entrada da API EcoSmart Mobile.
 * Exporta os módulos controladores, rotas e serviços para consumo ou exposição REST.
 */
export const EcoSmartApi = {
  auth: authController,
  discards: discardController,
  admin: adminController,
  sync: syncService,
  routes,
};

export default EcoSmartApi;