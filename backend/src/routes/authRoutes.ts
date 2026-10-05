import { authController } from '../controllers/authController';
import { PerfilUsuario } from '../../../shared/models';

/**
 * Definição de Rotas de Autenticação e Gestão de Usuários.
 * Endpoints:
 * - POST /api/auth/login
 * - POST /api/auth/register
 * - POST /api/auth/request-reset
 * - POST /api/auth/reset-password
 */
export const authRoutes = {
  login: async (reqBody: { email: string; pass: string; requiredRole: PerfilUsuario }) => {
    return authController.login({
      body: {
        email: reqBody.email,
        password: reqBody.pass,
        expectedRole: reqBody.requiredRole,
      },
    });
  },
  register: async (reqBody: { name: string; email: string; pass: string; role: PerfilUsuario; accessCode?: string }) => {
    return authController.register({
      body: {
        name: reqBody.name,
        email: reqBody.email,
        password: reqBody.pass,
        role: reqBody.role,
        accessCode: reqBody.accessCode,
      },
    });
  },
  requestReset: async (reqBody: { email: string; role: PerfilUsuario }) => {
    return authController.requestReset({
      body: {
        email: reqBody.email,
        role: reqBody.role,
      },
    });
  },
  resetPassword: async (reqBody: { email: string; code: string; newPass: string }) => {
    return authController.resetPassword({
      body: {
        email: reqBody.email,
        code: reqBody.code,
        newPassword: reqBody.newPass,
      },
    });
  },
};
