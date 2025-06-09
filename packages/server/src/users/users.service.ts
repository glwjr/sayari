import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { hashPassword } from 'src/auth/auth.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(username: string, password: string): Promise<User> {
    const user = new User();
    user.username = username;
    user.passwordHash = await hashPassword(password);

    return this.usersRepository.save(user);
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
