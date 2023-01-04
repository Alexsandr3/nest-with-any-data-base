import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { CommentsViewType } from "../../src/modules/comments/infrastructure/query-repository/types-view/comments-View-Model";

export const createCommentForTest = async (count: number, accessToken: string, id: string, app: INestApplication) => {
  const result: { comment: CommentsViewType }[] = [];
  for (let i = 0; i < count; i++) {
    const response = await request(app.getHttpServer())
      .post(`/posts/${id}/comments`)
      .auth(accessToken, { type: "bearer" })
      .send({
        content: `This is a new comment for post 0${i}`
      })
      .expect(201);
    result.push({ comment: response.body });
  }
  return result;
};
