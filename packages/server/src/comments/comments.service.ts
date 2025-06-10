import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from 'src/users/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from 'src/posts/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { content, userId, postId } = createCommentDto;

    const user = await this.usersRepository.exists({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const comment = this.commentsRepository.create({
      content,
      user: { id: userId } as User,
      post: { id: postId } as Post,
    });

    return this.commentsRepository.save(comment);
  }

  async findById(id: string): Promise<Comment | null> {
    return this.commentsRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          username: true,
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: {
        user: { id: userId },
      },
    });
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: {
        post: { id: postId },
      },
      // relations: ['user'],
      // select: {
      //   user: {
      //     id: true,
      //     username: true,
      //   },
      // },
    });
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    Object.assign(comment, updateCommentDto);

    return await this.commentsRepository.save(comment);
  }

  async delete(id: string): Promise<void> {
    await this.commentsRepository.delete(id);
  }
}
