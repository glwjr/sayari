import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    user.passwordHash = await hashPassword(createUserDto.password);

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

    if (!existingUser) {
      return null;
    }

    const requestingUser = await this.usersRepository.findOneBy({
      id: updateData.userId,
    });

    if (
      existingUser.role === UserRole.ADMIN &&
      requestingUser?.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Cannot update admin users');
    }

    if (
      updateData.userId !== id &&
      (!requestingUser || requestingUser.role !== UserRole.ADMIN)
    ) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (updateData.role && requestingUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can change user roles');
    }

    if (updateData.isActive === false && existingUser.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot deactivate admin users');
    }

    delete updateData.userId;

    const updateObject: Partial<User> = { ...updateData };

    if (updateData.password) {
      updateObject.passwordHash = await hashPassword(updateData.password);
    }

    await this.usersRepository.update(id, updateObject);

    return this.findById(id);
  }

  async delete(id: string, requestingUserId: string): Promise<void> {
    const existingUser = await this.usersRepository.findOneBy({ id });
    const requestingUser = await this.usersRepository.findOneBy({
      id: requestingUserId,
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (!requestingUser) {
      throw new ForbiddenException('Requesting user not found');
    }

    if (
      existingUser.id !== requestingUserId &&
      requestingUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    if (existingUser.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot delete admin users');
    }

    await this.usersRepository.delete(id);
  }
}
