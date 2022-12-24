import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { BlogsQueryRepositories } from "../../blogs/infrastructure/query-repository/blogs-query.repositories";
import { PaginationDto } from "../../blogs/api/input-Dtos/pagination-Dto-Model";
import { PaginationViewModel } from "../../blogs/infrastructure/query-repository/pagination-View-Model";
import { BlogViewModel } from "../../blogs/infrastructure/query-repository/blog-View-Model";
import { BasicAuthGuard } from "../../../guards/basic-auth.guard";
import { IdValidationPipe } from "../../../validators/id-validation-pipe";
import { BindBlogCommand } from "../application/use-cases/bindBlogCommand";
import { UpdateBanInfoForBlogDto } from "./input-dtos/update-ban-info-for-blog-Dto-Model";
import { UpdateBanInfoForBlogCommand } from "../application/use-cases/updateBanInfoForBlogCommand";

@UseGuards(BasicAuthGuard)
@Controller(`sa/blogs`)
export class SaController {
  constructor(private readonly blogsQueryRepositories: BlogsQueryRepositories,
              private commandBus: CommandBus) {
  }


  @HttpCode(204)
  @Put(`/:blogId/ban`)
  async updateBanInfoForBlog(@Body() updateBanInfoForBlogModel: UpdateBanInfoForBlogDto,
                             @Param(`blogId`, IdValidationPipe) blogId: string): Promise<boolean> {
    return this.commandBus.execute(new UpdateBanInfoForBlogCommand(updateBanInfoForBlogModel, blogId));
  }

  @HttpCode(204)
  @Put(`/:blogId/bind-with-user/:userId`)
  async bindBlog(@Param(`blogId`, IdValidationPipe) blogId: string,
                 @Param(`userId`, IdValidationPipe) userId: string) {
    return await this.commandBus.execute(new BindBlogCommand(blogId, userId));
  }

  @Get()
  async findAll(@Query() paginationInputModel: PaginationDto): Promise<PaginationViewModel<BlogViewModel[]>> {
    return await this.blogsQueryRepositories.findBlogsForSa(paginationInputModel);
  }
}
