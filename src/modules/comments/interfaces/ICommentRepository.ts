import { getConfiguration } from "../../../config/configuration";
import { CommentsViewType } from "../infrastructure/query-repository/types-view/comments-View-Model";
import { PreparationCommentForDB } from "../domain/types/comment-preparation-for-DB";
import { CommentDBSQLType } from "../domain/types/comment-DB-SQL-Type";
import { LikeStatusType } from "../../posts/domain/mongo-schemas/likesPost-schema-Model";
import { CommentsSqlRepositories } from "../infrastructure/comments-sql.repositories";
import { CommentsRepositories } from "../infrastructure/comments.repositories";

export interface ICommentRepository {
  createCommentByIdPost(newComment: PreparationCommentForDB): Promise<CommentsViewType>;

  findCommentsById(id: string): Promise<CommentDBSQLType>;

  deleteCommentsById(id: string): Promise<boolean>;

  updateCommentsById(id: string, content: string): Promise<boolean>;

  updateStatusBanComments(userId: string, isBanned: boolean): Promise<boolean>;

  updateLikeStatusForComment(id: string, userId: string, likeStatus: LikeStatusType): Promise<boolean>;

  updateStatusBanLike(userId: string, isBanned: boolean): Promise<boolean>;


}

export const ICommentRepositoryKey = "ICommentRepository";


export const CommentRepository = () => {
  const dbType = getConfiguration().database.DB_TYPE;
  switch (dbType) {
    case "MongoDB":
      return {
        provide: ICommentRepositoryKey,
        useClass: CommentsRepositories
      };
    case "RawSQL":
      return {
        provide: ICommentRepositoryKey,
        useClass: CommentsSqlRepositories
      };
    default:
      return {
        provide: ICommentRepositoryKey,
        useClass: CommentsSqlRepositories
      };
  }
};