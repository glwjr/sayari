import { IsNotEmpty, IsString } from 'class-validator';

export class SignInUpDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
