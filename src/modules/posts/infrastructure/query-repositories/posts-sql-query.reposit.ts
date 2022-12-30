import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { LeanDocument, Model } from "mongoose";
import { Post, PostDocument } from "../../domain/post-schema-Model";
import { PaginationDto } from "../../../blogs/api/input-Dtos/pagination-Dto-Model";
import { PostViewModel } from "./post-View-Model";
import {
  LikesPostsStatus,
  LikesPostsStatusDocument,
  LikeStatusType
} from "../../domain/likesPost-schema-Model";
import {
  ExtendedLikesInfoViewModel,
  LikeDetailsViewModel
} from "./likes-Info-View-Model";
import { PaginationViewModel } from "../../../blogs/infrastructure/query-repository/pagination-View-Model";
import { NotFoundExceptionMY } from "../../../../helpers/My-HttpExceptionFilter";
import {
  Comment,
  CommentDocument
} from "../../../comments/domain/comments-schema-Model";
import { CommentsDBType } from "../../../comments/domain/comment-DB-Type";
import {
  LikesStatus,
  LikesStatusDocument
} from "../../../comments/domain/likesStatus-schema-Model";
import {
  BloggerCommentsViewType, CommentatorInfoModel,
  CommentsViewType,
  LikesInfoViewModel, PostInfoModel
} from "../../../comments/infrastructure/query-repository/comments-View-Model";
import { BlogBanInfo, BlogBanInfoDocument } from "../../../blogger/domain/ban-user-for-current-blog-schema-Model";
import { DataSource } from "typeorm";
import { PostDBSQLType } from "../../domain/post-DB-SQL-Type";

@Injectable()
export class PostsSqlQueryRepositories {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly dataSource: DataSource,
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
    @InjectModel(LikesStatus.name) private readonly likesStatusModel: Model<LikesStatusDocument>,
    @InjectModel(LikesPostsStatus.name) private readonly likesPostsStatusModel: Model<LikesPostsStatusDocument>,
    @InjectModel(BlogBanInfo.name) private readonly blogBanInfoModel: Model<BlogBanInfoDocument>
  ) {
  }

  private LikeDetailsView(object: LeanDocument<LikesPostsStatusDocument>): LikeDetailsViewModel {
    return new LikeDetailsViewModel(
      object.addedAt,
      object.userId,
      object.login
    );
  }

  private async commentWithNewId(comment: CommentsDBType, userId: string | null): Promise<CommentsViewType> {
    let myStatus: string = LikeStatusType.None;
    if (userId) {
      const result = await this.likesStatusModel.findOne({
        userId: userId,
        parentId: comment._id
      });
      if (result) {
        myStatus = result.likeStatus;
      }
    }
    const totalCountLike = await this.likesStatusModel.countDocuments({
      parentId: comment._id,
      likeStatus: "Like",
      isBanned: false
    });
    const totalCountDislike = await this.likesStatusModel.countDocuments({
      parentId: comment._id,
      likeStatus: "Dislike",
      isBanned: false
    });
    const likesInfo = new LikesInfoViewModel(
      totalCountLike,
      totalCountDislike,
      myStatus
    );
    return new CommentsViewType(
      comment._id.toString(),
      comment.content,
      comment.userId,
      comment.userLogin,
      comment.createdAt,
      likesInfo
    );
  }

  private async postForView(post: PostDBSQLType, userId: string | null): Promise<PostViewModel> {
    console.log(post);
    //find likes status
    let myStatus: string = LikeStatusType.None;
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
      0, //totalCountLike,
      0, //totalCountDislike,
      myStatus,
      [] //mappedNewestLikes
    );
    return new PostViewModel(
      post.postId,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      extendedLikesInfo
    );
  }

  async findPosts(data: PaginationDto, userId: string | null, blogId?: string): Promise<PaginationViewModel<PostViewModel[]>> {
    const { sortDirection, sortBy, pageSize, pageNumber } = data;
    // let query = blogId ? { "blogId" = `${blogId}` AND "isBanned" =  false } : { "isBanned" = false };
    let filter = `
        SELECT *
        FROM posts
        WHERE "isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT ${pageSize}
        OFFSET ${(pageNumber - 1) * pageSize}
    `;
    let filterCounting = `
        SELECT count(*)
        FROM posts
        WHERE "isBanned" = false
    `;
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
          SELECT *
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
    const filter = { postId: postId, isBanned: false };
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
    );
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
    const foundComments = await this.commentModel.find({ ownerId: userId })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection })
      .lean();
    //mapped posts for view
    const mappedPosts = foundComments.map((comment) => this.bloggerCommentViewModel(comment, userId));
    const items = await Promise.all(mappedPosts);
    const totalCount = await this.commentModel.countDocuments({ ownerId: userId });
    //pages count
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

  private async bloggerCommentViewModel(comment: CommentsDBType, userId: string | null) {
    let myStatus: string = LikeStatusType.None;
    if (userId) {
      const result = await this.likesStatusModel.findOne({ userId: userId, parentId: comment._id.toString() });
      if (result) {
        myStatus = result.likeStatus;
      }
    }
    const totalCountLike = await this.likesStatusModel.countDocuments({
      parentId: comment._id.toString(),
      likeStatus: "Like",
      isBanned: false
    });
    const totalCountDislike = await this.likesStatusModel.countDocuments({
      parentId: comment._id.toString(),
      likeStatus: "Dislike",
      isBanned: false
    });
    const likesInfo = new LikesInfoViewModel(
      totalCountLike,
      totalCountDislike,
      myStatus
    );

    const post = await this.postModel.findOne({ _id: new Object(comment.postId) });
    const commentatorInfo = new CommentatorInfoModel(
      comment.userId,
      comment.userLogin
    );
    const postInfo = new PostInfoModel(
      post._id.toString(),
      post.title,
      post.blogId,
      post.blogName
    );
    return new BloggerCommentsViewType(
      comment._id.toString(),
      comment.content,
      comment.createdAt,
      likesInfo,
      commentatorInfo,
      postInfo
    );
  }
}
