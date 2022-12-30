import { INestApplication } from "@nestjs/common";
import { UsersViewType } from "../../src/modules/users/infrastructure/query-reposirory/user-View-Model";
import request from "supertest";
import { LikeStatusType } from "../../src/modules/posts/domain/likesPost-schema-Model";

let randomText = (Math.random() + 1).toString(36).substring(7);
export const createUserByLoginEmail = async (count: number, app: INestApplication) => {
  const result: { userId: string, user: UsersViewType, accessToken: string, refreshToken: string }[] = [];
  for (let i = 0; i < count; i++) {
    const response00 = await request(app.getHttpServer())
      .post(`/sa/users`)
      .auth(`admin`, `qwerty`, { type: "basic" })
      .send({ login: `asirius-${i}`, password: `asirius-12${i}`, email: `asirius${i}@jive.com` })
      .expect(201);
    console.log("----",response00.body);

    const responseToken = await request(app.getHttpServer())
      .post(`/auth/login`)
      .set(`User-Agent`, `for test`)
      .send({ loginOrEmail: `asirius-${i}`, password: `asirius-12${i}` })
      .expect(200);
    result.push({
      userId: response00.body.id,
      user: response00.body,
      accessToken: responseToken.body.accessToken,
      refreshToken: responseToken.headers["set-cookie"]
    });
  }
  return result;
};
export const createUniqeUserByLoginEmail = async (count: number, uniq: string, app: INestApplication) => {
  const result: { userId: string, user: UsersViewType, accessToken: string, refreshToken: string }[] = [];
  for (let i = 0; i < count; i++) {
    const response00 = await request(app.getHttpServer())
      .post(`/sa/users`)
      .auth(`admin`, `qwerty`, { type: "basic" })
      .send({ login: `log${uniq}-${i}`, password: `asirius-12${i}`, email: `${uniq}asirius${i}@jive.com` })
      .expect(201);

    const responseToken = await request(app.getHttpServer())
      .post(`/auth/login`)
      .set(`User-Agent`, `for test`)
      .send({ loginOrEmail: `log${uniq}-${i}`, password: `asirius-12${i}` })
      .expect(200);
    result.push({
      userId: response00.body.id,
      user: response00.body,
      accessToken: responseToken.body.accessToken,
      refreshToken: responseToken.headers["set-cookie"]
    });
  }
  return result;
};

export const userTestSchema = {
  id: expect.any(String),
  login: expect.any(String),
  email: expect.any(String),
  createdAt: expect.any(String),
  banInfo: { isBanned: expect.any(Boolean), banDate: expect.any(String), banReason: expect.any(String) }
};

export const commentTestSchema = {
  id: expect.any(String),
  content: expect.any(String),
  userId: expect.any(String),
  userLogin: expect.any(String),
  createdAt: expect.any(String),
  likesInfo: { likesCount: expect.any(Number), dislikesCount: expect.any(Number), myStatus: LikeStatusType.None }
};

export const postTestSchema = {
  id: expect.any(String),
  title: expect.any(String),
  shortDescription: expect.any(String),
  content: expect.any(String),
  blogId: expect.any(String),
  blogName: expect.any(String),
  createdAt: expect.any(String),
  extendedLikesInfo: {
    likesCount: expect.any(Number),
    dislikesCount: expect.any(Number),
    myStatus: expect.any(String),
    newestLikes: expect.any(Array)
  }
};