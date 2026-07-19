import { prisma } from '../database/prisma';
import { UserRepository } from '../repositories/user.repository';
import { toUserListItem } from './mappers';
import type { UserListItem } from '../../shared/types';

export class UserService {
  private readonly users = new UserRepository(prisma);

  async listUsers(): Promise<UserListItem[]> {
    const users = await this.users.listActive();
    return users.map(toUserListItem);
  }
}
