import { Injectable } from "@nestjs/common";
import { PreparationBlogForDB } from "../../blogger/domain/types/blog-preparation-for-DB";
import { UpdateBlogDto } from "../../blogger/api/input-dtos/update-Blog-Dto-Model";
import { BanUserForBlogPreparationForDB } from "../../blogger/domain/types/ban-user-for-blog-preparation-for-DB";
import {  Repository } from "typeorm";
import { BannedBlogUsersDBSQL } from "../../blogger/domain/types/banned_blog_users-DB-SQL";
import { IBlogRepository } from "../interfaces/IBlogRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogT } from "../../../entities/blog.entity";
import { BannedBlogUser } from "../../../entities/bannedBlogUser.entity";

@Injectable()
export class BlogsTypeOrmRepositories implements IBlogRepository {
  constructor(
    @InjectRepository(BlogT)
    private readonly blogTRepository: Repository<BlogT>,
    @InjectRepository(BannedBlogUser)
    private readonly bannedBlogUserRepository: Repository<BannedBlogUser>
  ) {
  }

  async createBlog(newBlog: PreparationBlogForDB): Promise<string> {
    const { createdAt, userId, userLogin, websiteUrl, name, description } = newBlog;
    const blog = new BlogT();
    blog.userId = userId;
    blog.userLogin = userLogin;
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.createdAt = createdAt;
    const createdBlog = await this.blogTRepository.save(blog);
    return createdBlog.blogId;

  }

  async deleteBlog(id: string, userId: string): Promise<boolean> {
    await this.blogTRepository.manager.connection.transaction(async manager => {
      await manager.delete(BlogT, { userId: userId });
    })
      .catch((e) => {
        console.log(e);
        return false;
      });
    return true;
  }

  async updateBlog(id: string, userId: string, data: UpdateBlogDto): Promise<boolean> {
    const { name, description, websiteUrl } = data;
    await this.blogTRepository.manager.connection.transaction(async manager => {
      await manager.update(BlogT,
        { blogId: id, userId: userId },
        { name: name, description: description, websiteUrl: websiteUrl }
      );
    })
      .catch((e) => {
        console.log(e);
        return null;
      });
    return true;
  }

  async findBlog(id: string)/*: Promise<BlogDBSQLType>*/ {
    return await this.blogTRepository
      .findOneBy({ blogId: id })
      .catch((e) => {
        console.log(e);
        return null;
      });
  }

  async updateOwnerBlog(id: string, userId: string): Promise<boolean> {
    await this.blogTRepository.manager.connection.transaction(async manager => {
      await manager.update(BlogT,
        { blogId: id },
        { userId: userId }
      );
    })
      .catch((e) => {
        console.log(e);
        return false;
      });
    return true;
  }

  async updateBanStatusForBlog(blogId: string, isBanned: boolean): Promise<boolean> {
    await this.blogTRepository.manager.connection.transaction(async manager => {
      await manager.update(BlogT,
        { blogId: blogId },
        { isBanned: isBanned, banDate: new Date().toISOString }
      );
    })
      .catch((e) => {
        console.log(e);
        return false;
      });
    return true;
  }

  async createBanStatus(banStatus: BanUserForBlogPreparationForDB) {
    const { blogId, userId, createdAt, ownerId, email, login } = banStatus;
    const bannedBlogUser = new BannedBlogUser();
    bannedBlogUser.ownerId = ownerId;
    bannedBlogUser.userId = userId;
    bannedBlogUser.login = login;
    bannedBlogUser.email = email;
    bannedBlogUser.createdAt = createdAt;
    bannedBlogUser.blogId = blogId;
    const createdBanStatus = await this.bannedBlogUserRepository.save(bannedBlogUser);
    return createdBanStatus.id;
  }

  async updateBanStatus(banStatus: BanUserForBlogPreparationForDB): Promise<boolean> {
    const { blogId, isBanned, banReason, banDate, userId, login, ownerId, email, createdAt } = banStatus;
    await this.bannedBlogUserRepository.manager.connection.transaction(async manager => {
      await manager.update(BannedBlogUser,
        { blogId: blogId, userId: userId },
        {
          isBanned: isBanned,
          banReason: banReason,
          banDate: banDate
        }
      );
    })
      .catch((e) => {
        console.log(e);
        return false;
      });
    return true;
  }

  async findStatusBan(userId: string, blogId: string): Promise<BannedBlogUsersDBSQL> {
    const statusBan = await this.bannedBlogUserRepository
      .findOneBy({ blogId: blogId, userId: userId });
    if (!statusBan) return null;
    return statusBan;
  }
}
