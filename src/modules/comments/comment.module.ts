import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './domain/mongo-schemas/comments-schema-Model';
import { CommentsQueryRepositories } from './infrastructure/query-repository/comments-query.repositories';
import { CommentsController } from './api/comments.controller';
import {
  LikesStatus,
  LikesStatusSchema,
} from './domain/mongo-schemas/likesStatus-schema-Model';
import { CommentsService } from './domain/comments.service';
import { CommentsRepositories } from './infrastructure/comments.repositories';
import { JwtAuthGuard } from '../../guards/jwt-auth-bearer.guard';
import { JwtService } from '../auth/application/jwt.service';
import { JwtForGetGuard } from '../../guards/jwt-auth-bearer-for-get.guard';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteCommentHandler } from './application/use-cases/handlers/delete-comment-handler';
import { UpdateCommentHandler } from './application/use-cases/handlers/update-comment-handler';
import { UpdateLikeStatusCommentHandler } from './application/use-cases/handlers/update-like-status-comment-handler';
import { CommentsSqlRepositories } from "./infrastructure/comments-sql.repositories";
import { CommentsSqlQueryRepositories } from "./infrastructure/query-repository/comments-sql-query.repositories";

const handlers = [
  DeleteCommentHandler,
  UpdateCommentHandler,
  UpdateLikeStatusCommentHandler,
];
const adapters = [CommentsQueryRepositories, CommentsSqlQueryRepositories, CommentsSqlRepositories,  CommentsRepositories, JwtService];
const guards = [JwtAuthGuard, JwtForGetGuard];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: LikesStatus.name, schema: LikesStatusSchema },
    ]),
    CqrsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService, ...handlers, ...adapters, ...guards],
})
export class CommentModule {}
