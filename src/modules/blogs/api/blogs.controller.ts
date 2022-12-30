import { Controller, Get, Query, Param, UseGuards } from "@nestjs/common";
import { BlogViewModel } from "../infrastructure/query-repository/blog-View-Model";
import { PaginationDto } from "./input-Dtos/pagination-Dto-Model";
import { PaginationViewModel } from "../infrastructure/query-repository/pagination-View-Model";
import { PostViewModel } from "../../posts/infrastructure/query-repositories/post-View-Model";
import { CurrentUserId } from "../../../decorators/current-user-id.param.decorator";
import { JwtForGetGuard } from "../../../guards/jwt-auth-bearer-for-get.guard";
import { SkipThrottle } from "@nestjs/throttler";
import { ValidateUuidPipe } from "../../../validators/validate-uuid-pipe";
import { BlogsSqlQueryRepositories } from "../infrastructure/query-repository/blogs-sql-query.repositories";
import { PostsSqlQueryRepositories } from "../../posts/infrastructure/query-repositories/posts-sql-query.reposit";

@SkipThrottle()
@Controller(`blogs`)
export class BlogsController {
  constructor(
    private readonly blogsQueryRepositories: BlogsSqlQueryRepositories,
    private readonly postsQueryRepositories: PostsSqlQueryRepositories,
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
                  @Param(`blogId`, ValidateUuidPipe) blogId: string,
                  @Query() paginationInputModel: PaginationDto): Promise<PaginationViewModel<PostViewModel[]>> {
    await this.blogsQueryRepositories.findBlog(blogId);
    return this.postsQueryRepositories.findPosts(paginationInputModel, userId, blogId);
  }

  @Get(`:id`)
  async findOne(@Param(`id`, ValidateUuidPipe) id: string): Promise<BlogViewModel> {
    return await this.blogsQueryRepositories.findBlog(id);
  }
}
