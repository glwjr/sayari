import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { compareHash } from './auth.util';

interface JwtPayload {
  id: string;
  username: string;
  createdAt: Date;
  role: string;
}

export interface AuthResponse {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByUsernameWithPassword(
      loginDto.username,
    );

    if (!user || !(await compareHash(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
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

    return this.generateAuthResponse(user);
  }

  private async generateAuthResponse(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
