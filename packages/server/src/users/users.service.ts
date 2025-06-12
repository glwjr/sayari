import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { hashPassword } from 'src/auth/auth.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.username = createUserDto.username;
    user.passwordHash = (await hashPassword(createUserDto.password)) as string;

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
        isActive: true,
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
        isActive: true,
      },
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .loadRelationCountAndMap('user.postCount', 'user.posts')
      .getMany();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async update(id: string, updateData: UpdateUserDto): Promise<User | null> {
    const existingUser = await this.usersRepository.findOneBy({ id });

    if (!existingUser || existingUser.role === UserRole.ADMIN) {
      return null;
    }

    const updateObject: Partial<User> = { ...updateData };

    if (updateData.password) {
      updateObject.passwordHash = (await hashPassword(
        updateData.password,
      )) as string;
    }

    // Remove undefined values to avoid updating with undefined
    Object.keys(updateObject).forEach((key) => {
      if (updateObject[key] === undefined) {
        delete updateObject[key];
      }
    });

    await this.usersRepository.update(id, updateObject);

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
