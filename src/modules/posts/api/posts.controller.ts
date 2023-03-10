import {
  Body,
  Controller,
  Get,
  HttpCode, Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { PaginationDto } from "../../blogs/api/input-Dtos/pagination-Dto-Model";
import { PaginationViewModel } from "../../blogs/infrastructure/query-repository/pagination-View-Model";
import { PostViewModel } from "../infrastructure/query-repositories/types-view/post-View-Model";
import { CommentsViewType } from "../../comments/infrastructure/query-repository/types-view/comments-View-Model";
import { JwtAuthGuard } from "../../../guards/jwt-auth-bearer.guard";
import { UpdateLikeStatusDto } from "./input-Dtos/update-Like-Status-Model";
import { CurrentUserId } from "../../../decorators/current-user-id.param.decorator";
import { CreateCommentDto } from "./input-Dtos/create-Comment-Dto-Model";
import { JwtForGetGuard } from "../../../guards/jwt-auth-bearer-for-get.guard";
import { CommandBus } from "@nestjs/cqrs";
import { CreateCommentCommand } from "../application/use-cases/create-comment-command";
import { UpdateLikeStatusCommand } from "../application/use-cases/update-like-status-command";
import { SkipThrottle } from "@nestjs/throttler";
import { ValidateUuidPipe } from "../../../validators/validate-uuid-pipe";
import { IPostQueryRepository, IPostQueryRepositoryKey } from "../interfaces/IPostQueryRepository";

@SkipThrottle()
@Controller(`posts`)
export class PostsController {
  constructor(@Inject(IPostQueryRepositoryKey)
    private readonly postsQueryRepositories: IPostQueryRepository,
              private commandBus: CommandBus) {
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(`:postId/like-status`)
  async updateLikeStatus(@CurrentUserId() userId: string,
                         @Param(`postId`, ValidateUuidPipe) id: string,
                         @Body() updateLikeStatusInputModel: UpdateLikeStatusDto): Promise<boolean> {
    return await this.commandBus.execute(new UpdateLikeStatusCommand(id, updateLikeStatusInputModel, userId));
  }

  @UseGuards(JwtForGetGuard)
  @Get(`:postId/comments`)
  async findComments(@CurrentUserId() userId: string,
                     @Param(`postId`, ValidateUuidPipe) postId: string,
                     @Query() paginationInputModel: PaginationDto): Promise<PaginationViewModel<CommentsViewType[]>> {
    return await this.postsQueryRepositories.getCommentsByIdPost(postId, paginationInputModel, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(`:postId/comments`)
  async createComment(@CurrentUserId() userId: string,
                      @Param(`postId`, ValidateUuidPipe) id: string,
                      @Body() inputCommentModel: CreateCommentDto) {
    return await this.commandBus.execute(new CreateCommentCommand(id, inputCommentModel, userId));
  }

  @UseGuards(JwtForGetGuard)
  @Get()
  async findAll(@CurrentUserId() userId: string,
                @Query() pagination: PaginationDto): Promise<PaginationViewModel<PostViewModel[]>> {
    return await this.postsQueryRepositories.findPosts(pagination, userId);
  }

  @UseGuards(JwtForGetGuard)
  @Get(`:id`)
  async findOne(@CurrentUserId() userId: string,
                @Param(`id`, ValidateUuidPipe) id: string): Promise<PostViewModel> {
    return await this.postsQueryRepositories.findPost(id, userId);
  }
}
