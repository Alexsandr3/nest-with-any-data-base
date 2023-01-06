import { Controller, Get, Query, Param, UseGuards, Inject } from "@nestjs/common";
import { BlogViewModel } from "../infrastructure/query-repository/types-view/blog-View-Model";
import { PaginationDto } from "./input-Dtos/pagination-Dto-Model";
import { PaginationViewModel } from "../infrastructure/query-repository/pagination-View-Model";
import { PostViewModel } from "../../posts/infrastructure/query-repositories/types-view/post-View-Model";
import { CurrentUserId } from "../../../decorators/current-user-id.param.decorator";
import { JwtForGetGuard } from "../../../guards/jwt-auth-bearer-for-get.guard";
import { SkipThrottle } from "@nestjs/throttler";
import { ValidateUuidPipe } from "../../../validators/validate-uuid-pipe";
import { IBlogQueryRepository, IBlogQueryRepositoryKey } from "../interfaces/IBlogQueryRepository";
import { IPostQueryRepository, IPostQueryRepositoryKey } from "../../posts/interfaces/IPostQueryRepository";

@SkipThrottle()
@Controller(`blogs`)
export class BlogsController {
  constructor(
    @Inject(IBlogQueryRepositoryKey)
    private readonly blogsQueryRepositories: IBlogQueryRepository,
    @Inject(IPostQueryRepositoryKey)
    private readonly postsQueryRepositories: IPostQueryRepository,
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
