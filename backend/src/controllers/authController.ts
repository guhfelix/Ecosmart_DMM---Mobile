import { userRepository } from '../../database/repositories/userRepository';
import { authenticateUser, registerUser } from '../../shared/services/authService';

/**
 * Controlador de Autenticação da API EcoSmart.
 * Responsável por orquestrar o login e registro de usuários
 * com validação estrita de perfis RBAC (Cidadão, Coletor, Admin).
 */
export class AuthController {
  /**
   * Realiza a autenticação de um usuário verificando credenciais e perfil esperado.
   * @param req Objeto contendo email, senha e perfil esperado
   * @returns Resultado da autenticação com dados do usuário ou mensagem de erro
   */
  async login(req: { body: { email: string; password: string; expectedRole: 'cidadao' | 'coletor' | 'admin' } }) {
    const { email, password, expectedRole } = req.body;
    const allUsers = await userRepository.getAll();
    const formattedUsers = allUsers.map((u) => ({
      id: u.id,
      name: u.nome,
      email: u.email,
      password: u.senha_hash,
      perfil: u.perfil,
    }));

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
    const formattedUsers = allUsers.map((u) => ({
      id: u.id,
      name: u.nome,
      email: u.email,
      password: u.senha_hash,
      perfil: u.perfil,
    }));

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
}

export const authController = new AuthController();