import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  UseGuards
} from "@nestjs/common";
import { CommentsQueryRepositories } from "../infrastructure/query-repository/comments-query.repositories";
import { CommentsViewType } from "../infrastructure/query-repository/comments-View-Model";
import { IdValidationPipe } from "../../../validators/id-validation-pipe";
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

@Controller(`comments`)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService,
              private commandBus: CommandBus,
              private readonly commentsQueryRepositories: CommentsQueryRepositories) {
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(`/:id/like-status`)
  async updateLikeStatus(@CurrentUserId() userId: string,
                         @Param(`id`, IdValidationPipe) id: string,
                         @Body() updateLikeStatusInputModel: UpdateLikeStatusDto): Promise<boolean> {
    return await this.commandBus.execute(new UpdateLikeStatusCommentCommand(id, updateLikeStatusInputModel, userId));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(`/:id`)
  async updateCommentsById(@CurrentUserId() userId: string,
                           @Param(`id`, IdValidationPipe) id: string,
                           @Body() updateCommentInputModel: UpdateCommentDto): Promise<boolean> {
    await this.commandBus.execute(new UpdateCommentCommand(id, updateCommentInputModel, userId));
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete(`/:id`)
  async deleteCommentById(@CurrentUserId() userId: string,
                          @Param(`id`, IdValidationPipe) id: string): Promise<boolean> {
    await this.commandBus.execute(new DeleteCommentCommand(id, userId));
    return true;
  }

  @UseGuards(JwtForGetGuard)
  @Get(`/:id`)
  async findOne(@CurrentUserId() userId: string,
                @Param(`id`, IdValidationPipe) id: string): Promise<CommentsViewType> {
    return this.commentsQueryRepositories.findComment(id, userId);
  }
}
