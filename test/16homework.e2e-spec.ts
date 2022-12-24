import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersViewType } from "../src/modules/users/infrastructure/query-reposirory/user-View-Model";
import { createdApp } from "../src/helpers/createdApp";
import {
  createUserByLoginEmail,
} from "./helpers/create-user-by-login-email";
import { BlogViewModel } from "../src/modules/blogs/infrastructure/query-repository/blog-View-Model";
import { PostViewModel } from "../src/modules/posts/infrastructure/query-repositories/post-View-Model";
import { createBlogsForTest } from "./helpers/create-blog-for-test";
import { ObjectId } from "mongodb";
import { MailService } from "../src/modules/mail/mail.service";
import { MailServiceMock } from "./mock/mailService.mock";


jest.setTimeout(120000);


describe(`Ban blog by super admin`, () => {

  let app: INestApplication;

  beforeAll(async () => {
    // Create a NestJS application
    const module: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MailService)
      .useClass(MailServiceMock)
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

  describe(`Super admin Api > Users`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let blog: BlogViewModel;
    let blog1: BlogViewModel;
    let blog2: BlogViewModel;
    let post: PostViewModel;
    let accessToken: string;
    let accessToken1: string;

    it(`01-POST -> "/sa/users": should create new user; status 201; content: created user; used additional methods: GET => /sa/users;`, async () => {
      const res = await createUserByLoginEmail(2, app);
      accessToken = res[0].accessToken;
      accessToken1 = res[1].accessToken;

      const responseStatusInfoUser = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ pageSize: 10, sorBy: "login", sortDirection: "desc" })
        .expect(200);

      expect(responseStatusInfoUser.body.items).toHaveLength(2);
      //need to be careful if there is sorting
      //expect(responseStatusInfoUser.body.items[0]).toEqual({ ...userTestSchema, login: "asirius-1" });

    });
    it(`02-PUT -> "/sa/blogs/:id/ban": should ban blog; status 204; used additional methods: POST => /blogger/blogs, GET => /blogs, GET => /blogs/:id, GET => /sa/blogs;`, async () => {
      const resBlog = await createBlogsForTest(1, accessToken, app);
      const resBlog1 = await createBlogsForTest(2, accessToken1, app);
      blog = resBlog[0].blog;
      blog1 = resBlog1[0].blog;
      blog2 = resBlog1[1].blog;

      const resBlogs = await request(app.getHttpServer())
        .get(`/blogs`)
        .query({ pageSize: 6 })
        .expect(200);

      expect(resBlogs.body.items).toHaveLength(3);

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          isBanned: true
        })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(404);

      const resBlogs2 = await request(app.getHttpServer())
        .get(`/blogs`)
        .expect(200);

      expect(resBlogs2.body.items).toHaveLength(2);

      const result = await request(app.getHttpServer())
        .get(`/sa/blogs`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(200);

      expect(result.body.items).toHaveLength(3);
     // expect(result.body.items[2].banInfo).toContainEqual({ isBanned: true, banDate: expect.any(String) })
    });
    it(`03-PUT -> "/sa/blogs/:id/ban": should unban blog; status 204; used additional methods: GET => /blogs;`, async () => {

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          isBanned: false
        })
        .expect(204);

      const resBlogs = await request(app.getHttpServer())
        .get(`/blogs`)
        .expect(200);

      expect(resBlogs.body.items).toHaveLength(3);
    });
    it(`04-GET -> "/posts/:id": Shouldn't return banned blog post. Should return unbanned blog post; status 404; used additional methods: PUT => /sa/blogs/:id/ban, POST => /auth/login, POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, GET => /posts/:id;`, async () => {

      const responseCreatedPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(accessToken, { type: "bearer" })
        .send({
          title: "string113231423",
          shortDescription: "fasdfdsfsd",
          content: "strifdasdfsadfsadfng"
        })
        .expect(201);

      post = responseCreatedPost.body

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          isBanned: true
        })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/post/${post.id}`)
        .expect(404);

     // expect(resBlogs.body.items).toHaveLength(3);
    });
    it(`05-PUT -> "/sa/blogs/:id/ban": should return error if auth credentials is incorrect; status 401; used additional methods: POST => /blogger/blogs;`, async () => {

      await request(app.getHttpServer())
        .put(`/sa/blogs/${blog1.id}/ban`)
        .auth("admin1", "qwerty2", { type: "basic" })
        .send({
          isBanned: true
        })
        .expect(401);

    });

  });
  describe(`Super admin Api > Super Admin`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });

    it(`01-GET -> "sa/blogs": should return blogs with owner info; status 200; content: blog array with pagination; used additional methods: POST -> /sa/users, POST => /auth/login, POST -> /blogger/blogs;`, async () => {
      await createUserByLoginEmail(13, app);

      await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ pageSize: 10, sorBy: "login", sortDirection: "desc" })
        .expect(200);

      //expect(responseStatusInfoUser.body.items).toHaveLength(13);
    });

  });
  describe(`Blogger`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let user1: UsersViewType;
    let blog: BlogViewModel;
    let accessToken: string;
    let accessToken1: string;

    it(`01-GET -> "GET => blogger/users/blog/:id": should return status 200; content: banned users array with pagination; used additional methods: POST -> /sa/users, PUT -> /blogger/users/:id/ban;`, async () => {
      const res = await createUserByLoginEmail(2, app);
      user = res[0].user
      user1 = res[1].user
      accessToken = res[0].accessToken
      accessToken1 = res[1].accessToken
      const resB = await createBlogsForTest(1, accessToken, app)
      blog = resB[0].blog
      await request(app.getHttpServer())
        .put(`/blogger/users/${user1.id}/ban`)
        .auth(accessToken, {type: "bearer"})
        .send({
          isBanned: true,
          banReason: "very bad type user, too much talking",
          blogId: `${blog.id}`
        })
        .expect(204)

      const responseBannedUSerForBlog = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(200);

      expect(responseBannedUSerForBlog.body.items).toHaveLength(1)
      expect(responseBannedUSerForBlog.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: expect.any(Array)
      })
    });
    it(`02-PUT -> "/blogger/users/:id/ban": should unban user by blogger for specified blog; status 204; used additional methods: POST => blogger/blogs, GET => blogger/users/blog/:id;`, async () => {

      await request(app.getHttpServer())
        .put(`/blogger/users/${user1.id}/ban`)
        .auth(accessToken, {type: "bearer"})
        .send({
          isBanned: false,
          banReason: "this user is on the right path",
          blogId: `${blog.id}`
        })
        .expect(204)

      const responseBannedUSerForBlog = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(200);

      expect(responseBannedUSerForBlog.body.items).toHaveLength(0)

    });
    it(`03-PUT -> "/blogger/users/:id/ban", GET -> "blogger/users/blog/:id": should return error if auth credentials is incorrect; status 401; used additional methods: POST => /sa/users, POST => /blogger/blogs`, async () => {

      await request(app.getHttpServer())
        .put(`/blogger/users/${user1.id}/ban`)
        .auth(accessToken+1, {type: "bearer"})
        .send({
          isBanned: true,
          banReason: "this user is on the right path",
          blogId: `${blog.id}`
        })
        .expect(401)

      await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog.id}`)
        .auth(accessToken+1, { type: "bearer" })
        .expect(401);

    });
    it(`04-PUT -> "/blogger/users/:id/ban", GET -> "blogger/users/blog/:id": should return error if :id from uri param not found; status 404; used additional methods: POST => /blogger/blogs`, async () => {

      await request(app.getHttpServer())
        .put(`/blogger/users/${new ObjectId()}/ban`)
        .auth(accessToken, {type: "bearer"})
        .send({
          isBanned: true,
          banReason: "this user is on the right path",
          blogId: `${blog.id}`
        })
        .expect(404)

      await request(app.getHttpServer())
        .get(`/blogger/users/blog/${new ObjectId()}`)
        .auth(accessToken, { type: "bearer" })
        .expect(404);

    });
    it(`05-PUT -> "/blogger/users/:id/ban", GET -> "blogger/users/blog/:id": should return error if access denied; status 403; used additional methods: POST => /sa/users, POST => /auth/login, POST => /blogger/blogs;`, async () => {

      await request(app.getHttpServer())
        .put(`/blogger/users/${user1.id}/ban`)
        .auth(accessToken1, {type: "bearer"})
        .send({
          isBanned: true,
          banReason: "this user is on the right path",
          blogId: `${blog.id}`
        })
        .expect(403)

      await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(403);

    });


  });
  describe(`Ban user by blogger`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let user1: UsersViewType;
    let blog: BlogViewModel;
    let post: PostViewModel;
    let accessToken: string;
    let accessToken1: string;

    it(`01-POST -> "/posts/:postId/comments": banned user by blogger cant comment posts of current blog; status 403; used additional methods: POST => sa/users, POST => auth/login, POST => blogger/blogs, POST => blogger/blogs/:id/posts;`, async () => {

      const res = await createUserByLoginEmail(2, app)
      user = res[0].user
      user1 = res[1].user
      accessToken = res[0].accessToken
      accessToken1 = res[1].accessToken
      const resB = await createBlogsForTest(2, accessToken, app)
      blog = resB[0].blog

      const resP = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(accessToken, {type: "bearer"})
        .send({
          title: "string113231423",
          shortDescription: "fasdfdsfsd",
          content: "strifdasdfsadfsadfng"
        })
        .expect(201);

      post = resP.body

      await request(app.getHttpServer())
        .put(`/blogger/users/${user1.id}/ban`)
        .auth(accessToken, {type: "bearer"})
        .send({
          isBanned: true,
          banReason: "this user is on the right path",
          blogId: `${blog.id}`
        })
        .expect(204)


      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken1, {type: "bearer"})
        .send({
          content: "you need to read this post, it is very interesting history"
        })
        .expect(403)

    });

  });
  describe(`blogger studio comments`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let user1: UsersViewType;
    let user2: UsersViewType;
    let user3: UsersViewType;
    let blog: BlogViewModel;
    let post: PostViewModel;
    let accessToken: string;
    let accessToken1: string;
    let accessToken2: string;
    let accessToken3: string;

    it(`01-GET => blogger/blogs/comments: should return error if auth credentials is incorrect; status 401;`, async () => {

      const res = await createUserByLoginEmail(4, app)
      user = res[0].user
      user1 = res[1].user
      user2 = res[2].user
      user3 = res[3].user
      accessToken = res[0].accessToken
      accessToken1 = res[1].accessToken
      accessToken2 = res[2].accessToken
      accessToken3 = res[3].accessToken
      const resB = await createBlogsForTest(2, accessToken, app)
      blog = resB[0].blog

      const resP = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(accessToken, {type: "bearer"})
        .send({
          title: "string113231423",
          shortDescription: "fasdfdsfsd",
          content: "strifdasdfsadfsadfng"
        })
        .expect(201);

      post = resP.body

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken1, {type: "bearer"})
        .send({
          content: "you need to read this post, it is very interesting history"
        })
        .expect(201)

      await request(app.getHttpServer())
        .get(`/blogger/blogs/comments`)
        .auth(accessToken+1, {type: "bearer"})
        .expect(401)

    });
    it(`02-GET -> "GET => blogger/blogs/comments": should return status 200; content: all comments for all posts inside all current user blogs with pagination; used additional methods: POST -> /sa/users, POST => /auth/login, POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments;`, async () => {

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken2, {type: "bearer"})
        .send({
          content: "you need to read this post, it is very interesting history  0000"
        })
        .expect(201)

      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken3, {type: "bearer"})
        .send({
          content: "you need to read this post"
        })
        .expect(201)

      const resC = await request(app.getHttpServer())
        .get(`/blogger/blogs/comments`)
        .auth(accessToken, {type: "bearer"})
        .expect(200)

      console.log(resC.body.items[0]);

      expect(resC.body.items).toHaveLength(3)
      expect(resC.body).toEqual({ pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: expect.any(Array)})
      expect(resC.body.items[0]).toEqual({
        id: expect.any(String),
        content: 'you need to read this post',
        createdAt: expect.any(String),
        likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: 'None' },
        commentatorInfo: { userId: expect.any(String), userLogin: 'asirius-3' },
        postInfo: {
          id: expect.any(String),
          title: expect.any(String),
          blogId: `${blog.id}`,
          blogName: 'Mongoose00'
        }
      });

    });

  });

});





