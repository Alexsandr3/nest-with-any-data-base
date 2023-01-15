import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../blogger/domain/mongo-schemas/blog-schema-Model';
import { Post, PostSchema } from '../posts/domain/mongo-schemas/post-schema-Model';
import { User, UserSchema } from '../users/domain/mongo-schemas/users-schema-Model';
import { TestingController } from './testins.controller';
import {
  Comment,
  CommentSchema,
} from '../comments/domain/mongo-schemas/comments-schema-Model';
import { TestingService } from './testing.service';
import { Device, DeviceSchema } from '../security/domain/mongo-schemas/device-schema-Model';
import {
  LikesStatus,
  LikesStatusSchema,
} from '../comments/domain/mongo-schemas/likesStatus-schema-Model';
import {
  LikesPostsStatus,
  LikesPostsStatusSchema,
} from '../posts/domain/mongo-schemas/likesPost-schema-Model';
import { BlogBanInfo, BlogBanInfoSchema } from "../blogger/domain/mongo-schemas/ban-user-for-current-blog-schema-Model";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usser } from "../../entities/user.entity";
import { EmailConfirmation } from "../../entities/emailConfirmation.entity";
import { EmailRecovery } from "../../entities/emailRecovery.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: LikesStatus.name, schema: LikesStatusSchema },
      { name: LikesPostsStatus.name, schema: LikesPostsStatusSchema },
      { name: BlogBanInfo.name, schema: BlogBanInfoSchema },
    ]),
    TypeOrmModule.forFeature([Usser, EmailConfirmation, EmailRecovery, Device]),
  ],

  controllers: [TestingController],
  providers: [TestingService],
})
export class TestingModule {}
