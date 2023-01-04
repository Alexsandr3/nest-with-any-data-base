import { Injectable } from "@nestjs/common";
import { PaginationDto } from "../../../blogs/api/input-Dtos/pagination-Dto-Model";
import { PostViewModel } from "./types-view/post-View-Model";
import {
  LikeStatusType
} from "../../domain/mongo-schemas/likesPost-schema-Model";
import {
  ExtendedLikesInfoViewModel
} from "./types-view/likes-Info-View-Model";
import { PaginationViewModel } from "../../../blogs/infrastructure/query-repository/pagination-View-Model";
import { NotFoundExceptionMY } from "../../../../helpers/My-HttpExceptionFilter";
import {
  BloggerCommentsViewType, CommentatorInfoModel,
  CommentsViewType,
  LikesInfoViewModel, PostInfoModel
} from "../../../comments/infrastructure/query-repository/types-view/comments-View-Model";
import { DataSource } from "typeorm";
import { CommentDBSQLType } from "../../../comments/domain/types/comment-DB-SQL-Type";

@Injectable()
export class PostsSqlQueryRepositories {
  constructor(private readonly dataSource: DataSource) {
  }


  async findPost(id: string, userId: string | null): Promise<PostViewModel> {
    const query =
      `
          SELECT "postId", "title", "shortDescription", "content", "blogId", "blogName" AS "name", "createdAt"
          FROM posts
          WHERE "postId" = '${id}'
            AND "isBanned" = false
      `;
    //find post by id from uri params
    const post = await this.dataSource.query(query);
    if (!post[0]) throw new NotFoundExceptionMY(`Not found for id: ${id}`);
    //returning post for View
    return this.postForView(post[0], userId);
  }

  async findPosts(data: PaginationDto, userId: string | null, blogId?: string): Promise<PaginationViewModel<PostViewModel[]>> {
    const { sortDirection, sortBy, pageSize, pageNumber } = data;
    let filter;
    let filterCounting;
    if (blogId) {
      filter = `
          SELECT a."postId",
                 a."title",
                 a."shortDescription",
                 a."content",
                 a."blogId",
                 b."name",
                 a."createdAt"
          FROM posts a
                   INNER JOIN blogs b
                              ON a."blogId" = b."blogId"
          WHERE a."isBanned" = false
            AND a."blogId" = '${blogId}'
          ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      filterCounting = `
          SELECT count(*)
          FROM posts
          WHERE "isBanned" = false
            AND "blogId" = '${blogId}'
      `;
    } else {
      filter = `
          SELECT a."postId",
                 a."title",
                 a."shortDescription",
                 a."content",
                 a."blogId",
                 b."name",
                 a."createdAt"
          FROM posts a
                   INNER JOIN blogs b
                              ON a."blogId" = b."blogId"
          WHERE a."isBanned" = false
          ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
          OFFSET ${(pageNumber - 1) * pageSize}
      `;
      filterCounting = `
          SELECT count(*)
          FROM posts
          WHERE "isBanned" = false
      `;
    }
    const foundPosts = await this.dataSource.query(filter);
    //mapped posts for view
    const mappedPosts = foundPosts.map((post) =>
      this.postForView(post, userId)
    );
    const itemsPosts = await Promise.all(mappedPosts);
    //counting blogs user
    const totalCount = await this.dataSource.query(filterCounting);
    const { count } = totalCount[0];
    const pagesCountRes = Math.ceil(+count / pageSize);
    // Found posts with pagination
    return new PaginationViewModel(
      pagesCountRes,
      data.pageNumber,
      data.pageSize,
      +count,
      itemsPosts
    );

  }

  private async postForView(post: any, userId: string | null): Promise<PostViewModel> {
    //find likes status
    let myStatus: string = LikeStatusType.None;
    if (userId) {
      const query = `
          SELECT *
          FROM "likesPost"
          WHERE "userId" = '${userId}'
            AND "parentId" = '${post.postId}'
            AND "isBanned" = false
      `;
      const result = await this.dataSource.query(query);
      if (result[0]) {
        myStatus = result[0].likeStatus;
      }
    }
    const queryCountLike = `
        SELECT count(*)
        FROM "likesPost"
        WHERE "likeStatus" = 'Like'
          AND "parentId" = '${post.postId}'
          AND "isBanned" = false
    `;
    const countLike = await this.dataSource.query(queryCountLike);
    const totalCountLike = +countLike[0][`count`];
    const queryCountDislike = `
        SELECT count(*)
        FROM "likesPost"
        WHERE "likeStatus" = 'Dislike'
          AND "parentId" = '${post.postId}'
          AND "isBanned" = false
    `;
    const countDislike = await this.dataSource.query(queryCountDislike);
    const totalCountDislike = +countDislike[0]["count"];
    const queryNewestLikes = `
        SELECT "addedAt", "userId", "userLogin" AS "login"
        FROM "likesPost"
        WHERE "likeStatus" = 'Like'
          AND "parentId" = '${post.postId}'
          AND "isBanned" = false
        ORDER BY "addedAt" DESC LIMIT 3
    `;
    //finding the newest likes
    const newestLikes = await this.dataSource.query(queryNewestLikes);

    /* if (userId) {
       const result = await this.likesPostsStatusModel.findOne({
         userId: userId,
         parentId: post._id,
         isBanned: false
       });
       if (result) {
         myStatus = result.likeStatus;
       }
     }
     const totalCountLike = await this.likesPostsStatusModel.countDocuments({
       parentId: post._id,
       likeStatus: "Like",
       isBanned: false
     });
     const totalCountDislike = await this.likesPostsStatusModel.countDocuments({
       parentId: post._id,
       likeStatus: "Dislike",
       isBanned: false
     });
     //finding the newest likes
     const newestLikes = await this.likesPostsStatusModel
       .find({
         parentId: post._id.toString(),
         likeStatus: "Like",
         isBanned: false
       })
       .sort({ addedAt: "desc" })
       .limit(3)
       .lean();
     //mapped the newest likes for View
     const mappedNewestLikes = newestLikes.map((like) =>
       this.LikeDetailsView(like)
     );*/
    //const itemsLikes = await Promise.all(mappedNewestLikes);
    const extendedLikesInfo = new ExtendedLikesInfoViewModel(
      totalCountLike,
      totalCountDislike,
      myStatus,
      newestLikes
    );
    return new PostViewModel(
      post.postId,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.name,
      post.createdAt,
      extendedLikesInfo
    );
  }

  async getCommentsByIdPost(postId: string, data: PaginationDto, userId: string | null): Promise<PaginationViewModel<CommentsViewType[]>> {
    const { sortDirection, sortBy, pageSize, pageNumber } = data;
    const queryPost = `
        SELECT *
        FROM posts
        WHERE "postId" = '${postId}'
    `;
    //find post by postId and userId
    const post = await this.dataSource.query(queryPost);
    if (!post[0]) throw new NotFoundExceptionMY(`No content found for current id: ${postId}`);
    //finding comments by postId
    const queryFilter = `
        SELECT c."commentId"                                                           AS "id",
               c."content",
               c."userId",
               u."login"                                                               AS "userLogin",
               c."createdAt",
               (SELECT count(*) AS "countLike"
                FROM "likesComment" l
                WHERE l."parentId" = c."commentId"
                  AND l."likeStatus" = 'Like'
                  AND l."isBanned" = false)                                            AS "likeCount",
               (SELECT count(*) AS "countDislike"
                FROM "likesComment" l
                WHERE l."parentId" = c."commentId"
                  AND l."likeStatus" = 'Dislike'
                  AND l."isBanned" = false)                                            AS "dislikeCount",
               COALESCE((SELECT l."likeStatus"
                         FROM "likesComment" l
                         WHERE l."parentId" = c."commentId"
                           AND l."userId" = ${userId ? `'${userId}'` : null}), 'None') AS "myStatus"
        FROM comments c
                 LEFT JOIN users u on u."userId" = c."ownerId"
        WHERE c."postId" = '${postId}'
          AND c."isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    const commentsWithAddFields = await this.dataSource.query(queryFilter);
    //mapped comments for View
    const mappedComments = commentsWithAddFields.map((object) =>
      this.commentByIdPostForView(object)
    );
    const itemsComments = await Promise.all(mappedComments);
    //counting all comments
    const filterCounting = `
        SELECT count(*)
        FROM comments
        WHERE "postId" = '${postId}'
          AND "isBanned" = false
    `;
    const totalCountComments = await this.dataSource.query(filterCounting);
    const { count } = totalCountComments[0];
    const pagesCountRes = Math.ceil(+count / data.pageSize);
    //returning comment with pagination
    return new PaginationViewModel(
      pagesCountRes,
      data.pageNumber,
      data.pageSize,
      +count,
      itemsComments
    );
  }

  private async commentByIdPostForView(object: any): Promise<CommentsViewType> {
    const likesInfo = new LikesInfoViewModel(
      +object.likeCount,
      +object.dislikeCount,
      object.myStatus
    );
    return new CommentsViewType(
      object.id,
      object.content,
      object.userId,
      object.userLogin,
      object.createdAt,
      likesInfo
    );
  }

  async createPostForView(id: string): Promise<PostViewModel> {
    const query = `
        SELECT p."postId" AS "id",
               p.title,
               p."shortDescription",
               p.content,
               p."blogId",
               b.name     AS "blogName",
               p."createdAt"
        FROM posts p
                 LEFT JOIN blogs b on b."blogId" = p."blogId"
        WHERE "postId" = '${id}'
    `;
    const post = await this.dataSource.query(query);
    const extendedLikesInfo = new ExtendedLikesInfoViewModel(
      0,
      0,
      LikeStatusType.None,
      []);
    //returning created post with extended likes info for View
    return new PostViewModel(
      post[0].id,
      post[0].title,
      post[0].shortDescription,
      post[0].content,
      post[0].blogId,
      post[0].blogName,
      post[0].createdAt,
      extendedLikesInfo);
  }

  async getCommentsBloggerForPosts(userId: string, paginationInputModel: PaginationDto) {
    const { sortDirection, sortBy, pageSize, pageNumber } = paginationInputModel;
    const query = `
        SELECT c."commentId"                                      AS "id",
               c."content",
               c."createdAt",
               c."userId",
               u."userId",
               u."login"                                          AS "userLogin",
               p."postId",
               p."title",
               b."blogId",
               b."name"                                           AS "blogName",
               (SELECT count(*) AS "countLike"
                FROM "likesComment" l
                WHERE l."parentId" = c."commentId"
                  AND l."likeStatus" = 'Like'
                  AND l."isBanned" = false)                       AS "likeCount",
               (SELECT count(*) AS "countDislike"
                FROM "likesComment" l
                WHERE l."parentId" = c."commentId"
                  AND l."likeStatus" = 'Dislike'
                  AND l."isBanned" = false)                       AS "dislikeCount",
               COALESCE((SELECT l."likeStatus"
                         FROM "likesComment" l
                         WHERE l."parentId" = c."commentId"
                           AND l."userId" = '${userId}'), 'None') AS "myStatus"
        FROM "comments" c
                 LEFT JOIN posts p on c."postId" = p."postId"
                 LEFT JOIN blogs b on b."blogId" = p."blogId"
                 LEFT JOIN users u on u."userId" = c."ownerId"
        WHERE "ownerId" = '${userId}'
        ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    const foundCommentsWithAddFields = await this.dataSource.query(query);
    const mappedPosts = foundCommentsWithAddFields.map((object) => this.commentBloggerForPostView(object));
    const items = await Promise.all(mappedPosts);

    const requestCount = `
        SELECT count(*)
        FROM "comments"
        WHERE "ownerId" = '${userId}'
    `;
    const commentsCount = await this.dataSource.query(requestCount);
    const totalCount = +commentsCount[0]["count"];
    // pages count
    const pagesCountRes = Math.ceil(totalCount / pageSize);
    // Found posts with pagination
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      totalCount,
      items
    );
  }

  private async commentBloggerForPostView(object: any) {
    const likesInfo = new LikesInfoViewModel(
      +object.likeCount,
      +object.dislikeCount,
      object.myStatus
    );
    const commentatorInfo = new CommentatorInfoModel(
      object.userId,
      object.userLogin
    );
    const postInfo = new PostInfoModel(
      object.postId,
      object.title,
      object.blogId,
      object.blogName
    );
    return new BloggerCommentsViewType(
      object.id,
      object.content,
      object.createdAt,
      likesInfo,
      commentatorInfo,
      postInfo
    );
  }


  /////------- not used

  async createPostFor_View(id: string): Promise<PostViewModel> {
    const query = `
        SELECT *
        FROM posts
        WHERE "postId" = '${id}'
    `;
    const post = await this.dataSource.query(query);
    const extendedLikesInfo = new ExtendedLikesInfoViewModel(
      0,
      0,
      LikeStatusType.None,
      []);
    //returning created post with extended likes info for View
    return new PostViewModel(
      post[0].postId,
      post[0].title,
      post[0].shortDescription,
      post[0].content,
      post[0].blogId,
      post[0].blogName,
      post[0].createdAt,
      extendedLikesInfo);
  }

  async findCommentsByIdPost(postId: string, data: PaginationDto, userId: string | null): Promise<PaginationViewModel<CommentsViewType[]>> {
    const { sortDirection, sortBy, pageSize, pageNumber } = data;
    const queryPost = `
        SELECT *
        FROM posts
        WHERE "postId" = '${postId}'
    `;
    //find post by postId and userId
    const post = await this.dataSource.query(queryPost);
    if (!post[0]) throw new NotFoundExceptionMY(`Not found for id: ${postId}`);
    const filter = `
        SELECT *
        FROM comments
        WHERE "postId" = '${postId}'
          AND "isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    const filterCounting = `
        SELECT count(*)
        FROM comments
        WHERE "postId" = '${postId}'
          AND "isBanned" = false
    `;
    //find comment by postId
    const comments = await this.dataSource.query(filter);
    const mappedComments = comments.map((comment) =>
      this.commentWithNewId(comment, userId)
    );
    const itemsComments = await Promise.all(mappedComments);
    //counting comments
    const totalCountComments = await this.dataSource.query(filterCounting);
    const { count } = totalCountComments[0];
    const pagesCountRes = Math.ceil(+count / data.pageSize);
    //returning comment with pagination
    return new PaginationViewModel(
      pagesCountRes,
      data.pageNumber,
      data.pageSize,
      +count,
      itemsComments
    );
  }


  private async commentWithNewId(comment: CommentDBSQLType, userId: string | null): Promise<CommentsViewType> {
    let myStatus: string = LikeStatusType.None;
    if (userId) {
      const query =
        `
            SELECT *
            FROM "likesComment"
            WHERE "userId" = '${userId}'
              AND "parentId" = '${comment.commentId}'
        `;
      const result = await this.dataSource.query(query);
      if (result[0]) {
        myStatus = result[0].likeStatus;
      }
    }
    const queryTotalCountLike =
      `
          SELECT count(*)
          FROM "likesComment"
          WHERE "parentId" = '${comment.commentId}'
            AND "likeStatus" = 'Like'
            AND "isBanned" = false
      `;
    const totalCountLike = await this.dataSource.query(queryTotalCountLike);
    const countLikes = totalCountLike[0]["count"];
    const queryTotalCountDislike =
      `
          SELECT count(*)
          FROM "likesComment"
          WHERE "parentId" = '${comment.commentId}'
            AND "likeStatus" = 'Dislike'
            AND "isBanned" = false
      `;
    const totalCountDislike = await this.dataSource.query(queryTotalCountDislike);
    const countDislikes = totalCountDislike[0]["count"];
    const likesInfo = new LikesInfoViewModel(
      +countLikes,
      +countDislikes,
      myStatus
    );
    return new CommentsViewType(
      comment.commentId,
      comment.content,
      comment.userId,
      comment.userLogin,
      comment.createdAt,
      likesInfo
    );
  }

  async findCommentsBloggerForPosts(userId: string, paginationInputModel: PaginationDto) {
    const { sortDirection, sortBy, pageSize, pageNumber } = paginationInputModel;
    //search all comments with pagination
    const query = `
        SELECT *
        FROM "comments"
        WHERE "ownerId" = '${userId}'
        ORDER BY "${sortBy}" ${sortDirection}
              LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    const foundComments = await this.dataSource.query(query);
    const requestCount = `
        SELECT count(*)
        FROM "comments"
        WHERE "ownerId" = '${userId}'
    `;
    const commentsCount = await this.dataSource.query(requestCount);
    const totalCount = +commentsCount[0]["count"];
    //mapped posts for view
    const mappedPosts = foundComments.map((comment) => this.bloggerCommentViewModel(comment, userId));
    const items = await Promise.all(mappedPosts);
    // pages count
    const pagesCountRes = Math.ceil(totalCount / pageSize);
    // Found posts with pagination
    return new PaginationViewModel(
      pagesCountRes,
      pageNumber,
      pageSize,
      totalCount,
      items
    );
  }

  private async bloggerCommentViewModel(comment: CommentDBSQLType, userId: string | null) {
    let myStatus: string = LikeStatusType.None;
    if (userId) {
      const query = `
          SELECT *
          FROM "likesComment"
          WHERE "userId" = '${userId}'
            AND "parentId" = '${comment.commentId}'
      `;
      const result = await this.dataSource.query(query);
      if (result[0]) {
        myStatus = result[0].likeStatus;
      }
    }
    const requestCountLike = `
        SELECT count(*)
        FROM "likesComment"
        WHERE "parentId" = '${comment.commentId}'
          AND "likeStatus" = 'Like'
          AND "isBanned" = false
    `;
    const countLike = await this.dataSource.query(requestCountLike);
    const totalCountLike = +countLike[0]["count"];
    const requestCountDislike = `
        SELECT count(*)
        FROM "likesComment"
        WHERE "parentId" = '${comment.commentId}'
          AND "likeStatus" = 'Dislike'
          AND "isBanned" = false
    `;
    const countDislike = await this.dataSource.query(requestCountDislike);
    const totalCountDislike = +countDislike[0]["count"];
    const likesInfo = new LikesInfoViewModel(
      totalCountLike,
      totalCountDislike,
      myStatus
    );
    const queryPost = `
        SELECT *
        FROM "posts"
        WHERE "postId" = '${comment.postId}'
    `;
    const post = await this.dataSource.query(queryPost);
    const commentatorInfo = new CommentatorInfoModel(
      comment.userId,
      comment.userLogin
    );
    const postInfo = new PostInfoModel(
      post[0].postId,
      post[0].title,
      post[0].blogId,
      post[0].blogName
    );
    return new BloggerCommentsViewType(
      comment.commentId,
      comment.content,
      comment.createdAt,
      likesInfo,
      commentatorInfo,
      postInfo
    );
  }
}
