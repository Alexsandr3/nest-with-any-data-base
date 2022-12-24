import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor() {}

  /*async createPost(postInputModel: CreatePostDto): Promise<PostViewModel> {
    //finding Blog
    const blog = await this.blogsQueryRepositories.findBlog(postInputModel.blogId);
    //preparation Post for save in DB
    const newPost = new PreparationPostForDB(
      postInputModel.title,
      postInputModel.shortDescription,
      postInputModel.content,
      postInputModel.blogId,
      blog.name,
      new Date().toISOString()
    );
    const createdPost = await this.postsRepositories.createPost(newPost);
    return await this.postsQueryRepositories.createPostForView(createdPost);
  }*/

  /*async removePost(id: string): Promise<boolean> {
    const result = await this.postsRepositories.deletePost(id);
    if (!result) throw new NotFoundExceptionMY(`Not found for id:${id}`);
    return true;
  }*/

  /*async updatePost(id: string, postInputModel: CreatePostDto): Promise<boolean> {
    const result = await this.postsRepositories.updatePost(id, postInputModel);
    if (!result) throw new NotFoundExceptionMY(`Not found for id:${id}`);
    return true;
  }*/

  /*async updateLikeStatus(id: string, likeStatus: string, userId: string): Promise<boolean> {
    //finding post by id from uri params
    const post = await this.postsRepositories.findPost(id);
    if (!post) throw new NotFoundExceptionMY(`Not found for id: ${id}`);
    //finding user by userId for update like status
    const user = await this.usersQueryRepositories.findUser(userId);
    //update like status
    const result = await this.postsRepositories.updateStatusPostById(id, userId, likeStatus, user.login);
    if (!result) throw new NotFoundExceptionMY(`Like doesn't exists`);
    return result;
  }*/

  /*async createComment(id: string, content: string, userId: string): Promise<CommentsViewType> {
    //find post for create comment
    const post = await this.postsRepositories.findPost(id);
    if (!post) throw new NotFoundExceptionMY(`Not found for id: ${id}`);
    const user = await this.usersQueryRepositories.findUser(userId);
    //preparation comment for save in DB
    const newComment = new PreparationCommentForDB(
      post._id.toString(),
      content,
      userId,
      user.login,
      new Date().toISOString());
    return await this.commentsRepositories.createCommentByIdPost(newComment);
  }*/
}
