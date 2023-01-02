import { Injectable } from "@nestjs/common";
import { PreparationPostForDB } from "../domain/post-preparation-for-DB";
import { CreatePostDto } from "../api/input-Dtos/create-Post-Dto-Model";
import { DataSource } from "typeorm";
import { NotFoundExceptionMY } from "../../../helpers/My-HttpExceptionFilter";
import { PostDBSQLType } from "../domain/post-DB-SQL-Type";

@Injectable()
export class PostsSqlRepositories {
  constructor(
    private readonly dataSource: DataSource
  ) {
  }

  async createPost(newPost: PreparationPostForDB): Promise<string> {
    const { userId, content, blogId, createdAt, shortDescription, blogName, title } = newPost;
    const query = `
        INSERT INTO posts ("userId", "title", "shortDescription", "content",
                           "createdAt", "blogId", "blogName")
        VALUES ('${userId}', '${title}', '${shortDescription}', '${content}',
                '${createdAt}', '${blogId}', '${blogName}') RETURNING "postId"
    `;
    const post = await this.dataSource.query(query);
    const { postId } = post[0];
    return postId;
  }

  async updatePost(id: string, data: CreatePostDto, blogId: string, userId: string): Promise<boolean> {
    const { title, shortDescription, content } = data;
    const query =
      `
          UPDATE posts
          SET "title"            = '${title}',
              "shortDescription" = '${shortDescription}',
              "content"          = '${content}',
              "blogId"           = '${blogId}'
          WHERE "postId" = '${id}'
            AND "userId" = '${userId}'
      `;
    const res = await this.dataSource.query(query);
    if (res[1] === 0) throw new NotFoundExceptionMY(`Not found post for blog`);
    return true;
  }

  async deletePost(id: string, userId: string): Promise<boolean> {
    const query = `
        DELETE
        FROM posts
        WHERE "postId" = '${id}'
          AND "userId" = '${userId}'
    `;
    const res = await this.dataSource.query(query);
    return res[1] !== 0;
  }

  async findPost(id: string): Promise<PostDBSQLType> {
    const query = `
        SELECT *
        FROM posts
        WHERE "postId" = '${id}'
    `;
    const post = await this.dataSource.query(query);
    // const post = await this.postModel.findOne({ _id: new ObjectId(id) });
    if (!post[0]) return null;
    return post[0];
  }

  async updateStatusBanPostForUser(userId: string, isBanned: boolean): Promise<boolean> {
    const query = `
        UPDATE posts
        SET "isBanned" = ${isBanned}
        WHERE "userId" = '${userId}'
    `;
    await this.dataSource.query(query);
    return true;
    // const result = await this.postModel.updateMany(
    //   { userId: userId },
    //   { $set: { isBanned: isBanned } }
    // );
    // return result.matchedCount === 1;
  }

  async updateStatusBanPostForBlogger(blogId: string, isBanned: boolean): Promise<boolean> {
    const query = `
        UPDATE posts
        SET "isBanned" = ${isBanned}
        WHERE "blogId" = '${blogId}'
    `;
    await this.dataSource.query(query);
    return true;
    // const result = await this.postModel.updateMany(
    //   { blogId },
    //   { $set: { isBanned: isBanned } }
    // );
    // return result.matchedCount === 1;
  }

  async updateLikeStatusPost(id: string, userId: string, likeStatus: string, login: string): Promise<boolean> {
    const queryFind = `
        SELECT *
        FROM "likesPost"
        WHERE "userId" = '${userId}'
          AND "parentId" = '${id}'
    `;
    const result = await this.dataSource.query(queryFind);
    if (!result[0]) {
      const query = `
          INSERT INTO "likesPost"("parentId", "addedAt", "likeStatus", "userLogin", "userId")
          VALUES ('${id}', '${new Date().toISOString()}', '${likeStatus}', '${login}', '${userId}')
      `;
      await this.dataSource.query(query);
      const queryUpdate = `
          UPDATE "likesPost"
          SET "likeStatus" = '${likeStatus}',
              "addedAt"    = '${new Date().toISOString()}',
              "userLogin"  = '${login}'
          WHERE "userId" = '${userId}'
            AND "parentId" = '${id}'
      `;

      const res = await this.dataSource.query(queryUpdate);
      if (!res[1]) return null;
      return true;
    } else {
      const queryUpdate = `
          UPDATE "likesPost"
          SET "likeStatus" = '${likeStatus}',
              "addedAt"    = '${new Date().toISOString()}',
              "userLogin"  = '${login}'
          WHERE "userId" = '${userId}'
            AND "parentId" = '${id}'
      `;

      const res = await this.dataSource.query(queryUpdate);
      if (!res[1]) return null;
      return true;
    }

    // const like = await this.likesPostsStatusModel.updateOne(
    //   { userId: userId, parentId: id },
    //   {
    //     $set: {
    //       likeStatus: likeStatus,
    //       addedAt: new Date().toISOString(),
    //       login: login,
    //       isBanned: false
    //     }
    //   },
    //   { upsert: true }
    // );

  }

  async updateStatusBanLikePost(userId: string, isBanned: boolean): Promise<boolean> {
    const query = `
        UPDATE "likesPost"
        SET "isBanned" = ${isBanned}
        WHERE "userId" = '${userId}'
    `;
    await this.dataSource.query(query);
    return true;
    //
    // const result = await this.likesPostsStatusModel.updateMany(
    //   { userId: userId },
    //   { $set: { isBanned: isBanned } }
    // );
    // return result.matchedCount === 1;
  }
}
