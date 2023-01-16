import { Module } from "@nestjs/common";
import { BlogsController } from "./api/blogs.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Blog, BlogSchema } from "../blogger/domain/mongo-schemas/blog-schema-Model";
import { BlogsQueryRepositories } from "./infrastructure/query-repository/blogs-query.repositories";
import { Post, PostSchema } from "../posts/domain/mongo-schemas/post-schema-Model";
import { PostsQueryRepositories } from "../posts/infrastructure/query-repositories/posts-query.reposit";
import {
  LikesPostsStatus,
  LikesPostsStatusSchema
} from "../posts/domain/mongo-schemas/likesPost-schema-Model";
import { BasicStrategy } from "../../strategies/basic.strategy";
import { JwtForGetGuard } from "../../guards/jwt-auth-bearer-for-get.guard";
import { JwtService } from "../auth/application/jwt.service";
import { CqrsModule } from "@nestjs/cqrs";
import { BlogsService } from "./domain/blogs.service";
import {
  Comment,
  CommentSchema
} from "../comments/domain/mongo-schemas/comments-schema-Model";
import {
  LikesStatus,
  LikesStatusSchema
} from "../comments/domain/mongo-schemas/likesStatus-schema-Model";
import { BlogBanInfo, BlogBanInfoSchema } from "../blogger/domain/mongo-schemas/ban-user-for-current-blog-schema-Model";
import { PostQueryRepository } from "../posts/interfaces/IPostQueryRepository";
import { BlogQueryRepository } from "./interfaces/IBlogQueryRepository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogT } from "../../entities/blog.entity";
import { PostT } from "../../entities/post.entity";
import { CommentT } from "../../entities/comment.entity";
import { LikePost } from "../../entities/likePost.entity";
import { LikeComment } from "../../entities/likeComment.entity";
import { BannedBlogUser } from "../../entities/bannedBlogUser.entity";

const handlers = [];
const adapters = [
  BlogQueryRepository(),
  PostQueryRepository(),
  BlogsQueryRepositories, // mongo
  PostsQueryRepositories, // mongo
  // BlogsSqlQueryRepositories, // sql
  // PostsSqlQueryRepositories, // sql
  JwtService
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: LikesStatus.name, schema: LikesStatusSchema },
      { name: LikesPostsStatus.name, schema: LikesPostsStatusSchema },
      { name: BlogBanInfo.name, schema: BlogBanInfoSchema }
    ]),
    TypeOrmModule.forFeature([BlogT, PostT, CommentT, LikePost, LikeComment, BannedBlogUser]),
    CqrsModule
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BasicStrategy,
    JwtForGetGuard,
    ...handlers,
    ...adapters
  ]
})
export class BlogModule {
}
