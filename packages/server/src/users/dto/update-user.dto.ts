import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { UserRole } from '../user.entity';

export class UpdateUserDto {
  userId?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  role?: UserRole;
}
