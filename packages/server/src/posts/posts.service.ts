import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { User, UserRole } from 'src/users/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationDto } from './dto/pagination.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const { title, content, userId } = createPostDto;

    const user = await this.usersRepository.exists({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const post = this.postsRepository.create({
      title,
      content,
      user: { id: userId } as User,
    });

    return this.postsRepository.save(post);
  }

  async findAll(options: PaginationDto): Promise<Post[]> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoin('post.comments', 'comment')
      .addSelect(['user.id', 'user.username'])
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .orderBy('post.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return posts;
  }

  async findById(id: string): Promise<Post | null> {
    return this.postsRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'comments.user'],
      order: {
        comments: {
          createdAt: 'DESC',
        },
      },
    });
  }

  async findByUserId({
    userId,
    options,
  }: {
    userId: string;
    options: PaginationDto;
  }): Promise<Post[]> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const posts = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoin('post.comments', 'comment')
      .addSelect(['user.id', 'user.username'])
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .where('user.id = :userId', { userId })
      .orderBy('post.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    return posts;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findById(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    Object.assign(post, updatePostDto);

    return await this.postsRepository.save(post);
  }

  async delete({ id, userId }: { id: string; userId: string }): Promise<void> {
    const post = await this.findById(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user || (post.user.id !== userId && user.role !== UserRole.ADMIN)) {
      throw new NotFoundException(
        `You do not have permission to delete this post`,
      );
    }

    await this.postsRepository.delete(id);
  }
}
