import { Injectable } from "@nestjs/common";
import { PaginationDto } from "../../../blogs/api/input-Dtos/pagination-Dto-Model";
import { PostViewModel } from "./post-View-Model";
import {
  LikeStatusType
} from "../../domain/likesPost-schema-Model";
import {
  ExtendedLikesInfoViewModel
} from "./likes-Info-View-Model";
import { PaginationViewModel } from "../../../blogs/infrastructure/query-repository/pagination-View-Model";
import { NotFoundExceptionMY } from "../../../../helpers/My-HttpExceptionFilter";
import {
  BloggerCommentsViewType, CommentatorInfoModel,
  CommentsViewType,
  LikesInfoViewModel, PostInfoModel
} from "../../../comments/infrastructure/query-repository/comments-View-Model";
import { DataSource } from "typeorm";
import { CommentDBSQLType } from "../../../comments/domain/comment-DB-SQL-Type";

@Injectable()
export class PostsSqlQueryRepositories {
  constructor(
    private readonly dataSource: DataSource
  ) {
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
      // const result = await this.likesStatusModel.findOne({
      //   userId: userId,
      //   parentId: comment.commentId
      // });
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
    // const totalCountLike = await this.likesStatusModel.countDocuments({
    //   parentId: comment._id,
    //   likeStatus: "Like",
    //   isBanned: false
    // });
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
    // const totalCountDislike = await this.likesStatusModel.countDocuments({
    //   parentId: comment._id,
    //   likeStatus: "Dislike",
    //   isBanned: false
    // });
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

    //search all posts with pagination by blogId
    /* const filter = blogId ? { blogId, isBanned: false } : { isBanned: false };
     const foundPosts = await this.postModel
       .find(filter)
       .skip((data.pageNumber - 1) * data.pageSize)
       .limit(data.pageSize)
       .sort({ [data.sortBy]: data.sortDirection })
       .lean();
     //mapped posts for view
     const mappedPosts = foundPosts.map((post) =>
       this.postForView(post, userId)
     );
     const itemsPosts = await Promise.all(mappedPosts);
     //counting posts for blogId
     const totalCount = await this.postModel.countDocuments(filter);
     //pages count
     const pagesCountRes = Math.ceil(totalCount / data.pageSize);
     // Found posts with pagination
     return new PaginationViewModel(
       pagesCountRes,
       data.pageNumber,
       data.pageSize,
       totalCount,
       itemsPosts
     );*/
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
    // const post = await this.postModel.findOne({
    //   _id: new ObjectId(id),
    //   isBanned: false
    // });

    if (!post[0]) throw new NotFoundExceptionMY(`Not found for id: ${id}`);
    //returning post for View
    // return  /// ???????
    return this.postForView(post[0], userId);
  }

  async findCommentsByIdPost(postId: string, data: PaginationDto, userId: string | null): Promise<PaginationViewModel<CommentsViewType[]>> {
    const { sortDirection, sortBy, pageSize, pageNumber } = data;
    const queryPost = `
        SELECT *
        FROM posts
        WHERE "postId" = '${postId}'
    `;
    /*if (userId) {
      queryPost = `
          SELECT *
          FROM posts
          WHERE "postId" = '${postId}'
            AND "userId" = '${userId}'
      `;
    } else {
      queryPost = `
          SELECT *
          FROM posts
          WHERE "postId" = '${postId}'
      `;
    }*/
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

    /* const filter = { postId: postId, isBanned: false };
     //find post by postId and userId
     const post = await this.findPost(postId, userId);
     if (!post) throw new NotFoundExceptionMY(`Not found for id: ${postId}`);
     //find comment by postId
     const comments = await this.commentModel
       .find(filter)
       .skip((data.pageNumber - 1) * data.pageSize)
       .limit(data.pageSize)
       .sort({ [data.sortBy]: data.sortDirection })
       .lean();

     const mappedComments = comments.map((comment) =>
       this.commentWithNewId(comment, userId)
     );
     const itemsComments = await Promise.all(mappedComments);
     //counting comments
     const totalCountComments = await this.commentModel.countDocuments(
       postId ? { postId, isBanned: false } : { isBanned: false }
     );
     const pagesCountRes = Math.ceil(totalCountComments / data.pageSize);
     //returning comment with pagination
     return new PaginationViewModel(
       pagesCountRes,
       data.pageNumber,
       data.pageSize,
       totalCountComments,
       itemsComments
     );*/
  }

  async createPostForView(id: string): Promise<PostViewModel> {
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
    /*const postId = post._id.toString();
    const newestLikes = await this.likesPostsStatusModel
      .find({ parentId: postId, likeStatus: "Like", isBanned: false })
      .sort({ addedAt: "desc" })
      .limit(3)
      .lean();
    const mappedNewestLikes = newestLikes.map((like) =>
      this.LikeDetailsView(like)
    );
    //const itemsLikes = await Promise.all(mappedNewestLikes);
    const extendedLikesInfo = new ExtendedLikesInfoViewModel(
      0,
      0,
      LikeStatusType.None,
      mappedNewestLikes
    );
    //returning created post with extended likes info for View
    return new PostViewModel(
      post._id.toString(),
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      extendedLikesInfo
    );*/
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
    const queryCount = `
        SELECT count(*)
        FROM "comments"
        WHERE "ownerId" = '${userId}'
    `;
    const foundComments = await this.dataSource.query(query);
    const commentsCount = await this.dataSource.query(queryCount);
    const totalCount = +commentsCount[0]["count"];
    //mapped posts for view
    const mappedPosts = foundComments.map((comment) => this.bloggerCommentViewModel(comment, userId));
    const items = await Promise.all(mappedPosts);
    // pages count
    const pagesCountRes = Math.ceil(totalCount / pageSize);
    // Found posts with pagination

    //
    // const foundComments = await this.commentModel.find({ ownerId: userId })
    //   .skip((pageNumber - 1) * pageSize)
    //   .limit(pageSize)
    //   .sort({ [sortBy]: sortDirection })
    //   .lean();
    // //mapped posts for view
    // const mappedPosts = foundComments.map((comment) => this.bloggerCommentViewModel(comment, userId));
    // const items = await Promise.all(mappedPosts);
    // const totalCount = await this.commentModel.countDocuments({ ownerId: userId });
    //pages count
    // const pagesCountRes = Math.ceil(totalCount / pageSize);
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

      // const result = await this.likesStatusModel.findOne({ userId: userId, parentId: comment._id.toString() });
      if (result[0]) {
        myStatus = result[0].likeStatus;
      }
    }
    const queryCountLike = `
        SELECT count(*)
        FROM "likesComment"
        WHERE "parentId" = '${comment.commentId}'
          AND "likeStatus" = 'Like'
          AND "isBanned" = false
    `;
    const countLike = await this.dataSource.query(queryCountLike);
    const totalCountLike = +countLike[0]["count"];
    // const totalCountLike = await this.likesStatusModel.countDocuments({
    //   parentId: comment._id.toString(),
    //   likeStatus: "Like",
    //   isBanned: false
    // });
    const queryCountDislike = `
        SELECT count(*)
        FROM "likesComment"
        WHERE "parentId" = '${comment.commentId}'
          AND "likeStatus" = 'Dislike'
          AND "isBanned" = false
    `;
    const countDislike = await this.dataSource.query(queryCountDislike);
    const totalCountDislike = +countDislike[0]["count"];
    // const totalCountDislike = await this.likesStatusModel.countDocuments({
    //   parentId: comment._id.toString(),
    //   likeStatus: "Dislike",
    //   isBanned: false
    // });
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

    // const post = await this.postModel.findOne({ _id: new Object(comment.postId) });
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
