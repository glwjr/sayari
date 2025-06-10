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
  Delete,
  Request,
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
  async create(
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

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    const id = commentId;
    const userId = req.user.id;
    return this.commentsService.delete({ id, userId });
  }
}
