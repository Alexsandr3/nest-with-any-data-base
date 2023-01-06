import { Module } from '@nestjs/common';
import { PostsService } from './domain/posts.service';
import { PostsRepositories } from './infrastructure/posts-repositories';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './domain/mongo-schemas/post-schema-Model';
import { PostsController } from './api/posts.controller';
import { PostsQueryRepositories } from './infrastructure/query-repositories/posts-query.reposit';
import {
  LikesPostsStatus,
  LikesPostsStatusSchema,
} from './domain/mongo-schemas/likesPost-schema-Model';
import { BlogsQueryRepositories } from '../blogs/infrastructure/query-repository/blogs-query.repositories';
import { Blog, BlogSchema } from '../blogger/domain/mongo-schemas/blog-schema-Model';
import {
  Comment,
  CommentSchema,
} from '../comments/domain/mongo-schemas/comments-schema-Model';
import { JwtAuthGuard } from '../../guards/jwt-auth-bearer.guard';
import { CommentsRepositories } from '../comments/infrastructure/comments.repositories';
import {
  LikesStatus,
  LikesStatusSchema,
} from '../comments/domain/mongo-schemas/likesStatus-schema-Model';
import { User, UserSchema } from '../users/domain/mongo-schemas/users-schema-Model';
import { JwtService } from '../auth/application/jwt.service';
import { BasicAuthGuard } from '../../guards/basic-auth.guard';
import { JwtForGetGuard } from '../../guards/jwt-auth-bearer-for-get.guard';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateCommentHandler } from './application/use-cases/handlers/create-comment-handler';
import { UpdateLikeStatusHandler } from './application/use-cases/handlers/update-like-status-handler';
import { BlogBanInfo, BlogBanInfoSchema } from "../blogger/domain/mongo-schemas/ban-user-for-current-blog-schema-Model";
import { BlogsRepositories } from "../blogs/infrastructure/blogs.repositories";
import { PostRepository } from "./interfaces/IPostRepository";
import { PostQueryRepository } from "./interfaces/IPostQueryRepository";
import { BlogRepository } from "../blogs/interfaces/IBlogRepository";
import { CommentRepository } from "../comments/interfaces/ICommentRepository";
import { UserQueryRepository } from "../users/interfaces/IUserQueryRepository";

const handlers = [CreateCommentHandler, UpdateLikeStatusHandler];
const adapters = [
  BlogRepository(),
  PostRepository(),
  CommentRepository(),
  PostQueryRepository(),
  UserQueryRepository(),
  BlogsRepositories, // mongo
  BlogsQueryRepositories, // mongo
  PostsRepositories, // mongo
  PostsQueryRepositories, // mongo
  CommentsRepositories, // mongo
  // PostsSqlRepositories, // sql
  // PostsSqlQueryRepositories, // sql
  // BlogsSqlRepositories, // sql
  // CommentsSqlRepositories, // sql
  // UsersSqlQueryRepositories, // sql
  JwtService,
];
const guards = [JwtAuthGuard, BasicAuthGuard, JwtForGetGuard];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: LikesPostsStatus.name, schema: LikesPostsStatusSchema },
      { name: LikesStatus.name, schema: LikesStatusSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
      { name: BlogBanInfo.name, schema: BlogBanInfoSchema },
    ]),
    CqrsModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    ...guards,
    ...adapters,
    ...handlers,
  ],
})
export class PostModule {}
