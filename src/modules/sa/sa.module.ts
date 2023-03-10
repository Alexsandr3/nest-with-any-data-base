import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CqrsModule } from "@nestjs/cqrs";
import { SaController } from "./api/sa.controller";
import { SaService } from "./domain/sa.service";
import { BasicAuthGuard } from "../../guards/basic-auth.guard";
import { BlogsQueryRepositories } from "../blogs/infrastructure/query-repository/blogs-query.repositories";
import { Blog, BlogSchema } from "../blogger/domain/mongo-schemas/blog-schema-Model";
import { BindBlogHandler } from "./application/use-cases/handlers/bind-blog-handler";
import { BlogsRepositories } from "../blogs/infrastructure/blogs.repositories";
import { BlogBanInfo, BlogBanInfoSchema } from "../blogger/domain/mongo-schemas/ban-user-for-current-blog-schema-Model";
import { UpdateBanInfoForBlogHandler } from "./application/use-cases/handlers/update-ban-info-for-blog-handler";
import { Post, PostSchema } from "../posts/domain/mongo-schemas/post-schema-Model";
import { LikesPostsStatus, LikesPostsStatusSchema } from "../posts/domain/mongo-schemas/likesPost-schema-Model";
import { PostsRepositories } from "../posts/infrastructure/posts-repositories";
import { BlogRepository } from "../blogs/interfaces/IBlogRepository";
import { BlogQueryRepository } from "../blogs/interfaces/IBlogQueryRepository";
import { PostRepository } from "../posts/interfaces/IPostRepository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlogT } from "../../entities/blog.entity";
import { PostT } from "../../entities/post.entity";
import { LikePost } from "../../entities/likePost.entity";
import { BannedBlogUser } from "../../entities/bannedBlogUser.entity";
import { Usser } from "../../entities/user.entity";

const handlers = [BindBlogHandler, UpdateBanInfoForBlogHandler];
const adapters = [
  BlogRepository(),
  BlogQueryRepository(),
  PostRepository(),
  BlogsRepositories, // mongo
  BlogsQueryRepositories, // mongo
  PostsRepositories, // mongo
  // BlogsSqlRepositories, // sql
  // BlogsSqlQueryRepositories, // sql
  // PostsSqlRepositories // sql
];
const guards = [BasicAuthGuard];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: BlogBanInfo.name, schema: BlogBanInfoSchema },
      { name: Post.name, schema: PostSchema },
      { name: LikesPostsStatus.name, schema: LikesPostsStatusSchema }
    ]),
    TypeOrmModule.forFeature([BlogT, Usser, PostT, LikePost, BannedBlogUser]),
    CqrsModule
  ],
  controllers: [SaController],
  providers: [SaService, ...guards, ...handlers, ...adapters]
})
export class SaModule {
}
