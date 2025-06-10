import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsNotEmpty()
  @IsUUID()
  postId: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
