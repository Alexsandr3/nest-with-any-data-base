import { getConfiguration } from "../../../config/configuration";
import { PreparationPostForDB } from "../domain/types/post-preparation-for-DB";
import { CreatePostDto } from "../api/input-Dtos/create-Post-Dto-Model";
import { PostDBSQLType } from "../domain/types/post-DB-SQL-Type";
import { PostsSqlRepositories } from "../infrastructure/posts-sql-repositories";
import { PostsRepositories } from "../infrastructure/posts-repositories";
import { PostsTypeOrmRepositories } from "../infrastructure/posts-type-orm-repositories";

export interface IPostRepository {
  createPost(newPost: PreparationPostForDB): Promise<string>;

  updatePost(id: string, data: CreatePostDto, blogId: string, userId: string): Promise<boolean>;

  deletePost(id: string, userId: string): Promise<boolean>;

  findPost(id: string): Promise<PostDBSQLType>;

  updateStatusBanPostForUser(userId: string, isBanned: boolean): Promise<boolean>;

  updateStatusBanPostForBlogger(blogId: string, isBanned: boolean): Promise<boolean>;

  updateLikeStatusPost(id: string, userId: string, likeStatus: string, login: string): Promise<boolean>;

  updateStatusBanLikePost(userId: string, isBanned: boolean): Promise<boolean>;


}

export const IPostRepositoryKey = "IPostRepository";


export const PostRepository = () => {
  const dbType = getConfiguration().database.DB_TYPE;
  switch (dbType) {
    case "MongoDB":
      return {
        provide: IPostRepositoryKey,
        useClass: PostsRepositories
      };
    case "RawSQL":
      return {
        provide: IPostRepositoryKey,
        useClass: PostsSqlRepositories
      };
    case "TypeOrm":
      return {
        provide: IPostRepositoryKey,
        useClass: PostsTypeOrmRepositories
      };
    default:
      return {
        provide: IPostRepositoryKey,
        useClass: PostsSqlRepositories
      };
  }
};