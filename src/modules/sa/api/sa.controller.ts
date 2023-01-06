import {
  Body,
  Controller,
  Get,
  HttpCode, Inject,
  Param,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { PaginationDto } from "../../blogs/api/input-Dtos/pagination-Dto-Model";
import { PaginationViewModel } from "../../blogs/infrastructure/query-repository/pagination-View-Model";
import { BlogViewModel } from "../../blogs/infrastructure/query-repository/types-view/blog-View-Model";
import { BasicAuthGuard } from "../../../guards/basic-auth.guard";
import { BindBlogCommand } from "../application/use-cases/bindBlogCommand";
import { UpdateBanInfoForBlogDto } from "./input-dtos/update-ban-info-for-blog-Dto-Model";
import { UpdateBanInfoForBlogCommand } from "../application/use-cases/updateBanInfoForBlogCommand";
import { SkipThrottle } from "@nestjs/throttler";
import { ValidateUuidPipe } from "../../../validators/validate-uuid-pipe";
import { IBlogQueryRepository, IBlogQueryRepositoryKey } from "../../blogs/interfaces/IBlogQueryRepository";

@SkipThrottle()
@UseGuards(BasicAuthGuard)
@Controller(`sa/blogs`)
export class SaController {
  constructor(
    @Inject(IBlogQueryRepositoryKey)
    private readonly blogsQueryRepositories: IBlogQueryRepository,
              private commandBus: CommandBus) {
  }


  @HttpCode(204)
  @Put(`/:blogId/ban`)
  async updateBanInfoForBlog(@Body() updateBanInfoForBlogModel: UpdateBanInfoForBlogDto,
                             @Param(`blogId`, ValidateUuidPipe) blogId: string): Promise<boolean> {
    return this.commandBus.execute(new UpdateBanInfoForBlogCommand(updateBanInfoForBlogModel, blogId));
  }

  @HttpCode(204)
  @Put(`/:blogId/bind-with-user/:userId`)
  async bindBlog(@Param(`blogId`, ValidateUuidPipe) blogId: string,
                 @Param(`userId`, ValidateUuidPipe) userId: string) {
    return await this.commandBus.execute(new BindBlogCommand(blogId, userId));
  }

  @Get()
  async findAll(@Query() paginationInputModel: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    return await this.blogsQueryRepositories.findBlogsForSa(paginationInputModel);
  }
}
