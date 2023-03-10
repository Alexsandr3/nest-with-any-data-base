import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode, Inject,
  Param,
  Put,
  UseGuards
} from "@nestjs/common";
import { CommentsViewType } from "../infrastructure/query-repository/types-view/comments-View-Model";
import { UpdateLikeStatusDto } from "../../posts/api/input-Dtos/update-Like-Status-Model";
import { CommentsService } from "../domain/comments.service";
import { CurrentUserId } from "../../../decorators/current-user-id.param.decorator";
import { UpdateCommentDto } from "./input-Dtos/update-Comment-Dto-Model";
import { JwtAuthGuard } from "../../../guards/jwt-auth-bearer.guard";
import { JwtForGetGuard } from "../../../guards/jwt-auth-bearer-for-get.guard";
import { CommandBus } from "@nestjs/cqrs";
import { DeleteCommentCommand } from "../application/use-cases/delete-comment-command";
import { UpdateCommentCommand } from "../application/use-cases/update-comment-command";
import { UpdateLikeStatusCommentCommand } from "../application/use-cases/update-like-status-comment-command";
import { SkipThrottle } from "@nestjs/throttler";
import { ValidateUuidPipe } from "../../../validators/validate-uuid-pipe";
import { ICommentQueryRepository, ICommentQueryRepositoryKey } from "../interfaces/ICommentQueryRepository";

@SkipThrottle()
@Controller(`comments`)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService,
              private commandBus: CommandBus,
              @Inject(ICommentQueryRepositoryKey)
              private readonly commentsQueryRepositories: ICommentQueryRepository) {
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(`/:id/like-status`)
  async updateLikeStatus(@CurrentUserId() userId: string,
                         @Param(`id`, ValidateUuidPipe) id: string,
                         @Body() updateLikeStatusInputModel: UpdateLikeStatusDto): Promise<boolean> {
    return await this.commandBus.execute(new UpdateLikeStatusCommentCommand(id, updateLikeStatusInputModel, userId));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(`/:id`)
  async updateCommentsById(@CurrentUserId() userId: string,
                           @Param(`id`, ValidateUuidPipe) id: string,
                           @Body() updateCommentInputModel: UpdateCommentDto): Promise<boolean> {
    await this.commandBus.execute(new UpdateCommentCommand(id, updateCommentInputModel, userId));
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete(`/:id`)
  async deleteCommentById(@CurrentUserId() userId: string,
                          @Param(`id`, ValidateUuidPipe) id: string): Promise<boolean> {
    await this.commandBus.execute(new DeleteCommentCommand(id, userId));
    return true;
  }

  @UseGuards(JwtForGetGuard)
  @Get(`/:id`)
  async findOne(@CurrentUserId() userId: string,
                @Param(`id`, ValidateUuidPipe) id: string): Promise<CommentsViewType> {
    return this.commentsQueryRepositories.getComment(id, userId);
  }
}
