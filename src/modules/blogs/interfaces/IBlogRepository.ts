import { BlogDBSQLType } from "../../blogger/domain/types/blog-DB-SQL-Type";
import { getConfiguration } from "../../../config/configuration";
import { BlogsSqlRepositories } from "../infrastructure/blogs-sql.repositories";
import { PreparationBlogForDB } from "../../blogger/domain/types/blog-preparation-for-DB";
import { UpdateBlogDto } from "../../blogger/api/input-dtos/update-Blog-Dto-Model";
import { BanUserForBlogPreparationForDB } from "../../blogger/domain/types/ban-user-for-blog-preparation-for-DB";
import { BannedBlogUsersDBSQL } from "../../blogger/domain/types/banned_blog_users-DB-SQL";
import { BlogsRepositories } from "../infrastructure/blogs.repositories";

export interface IBlogRepository {

  createBlog(newBlog: PreparationBlogForDB): Promise<string>;

  deleteBlog(id: string, userId: string): Promise<boolean>;

  updateBlog(id: string, userId: string, data: UpdateBlogDto): Promise<boolean>;

  findBlog(id: string): Promise<BlogDBSQLType>;

  updateOwnerBlog(id: string, userId: string): Promise<boolean>;

  updateBanStatusForBlog(blogId: string, isBanned: boolean): Promise<boolean>;

  createBanStatus(banStatus: BanUserForBlogPreparationForDB);

  updateBanStatus(banStatus: BanUserForBlogPreparationForDB): Promise<boolean>;

  findStatusBan(userId: string, blogId: string): Promise<BannedBlogUsersDBSQL>;

}

export const IBlogRepositoryKey = "IBlogRepository";


export const BlogRepository = () => {
  const dbType = getConfiguration().database.DB_TYPE;
  switch (dbType) {
    case "MongoDB":
      return {
        provide: IBlogRepositoryKey,
        useClass: BlogsRepositories
      };
    case "RawSQL":
      return {
        provide: IBlogRepositoryKey,
        useClass: BlogsSqlRepositories
      };
    default:
      return {
        provide: IBlogRepositoryKey,
        useClass: BlogsSqlRepositories
      };
  }
};