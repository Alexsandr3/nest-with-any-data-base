import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BlogDocument, Blog } from "../../../blogger/domain/blog-schema-Model";
import {
  BanInfoForBlogType,
  BlogOwnerInfoType,
  BlogViewForSaModel,
  BlogViewModel
} from "./blog-View-Model";
import { PaginationViewModel } from "./pagination-View-Model";
import { BlogsDBType } from "../../../blogger/domain/blog-DB-Type";
import { PaginationDto } from "../../api/input-Dtos/pagination-Dto-Model";
import { NotFoundExceptionMY } from "../../../../helpers/My-HttpExceptionFilter";
import { BlogBanInfo, BlogBanInfoDocument } from "../../../blogger/domain/ban-user-for-current-blog-schema-Model";
import {
  BanInfoType,
  UsersForBanBlogViewType
} from "../../../users/infrastructure/query-reposirory/user-View-Model";
import { DataSource } from "typeorm";
import { BlogDBSQLType } from "../../../blogger/domain/blog-DB-SQL-Type";
import { BannedBlogUsersDBSQL } from "../../../blogger/domain/banned_blog_users-DB-SQL";

@Injectable()
export class BlogsSqlQueryRepositories {
  constructor(
    @InjectModel(Blog.name) private readonly blogsModel: Model<BlogDocument>,
    private readonly dataSource: DataSource,
    @InjectModel(BlogBanInfo.name) private readonly blogBanInfoModel: Model<BlogBanInfoDocument>
  ) {
  }

  private mapperBlogForView(object: BlogsDBType): BlogViewModel {
    return new BlogViewModel(
      object._id.toString(),
      object.name,
      object.description,
      object.websiteUrl,
      object.createdAt
    );
  }

  private mapperBlogForSaView(object: BlogDBSQLType): BlogViewForSaModel {
    const blogOwnerInfo = new BlogOwnerInfoType(
      object.userId,
      object.userLogin
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
    let filter = `
        SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
        FROM blogs
        WHERE "isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let filterCounting = `
        SELECT count(*)
        FROM blogs
        WHERE "isBanned" = false
    `;
    if (searchNameTerm.trim().length > 0) {
      filter = `
          SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
          FROM blogs
          WHERE "isBanned" = false
            AND "name" ILIKE '%${searchNameTerm}%'
          ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      filterCounting = `
          SELECT count(*)
          FROM blogs
          WHERE "isBanned" = false
            AND "name" ILIKE '%${searchNameTerm}%'
      `;
    }
    //search all blogs for current user
    const blogs = await this.dataSource.query(filter);
    //counting blogs user
    const totalCount = await this.dataSource.query(filterCounting);
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

  async findBlogsForSa(data: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = data;
    let filter = `
        SELECT *
        FROM blogs
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let filterCounting = `
        SELECT count(*)
        FROM blogs
    `;
    if (searchNameTerm.trim().length > 0) {
      filter = `
          SELECT *
          FROM blogs
          WHERE "name" ILIKE '%${searchNameTerm}%'
          ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      filterCounting = `
          SELECT count(*)
          FROM blogs
          WHERE "name" ILIKE '%${searchNameTerm}%'
      `;
    }
    //search all blogs for current user
    const foundBlogs = await this.dataSource.query(filter);
    //mapped for View
    const mappedBlogs = foundBlogs.map((blog) => this.mapperBlogForSaView(blog));
    //counting blogs user
    const totalCount = await this.dataSource.query(filterCounting);
    const { count } = totalCount[0];
    const pagesCountRes = Math.ceil(+count / pageSize);

    /*//search all blogs
    const foundBlogs = await this.blogsModel
      .find(searchNameTerm ? { name: { $regex: searchNameTerm, $options: "i" } } : {})
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .lean();
    //mapped for View
    const mappedBlogs = foundBlogs.map((blog) => this.mapperBlogForSaView(blog));
    //counting blogs
    const totalCount = await this.blogsModel.countDocuments(
      searchNameTerm ? { name: { $regex: searchNameTerm, $options: "i" } } : {});
    const pagesCountRes = Math.ceil(totalCount / pageSize);*/
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
    let filter = `
        SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
        FROM blogs
        WHERE "userId" = '${userId}'
          AND "isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let filterCounting = `
        SELECT count(*)
        FROM blogs
        WHERE "userId" = '${userId}'
          AND "isBanned" = false
    `;
    if (searchNameTerm.trim().length > 0) {
      filter = `
          SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
          FROM blogs
          WHERE "userId" = '${userId}'
            AND "isBanned" = false
            AND "name" ILIKE '%${searchNameTerm}%'
          ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      filterCounting = `
          SELECT count(*)
          FROM blogs
          WHERE "userId" = '${userId}'
            AND "isBanned" = false
            AND "name" ILIKE '%${searchNameTerm}%'
      `;
    }
    //search all blogs for current user
    const blogs = await this.dataSource.query(filter);
    //counting blogs user
    const totalCount = await this.dataSource.query(filterCounting);
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

    /*
    const filter: FilterQuery<Blog> = { userId: userId, isBanned: false };
    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: "i" };
    }
    //search all blogs for current user
    const foundBlogs = await this.blogsModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .lean();
    //mapped for View
    const mappedBlogs = foundBlogs.map((blog) => this.mapperBlogForView(blog));
    //counting blogs user
    const totalCount = await this.blogsModel.countDocuments(filter);
    const pagesCountRes = Math.ceil(totalCount / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      totalCount,
      mappedBlogs
    );*/
  }

  async findBlog(id: string): Promise<BlogViewModel> {
    const query =
      `
          SELECT "blogId" AS "id", "name", "description", "websiteUrl", "createdAt"
          FROM blogs
          WHERE "blogId" = '${id}' AND "isBanned" = false
      `;
    const blog = await this.dataSource.query(query);
    if (!blog[0]) throw new NotFoundExceptionMY("not found");
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
    // const blog = await this.blogsModel.findOne({ _id: new Object(id), isBanned: false });
     if (!blog[0]) throw new NotFoundExceptionMY(`Not found for id:${id}`);
    //returning Blog with View
    return blog[0];
  }

  async getBannedUsersForBlog(blogId: string, paginationInputModel: PaginationDto) {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = paginationInputModel;
    let filter = `
        SELECT *
        FROM banned_blog_users
        WHERE "blogId" = '${blogId}'
          AND "isBanned" = true
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let filterCounting = `
        SELECT count(*)
        FROM banned_blog_users
        WHERE "blogId" = '${blogId}'
          AND "isBanned" = true
    `;
    if (searchNameTerm.trim().length > 0) {
      filter = `
          SELECT *
          FROM banned_blog_users
          WHERE "blogId" = '${blogId}'
            AND "isBanned" = true
            AND "login" ILIKE '%${searchNameTerm}%'
          ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      filterCounting = `
          SELECT count(*)
          FROM banned_blog_users
          WHERE "blogId" = '${blogId}'
            AND "isBanned" = true
            AND "login" ILIKE '%${searchNameTerm}%'
      `;
    }
    //search all blogs for current user
    const foundBanStatusForBlog = await this.dataSource.query(filter);
    //mapped for View
    const mappedBlogs = foundBanStatusForBlog.map((blog) => this.mapperBanInfo(blog));
    //counting blogs user
    const totalCount = await this.dataSource.query(filterCounting);
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
    /* const filter: FilterQuery<BlogBanInfo> = { blogId, isBanned: true };
     if (searchNameTerm) {
       filter.name = { $regex: searchNameTerm, $options: "i" };
     }
     const foundBanStatusForBlog = await this.blogBanInfoModel
       .find(filter)
       .skip((pageNumber - 1) * pageSize)
       .limit(pageSize)
       .sort({ [sortBy]: sortDirection })
       .lean();
     //mapped for View
     const mappedBlogs = foundBanStatusForBlog.map((blog) => this.mapperBanInfo(blog));
     //counting blogs user
     const totalCount = await this.blogBanInfoModel.countDocuments(filter);
     const pagesCountRes = Math.ceil(totalCount / pageSize);
     // Found Blogs with pagination!
     return new PaginationViewModel(
       pagesCountRes,
       pageNumber,
       pageSize,
       totalCount,
       mappedBlogs
     );*/
  }
}
