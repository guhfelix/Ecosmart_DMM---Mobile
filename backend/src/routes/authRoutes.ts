import { authController } from '../controllers/authController';

/**
 * Definição de Rotas de Autenticação e Gestão de Usuários.
 * Endpoints:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - POST /api/auth/request-reset
 * - POST /api/auth/reset-password
 */
export const authRoutes = {
  login: async (reqBody: { email: string; pass: string; requiredRole?: any }) => {
    return authController.login(reqBody.email, reqBody.pass, reqBody.requiredRole);
  },
  register: async (reqBody: { name: string; email: string; pass: string; role: any; accessCode?: string }) => {
    return authController.register(reqBody.name, reqBody.email, reqBody.pass, reqBody.role, reqBody.accessCode);
  },
  requestReset: async (reqBody: { email: string; role: any }) => {
    return authController.requestReset(reqBody.email, reqBody.role);
  },
  resetPassword: async (reqBody: { email: string; code: string; newPass: string }) => {
    return authController.resetPassword(reqBody.email, reqBody.code, reqBody.newPass);
  },
};
