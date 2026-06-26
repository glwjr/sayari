import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post as HttpPost,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './post.entity';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @HttpPost()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body(ValidationPipe) createPostDto: CreatePostDto,
  ): Promise<Post> {
    return this.postsService.create(createPostDto);
  }

  @Public()
  @Get()
  async getAllPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: string,
  ): Promise<Post[]> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    if (userId) {
      return this.postsService.findByUserId({
        userId,
        options: { page: pageNumber, limit: limitNumber },
      });
    }

    return this.postsService.findAll({
      page: pageNumber,
      limit: limitNumber,
    });
  }

  @Public()
  @Get('hot')
  async getHotPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Post[]> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    return this.postsService.findHotPosts({
      page: pageNumber,
      limit: limitNumber,
    });
  }

  @Public()
  @Get(':id')
  async getPostById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Post | null> {
    return this.postsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    const userId = req.user.id;

    return this.postsService.delete({ id, userId });
  }
}
