import { authRoutes } from './authRoutes';
import { discardRoutes } from './discardRoutes';
import { adminRoutes } from './adminRoutes';
import { syncRoutes } from './syncRoutes';

export const routes = {
  auth: authRoutes,
  discards: discardRoutes,
  admin: adminRoutes,
  sync: syncRoutes,
};

export { authRoutes, discardRoutes, adminRoutes, syncRoutes };
