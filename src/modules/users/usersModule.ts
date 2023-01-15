import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "./api/users.controller";
import { User, UserSchema } from "./domain/mongo-schemas/users-schema-Model";
import { UsersRepositories } from "./infrastructure/users-repositories";
import { UsersService } from "./domain/users.service";
import { JwtService } from "../auth/application/jwt.service";
import { MailService } from "../mail/mail.service";
import { Device, DeviceSchema } from "../security/domain/mongo-schemas/device-schema-Model";
import { MailModule } from "../mail/mail.module";
import { BasicAuthGuard } from "../../guards/basic-auth.guard";
import { CreateUserHandler } from "./application/use-cases/handlers/create-user-handler";
import { CqrsModule } from "@nestjs/cqrs";
import { UpdateBanInfoHandler } from "./application/use-cases/handlers/update-ban-info-handler";
import { Post, PostSchema } from "../posts/domain/mongo-schemas/post-schema-Model";
import { LikesPostsStatus, LikesPostsStatusSchema } from "../posts/domain/mongo-schemas/likesPost-schema-Model";
import { PostsRepositories } from "../posts/infrastructure/posts-repositories";
import { CommentsRepositories } from "../comments/infrastructure/comments.repositories";
import { Comment, CommentSchema } from "../comments/domain/mongo-schemas/comments-schema-Model";
import { LikesStatus, LikesStatusSchema } from "../comments/domain/mongo-schemas/likesStatus-schema-Model";
import { DeleteUserHandler } from "./application/use-cases/handlers/delete-user-handler";
import { CreateUserSaHandler } from "./application/use-cases/handlers/create-user-sa-handler";
import { UserQueryRepository } from "./interfaces/IUserQueryRepository";
import { UserRepository } from "./interfaces/IUserRepository";
import { PostRepository } from "../posts/interfaces/IPostRepository";
import { CommentRepository } from "../comments/interfaces/ICommentRepository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailRecovery } from "../../entities/emailRecovery.entity";
import { EmailConfirmation } from "../../entities/emailConfirmation.entity";
import { Usser } from "../../entities/user.entity";
import { PostT } from "../../entities/post.entity";
import { CommentT } from "../../entities/comment.entity";
import { LikePost } from "../../entities/likePost.entity";
import { LikeComment } from "../../entities/likeComment.entity";

const handlers = [CreateUserHandler, CreateUserSaHandler, DeleteUserHandler, UpdateBanInfoHandler];

const adapters = [
  JwtService,
  MailService,
  // UserTypeOrmRepositories, //typeOrm
  // UsersTypeOrmQueryRepository, //typeOrm
  PostRepository(),
  CommentRepository(),
  UserRepository(),
  UserQueryRepository(),
  PostsRepositories, // Mongo
  CommentsRepositories, // Mongo
  UsersRepositories // Mongo
  // UsersQueryRepositories, // Mongo
  // PostsSqlRepositories, // Sql
  // CommentsSqlRepositories, // Sql
  // UsersSqlRepositories, // Sql
  // UsersSqlQueryRepositories // Sql
];
const guards = [BasicAuthGuard];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: LikesStatus.name, schema: LikesStatusSchema },
      { name: LikesPostsStatus.name, schema: LikesPostsStatusSchema }
    ]),
    TypeOrmModule.forFeature([Usser, EmailConfirmation, EmailRecovery, Device, PostT, CommentT, LikePost, LikeComment]),
    MailModule,
    CqrsModule
  ],

  controllers: [UsersController],
  providers: [UsersService, ...guards, ...adapters, ...handlers]
})
export class UsersModule {
}
