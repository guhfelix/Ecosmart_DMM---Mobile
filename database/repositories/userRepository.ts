import { DbUser } from '../schemas/types';
import { SEED_USERS } from '../seeds/initialData';
import { generateEntityId } from '../../shared/utils/idUtils';

export class UserRepository {
  private users: DbUser[] = [...SEED_USERS];

  async findByEmail(email: string): Promise<DbUser | null> {
    const normalized = email.trim().toLowerCase();
    return this.users.find((u) => u.email.trim().toLowerCase() === normalized) ?? null;
  }

  async findById(id: string): Promise<DbUser | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async create(user: Omit<DbUser, 'id' | 'criado_em'>): Promise<DbUser> {
    const newUser: DbUser = {
      ...user,
      id: generateEntityId(`user-${user.perfil}`),
      criado_em: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, updates: Partial<DbUser>): Promise<DbUser | null> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index < 0) return null;
    this.users[index] = {
      ...this.users[index],
      ...updates,
      atualizado_em: new Date().toISOString(),
    };
    return this.users[index];
  }

  async upsert(user: DbUser): Promise<DbUser> {
    const index = this.users.findIndex(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (index >= 0) {
      this.users[index] = {
        ...this.users[index],
        ...user,
        atualizado_em: new Date().toISOString(),
      };
      return this.users[index];
    }
    this.users.push(user);
    return user;
  }

  async getAll(): Promise<DbUser[]> {
    return [...this.users];
  }
}

export const userRepository = new UserRepository();