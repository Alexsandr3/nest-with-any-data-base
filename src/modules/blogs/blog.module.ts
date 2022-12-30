import { Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../blogger/domain/blog-schema-Model';
import { BlogsQueryRepositories } from './infrastructure/query-repository/blogs-query.repositories';
import { Post, PostSchema } from '../posts/domain/post-schema-Model';
import { PostsQueryRepositories } from '../posts/infrastructure/query-repositories/posts-query.reposit';
import {
  LikesPostsStatus,
  LikesPostsStatusSchema,
} from '../posts/domain/likesPost-schema-Model';
import { BasicStrategy } from '../../strategies/basic.strategy';
import { JwtForGetGuard } from '../../guards/jwt-auth-bearer-for-get.guard';
import { JwtService } from '../auth/application/jwt.service';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsService } from './domain/blogs.service';
import {
  Comment,
  CommentSchema,
} from '../comments/domain/comments-schema-Model';
import {
  LikesStatus,
  LikesStatusSchema,
} from '../comments/domain/likesStatus-schema-Model';
import { BlogBanInfo, BlogBanInfoSchema } from "../blogger/domain/ban-user-for-current-blog-schema-Model";
import { BlogsSqlQueryRepositories } from "./infrastructure/query-repository/blogs-sql-query.repositories";
import { PostsSqlQueryRepositories } from "../posts/infrastructure/query-repositories/posts-sql-query.reposit";

const handlers = [];
const adapters = [BlogsQueryRepositories, BlogsSqlQueryRepositories, PostsQueryRepositories, PostsSqlQueryRepositories, JwtService];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: LikesStatus.name, schema: LikesStatusSchema },
      { name: LikesPostsStatus.name, schema: LikesPostsStatusSchema },
      { name: BlogBanInfo.name, schema: BlogBanInfoSchema },
    ]),
    CqrsModule,
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BasicStrategy,
    JwtForGetGuard,
    ...handlers,
    ...adapters,
  ],
})
export class BlogModule {}
