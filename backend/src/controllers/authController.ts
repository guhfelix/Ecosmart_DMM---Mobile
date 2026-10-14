import { DbUser, DbAdmin } from '../../../database/schemas/types';
import { userRepository } from '../../../database/repositories/userRepository';
import { adminRepository } from '../../../database/repositories/adminRepository';
import { PerfilUsuario } from '../../../shared/models';
import {
  RegisteredUser,
  authenticateUser,
  registerUser,
  requestPasswordReset,
  resetPassword as resetUserPassword,
} from '../../../shared/services/authService';

/**
 * Controlador de Autenticação da API EcoSmart.
 * Responsável por orquestrar o login e registro de usuários
 * com isolamento estrito de bancos e repositórios entre Cidadão/Coletor e Administrador.
 */
export class AuthController {
  private formatUsers(users: DbUser[]): RegisteredUser[] {
    return users.map((u) => ({
      id: u.id,
      name: u.nome,
      email: u.email,
      password: u.senha_hash,
      perfil: u.perfil,
      telefone: u.telefone,
      cep: u.cep,
      endereco: u.endereco,
      numero: u.numero,
      bairro: u.bairro,
      cidade: u.cidade,
      veiculo: u.veiculo,
      capacidadeCarga: u.capacidade_carga,
      bio: u.bio,
      avatarUri: u.avatar_url,
      createdAt: u.criado_em,
      updatedAt: u.atualizado_em,
    }));
  }

  private formatAdmins(admins: DbAdmin[]): RegisteredUser[] {
    return admins.map((a) => ({
      id: a.id,
      name: a.nome,
      email: a.email,
      password: a.senha_hash,
      perfil: 'admin',
      telefone: a.telefone,
      cep: a.cep,
      endereco: a.endereco,
      numero: a.numero,
      bairro: a.bairro,
      cidade: a.cidade,
      cargo: a.cargo,
      departamento: a.departamento,
      bio: a.bio,
      avatarUri: a.avatar_url,
      createdAt: a.criado_em,
      updatedAt: a.atualizado_em,
    }));
  }

  /**
   * Realiza a autenticação de um usuário consultando EXCLUSIVAMENTE a base correspondente:
   * - Administradores -> Base isolada do admin (adminRepository)
   * - Usuários Comuns (Cidadão/Coletor) -> Base principal (userRepository)
   */
  async login(req: { body: { email: string; password: string; expectedRole: 'cidadao' | 'coletor' | 'admin' } }) {
    const { email, password, expectedRole } = req.body;

    if (expectedRole === 'admin') {
      const admins = await adminRepository.getAllAdmins();
      const formattedAdmins = this.formatAdmins(admins);
      const authRes = authenticateUser(email, password, 'admin', formattedAdmins);
      if (authRes.success && authRes.user) {
        await adminRepository.logAction({
          admin_id: authRes.user.id,
          admin_email: authRes.user.email,
          acao: 'LOGIN_SUCESSO',
          detalhes: 'Autenticação realizada com sucesso no painel administrativo.',
        });
      }
      return authRes;
    }

    const allUsers = await userRepository.getAll();
    const formattedUsers = this.formatUsers(allUsers);
    return authenticateUser(email, password, expectedRole, formattedUsers);
  }

  /**
   * Cadastra um novo usuário no sistema com gravação direcionada e isolada:
   * - Admin -> adminRepository na base administrativa
   * - Cidadão/Coletor -> userRepository na base geral
   */
  async register(req: { body: { name: string; email: string; password: string; role: 'cidadao' | 'coletor' | 'admin'; accessCode?: string } }) {
    const { name, email, password, role, accessCode } = req.body;

    if (role === 'admin') {
      const admins = await adminRepository.getAllAdmins();
      const formattedAdmins = this.formatAdmins(admins);
      const result = registerUser(name, email, password, 'admin', accessCode, formattedAdmins);

      if (result.success && result.user) {
        const createdAdmin = await adminRepository.createAdmin({
          nome: name,
          email: email,
          senha_hash: password,
          perfil: 'admin',
        });
        await adminRepository.logAction({
          admin_id: createdAdmin.id,
          admin_email: createdAdmin.email,
          acao: 'CADASTRO_ADMIN',
          detalhes: 'Novo administrador cadastrado no banco dedicado.',
        });
      }

      return result;
    }

    const allUsers = await userRepository.getAll();
    const formattedUsers = this.formatUsers(allUsers);
    const result = registerUser(name, email, password, role, accessCode, formattedUsers);

    if (result.success && result.user) {
      await userRepository.create({
        nome: name,
        email: email,
        senha_hash: password,
        perfil: role,
      });
    }

    return result;
  }

  /**
   * Gera e persiste um código temporário de recuperação de senha no repositório isolado adequado.
   */
  async requestReset(req: { body: { email: string; role: PerfilUsuario } }) {
    const { email, role } = req.body;

    if (role === 'admin') {
      const admins = await adminRepository.getAllAdmins();
      const formattedAdmins = this.formatAdmins(admins);
      const result = requestPasswordReset(email, 'admin', formattedAdmins);

      if (result.success && result.code) {
        const admin = await adminRepository.getAdminByEmail(email);
        if (admin) {
          await adminRepository.updateAdmin(admin.id, { codigo_recuperacao: result.code });
        }
      }
      return result;
    }

    const allUsers = await userRepository.getAll();
    const formattedUsers = this.formatUsers(allUsers);
    const result = requestPasswordReset(email, role, formattedUsers);

    if (result.success && result.code) {
      const user = await userRepository.findByEmail(email);
      if (user) {
        await userRepository.update(user.id, { codigo_recuperacao: result.code });
      }
    }

    return result;
  }

  /**
   * Redefine a senha validando o código temporário persistido no repositório correto.
   */
  async resetPassword(req: { body: { email: string; code: string; newPassword: string } }) {
    const { email, code, newPassword } = req.body;

    // Tenta primeiro no repositório de administradores isolado
    const adminUser = await adminRepository.getAdminByEmail(email);
    if (adminUser) {
      const admins = await adminRepository.getAllAdmins();
      const formattedAdmins = this.formatAdmins(admins);
      const result = resetUserPassword(
        email,
        code,
        adminUser.codigo_recuperacao || '',
        newPassword,
        formattedAdmins
      );

      if (result.success) {
        await adminRepository.updateAdmin(adminUser.id, {
          senha_hash: newPassword.trim(),
          codigo_recuperacao: undefined,
        });
      }
      return result;
    }

    // Se não for admin, busca na base principal de usuários
    const targetUser = await userRepository.findByEmail(email);
    if (!targetUser) {
      return { success: false, message: 'Usuário não encontrado.' };
    }

    const allUsers = await userRepository.getAll();
    const formattedUsers = this.formatUsers(allUsers);
    const result = resetUserPassword(
      email,
      code,
      targetUser.codigo_recuperacao || '',
      newPassword,
      formattedUsers
    );

    if (result.success) {
      await userRepository.update(targetUser.id, {
        senha_hash: newPassword.trim(),
        codigo_recuperacao: undefined,
      });
    }

    return result;
  }
}

export const authController = new AuthController();
