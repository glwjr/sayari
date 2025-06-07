import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { compareHash } from './auth.util';
import { User } from 'src/users/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: string): Promise<Partial<User> | null> {
    const user = await this.usersService.findById(userId);
    if (user) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user || !(await compareHash(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const existingUser = await this.usersService.findByUsername(
      registerDto.username,
    );

    if (existingUser) {
      throw new ConflictException('Username is already taken');
    }

    const user = await this.usersService.create(
      registerDto.username,
      registerDto.password,
    );

    const payload = { sub: user.id, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }
}
