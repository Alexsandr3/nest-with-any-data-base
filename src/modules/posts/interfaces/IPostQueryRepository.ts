import { getConfiguration } from "../../../config/configuration";
import { PostViewModel } from "../infrastructure/query-repositories/types-view/post-View-Model";
import { PaginationDto } from "../../blogs/api/input-Dtos/pagination-Dto-Model";
import { PaginationViewModel } from "../../blogs/infrastructure/query-repository/pagination-View-Model";
import { PostsSqlQueryRepositories } from "../infrastructure/query-repositories/posts-sql-query.reposit";
import { PostsQueryRepositories } from "../infrastructure/query-repositories/posts-query.reposit";
import { PostsTypeOrmQueryReposit } from "../infrastructure/query-repositories/posts-type-orm-query.reposit";

export interface IPostQueryRepository {
  findPost(id: string, userId: string | null): Promise<PostViewModel>
  findPosts(data: PaginationDto, userId: string | null, blogId?: string): Promise<PaginationViewModel<PostViewModel[]>>
  getCommentsByIdPost(postId: string, data: PaginationDto, userId: string | null)/*: Promise<PaginationViewModel<CommentsViewType[]>>*/
  createPostForView(id: string): Promise<PostViewModel>
  getCommentsBloggerForPosts(userId: string, paginationInputModel: PaginationDto)


}

export const IPostQueryRepositoryKey = "IPostQueryRepository";


export const PostQueryRepository = () => {
  const dbType = getConfiguration().database.DB_TYPE;
  switch (dbType) {
    case "MongoDB":
      return {
        provide: IPostQueryRepositoryKey,
        useClass: PostsQueryRepositories
      };
    case "RawSQL":
      return {
        provide: IPostQueryRepositoryKey,
        useClass: PostsSqlQueryRepositories
      };
    case "TypeOrm":
      return {
        provide: IPostQueryRepositoryKey,
        useClass: PostsTypeOrmQueryReposit
      }
    default:
      return {
        provide: IPostQueryRepositoryKey,
        useClass: PostsSqlQueryRepositories
      };
  }
};