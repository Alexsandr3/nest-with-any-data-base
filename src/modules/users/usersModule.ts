import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './api/users.controller';
import { User, UserSchema } from './domain/users-schema-Model';
import { UsersRepositories } from './infrastructure/users-repositories';
import { UsersQueryRepositories } from './infrastructure/query-reposirory/users-query.reposit';
import { UsersService } from './domain/users.service';
import { JwtService } from '../auth/application/jwt.service';
import { DeviceRepositories } from '../security/infrastructure/device-repositories';
import { MailService } from '../mail/mail.service';
import { Device, DeviceSchema } from '../security/domain/device-schema-Model';
import { MailModule } from '../mail/mail.module';
import { BasicAuthGuard } from '../../guards/basic-auth.guard';
import { CreateUserHandler } from './application/use-cases/handlers/create-user-handler';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateBanInfoHandler } from './application/use-cases/handlers/update-ban-info-handler';
import { Post, PostSchema } from '../posts/domain/post-schema-Model';
import {
  LikesPostsStatus,
  LikesPostsStatusSchema,
} from '../posts/domain/likesPost-schema-Model';
import { PostsRepositories } from '../posts/infrastructure/posts-repositories';
import { CommentsRepositories } from '../comments/infrastructure/comments.repositories';
import {
  Comment,
  CommentSchema,
} from '../comments/domain/comments-schema-Model';
import {
  LikesStatus,
  LikesStatusSchema,
} from '../comments/domain/likesStatus-schema-Model';
import { DeleteUserHandler } from './application/use-cases/handlers/delete-user-handler';

const handlers = [CreateUserHandler, DeleteUserHandler, UpdateBanInfoHandler];
const adapters = [
  JwtService,
  MailService,
  UsersRepositories,
  PostsRepositories,
  UsersQueryRepositories,
  DeviceRepositories,
  CommentsRepositories,
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
      { name: Post.name, schema: PostSchema },
      { name: LikesPostsStatus.name, schema: LikesPostsStatusSchema },
    ]),
    MailModule,
    CqrsModule,
  ],

  controllers: [UsersController],
  providers: [UsersService, ...guards, ...adapters, ...handlers],
})
export class UsersModule {}
