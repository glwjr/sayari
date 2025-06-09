import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from 'src/users/user.entity';
import { hashPassword } from 'src/auth/auth.util';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seedAdminUser() {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await this.userRepository.findOne({
      where: { username: adminUsername },
    });

    if (existingAdmin) {
      return;
    }

    const admin = this.userRepository.create({
      username: adminUsername,
      passwordHash: await hashPassword(adminPassword),
      role: UserRole.ADMIN,
    });

    await this.userRepository.save(admin);
  }
}
