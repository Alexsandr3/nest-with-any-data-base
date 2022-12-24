import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import { BlogsQueryRepositories } from "../infrastructure/query-repository/blogs-query.repositories";
import { BlogViewModel } from "../infrastructure/query-repository/blog-View-Model";
import { PaginationDto } from "./input-Dtos/pagination-Dto-Model";
import { PaginationViewModel } from "../infrastructure/query-repository/pagination-View-Model";
import { PostsQueryRepositories } from "../../posts/infrastructure/query-repositories/posts-query.reposit";
import { IdValidationPipe } from "../../../validators/id-validation-pipe";
import { PostViewModel } from "../../posts/infrastructure/query-repositories/post-View-Model";
import { CurrentUserId } from "../../../decorators/current-user-id.param.decorator";
import { JwtForGetGuard } from "../../../guards/jwt-auth-bearer-for-get.guard";

@Controller(`blogs`)
export class BlogsController {
  constructor(
    private readonly blogsQueryRepositories: BlogsQueryRepositories,
    private readonly postsQueryRepositories: PostsQueryRepositories
  ) {
  }

  @Get()
  async findAll(
    @Query() paginationInputModel: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    return await this.blogsQueryRepositories.findBlogs(paginationInputModel);
  }

  @UseGuards(JwtForGetGuard)
  @Get(`:blogId/posts`)
  async findPosts(@CurrentUserId() userId: string,
                  @Param(`blogId`, IdValidationPipe) blogId: string,
                  @Query() paginationInputModel: PaginationDto): Promise<PaginationViewModel<PostViewModel[]>> {
    await this.blogsQueryRepositories.findBlog(blogId);
    return this.postsQueryRepositories.findPosts(paginationInputModel, userId, blogId);
  }

  @Get(`:id`)
  async findOne(@Param(`id`, IdValidationPipe) id: string): Promise<BlogViewModel> {
    return await this.blogsQueryRepositories.findBlog(id);
  }
}
