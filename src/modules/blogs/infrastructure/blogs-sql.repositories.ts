import { Injectable } from "@nestjs/common";
import { PreparationBlogForDB } from "../../blogger/domain/types/blog-preparation-for-DB";
import { UpdateBlogDto } from "../../blogger/api/input-dtos/update-Blog-Dto-Model";
import { BanUserForBlogPreparationForDB } from "../../blogger/domain/types/ban-user-for-blog-preparation-for-DB";
import { DataSource } from "typeorm";
import { BlogDBSQLType } from "../../blogger/domain/types/blog-DB-SQL-Type";
import { BannedBlogUsersDBSQL } from "../../blogger/domain/types/banned_blog_users-DB-SQL";

@Injectable()
export class BlogsSqlRepositories {
  constructor(
    private readonly dataSource: DataSource,
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
    return true; //res[1] === 1
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
  }

  async updateBanStatusForBlog(blogId: string, isBanned: boolean): Promise<boolean> {
    const query = `
        UPDATE blogs
        SET "isBanned" = ${isBanned},
            "banDate"  = '${new Date().toISOString()}'
        WHERE "blogId" = '${blogId}'
    `;
    await this.dataSource.query(query);
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
    await this.dataSource.query(query);
    return true;
  }

  async findStatusBan(userId: string, blogId: string): Promise<BannedBlogUsersDBSQL> {
    const query =`
        SELECT *
        FROM banned_blog_users
        WHERE "blogId" = '${blogId}' AND "userId" = '${userId}'
    `
    const statusBan = await this.dataSource.query(query)
    // const statusBan = await this.blogBanInfoModel.findOne({ blogId, userId });
    if (!statusBan[0]) return null;
    return statusBan[0];
  }
}
