import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post as HttpPost,
  ValidationPipe,
} from '@nestjs/common';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @HttpPost()
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Body(ValidationPipe) createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentsService.create(createCommentDto);
  }

  @Public()
  @Get()
  async getCommentsByPostId(
    @Param('postId', ParseUUIDPipe) postId: string,
  ): Promise<Comment[]> {
    return this.commentsService.findByPostId(postId);
  }
}
