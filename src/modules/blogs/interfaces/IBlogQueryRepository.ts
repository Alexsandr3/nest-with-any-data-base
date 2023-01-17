import {
  BlogViewModel
} from "../infrastructure/query-repository/types-view/blog-View-Model";
import {
  UsersForBanBlogViewType
} from "../../users/infrastructure/query-reposirory/types-view/user-View-Model";
import { PaginationDto } from "../api/input-Dtos/pagination-Dto-Model";
import { PaginationViewModel } from "../infrastructure/query-repository/pagination-View-Model";
import { BlogDBSQLType } from "../../blogger/domain/types/blog-DB-SQL-Type";
import { BlogsSqlQueryRepositories } from "../infrastructure/query-repository/blogs-sql-query.repositories";
import { BlogsQueryRepositories } from "../infrastructure/query-repository/blogs-query.repositories";
import { getConfiguration } from "../../../config/configuration";
import { BlogsTypeOrmQueryRepositories } from "../infrastructure/query-repository/blogs-type-orm-query.repositories";
import { PaginationUsersDto } from "../../users/api/input-Dto/pagination-Users-Dto-Model";

export interface IBlogQueryRepository {

  findBlogs(data: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>>;

  findBlogsForSa(data: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>>;

  findBlogsForCurrentBlogger(data: PaginationDto, userId: string): Promise<PaginationViewModel<BlogViewModel[]>>;

  findBlog(id: string): Promise<BlogViewModel>;

  findBlogWithMap(id: string): Promise<BlogDBSQLType>;

  getBannedUsersForBlog(blogId: string, paginationInputModel: PaginationUsersDto): Promise<PaginationViewModel<UsersForBanBlogViewType[]>>;

}

export const IBlogQueryRepositoryKey = "IBlogQueryRepository";


export const BlogQueryRepository = () => {
  const dbType = getConfiguration().database.DB_TYPE
  switch (dbType) {
    case "MongoDB":
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogsQueryRepositories
      };
    case "RawSQL":
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogsSqlQueryRepositories
      };
    case "TypeOrm":
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogsTypeOrmQueryRepositories
      }
    default:
      return {
        provide: IBlogQueryRepositoryKey,
        useClass: BlogsSqlQueryRepositories
      };
  }
};