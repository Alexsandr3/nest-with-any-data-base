import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PostsRepositories } from "../posts/infrastructure/posts-repositories";
import { Post, PostSchema } from "../posts/domain/mongo-schemas/post-schema-Model";
import { PostsQueryRepositories } from "../posts/infrastructure/query-repositories/posts-query.reposit";
import {
  LikesPostsStatus,
  LikesPostsStatusSchema
} from "../posts/domain/mongo-schemas/likesPost-schema-Model";
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
import { Blog, BlogSchema } from "./domain/mongo-schemas/blog-schema-Model";
import { Comment, CommentSchema } from "../comments/domain/mongo-schemas/comments-schema-Model";
import { LikesStatus, LikesStatusSchema } from "../comments/domain/mongo-schemas/likesStatus-schema-Model";
import { DeletePostHandler } from "./application/use-cases/handlers/delete-post-handler";
import { UpdatePostHandler } from "./application/use-cases/handlers/update-post-handler";
import { UsersQueryRepositories } from "../users/infrastructure/query-reposirory/users-query.reposit";
import { User, UserSchema } from "../users/domain/mongo-schemas/users-schema-Model";
import { BlogBanInfo, BlogBanInfoSchema } from "./domain/mongo-schemas/ban-user-for-current-blog-schema-Model";
import {
  UpdateBanUserForCurrentBlogHandler
} from "./application/use-cases/handlers/update-ban-user-for-current-blog-handler";
import { UsersRepositories } from "../users/infrastructure/users-repositories";
import { BlogUuidIdValidator } from "../../validators/is-uuid-id-validator.service";
import { BlogQueryRepository } from "../blogs/interfaces/IBlogQueryRepository";
import { BlogRepository } from "../blogs/interfaces/IBlogRepository";
import { PostQueryRepository } from "../posts/interfaces/IPostQueryRepository";
import { UserRepository } from "../users/interfaces/IUserRepository";
import { UserQueryRepository } from "../users/interfaces/IUserQueryRepository";
import { PostRepository } from "../posts/interfaces/IPostRepository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usser } from "../../entities/user.entity";
import { EmailConfirmation } from "../../entities/emailConfirmation.entity";
import { EmailRecovery } from "../../entities/emailRecovery.entity";
import { PostT } from "../../entities/post.entity";
import { CommentT } from "../../entities/comment.entity";
import { LikePost } from "../../entities/likePost.entity";
import { BlogT } from "../../entities/blog.entity";
import { BannedBlogUser } from "../../entities/bannedBlogUser.entity";
import { LikeComment } from "../../entities/likeComment.entity";

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
  BlogRepository(),
  BlogQueryRepository(),
  PostRepository(),
  PostQueryRepository(),
  UserRepository(),
  UserQueryRepository(),
  // BlogsSqlRepositories, // Sql
  // BlogsSqlQueryRepositories,// Sql
  // PostsSqlRepositories,// Sql
  // PostsSqlQueryRepositories,// Sql
  // UsersSqlRepositories,// Sql
  // UsersSqlQueryRepositories,// Sql
  BlogsRepositories, // Mongo
  BlogsQueryRepositories, // Mongo
  PostsRepositories, // Mongo
  PostsQueryRepositories, // Mongo
  UsersRepositories, // Mongo
  UsersQueryRepositories, // Mongo
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
      { name: BlogBanInfo.name, schema: BlogBanInfoSchema }
    ]),
    TypeOrmModule.forFeature([Usser, EmailConfirmation, EmailRecovery, BlogT, PostT, CommentT, LikePost, LikeComment, BannedBlogUser]),
    CqrsModule
  ],
  controllers: [BloggersController],
  providers: [BloggersService, ...guards, ...handlers, ...adapters, BlogUuidIdValidator]
})
export class BloggerModule {
}
