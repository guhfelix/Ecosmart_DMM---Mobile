import { DbUser } from '../../../database/schemas/types';
import { userRepository } from '../../../database/repositories/userRepository';
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
 * com validação estrita de perfis RBAC (Cidadão, Coletor, Admin).
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
      cargo: u.cargo,
      departamento: u.departamento,
      bio: u.bio,
      avatarUri: u.avatar_url,
      createdAt: u.criado_em,
      updatedAt: u.atualizado_em,
    }));
  }

  /**
   * Realiza a autenticação de um usuário verificando credenciais e perfil esperado.
   * @param req Objeto contendo email, senha e perfil esperado
   * @returns Resultado da autenticação com dados do usuário ou mensagem de erro
   */
  async login(req: { body: { email: string; password: string; expectedRole: 'cidadao' | 'coletor' | 'admin' } }) {
    const { email, password, expectedRole } = req.body;
    const allUsers = await userRepository.getAll();
    const formattedUsers = this.formatUsers(allUsers);

    return authenticateUser(email, password, expectedRole, formattedUsers);
  }

  /**
   * Cadastra um novo usuário no sistema. Se for Administrador, exige o código de segurança.
   * @param req Objeto com nome, email, senha, perfil e código de acesso opcional
   * @returns Usuário recém-criado ou erro de validação
   */
  async register(req: { body: { name: string; email: string; password: string; role: 'cidadao' | 'coletor' | 'admin'; accessCode?: string } }) {
    const { name, email, password, role, accessCode } = req.body;
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
   * Gera e persiste um código temporário de recuperação de senha.
   */
  async requestReset(req: { body: { email: string; role: PerfilUsuario } }) {
    const { email, role } = req.body;
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
   * Redefine a senha validando o código temporário persistido no repositório.
   */
  async resetPassword(req: { body: { email: string; code: string; newPassword: string } }) {
    const { email, code, newPassword } = req.body;
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
