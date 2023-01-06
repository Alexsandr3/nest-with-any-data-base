import { getConfiguration } from "../../../config/configuration";
import { CommentsViewType } from "../infrastructure/query-repository/types-view/comments-View-Model";
import { CommentsSqlQueryRepositories } from "../infrastructure/query-repository/comments-sql-query.repositories";
import { CommentsQueryRepositories } from "../infrastructure/query-repository/comments-query.repositories";

export interface ICommentQueryRepository {
  getComment(commentId: string, userId: string | null): Promise<CommentsViewType>;

  findComment(commentId: string, userId: string | null): Promise<CommentsViewType>;
}

export const ICommentQueryRepositoryKey = "ICommentQueryRepository";


export const CommentQueryRepository = () => {
  const dbType = getConfiguration().database.DB_TYPE;
  switch (dbType) {
    case "MongoDB":
      return {
        provide: ICommentQueryRepositoryKey,
        useClass: CommentsQueryRepositories
      };
    case "RawSQL":
      return {
        provide: ICommentQueryRepositoryKey,
        useClass: CommentsSqlQueryRepositories
      };
    default:
      return {
        provide: ICommentQueryRepositoryKey,
        useClass: CommentsSqlQueryRepositories
      };
  }
};