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
import { ILike, Repository } from "typeorm";
import { BlogDBSQLType } from "../../../blogger/domain/types/blog-DB-SQL-Type";
import { BannedBlogUsersDBSQL } from "../../../blogger/domain/types/banned_blog_users-DB-SQL";
import { IBlogQueryRepository } from "../../interfaces/IBlogQueryRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogT } from "../../../../entities/blog.entity";
import { BannedBlogUser } from "../../../../entities/bannedBlogUser.entity";
import { PaginationUsersDto } from "../../../users/api/input-Dto/pagination-Users-Dto-Model";

@Injectable()
export class BlogsTypeOrmQueryRepositories implements IBlogQueryRepository {
  constructor(
    @InjectRepository(BlogT)
    private readonly blogTRepository: Repository<BlogT>,
    @InjectRepository(BannedBlogUser)
    private readonly bannedBlogUserRepository: Repository<BannedBlogUser>
  ) {
  }


  private mapperBlogForSaView(object: any): BlogViewForSaModel {
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
    let order;
    if (sortDirection === "asc") {
      order = "ASC";
    } else {
      order = "DESC";
    }
    let filter: any = { isBanned: false };
    if (searchNameTerm.trim().length > 0) {
      filter = { isBanned: false, name: ILike(`%${searchNameTerm}%`) };
    }
    //search all blogs for current user
    const [blogs, count] = await Promise.all([this.blogTRepository
      .find({
        select: ["blogId", "name", "description", "websiteUrl", "createdAt"],
        where: filter,
        order: { [sortBy]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      }),
      this.blogTRepository.count({ where: filter })
    ]);
    const pagesCountRes = Math.ceil(count / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      count,
      blogs.map(({ blogId: id, ...rest }) => ({ id, ...rest }))
    );
  }

  async findBlogsForSa(data: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = data;
    let order;
    if (sortDirection === "asc") {
      order = "ASC";
    } else {
      order = "DESC";
    }
    let filter = {};
    if (searchNameTerm.trim().length > 0) {
      filter = { name: ILike(`%${searchNameTerm}%`) };
    }
    //search all blogs for current user and counting
    const [blogs, count] = await Promise.all([this.blogTRepository
      .find({
        select: [],
        where: filter,
        order: { [sortBy]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      }),
      this.blogTRepository.count({ where: filter })
    ]);
    //mapped for View
    const mappedBlogs = blogs.map((blog) => this.mapperBlogForSaView(blog));
    const pagesCountRes = Math.ceil(count / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      count,
      mappedBlogs
    );
  }

  async findBlogsForCurrentBlogger(data: PaginationDto, userId: string): Promise<PaginationViewModel<BlogViewModel[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = data;
    let order;
    if (sortDirection === "asc") {
      order = "ASC";
    } else {
      order = "DESC";
    }
    let filter: any = { userId: userId, isBanned: false };
    if (searchNameTerm.trim().length > 0) {
      filter = { userId: userId, isBanned: false, name: ILike(`%${searchNameTerm}%`) };
    }
    //search all blogs and counting for current user
    const [blogs, count] = await Promise.all([this.blogTRepository
      .find({
        select: ["blogId", "name", "description", "websiteUrl", "createdAt"],
        where: filter,
        order: { [sortBy]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      }),
      this.blogTRepository.count({ where: filter })
    ]);
    const pagesCountRes = Math.ceil(count / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      count,
      blogs.map(({ blogId: id, ...rest }) => ({ id, ...rest }))
    );

  }

  async findBlog(id: string): Promise<BlogViewModel> {
    const blog = await this.blogTRepository
      .findOneBy({ blogId: id, isBanned: false });
    if (!blog) throw new NotFoundExceptionMY(`Not found current blog with id: ${id}`);
    return new BlogViewModel(
      blog.blogId,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt
    );
  }

  async findBlogWithMap(id: string): Promise<BlogDBSQLType> {
    const blog = await this.blogTRepository
      .findOneBy({ blogId: id, isBanned: false });
    if (!blog) throw new NotFoundExceptionMY(`Not found current blog with id: ${id}`);
    return blog;
  }

  async getBannedUsersForBlog(blogId: string, paginationInputModel: PaginationUsersDto): Promise<PaginationViewModel<UsersForBanBlogViewType[]>> {
    const { searchLoginTerm, pageSize, pageNumber, sortDirection, sortBy } = paginationInputModel;
    let order;
    if (sortDirection === "asc") {
      order = "ASC";
    } else {
      order = "DESC";
    }
    let filter: any = { blogId: blogId, isBanned: true };
    if (searchLoginTerm.trim().length > 0) {
      filter = { blogId: blogId, isBanned: true, login: ILike(`%${searchLoginTerm}%`) };
    }
    //search all blogs for current user
    const [blogs, count] = await Promise.all([this.bannedBlogUserRepository
      .find({
        select: ["isBanned", "banReason", "banDate", "userId", "login"],
        where: filter,
        order: { [sortBy]: order },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize
      }),
      this.bannedBlogUserRepository.count({ where: filter })
    ]);
    //mapped for View
    const mappedBlogs = blogs.map((blog) => this.mapperBanInfo(blog));
    const pagesCountRes = Math.ceil(count / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      count,
      mappedBlogs
    );
  }
}
