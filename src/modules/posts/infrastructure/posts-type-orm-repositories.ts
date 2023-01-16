import { Injectable } from "@nestjs/common";
import { PreparationPostForDB } from "../domain/types/post-preparation-for-DB";
import { CreatePostDto } from "../api/input-Dtos/create-Post-Dto-Model";
import { Repository } from "typeorm";
import { PostDBSQLType } from "../domain/types/post-DB-SQL-Type";
import { IPostRepository } from "../interfaces/IPostRepository";
import { InjectRepository } from "@nestjs/typeorm";
import { PostT } from "../../../entities/post.entity";
import { LikePost } from "../../../entities/likePost.entity";

@Injectable()
export class PostsTypeOrmRepositories implements IPostRepository {
  constructor(
    @InjectRepository(PostT)
    private readonly postTRepository: Repository<PostT>,
    @InjectRepository(LikePost)
    private readonly likePostRepository: Repository<LikePost>
  ) {
  }

  async createPost(newPost: PreparationPostForDB): Promise<string> {
    const { userId, content, blogId, createdAt, shortDescription, blogName, title } = newPost;
    const post = new PostT();
    post.userId = userId;
    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.createdAt = createdAt;
    post.blogName = blogName;
    post.blogId = blogId;
    const createdPost = await this.postTRepository.save(post);
    return createdPost.postId;
  }

  async updatePost(id: string, data: CreatePostDto, blogId: string, userId: string): Promise<boolean> {
    const { title, shortDescription, content } = data;
    await this.postTRepository.manager.connection.transaction(async manager => {
      await manager.update(PostT,
        { postId: id, userId: userId },
        { title: title, shortDescription: shortDescription, content: content }
      );
    })
      .catch((e) => {
        console.log(e);
        return null;
      });
    return true;
  }

  async deletePost(id: string, userId: string): Promise<boolean> {
    await this.postTRepository.manager.connection.transaction(async manager => {
      await manager.delete(PostT,
        { postId: id, userId: userId });
    })
      .catch((e) => {
        console.log(e);
        return false;
      });
    return true;
  }

  async findPost(id: string): Promise<PostDBSQLType> {
    const post = await this.postTRepository
      .findOneBy({ postId: id });
    if (!post) return null;
    return post;
  }

  async updateStatusBanPostForUser(userId: string, isBanned: boolean): Promise<boolean> {
    await this.postTRepository.manager.connection.transaction(async manager => {
      await manager.update(PostT,
        { userId: userId },
        { isBanned: isBanned }
      );
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }

  async updateStatusBanPostForBlogger(blogId: string, isBanned: boolean): Promise<boolean> {
    await this.postTRepository.manager.connection.transaction(async manager => {
      await manager.update(PostT,
        { blogId: blogId },
        { isBanned: isBanned }
      );
    })
      .catch((e) => {
        console.log(e);
        return false;
      });
    return true;
  }

  async updateLikeStatusPost(id: string, userId: string, likeStatus: string, login: string): Promise<boolean> {
    const result = await this.likePostRepository
      .findOneBy({ userId: userId, parentId: id });
    if (!result) {
      const likePost = new LikePost();
      likePost.parentId = id;
      likePost.addedAt = new Date().toISOString();
      likePost.likeStatus = likeStatus;
      likePost.userLogin = login;
      likePost.userId = userId;
      await this.likePostRepository.save(likePost);
      await this.likePostRepository.manager.connection.transaction(async manager => {
        await manager.update(LikePost,
          { postId: id, userId: userId },
          { likeStatus: likeStatus, addedAt: new Date().toISOString() }
        );
      })
        .catch((e) => {
          console.log(e);
          return null;
        });
      return true;
    } else {
      await this.likePostRepository.manager.connection.transaction(async manager => {
        await manager.update(LikePost,
          { postId: id, userId: userId },
          { likeStatus: likeStatus, addedAt: new Date().toISOString() }
        );
      })
        .catch((e) => {
          console.log(e);
          return null;
        });
      return true;
    }
  }

  async updateStatusBanLikePost(userId: string, isBanned: boolean): Promise<boolean> {
    await this.likePostRepository.manager.connection.transaction(async manager => {
      await manager.update(LikePost,
        { userId: userId },
        { isBanned: isBanned }
      );
    })
      .catch((e) => {
        console.log(e);
      });
    return true;
  }
}
