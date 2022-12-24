import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogDocument, Blog } from "../../blogger/domain/blog-schema-Model";
import { PreparationBlogForDB } from "../../blogger/domain/blog-preparation-for-DB";
import { BlogsDBType } from "../../blogger/domain/blog-DB-Type";
import { UpdateBlogDto } from "../../blogger/api/input-dtos/update-Blog-Dto-Model";
import { BlogBanInfo, BlogBanInfoDocument } from "../../blogger/domain/ban-user-for-current-blog-schema-Model";
import { BanUserForBlogPreparationForDB } from "../../blogger/domain/ban-user-for-blog-preparation-for-DB";

@Injectable()
export class BlogsRepositories {
  constructor(
    @InjectModel(Blog.name) private readonly blogsModel: Model<BlogDocument>,
    @InjectModel(BlogBanInfo.name) private readonly blogBanInfoModel: Model<BlogBanInfoDocument>
  ) {
  }

  async createBlog(newBlog: PreparationBlogForDB): Promise<string> {
    const smartBlog = new this.blogsModel(newBlog);
    const blog = await smartBlog.save();
    return blog.id;
  }

  async deleteBlog(id: string, userId: string): Promise<boolean> {
    const result = await this.blogsModel
      .deleteOne({ id, userId: userId })
      .exec();
    return result.deletedCount === 1;
  }

  async updateBlog(id: string, userId: string, data: UpdateBlogDto): Promise<boolean> {
    const result = await this.blogsModel.updateOne(
      { id, userId: userId },
      {
        $set: {
          name: data.name,
          description: data.description,
          websiteUrl: data.websiteUrl
        }
      }
    );
    return result.matchedCount === 1;
  }

  async findBlog(id: string): Promise<BlogsDBType> {
    const blog = await this.blogsModel.findOne({ _id: new Object(id) });
    if (!blog) return null;
    return blog;
  }

  async updateOwnerBlog(id: string, userId: string): Promise<boolean> {
    const result = await this.blogsModel.updateOne(
      { id },
      { $set: { userId: userId } }
    );
    return result.matchedCount === 1;
  }

  async updateBanStatusForBlog(blogId: string, isBanned: boolean): Promise<boolean> {
    const result = await this.blogsModel.updateOne({ _id: new Object(blogId) }, {
      $set: {
        isBanned,
        banDate: new Date().toISOString()
      }
    });
    return result.matchedCount === 1;
  }

  async createBanStatus(banStatus: BanUserForBlogPreparationForDB) {
    const smartBanStatus = new this.blogBanInfoModel(banStatus);
    const banStatusInfo = await smartBanStatus.save();
    return banStatusInfo.id;
  }

  async updateBanStatus(banStatus: BanUserForBlogPreparationForDB): Promise<boolean> {
    const { blogId, isBanned, banReason, banDate, userId, login, ownerId, email, createdAt } = banStatus;
    const result = await this.blogBanInfoModel.updateOne(
      { blogId, userId },
      { $set: { isBanned, banReason, banDate, login, ownerId, email, createdAt } }
    );
    return result.matchedCount === 1;
  }

  async findStatusBan(userId: string, blogId: string): Promise<BlogBanInfoDocument> {
    const statusBan = await this.blogBanInfoModel.findOne({ blogId, userId });
    if (!statusBan) return null;
    return statusBan;
  }
}
