import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { CreatePostDto } from "../../posts/api/input-Dtos/create-Post-Dto-Model";
import { IdValidationPipe } from "../../../validators/id-validation-pipe";
import { PostViewModel } from "../../posts/infrastructure/query-repositories/post-View-Model";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogCommand } from "../application/use-cases/create-blog-command";
import { DeleteBlogCommand } from "../application/use-cases/delete-blog-command";
import { UpdateBlogCommand } from "../application/use-cases/update-blog-command";
import { CreatePostCommand } from "../application/use-cases/create-post-command";
import { BlogsQueryRepositories } from "../../blogs/infrastructure/query-repository/blogs-query.repositories";
import { JwtAuthGuard } from "../../../guards/jwt-auth-bearer.guard";
import { PaginationDto } from "../../blogs/api/input-Dtos/pagination-Dto-Model";
import { BlogViewModel } from "../../blogs/infrastructure/query-repository/blog-View-Model";
import { PaginationViewModel } from "../../blogs/infrastructure/query-repository/pagination-View-Model";
import { UpdatePostCommand } from "../application/use-cases/update-post-command";
import { DeletePostCommand } from "../application/use-cases/delete-post-command";
import { CurrentUserIdBlogger } from "../../../decorators/current-user-id.param.decorator";
import { CreateBlogDto } from "./input-dtos/create-Blog-Dto-Model";
import { UpdateBlogDto } from "./input-dtos/update-Blog-Dto-Model";
import { UpdateBanInfoForUserDto } from "./input-dtos/update-ban-info-for-User-Dto-Model";
import { UpdateBanUserForCurrentBlogCommand } from "../application/use-cases/update-ban-User-For-Current-Blog-command";
import { PostsQueryRepositories } from "../../posts/infrastructure/query-repositories/posts-query.reposit";
import { ForbiddenExceptionMY } from "../../../helpers/My-HttpExceptionFilter";

@UseGuards(JwtAuthGuard)
@Controller(`blogger`)
export class BloggersController {
  constructor(private readonly blogsQueryRepositories: BlogsQueryRepositories,
              private readonly postsQueryRepositories: PostsQueryRepositories,
              private commandBus: CommandBus) {
  }

  @Get(`blogs/comments`)
  async getComments(@CurrentUserIdBlogger() userId: string,
                    @Query() paginationInputModel: PaginationDto) {
    return await this.postsQueryRepositories.findCommentsBloggerForPosts(userId, paginationInputModel);
  }

  @HttpCode(204)
  @Delete(`blogs/:blogId`)
  async deleteBlog(@CurrentUserIdBlogger() userId: string,
                   @Param(`blogId`, IdValidationPipe) blogId: string): Promise<boolean> {
    return await this.commandBus.execute(new DeleteBlogCommand(blogId, userId));
  }

  @HttpCode(204)
  @Put(`blogs/:blogId`)
  async updateBlog(@CurrentUserIdBlogger() userId: string,
                   @Param(`blogId`, IdValidationPipe) blogId: string,
                   @Body() blogInputModel: UpdateBlogDto): Promise<boolean> {
    return await this.commandBus.execute(new UpdateBlogCommand(userId, blogId, blogInputModel));
  }

  @Post(`blogs/:blogId/posts`)
  async createPost(@CurrentUserIdBlogger() userId: string,
                   @Param(`blogId`, IdValidationPipe) blogId: string,
                   @Body() postInputModel: CreatePostDto): Promise<PostViewModel> {
    return this.commandBus.execute(new CreatePostCommand(postInputModel, blogId, userId));
  }

  @HttpCode(204)
  @Put(`blogs/:blogId/posts/:postId`)
  async updatePost(@CurrentUserIdBlogger() userId: string,
                   @Param(`blogId`, IdValidationPipe) blogId: string,
                   @Param(`postId`, IdValidationPipe) postId: string,
                   @Body() postInputModel: CreatePostDto): Promise<boolean> {
    return await this.commandBus.execute(new UpdatePostCommand(userId, blogId, postId, postInputModel)
    );
  }

  @Delete(`blogs/:blogId/posts/:postId`)
  @HttpCode(204)
  async deletePost(@CurrentUserIdBlogger() userId: string,
                   @Param(`blogId`, IdValidationPipe) blogId: string,
                   @Param(`postId`, IdValidationPipe) postId: string): Promise<boolean> {
    return await this.commandBus.execute(new DeletePostCommand(userId, blogId, postId));
  }

  @Post(`blogs`)
  async createBlog(@CurrentUserIdBlogger() userId: string,
                   @Body() blogInputModel: CreateBlogDto): Promise<BlogViewModel> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(userId, blogInputModel));
    return this.blogsQueryRepositories.findBlog(blogId);
  }

  @Get(`blogs`)
  async findAll(@CurrentUserIdBlogger() userId: string,
                @Query() paginationInputModel: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    return await this.blogsQueryRepositories.findBlogsForCurrentBlogger(paginationInputModel, userId);
  }

  @HttpCode(204)
  @Put(`users/:id/ban`)
  async banUserForCurrentBlog(@CurrentUserIdBlogger() userId: string,
                              @Param(`id`, IdValidationPipe) id: string,
                              @Body() banUserForCurrentBlogInputModel: UpdateBanInfoForUserDto): Promise<boolean> {
    return await this.commandBus.execute(new UpdateBanUserForCurrentBlogCommand(userId, id, banUserForCurrentBlogInputModel));
  }

  @Get(`users/blog/:id`)
  async getBanedUser(@CurrentUserIdBlogger() userId: string,
                     @Param(`id`, IdValidationPipe) id: string,
                     @Query() paginationInputModel: PaginationDto) {
    const blog = await this.blogsQueryRepositories.findBlogWithMap(id);
    if (blog.userId !== userId) throw new ForbiddenExceptionMY(`You are not the owner of the blog`);
    return await this.blogsQueryRepositories.getBannedUsersForBlog(id, paginationInputModel);
  }
}
