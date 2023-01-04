import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { createdApp } from "../src/createdApp";
import {
  createUniqeUserByLoginEmail,
  createUserByLoginEmail
} from "./helpers/create-user-by-login-email";
import { UsersViewType } from "../src/modules/users/infrastructure/query-reposirory/types-view/user-View-Model";
import { BlogViewModel } from "../src/modules/blogs/infrastructure/query-repository/types-view/blog-View-Model";
import { PostViewModel } from "../src/modules/posts/infrastructure/query-repositories/types-view/post-View-Model";
import { createBlogsForTest } from "./helpers/create-blog-for-test";


jest.setTimeout(120000);


describe.skip(`Ban blog by super admin`, () => {

  let app: INestApplication;

  beforeAll(async () => {
    // Create a NestJS application
    const module: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .compile();
    app = module.createNestApplication();
    //created me
    app = createdApp(app);
    // Connect to the in-memory server
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  describe.skip(`Super admin Api > Users`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });

    let user: UsersViewType;
    let accessToken: string;
    let refreshToken: string;

    it(`01 - POST -> "/auth/login": Shouldn't login banned user. Should login unbanned user; status 401; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban;`, async () => {
      const res = await createUserByLoginEmail(1, app);

      await createUniqeUserByLoginEmail(1, "S", app);

      await request(app.getHttpServer())
        .put(`/sa/users/${res[0].userId}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          isBanned: true,
          banReason: "too much talking, bad user"
        })
        .expect(204);

      await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: `${res[0].user.login}`, password: `asirius-120` })
        .expect(401);

      const responseStatusInfoUser = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ pageSize: 50, sorBy: "login", sortDirection: "desc" })
        .expect(200);

      expect(responseStatusInfoUser.body.items).toHaveLength(1);

      await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: `${res[0].user.login}`, password: `asirius-120` })
        .expect(401);
    });
    it.skip(`POST -> "/auth/refresh-token", "/auth/logout": should return an error if the "refresh" token has become invalid; status 401;`, async () => {
      const res = await createUserByLoginEmail(1, app);
      user = res[0].user;
      accessToken = res[0].accessToken;
      refreshToken = res[0].refreshToken;

      await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: `${user.login}`, password: `asirius-120` })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/auth/logout`)
        .set("Cookie", `${refreshToken[0]}`)
        .expect(204);

      await request(app.getHttpServer())
        .post(`/auth/refresh-token`)
        .set("Cookie", `${refreshToken[0]}`)
        .expect(401);

    });

  });
  describe(`Check error for testing`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });

    let user: UsersViewType;
    let user1: UsersViewType;
    let blog: BlogViewModel;
    let accessToken: string;

    it(`01 - POST -> "/auth/login": Shouldn't login banned user. Should login unbanned user; status 401; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban;`, async () => {
      const res = await createUserByLoginEmail(2, app);
      user = res[0].user;
      user1 = res[1].user;
      accessToken = res[0].accessToken;
      const res2 = await createBlogsForTest(1, accessToken, app);
      blog = res2[0].blog;


      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/ban`)
        .auth(`admin`, `qwerty`, { type: "basic" })
        .send({
          isBanned: true,
          banReason: "stringstringstringst"
        })
        .expect(204)

      const responseBlog = await request(app.getHttpServer())
        .get(`/blogs`)
        .query({ pageSize: 50, sorBy: "Name", sortDirection: "desc" })
        .expect(200);
      console.log("-1", responseBlog.body);
      //
      // expect(responseBlog.body).toEqual({
      //   pagesCount: 0,
      //   page: 1,
      //   pageSize: 50,
      //   totalCount: 0,
      //   items: expect.any(Array)
      // });

      const responseBlogId = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(404);
      console.log("-2", responseBlogId.body);


      const responseBlogSA = await request(app.getHttpServer())
        .get(`/sa/blogs`)
        .auth(`admin`, `qwerty`, { type: "basic" })
        .query({ pageSize: 13, sorBy: "Name", sortDirection: "asc" })
        .expect(200)

      console.log("-3", responseBlogSA.body.items);
      // expect(responseBlogSA.body).toEqual({
      //   pagesCount: 1,
      //   page: 1,
      //   pageSize: 13,
      //   totalCount: 1,
      //   items: expect.any(Array)
      // });


      // await request(app.getHttpServer())
      //   .put(`/sa/blogs/${blog.id}/ban`)
      //   .auth(`admin`, `qwerty`, { type: "basic" })
      //   .send({
      //     isBanned: true,
      //     banReason: "stringstringstringst"
      //   })
      //   .expect(204)
      //
      // await request(app.getHttpServer())
      //   .put(`/sa/blogs/${blog.id}/ban`)
      //   .auth(`admin`, `qwerty`, { type: "basic" })
      //   .send({
      //     isBanned: false,
      //     banReason: "stringstringstringst"
      //   })
      //   .expect(204)


      // const responsePost = await request(app.getHttpServer())
      //   .post(`/blogger/blogs/${blog.id}/posts`)
      //   .auth(accessToken, { type: "bearer" })
      //   .send({
      //     title: "string113231423",
      //     shortDescription: "fasdfdsfsd",
      //     content: "strifdasdfsadfsadfng"
      //   })
      //   .expect(201)
      //
      // post = responsePost.body
      // const id = "07a4e10f-4386-49d2-9b78-df1e47f1f62e"

      // await request(app.getHttpServer())
      //   .put(`/blogger/blogs/${blog.id}/posts/${id}`)
      //   .auth(accessToken, { type: "bearer" })
      //   .send({
      //     title: "new string31423",
      //     shortDescription: "new fasdfdsfsd",
      //     content: "new strifdasdfsadfsadfng"
      //   })
      //   .expect(404)


      // const response = await request(app.getHttpServer())
      //   .delete(`/blogger/blogs/${blog.id}/posts/${id}`)
      //   .auth(accessToken, { type: "bearer" })
      //   // .send({
      //   //   title: "new string31423",
      //   //   shortDescription: "new fasdfdsfsd",
      //   //   content: "new strifdasdfsadfsadfng"
      //   // })
      //   .expect(404)

      // const response = await request(app.getHttpServer())
      //   .put(`/blogger/users/${user1.id}/ban`)
      //   .auth(accessToken, {type: "bearer"})
      //   .send({
      //     isBanned: false,
      //     banReason: "stringstringstringst",
      //     blogId: `${blog.id}`
      //   })
      //   .expect(204)
      // console.log(response.body);


      //
      // await request(app.getHttpServer())
      //   .delete(`/blogger/blogs/${blog.id}/posts/${post.id}`)
      //   .auth(accessToken, { type: "bearer" })
      //   .expect(204)

    });

  });
});





