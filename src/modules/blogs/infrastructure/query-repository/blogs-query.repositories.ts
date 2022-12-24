import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
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
import { BanStatusBlogDBType } from "../../../blogger/domain/ban-user-for-blog-preparation-for-DB";

@Injectable()
export class BlogsQueryRepositories {
  constructor(
    @InjectModel(Blog.name) private readonly blogsModel: Model<BlogDocument>,
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

  private mapperBlogForSaView(object: BlogsDBType): BlogViewForSaModel {
    const blogOwnerInfo = new BlogOwnerInfoType(
      object.userId,
      object.userLogin
    );
    const banInfoForBlog = new BanInfoForBlogType(
      object.isBanned,
      object.banDate
    );
    return new BlogViewForSaModel(
      object._id.toString(),
      object.name,
      object.description,
      object.websiteUrl,
      object.createdAt,
      blogOwnerInfo,
      banInfoForBlog
    );
  }

  private mapperBanInfo(object: BanStatusBlogDBType): UsersForBanBlogViewType {
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
    let filter: FilterQuery<Blog> = searchNameTerm ? {
      name: { $regex: searchNameTerm, $options: "i" },
      isBanned: false
    } : { isBanned: false };
    //search all blogs
    const foundBlogs = await this.blogsModel
      .find(filter)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .lean();
    //mapped for View
    const mappedBlogs = foundBlogs.map((blog) => this.mapperBlogForView(blog));
    //counting blogs
    const totalCount = await this.blogsModel.countDocuments(searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: "i" }, isBanned: false } : { isBanned: false });
    const pagesCountRes = Math.ceil(totalCount / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      totalCount,
      mappedBlogs
    );
  }

  async findBlogsForSa(data: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = data;
    //search all blogs
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
    const pagesCountRes = Math.ceil(totalCount / pageSize);
    // Found Blogs with pagination!
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      totalCount,
      mappedBlogs
    );
  }

  async findBlogsForCurrentBlogger(data: PaginationDto, userId: string): Promise<PaginationViewModel<BlogViewModel[]>> {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = data;
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
    );
  }

  async findBlog(id: string): Promise<BlogViewModel> {
    const blog = await this.blogsModel.findOne({ _id: new Object(id), isBanned: false });
    if (!blog) throw new NotFoundExceptionMY(`Not found for id:${id}`);
    //returning Blog for View
    return this.mapperBlogForView(blog);
  }

  async findBlogWithMap(id: string): Promise<BlogDocument> {
    const blog = await this.blogsModel.findOne({ _id: new Object(id), isBanned: false });
    if (!blog) throw new NotFoundExceptionMY(`Not found for id:${id}`);
    //returning Blog with View
    return blog;
  }

  async getBannedUsersForBlog(blogId: string, paginationInputModel: PaginationDto) {
    const { searchNameTerm, pageSize, pageNumber, sortDirection, sortBy } = paginationInputModel;
    const filter: FilterQuery<BlogBanInfo> = { blogId, isBanned: true };
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
    );
  }
}
