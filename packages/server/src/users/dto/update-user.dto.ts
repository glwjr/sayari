import { IsString, IsOptional } from 'class-validator';
import { UserRole } from '../user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  role?: UserRole;
}
