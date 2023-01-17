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
import { createBlogsForTest } from "./helpers/create-blog-for-test";
import { PostViewModel } from "../src/modules/posts/infrastructure/query-repositories/types-view/post-View-Model";
import {
  CommentsViewType
} from "../src/modules/comments/infrastructure/query-repository/types-view/comments-View-Model";
import { createBlogsAndPostForTest } from "./helpers/create-blog-and-post-for-test";


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

  describe(`Homework 22.2 > Blogger Api > Ban user by blogger`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let user1: UsersViewType;
    let blog: BlogViewModel;
    let accessToken: string;
    it(`01 - POST -> "/sa/users": should create new user; status 201; content: created user; used additional methods: GET => /sa/users;`, async () => {
      const res = await createUserByLoginEmail(2, app);
      user = res[0].user;
      user1 = res[0].user;
      accessToken = res[0].accessToken;
      const resBlog = await createBlogsForTest(1, accessToken, app);
      blog = resBlog[0].blog;
    });
    it(`02 - GET -> "GET => blogger/users/blog/:id": should return status 200; content: banned users array with pagination; used additional methods: POST -> /sa/users, PUT -> /blogger/users/:id/ban;`, async () => {
      await request(app.getHttpServer())
        .put(`/blogger/users/${user1.id}/ban`)
        .auth(accessToken, { type: "bearer" })
        .send({
          isBanned: true,
          banReason: "stringstringstringst",
          blogId: blog.id
        })
        .expect(204);
      await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog.id}`)
        .auth(accessToken, { type: "bearer" })
        .query({ pageSize: 13, sorBy: "login", sortDirection: "desc" })
        .expect(200)
        .then(({ body }) => {
          expect(body.items[0]).toEqual({
            id: expect.any(String),
            login: "asirius-0",
            banInfo: {
              isBanned: true,
              banDate: expect.any(String),
              banReason: "stringstringstringst"
            }
          });
          expect(body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 13,
            totalCount: 1,
            items: [
              {
                id: expect.any(String),
                login: "asirius-0",
                banInfo: {
                  isBanned: true,
                  banDate: expect.any(String),
                  banReason: "stringstringstringst"
                }
              }
            ]
          });
        });


    });
  });
  describe.skip(`Homework 22.1 > Super admin Api > Ban user by super admin`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let user1: UsersViewType;
    let accessToken1: string;
    let blog: BlogViewModel;
    let post: PostViewModel;
    let comment: CommentsViewType;

    it(`01- PUT -> "/sa/users/:id/ban": should ban user; status 204; used additional methods: POST => /sa/users, GET => /sa/users;`, async () => {
      const res = await createUserByLoginEmail(2, app);
      user = res[0].user;
      user1 = res[1].user;
      accessToken1 = res[1].accessToken;
      await request(app.getHttpServer())
        .put(`/sa/users/${user.id}/ban`)
        .auth(`admin`, `qwerty`, { type: "basic" })
        .send({
          isBanned: true,
          banReason: "stringstringstringst"
        })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ pageSize: 50, sorBy: "login", sortDirection: "desc" })
        .expect(200)
        .then(({ body }) => {
          expect(body.items).toHaveLength(2);
          expect(body.items[1].banInfo).toEqual({
            isBanned: true,
            banDate: expect.any(String),
            banReason: "stringstringstringst"
          });
        });


    });
    it(`02- PUT -> "/sa/users/:id/ban": should unban user; status 204; used additional methods: POST => /sa/users, GET => /sa/users;`, async () => {
      await request(app.getHttpServer())
        .put(`/sa/users/${user.id}/ban`)
        .auth(`admin`, `qwerty`, { type: "basic" })
        .send({
          isBanned: false,
          banReason: "stringstringstringst"
        })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ pageSize: 50, sorBy: "login", sortDirection: "desc" })
        .expect(200)
        .then(({ body }) => {
          expect(body.items).toHaveLength(2);
          expect(body.items[1].banInfo).toEqual({
            isBanned: false,
            banDate: null,
            banReason: null
          });
        });


    });
    it(`03- POST -> "/auth/login": Shouldn't login banned user. Should login unbanned user; status 401; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban;`, async () => {
      await request(app.getHttpServer())
        .put(`/sa/users/${user.id}/ban`)
        .auth(`admin`, `qwerty`, { type: "basic" })
        .send({
          isBanned: true,
          banReason: "stringstringstringst"
        })
        .expect(204);
      await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: `asirius-0`, password: `asirius-120` })
        .expect(401);
    });
    it(`04 - GET -> "/comments/:id": Shouldn't return banned user comment. 
    Should return unbanned user comment; status 404; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban,
    POST => /auth/login, POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments;`, async () => {
      const response = await createBlogsAndPostForTest(1, accessToken1, app);
      blog = response[0].blog;
      post = response[0].post;
      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken1, { type: "bearer" })
        .send({ content: "Very too talk, bad post" })
        .expect(201)
        .then(({ body }) => {
          comment = body;
          expect(body).toEqual({
            id: expect.any(String),
            content: "Very too talk, bad post",
            userId: expect.any(String),
            userLogin: "asirius-1",
            createdAt: expect.any(String),
            likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: "None" }
          });
        });
      await request(app.getHttpServer())
        .put(`/sa/users/${user1.id}/ban`)
        .auth(`admin`, `qwerty`, { type: "basic" })
        .send({
          isBanned: true,
          banReason: "stringstringstringst"
        })
        .expect(204);
      await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(404);


    });
  });
  describe.skip(`Homework 22.2 > Blogger Api > Blogger posts`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let accessToken: string;
    let blog: BlogViewModel;
    let post: PostViewModel;
    let post1: PostViewModel;

    it(`01 -POST -> "/blogger/blogs/:blogId/posts": should create new post for current blog; status 201; content: created post by blogger; used additional methods: POST -> /blogger/blogs, GET -> /posts/:id;`, async () => {
      const response = await createUserByLoginEmail(2, app);
      user = response[0].user;
      accessToken = response[0].accessToken;
      const res = await createBlogsAndPostForTest(1, accessToken, app);
      blog = res[0].blog;
      post = res[0].post;
      await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(String),
            title: "string title",
            shortDescription: "string shortDescription",
            content: "string content",
            blogId: expect.any(String),
            blogName: "Mongoose00",
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: "None",
              newestLikes: []
            }
          });
        });
    });
    it(`02- PUT -> "/blogger/blogs/:blogId/posts/:postId": should update post by blogger; status 204; used additional methods: POST -> /blogger/blogs, POST -> /blogger/blogs/:blogId/posts, GET -> /posts/:id;`, async () => {
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts/`)
        .auth(accessToken, { type: "bearer" })
        .send({
          title: "marakabanka karabaka",
          shortDescription: "marakabanka",
          content: "marakabanka"
        })
        .expect(201)
        .then(({ body }) => {
          post1 = body;
        });
      await request(app.getHttpServer())
        .get(`/posts/${post1.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(String),
            title: "marakabanka karabaka",
            shortDescription: "marakabanka",
            content: "marakabanka",
            blogId: blog.id.toString(),
            blogName: "Mongoose00",
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: "None",
              newestLikes: []
            }
          });
        });
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}/posts/${post1.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({
          title: "marakabanka 12345678",
          shortDescription: "marakabanka",
          content: "marakabanka"
        })
        .expect(204);
      await request(app.getHttpServer())
        .get(`/posts/${post1.id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            id: expect.any(String),
            title: "marakabanka 12345678",
            shortDescription: "marakabanka",
            content: "marakabanka",
            blogId: blog.id.toString(),
            blogName: "Mongoose00",
            createdAt: expect.any(String),
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: "None",
              newestLikes: []
            }
          });
        });
    });
    it(`03 - DELETE -> "/blogger/blogs/:blogId/posts/:postId": should delete post by blogger; status 204; used additional methods: POST -> /blogger/blogs, POST -> /blogger/blogs/:blogId/posts, GET -> /posts/:id`, async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}/posts/${post.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(404)
        .then(({ body }) => {
          expect(body).toEqual({});
        });


    });
    it(`04 -DELETE, PUT "/blogger/blogs/:blogId/posts/:postId", POST -> "/blogger/blogs/:blogId/posts: should return error if :id from uri param not found; status 404; used additional methods: POST -> /blogger/blogs, POST -> /blogger/blogs/:blogId/posts;`, async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}/posts/${post.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({
          title: "marakabanka 12345678",
          shortDescription: "marakabanka",
          content: "marakabanka"
        })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}/posts/${post.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(404);

    });
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
    it(`POST -> "/auth/refresh-token", "/auth/logout": should return an error if the "refresh" token has become invalid; status 401;`, async () => {
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
  describe.skip(`Check error for testing`, () => {
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
        .expect(204);

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
        .expect(200);

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





