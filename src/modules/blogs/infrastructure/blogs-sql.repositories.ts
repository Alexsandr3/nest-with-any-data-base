import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogDocument, Blog } from "../../blogger/domain/blog-schema-Model";
import { PreparationBlogForDB } from "../../blogger/domain/blog-preparation-for-DB";
import { UpdateBlogDto } from "../../blogger/api/input-dtos/update-Blog-Dto-Model";
import { BlogBanInfo, BlogBanInfoDocument } from "../../blogger/domain/ban-user-for-current-blog-schema-Model";
import { BanUserForBlogPreparationForDB } from "../../blogger/domain/ban-user-for-blog-preparation-for-DB";
import { DataSource } from "typeorm";
import { BlogDBSQLType } from "../../blogger/domain/blog-DB-SQL-Type";

@Injectable()
export class BlogsSqlRepositories {
  constructor(
    @InjectModel(Blog.name) private readonly blogsModel: Model<BlogDocument>,
    private readonly dataSource: DataSource,
    @InjectModel(BlogBanInfo.name) private readonly blogBanInfoModel: Model<BlogBanInfoDocument>
  ) {
  }

  async createBlog(newBlog: PreparationBlogForDB): Promise<string> {
    const { createdAt, userId, userLogin, websiteUrl, name, description } = newBlog;
    const query = `
        INSERT INTO blogs ("userId", "userLogin", "name", "description", "websiteUrl", "createdAt")
        VALUES ('${userId}', '${userLogin}', '${name}', '${description}',
                '${websiteUrl}', '${createdAt}') RETURNING "blogId"
    `;
    const blog = await this.dataSource.query(query);
    const { blogId } = blog[0];
    return blogId;
  }

  async deleteBlog(id: string, userId: string): Promise<boolean> {
    const query = `
        DELETE
        FROM blogs
        WHERE "blogId" = '${id}'
          AND "userId" = '${userId}'
    `;
    await this.dataSource.query(query);
    //if (res[1] === 0) throw new Error(`not today`);
    return true;
  }

  async updateBlog(id: string, userId: string, data: UpdateBlogDto): Promise<boolean> {
    const { name, description, websiteUrl } = data;
    const query = `
        UPDATE blogs
        SET "name"        = '${name}',
            "description" = '${description}',
            "websiteUrl"  = '${websiteUrl}'
        WHERE "blogId" = '${id}'
          AND "userId" = '${userId}'
    `;
    await this.dataSource.query(query);
    return true;
  }

  async findBlog(id: string): Promise<BlogDBSQLType> {
    const query = `
        SELECT *
        FROM blogs
        WHERE "blogId" = '${id}'
    `;
    const blog = await this.dataSource.query(query);
    return blog[0];
  }

  async updateOwnerBlog(id: string, userId: string): Promise<boolean> {
    const query = `
        UPDATE blogs
        SET "userId" = '${userId}'
        WHERE "blogId" = '${id}'
    `;
    await this.dataSource.query(query);
    return true;
    // const result = await this.blogsModel.updateOne(
    //   { id },
    //   { $set: { userId: userId } }
    // );
    // return result.matchedCount === 1;
  }

  async updateBanStatusForBlog(blogId: string, isBanned: boolean): Promise<boolean> {
    const query = `
        UPDATE blogs
        SET "isBanned" = ${isBanned},
            "banDate"  = '${new Date().toISOString()}'
        WHERE "blogId" = '${blogId}'
    `;

    await this.dataSource.query(query);
    //
    // const result = await this.blogsModel.updateOne({ _id: new Object(blogId) }, {
    //   $set: {
    //     isBanned,
    //     banDate: new Date().toISOString()
    //   }
    // });
    // return result.matchedCount === 1;
    return true;
  }

  async createBanStatus(banStatus: BanUserForBlogPreparationForDB) {
    const { blogId, userId, createdAt, ownerId, email, login } = banStatus;
    const query = `
        INSERT INTO banned_blog_users ("ownerId", "userId", "login", "email", "createdAt", "blogId")
        VALUES ('${ownerId}', '${userId}', '${login}', '${email}', '${createdAt}', '${blogId}') RETURNING id;
    `;
    const banStatusInfo = await this.dataSource.query(query);
    const { id } = banStatusInfo[0];
    return id;
  }

  async updateBanStatus(banStatus: BanUserForBlogPreparationForDB): Promise<boolean> {
    const { blogId, isBanned, banReason, banDate, userId, login, ownerId, email, createdAt } = banStatus;
    const query = `
        UPDATE banned_blog_users
        SET "isBanned"  = '${isBanned}',
            "banReason" = '${banReason}',
            "banDate"   = '${banDate}',
            "login"     = '${login}',
            "ownerId"   = '${ownerId}',
            "email"     = '${email}',
            "createdAt" = '${createdAt}'
        WHERE "blogId" = '${blogId}'
          AND "userId" = '${userId}'
    `;
    const res = await this.dataSource.query(query);
    console.log(res);

    return true;
  }

  async findStatusBan(userId: string, blogId: string): Promise<BlogBanInfoDocument> {
    const statusBan = await this.blogBanInfoModel.findOne({ blogId, userId });
    if (!statusBan) return null;
    return statusBan;
  }
}
