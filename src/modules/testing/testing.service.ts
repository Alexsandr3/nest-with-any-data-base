import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../blogger/domain/blog-schema-Model';
import { Model } from 'mongoose';
import {
  Comment,
  CommentDocument,
} from '../comments/domain/comments-schema-Model';
import { Post, PostDocument } from '../posts/domain/post-schema-Model';
import { User, UserDocument } from '../users/domain/users-schema-Model';
import { Device, DeviceDocument } from '../security/domain/device-schema-Model';
import {
  LikesPostsStatus,
  LikesPostsStatusDocument,
} from '../posts/domain/likesPost-schema-Model';
import {
  LikesStatus,
  LikesStatusDocument,
} from '../comments/domain/likesStatus-schema-Model';
import { BlogBanInfo, BlogBanInfoDocument } from "../blogger/domain/ban-user-for-current-blog-schema-Model";

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Blog.name) private readonly blogsModel: Model<BlogDocument>,
    @InjectModel(Comment.name)
    private readonly commentsModel: Model<CommentDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Device.name)
    private readonly deviceModel: Model<DeviceDocument>,
    @InjectModel(LikesStatus.name)
    private readonly likesStatusModel: Model<LikesStatusDocument>,
    @InjectModel(LikesPostsStatus.name)
    private readonly likesPostsStatusModel: Model<LikesPostsStatusDocument>,
    @InjectModel(BlogBanInfo.name) private readonly blogBanInfoModel: Model<BlogBanInfoDocument>
  ) {}
  async deleteAll() {
    await this.blogsModel.deleteMany();
    await this.postModel.deleteMany();
    await this.userModel.deleteMany();
    await this.commentsModel.deleteMany();
    await this.deviceModel.deleteMany();
    await this.likesStatusModel.deleteMany();
    await this.likesPostsStatusModel.deleteMany();
    await this.blogBanInfoModel.deleteMany();
    return;
  }
}
