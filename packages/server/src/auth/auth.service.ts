import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { compareHash } from './auth.util';

interface AuthResponse {
  access_token: string;
}

interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user || !(await compareHash(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user.id, user.username);
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

    return this.generateAuthResponse(user.id, user.username);
  }

  private async generateAuthResponse(
    userId: string,
    username: string,
  ): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: userId,
      username,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
