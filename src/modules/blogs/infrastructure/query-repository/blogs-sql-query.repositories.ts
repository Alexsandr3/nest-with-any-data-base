import { Injectable } from "@nestjs/common";
import {
  BanInfoForBlogType, BlogOwnerInfoType,
  BlogViewForSaModel, BlogViewModel
} from "./types-view/blog-View-Model";
import { PaginationViewModel } from "./pagination-View-Model";
import { PaginationDto } from "../../api/input-Dtos/pagination-Dto-Model";
import { NotFoundExceptionMY } from "../../../../helpers/My-HttpExceptionFilter";
import {
  BanInfoType, UsersForBanBlogViewType
} from "../../../users/infrastructure/query-reposirory/types-view/user-View-Model";
import { DataSource } from "typeorm";
import { BlogDBSQLType } from "../../../blogger/domain/types/blog-DB-SQL-Type";
import { BannedBlogUsersDBSQL } from "../../../blogger/domain/types/banned_blog_users-DB-SQL";

@Injectable()
export class BlogsSqlQueryRepositories {
  constructor(private readonly dataSource: DataSource) {
  }


  private mapperBlogForSaView(object: any): BlogViewForSaModel {
    const blogOwnerInfo = new BlogOwnerInfoType(
      object.userId,
      object.login
    );
    const banInfoForBlog = new BanInfoForBlogType(
      object.isBanned,
      object.banDate
    );
    return new BlogViewForSaModel(
      object.blogId,
      object.name,
      object.description,
      object.websiteUrl,
      object.createdAt,
      blogOwnerInfo,
      banInfoForBlog
    );
  }

  private mapperBanInfo(object: BannedBlogUsersDBSQL): UsersForBanBlogViewType {
    const banInfo = new BanInfoType(
      object.isBanned,
      object.banDate,
      object.banReason
    );
    return new UsersForBanBlogViewType(
      object.userId,
      object.login,
      banInfo
    );
  }

  async findBlogs(data: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = data;
    let queryFilter = `
        SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
        FROM blogs
        WHERE "isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let requestCount = `
        SELECT count(*)
        FROM blogs
        WHERE "isBanned" = false
    `;
    if (searchNameTerm.trim().length > 0) {
      queryFilter = `
          SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
          FROM blogs
          WHERE "isBanned" = false
            AND "name" ILIKE '%${searchNameTerm}%'
          ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      requestCount = `
          SELECT count(*)
          FROM blogs
          WHERE "isBanned" = false
            AND "name" ILIKE '%${searchNameTerm}%'
      `;
    }
    //search all blogs for current user
    const blogs = await this.dataSource.query(queryFilter);
    //counting blogs user
    const totalCount = await this.dataSource.query(requestCount);
    const { count } = totalCount[0]; //const count = +totalCount[0]['count']
    const pagesCountRes = Math.ceil(+count / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      +count,
      blogs
    );
  }

  async findBlogsForSa(data: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = data;
    let queryFilter = `
        SELECT a."blogId",
               a."name",
               a."description",
               a."websiteUrl",
               a."createdAt",
               a."userId",
               b."login",
               a."isBanned",
               a."banDate"
        FROM blogs a
                 INNER JOIN users b
                            ON b."userId" = a."userId"
        ORDER BY "${sortBy}" ${sortDirection}
         LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let requestCount = `
        SELECT count(*)
        FROM blogs
    `;
    if (searchNameTerm.trim().length > 0) {
      queryFilter = `
          SELECT a."blogId",
                 a."name",
                 a."description",
                 a."websiteUrl",
                 a."createdAt",
                 a."userId",
                 b."login",
                 a."isBanned",
                 a."banDate"
          FROM blogs a
                   INNER JOIN users b
                              ON b."userId" = a."userId"
          WHERE a."name" ILIKE '%${searchNameTerm}%'
          ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      requestCount = `
          SELECT count(*)
          FROM blogs
          WHERE "name" ILIKE '%${searchNameTerm}%'
      `;
    }
    //search all blogs for current user
    const foundBlogs = await this.dataSource.query(queryFilter);
    //mapped for View
    const mappedBlogs = foundBlogs.map((blog) => this.mapperBlogForSaView(blog));
    //counting blogs user
    const totalCount = await this.dataSource.query(requestCount);
    const { count } = totalCount[0];
    const pagesCountRes = Math.ceil(+count / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      +count,
      mappedBlogs
    );
  }

  async findBlogsForCurrentBlogger(data: PaginationDto, userId: string): Promise<PaginationViewModel<BlogViewModel[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = data;
    let queryFilter = `
        SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
        FROM blogs
        WHERE "userId" = '${userId}'
          AND "isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let requestCount = `
        SELECT count(*)
        FROM blogs
        WHERE "userId" = '${userId}'
          AND "isBanned" = false
    `;
    if (searchNameTerm.trim().length > 0) {
      queryFilter = `
          SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
          FROM blogs
          WHERE "userId" = '${userId}'
            AND "isBanned" = false
            AND "name" ILIKE '%${searchNameTerm}%'
          ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      requestCount = `
          SELECT count(*)
          FROM blogs
          WHERE "userId" = '${userId}'
            AND "isBanned" = false
            AND "name" ILIKE '%${searchNameTerm}%'
      `;
    }
    //search all blogs for current user
    const blogs = await this.dataSource.query(queryFilter);
    //counting blogs user
    const totalCount = await this.dataSource.query(requestCount);
    const { count } = totalCount[0];
    const pagesCountRes = Math.ceil(+count / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      +count,
      blogs
    );
  }

  async findBlog(id: string): Promise<BlogViewModel> {
    const query =
      `
          SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
          FROM blogs
          WHERE "blogId" = '${id}'
            AND "isBanned" = false
      `;
    const blog = await this.dataSource.query(query);
    if (!blog[0]) throw new NotFoundExceptionMY(`Not found current blog with id: ${id}`);
    return blog[0];
  }

  async findBlogWithMap(id: string): Promise<BlogDBSQLType> {
    const query = `
        SELECT *
        FROM "blogs"
        WHERE "blogId" = '${id}'
          AND "isBanned" = false
    `;
    const blog = await this.dataSource.query(query);
    if (!blog[0]) throw new NotFoundExceptionMY(`Not found current blog with id: ${id}`);
    //returning Blog with View
    return blog[0];
  }

  async getBannedUsersForBlog(blogId: string, paginationInputModel: PaginationDto): Promise<PaginationViewModel<UsersForBanBlogViewType[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = paginationInputModel;
    let queryFilter = `
        SELECT *
        FROM banned_blog_users
        WHERE "blogId" = '${blogId}'
          AND "isBanned" = true
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let requestCount = `
        SELECT count(*)
        FROM banned_blog_users
        WHERE "blogId" = '${blogId}'
          AND "isBanned" = true
    `;
    if (searchNameTerm.trim().length > 0) {
      queryFilter = `
          SELECT *
          FROM banned_blog_users
          WHERE "blogId" = '${blogId}'
            AND "isBanned" = true
            AND "login" ILIKE '%${searchNameTerm}%'
          ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      requestCount = `
          SELECT count(*)
          FROM banned_blog_users
          WHERE "blogId" = '${blogId}'
            AND "isBanned" = true
            AND "login" ILIKE '%${searchNameTerm}%'
      `;
    }
    //search all blogs for current user
    const foundBanStatusForBlog = await this.dataSource.query(queryFilter);
    //mapped for View
    const mappedBlogs = foundBanStatusForBlog.map((blog) => this.mapperBanInfo(blog));
    //counting blogs user
    const totalCount = await this.dataSource.query(requestCount);
    const { count } = totalCount[0];
    const pagesCountRes = Math.ceil(+count / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      +count,
      mappedBlogs
    );
  }
}
