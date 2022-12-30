import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PostsRepositories } from "../posts/infrastructure/posts-repositories";
import { Post, PostSchema } from "../posts/domain/post-schema-Model";
import { PostsQueryRepositories } from "../posts/infrastructure/query-repositories/posts-query.reposit";
import {
  LikesPostsStatus,
  LikesPostsStatusSchema
} from "../posts/domain/likesPost-schema-Model";
import { JwtService } from "../auth/application/jwt.service";
import { CreateBlogHandler } from "./application/use-cases/handlers/create-blog-handler";
import { CqrsModule } from "@nestjs/cqrs";
import { DeleteBlogHandler } from "./application/use-cases/handlers/delete-blog-handler";
import { UpdateBlogHandler } from "./application/use-cases/handlers/update-blog-handler";
import { CreatePostHandler } from "./application/use-cases/handlers/create-post-handler";
import { BloggersController } from "./api/bloggers.controller";
import { BloggersService } from "./domain/bloggers.service";
import { JwtAuthGuard } from "../../guards/jwt-auth-bearer.guard";
import { BlogsRepositories } from "../blogs/infrastructure/blogs.repositories";
import { BlogsQueryRepositories } from "../blogs/infrastructure/query-repository/blogs-query.repositories";
import { Blog, BlogSchema } from "./domain/blog-schema-Model";
import { Comment, CommentSchema } from "../comments/domain/comments-schema-Model";
import { LikesStatus, LikesStatusSchema } from "../comments/domain/likesStatus-schema-Model";
import { DeletePostHandler } from "./application/use-cases/handlers/delete-post-handler";
import { UpdatePostHandler } from "./application/use-cases/handlers/update-post-handler";
import { UsersQueryRepositories } from "../users/infrastructure/query-reposirory/users-query.reposit";
import { User, UserSchema } from "../users/domain/users-schema-Model";
import { BlogBanInfo, BlogBanInfoSchema } from "./domain/ban-user-for-current-blog-schema-Model";
import {
  UpdateBanUserForCurrentBlogHandler
} from "./application/use-cases/handlers/update-ban-user-for-current-blog-handler";
import { UsersRepositories } from "../users/infrastructure/users-repositories";
import { BlogsSqlRepositories } from "../blogs/infrastructure/blogs-sql.repositories";
import { BlogsSqlQueryRepositories } from "../blogs/infrastructure/query-repository/blogs-sql-query.repositories";
import { UsersSqlRepositories } from "../users/infrastructure/users-sql-repositories";
import { PostsSqlRepositories } from "../posts/infrastructure/posts-sql-repositories";
import { PostsSqlQueryRepositories } from "../posts/infrastructure/query-repositories/posts-sql-query.reposit";
import { UsersSqlQueryRepositories } from "../users/infrastructure/query-reposirory/users-sql-query.reposit";
import { BlogUuidIdValidator } from "../../validators/is-uuid-id-validator.service";

const handlers = [
  CreateBlogHandler,
  DeleteBlogHandler,
  UpdateBlogHandler,
  CreatePostHandler,
  DeletePostHandler,
  UpdatePostHandler,
  UpdateBanUserForCurrentBlogHandler
];
const adapters = [
  BlogsRepositories,
  BlogsSqlRepositories,
  BlogsQueryRepositories,
  BlogsSqlQueryRepositories,
  PostsRepositories,
  PostsSqlRepositories,
  PostsQueryRepositories,
  PostsSqlQueryRepositories,
  UsersRepositories,
  UsersSqlRepositories,
  UsersQueryRepositories,
  UsersSqlQueryRepositories,
  JwtService
];
const guards = [JwtAuthGuard];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: LikesStatus.name, schema: LikesStatusSchema },
      { name: LikesPostsStatus.name, schema: LikesPostsStatusSchema },
      { name: User.name, schema: UserSchema },
      //{ name: UserBanInfo.name, schema: UserBanInfoSchema },
      { name: BlogBanInfo.name, schema: BlogBanInfoSchema }
    ]),
    CqrsModule
  ],
  controllers: [BloggersController],
  providers: [BloggersService, ...guards, ...handlers, ...adapters, BlogUuidIdValidator]
})
export class BloggerModule {
}
