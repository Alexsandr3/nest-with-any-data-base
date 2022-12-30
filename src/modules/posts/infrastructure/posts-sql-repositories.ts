import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post, PostDocument } from "../domain/post-schema-Model";
import { PreparationPostForDB } from "../domain/post-preparation-for-DB";
import {
  LikesPostsStatus,
  LikesPostsStatusDocument
} from "../domain/likesPost-schema-Model";
import { ObjectId } from "mongodb";
import { PostDBType } from "../domain/post-DB-Type";
import { CreatePostDto } from "../api/input-Dtos/create-Post-Dto-Model";
import { DataSource } from "typeorm";

@Injectable()
export class PostsSqlRepositories {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly dataSource: DataSource,
    @InjectModel(LikesPostsStatus.name)
    private readonly likesPostsStatusModel: Model<LikesPostsStatusDocument>
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
    await this.dataSource.query(query)
    return true
  }

  async deletePost(id: string, userId: string): Promise<boolean> {
    const query = `
        DELETE
        FROM posts 
        WHERE "postId" = '${id}' AND "userId" = '${userId}'
    `
    await this.dataSource.query(query)
    return true
  }

  async findPost(id: string): Promise<PostDBType> {
    const post = await this.postModel.findOne({ _id: new ObjectId(id) });
    if (!post) return null;
    return post;
  }

  async updateStatusBanPostForUser(userId: string, isBanned: boolean): Promise<boolean> {
    const query = `
        UPDATE posts
        SET "isBanned" = ${isBanned}
        WHERE "userId" = '${userId}'
    `
    await this.dataSource.query(query)
    return true
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
    `
    await this.dataSource.query(query)
    return true
    // const result = await this.postModel.updateMany(
    //   { blogId },
    //   { $set: { isBanned: isBanned } }
    // );
    // return result.matchedCount === 1;
  }

  async updateLikeStatusPost(id: string, userId: string, likeStatus: string, login: string): Promise<boolean> {
    const like = await this.likesPostsStatusModel.updateOne(
      { userId: userId, parentId: id },
      {
        $set: {
          likeStatus: likeStatus,
          addedAt: new Date().toISOString(),
          login: login,
          isBanned: false
        }
      },
      { upsert: true }
    );
    if (!like) return null;
    return true;
  }

  async updateStatusBanLikePost(userId: string, isBanned: boolean): Promise<boolean> {
    const result = await this.likesPostsStatusModel.updateMany(
      { userId: userId },
      { $set: { isBanned: isBanned } }
    );
    return result.matchedCount === 1;
  }
}
