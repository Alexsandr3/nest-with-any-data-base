import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersViewType } from "../src/modules/users/infrastructure/query-reposirory/user-View-Model";
import { createdApp } from "../src/helpers/createdApp";
import { BlogViewModel } from "../src/modules/blogs/infrastructure/query-repository/blog-View-Model";
import { PostViewModel } from "../src/modules/posts/infrastructure/query-repositories/post-View-Model";
import { ObjectId } from "mongodb";
import {
  createUserByLoginEmail, postTestSchema,
  userTestSchema
} from "./helpers/create-user-by-login-email";
import { CommentsViewType } from "../src/modules/comments/infrastructure/query-repository/comments-View-Model";
import { createBlogsForTest } from "./helpers/create-blog-for-test";


jest.setTimeout(120000);


describe(`checking 15 homework`, () => {

  let app: INestApplication;

  beforeAll(async () => {
    // Create a NestJS application
    const module: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      // .overrideProvider()
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
    let user: UsersViewType;
    it(`01-POST -> "/sa/users": should create new user; status 201; content: created user; used additional methods: GET => /sa/users`, async () => {
      await createUserByLoginEmail(2, app);
      const responseCreatedUser = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({ login: "newUser", password: "newUser321", email: "newUser@me.me" })
        .expect(201);
      user = responseCreatedUser.body;

      expect(user).toEqual({
        id: expect.any(String),
        login: "newUser",
        email: "newUser@me.me",
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null
        }
      });

      await request(app.getHttpServer())
        .put(`/sa/users/${user.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          "isBanned": true,
          "banReason": "too much chatter, it's bad user"
        })
        .expect(204);

      const resBanIfo = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ "pageSize": 4 })
        .expect(200);

      expect(resBanIfo.body.items).toHaveLength(3);
      //need to be careful if there is sorting
      expect(resBanIfo.body.items[0]).toEqual({ ...userTestSchema, login: "newUser" });
      expect(resBanIfo.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 4,
        totalCount: 3,
        items: expect.arrayContaining([userTestSchema])
      });
    });

  });
  describe(`Ban user by super admin - 15 home work`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let user1: UsersViewType;
    let user2: UsersViewType;
    let blog: BlogViewModel;
    let post: PostViewModel;
    let comment: CommentsViewType;
    let accessToken: string;
    let accessToken1: string;

    it(`01-POST, DELETE -> "/sa/users": should return error if auth credentials is incorrect; status 401; used additional methods: POST -> /sa/users`, async () => {
      const resBanIfo = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ "pageSize": 4 })
        .expect(200);

      expect(resBanIfo.body).toEqual({ pagesCount: 0, page: 1, pageSize: 4, totalCount: 0, items: [] });
      //create new users
      const res = await createUserByLoginEmail(1, app);

      await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin123", "qwerty", { type: "basic" })
        .send({ login: "newUser", password: "newUser321", email: "newUserme.me" })
        .expect(401);

      await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin123", "qwerty34", { type: "basic" })
        .send({ login: "newUser", password: "newUser321", email: "newUserme.me" })
        .expect(401);

      await request(app.getHttpServer())
        .delete(`/sa/users/${res[0].userId}`)
        .auth("admin2", "qwerty", { type: "basic" })
        .expect(401);

      await request(app.getHttpServer())
        .delete(`/sa/users/${res[0].userId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(204);
    });
    it(`02-DELETE -> "/sa/users/:id": should delete user by id; status 204; used additional methods: POST -> /sa/users, GET -> /sa/users;`, async () => {
      const res = await createUserByLoginEmail(1, app);

      await request(app.getHttpServer())
        .delete(`/sa/users/${res[0].userId}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(204);

      const resBanIfoUser = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ "pageSize": 5 })
        .expect(200);
      expect(resBanIfoUser.body.items).toHaveLength(0);
    });
    it(`03-DELETE -> "/sa/users/:id": should return error if :id from uri param not found; status 404`, async () => {
      await request(app.getHttpServer())
        .delete(`/sa/users/${new ObjectId()}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(404);
    });
    it(`04-POST -> "/sa/users": should return error if passed body is incorrect; status 400;`, async () => {
      const responseError = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({ login: "d", password: "newUser321", email: "newUserme.me" })
        .expect(400);
      expect(responseError.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: "login"
          },
          { message: expect.any(String), field: "email" }
        ]
      });

    });
    it(`05-PUT -> "/sa/users/:id/ban": should ban user; status 204; used additional methods: POST => /sa/users, GET => /sa/users;`, async () => {
      const res = await createUserByLoginEmail(2, app);
      user = res[0].user;
      user2 = res[1].user;
      console.log(user);
      await request(app.getHttpServer())
        .put(`/sa/users/${res[0].userId}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          isBanned: true,
          banReason: "too much talking, it's bad user"
        })
        .expect(204);
      const resBanIfo = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ "pageSize": 5 })
        .expect(200);

      expect(resBanIfo.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 5,
        totalCount: 2,
        items: expect.any(Array)
      });
      expect(resBanIfo.body.items).toHaveLength(2);
      expect(resBanIfo.body.items).toEqual(expect.arrayContaining([userTestSchema]));
      expect(resBanIfo.body.items[1]).toEqual({ ...userTestSchema, login: "asirius-0" });
    });
    it(`06-POST -> "/auth/login": Shouldn't login banned user. Should login unbanned user; status 401; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban;`, async () => {
      await request(app.getHttpServer())
        .put(`/sa/users/${user2.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          isBanned: true,
          banReason: "too much chatter, it's bad user"
        })
        .expect(204);

      const ae = await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: `${user2.login}`, password: "asirius-121" })
        .expect(401);

      await request(app.getHttpServer())
        .delete(`/sa/users/${user.id}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(204);

    });
    it(`07-GET -> "/comments/:id": Shouldn't return banned user comment. Should return unbanned user comment; status 404; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban, POST => /auth/login, POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments;`, async () => {
      //create two new users
      const res = await createUserByLoginEmail(2, app);
      user = res[0].user;
      user1 = res[1].user;
      accessToken = res[0].accessToken;
      accessToken1 = res[1].accessToken;
      //user1 creates a blog
      const responseBlog = await request(app.getHttpServer())
        .post(`/blogger/blogs/`)
        .auth(accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(201);
      //check
      blog = responseBlog.body;
      expect(blog).toEqual({
        id: expect.any(String),
        name: "Mongoose",
        description: "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main",
        websiteUrl: "https://www.mongoose.com",
        createdAt: expect.any(String)
      });
      //user1 creates a post
      const responsePost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(accessToken, { type: "bearer" })
        .send({
          "title": "string113231423",
          "shortDescription": "fasdfdsfsd",
          "content": "strifdasdfsadfsadfng"
        })
        .expect(201);
      post = responsePost.body;
      //user2 creates a comment
      const responseComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          "content": "33333333333333333333333"
        })
        .expect(201);
      comment = responseComment.body;
      //super admin banned user2
      await request(app.getHttpServer())
        .put(`/sa/users/${res[1].userId}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          "isBanned": true,
          "banReason": "too much chatter, it's bad user"
        })
        .expect(204);
      //searching for a comment by id should return - status 404
      await request(app.getHttpServer())
        .get(`/comments/${responseComment.body.id}`)
        .expect(404);

    });
    it(`08-GET -> "/comments/:id": Shouldn't return banned user like for comment. Should return unbanned user like for comment; status 200; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban, POST => /auth/login, POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments;`, async () => {
      //super admin unbanned user2
      await request(app.getHttpServer())
        .put(`/sa/users/${user1.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          "isBanned": false,
          "banReason": "too much chatter, it's bad user"
        })
        .expect(204);
      //searching for a comment by id should return - status 200
      await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(200);

    });
    it(`09-GET -> "/posts/:id": Shouldn't return banned user like for post. Should return unbanned user like for post; status 200; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban, POST => /auth/login, POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts;`, async () => {
      //update like status
      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);
      //finding posts with pagination
      const responsePosts = await request(app.getHttpServer())
        .get(`/posts`)
        .auth(accessToken1, { type: "bearer" })
        .query({ pageSize: 7 })
        .expect(200);
      expect(responsePosts.body.items[0].extendedLikesInfo).toEqual({
        likesCount: 1,
        dislikesCount: 0,
        myStatus: "Like",
        newestLikes: [
          {
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: "asirius-1"
          }
        ]
      });
      //super admin banned user1
      await request(app.getHttpServer())
        .put(`/sa/users/${user.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          "isBanned": true,
          "banReason": "too much chatter, it's bad user"
        })
        .expect(204);
      //searching posts, should return - status 200
      const responsePosts1 = await request(app.getHttpServer())
        .get(`/posts`)
        .auth(accessToken, { type: "bearer" })
        .query({ pageSize: 6 })
        .expect(200);
      expect(responsePosts1.body).toEqual({ pagesCount: 0, page: 1, pageSize: 6, totalCount: 0, items: [] });
      //searching for a post by id should return - status 404
      const responsePost = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .auth(accessToken, { type: "bearer" })
        .query({ pageSize: 6 })
        .expect(404);
      expect(responsePost.body).toEqual({});
    });

  });
  describe(`Super admin Api > Ban user by super admin > Ban user by super admin body validation`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });

    it(`01-PUT -> "/sa/users/:id/ban": should return error if passed body is incorrect; status 400; used additional methods: POST => /sa/users, GET => /sa/users;`, async () => {
      //create new user
      const res = await createUserByLoginEmail(1, app);
      //update ban status for user, invalid input data
      const bod = await request(app.getHttpServer())
        .put(`/sa/users/${res[0].userId}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          isBanned: "true",
          banReason: "too much talking"
        })
        .expect(400);
      expect(bod.body).toEqual({
        errorsMessages: [
          { message: "isBanned must be a boolean value", field: "isBanned" },
          {
            message: "banReason must be longer than or equal to 20 characters",
            field: "banReason"
          }
        ]
      });
    });

  });
  describe(` Super admin Api > Bind blog`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });

    let blog: BlogViewModel;
    let blog1: BlogViewModel;
    let blogBefore: BlogViewModel;
    let blogAfter: BlogViewModel;
    let accessToken: string;
    let refreshToken: string;


    it(`01-GET -> "sa/blogs": should return blogs with owner info; status 200; content: blog array with pagination; used additional methods: POST -> /sa/users, POST => /auth/login, POST -> /blogger/blogs;`, async () => {
      //create new user
      const res = await createUserByLoginEmail(2, app);
      accessToken = res[0].accessToken;
      refreshToken = res[0].refreshToken;
      //user1 creates a blog
      const responseCreatedBlog = await createBlogsForTest(2, accessToken, app);
      blog = responseCreatedBlog[0].blog;
      blog1 = responseCreatedBlog[1].blog;
      const responseFoundBlogs = await request(app.getHttpServer())
        .get(`/sa/blogs`)
        .auth("admin", "qwerty", { type: "basic" })

        .expect(200);

      expect(responseFoundBlogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.any(Array)
      });

      const responseBlogs = await request(app.getHttpServer())
        .get(`/sa/blogs`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ pageSize: 4 })
        .expect(200);

      expect(responseBlogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 4,
        totalCount: 2,
        items: expect.any(Array)
      });
      expect(responseBlogs.body.items).toHaveLength(2);
    });
    it(`02-POST -> "/sa/users": should create new user; status 201; content: created user; used additional methods: GET => /sa/users;`, async () => {
      const response = await request(app.getHttpServer())
        .get(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(200);

      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.any(Array)
      });
      expect(response.body.items).toHaveLength(2);
    });
    it(`03-POST -> "/auth/login": should sign in user; status 200; content: JWT 'access' token, JWT 'refresh' token in cookie (http only, secure);`, async () => {
      expect(refreshToken).toBeTruthy();
      expect(refreshToken[0].includes("HttpOnly")).toBe(true);
      expect(refreshToken[0].includes("Secure")).toBe(true);
    });
    it(`04-POST -> "/blogger/blogs": should create new blog; status 201; content: created blog by blogger; used additional methods: GET -> /blogs/:id;`, async () => {
      const responseBlogById = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(200);

      blogBefore = responseBlogById.body;

      const responseBlogById1 = await request(app.getHttpServer())
        .get(`/blogs/${blog1.id}`)
        .expect(200);

      expect(responseBlogById.body).toBeTruthy();
      expect(responseBlogById1.body).toBeTruthy();
    });
    it(`05-PUT -> "/blogger/blogs/:id": should update blog by blogger; status 204; used additional methods: POST -> /blogger/blogs, GET -> /blogs/:id;`, async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({
          name: "paravos",
          description: "about 21.8 ± 3.6 million years ago in the Early Miocene",
          websiteUrl: "https://www.raccoon.by"
        })
        .expect(204);

      const responseBlogById1 = await request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(200);

      blogAfter = responseBlogById1.body;

      expect(blogBefore).not.toEqual(blogAfter);
    });
    it(`06-DELETE -> "/blogger/blogs/:id": should delete blog by blogger; status 204; used additional methods: POST -> /blogger/blogs, GET -> /blogs/:id;`, async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/blogs/${blog.id}`)
        .expect(404);


    });

  });
  describe(` Super admin Api > Bind blog 2`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let blog: BlogViewModel;
    let accessToken: string;
    let accessToken1: string;


    it(`01-GET -> "blogger/blogs": should return blogs created by blogger. Shouldn't return blogs created by other bloggers; status 200; content: blog array with pagination; used additional methods: POST -> /blogger/blogs, POST -> /sa/users, POST -> /auth/login;`, async () => {
      //create new user
      const res = await createUserByLoginEmail(2, app);
      accessToken = res[0].accessToken;
      accessToken1 = res[1].accessToken;

      //user1 creates a blog
      const responseCreatedBlog = await createBlogsForTest(1, accessToken, app);
      blog = responseCreatedBlog[0].blog;

      const responseFoundBlogs = await request(app.getHttpServer())
        .get(`/blogger/blogs`)
        .auth(accessToken, { type: "bearer" })
        .expect(200);

      expect(responseFoundBlogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [expect.any(Object)]
      });

      const responseFoundBlogs1 = await request(app.getHttpServer())
        .get(`/blogger/blogs`)
        .auth(accessToken1, { type: "bearer" })
        .expect(200);

      expect(responseFoundBlogs1.body).toEqual({ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });


    });
    it(`02-DELETE, PUT -> "/blogger/blogs/:id": should return error if :id from uri param not found; status 404;`, async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${new ObjectId()}`)
        .auth(accessToken, { type: "bearer" })
        .expect(404);

      await request(app.getHttpServer())
        .put(`/blogger/blogs/${new ObjectId()}`)
        .auth(accessToken, { type: "bearer" })
        .send({
          name: "paravos333",
          description: "333 about 21.8 ± 3.6 million years ago in the Early Miocene",
          websiteUrl: "https://www.raccoon.by"
        })
        .expect(404);

    });
    it(`03-DELETE, PUT -> "/blogger/blogs/:id", POST, GET -> "blogger/blogs": should return error if auth credentials is incorrect; status 401; used additional methods: POST -> /blogger/blogs;`, async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}`)
        .auth(accessToken + 1, { type: "bearer" })
        .expect(401);

      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}`)
        .auth(accessToken + 1, { type: "bearer" })
        .send({
          name: "paravos333",
          description: "333 about 21.8 ± 3.6 million years ago in the Early Miocene",
          websiteUrl: "https://www.raccoon.by"
        })
        .expect(401);

    });
    it(`04-DELETE, PUT -> "/blogger/blogs/:id": should return error if access denied; status 403; used additional methods: POST -> /blogger/blogs;`, async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(403);

      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          name: "paravos333",
          description: "333 about 21.8 ± 3.6 million years ago in the Early Miocene",
          websiteUrl: "https://www.raccoon.by"
        })
        .expect(403);

    });
    it(`05-POST -> "/blogger/blogs": should return error if passed body is incorrect; status 400;`, async () => {
      await request(app.getHttpServer())
        .post(`/blogger/blogs/`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          name: `Mon`,
          description: `A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae`,
          websiteUrl: `https:/www.mongoose.com`
        })
        .expect(400);

    });
    it(`06-PUT -> "/blogger/blogs/:id": should return error if passed body is incorrect; status 400; used additional methods: POST -> /blogs;`, async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          name: 44,
          description: "333 about 21.8 ± 3.6 million years ago in the Early Miocene",
          websiteUrl: "https//www.raccoon.by"
        })
        .expect(400);
    });
  });
  describe(` Super admin Api > Bind blog 3`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let blog: BlogViewModel;
    let blog1: BlogViewModel;
    let post: PostViewModel;
    let post1: PostViewModel;
    let accessToken: string;
    let accessToken1: string;


    it(`01-POST -> "/blogger/blogs/:blogId/posts": should create new post for current blog; status 201; content: created post by blogger; used additional methods: POST -> /blogger/blogs, GET -> /posts/:id;`, async () => {
      //create new user
      const res = await createUserByLoginEmail(2, app);
      accessToken = res[0].accessToken;
      accessToken1 = res[1].accessToken;

      //user1 creates a blog
      const responseCreatedBlog = await createBlogsForTest(2, accessToken, app);
      blog = responseCreatedBlog[0].blog;
      blog1 = responseCreatedBlog[1].blog;

      //user1 creates a post
      const responseCreatedPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(accessToken, { type: "bearer" })
        .send({
          title: "string113231423",
          shortDescription: "fasdfdsfsd",
          content: "strifdasdfsadfsadfng"
        })
        .expect(201);
      post = responseCreatedPost.body;

      const responseFoundBlogs1 = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(200);

      expect(responseFoundBlogs1.body).toEqual({ ...postTestSchema, title: "string113231423" });
    });
    it(`02-PUT -> "/blogger/blogs/:blogId/posts/:postId": should update post by blogger; status 204; used additional methods: POST -> /blogger/blogs, POST -> /blogger/blogs/:blogId/posts, GET -> /posts/:id;`, async () => {
      //user1 creates a post
      const responseCreatedPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog1.id}/posts`)
        .auth(accessToken, { type: "bearer" })
        .send({
          title: "string113231423",
          shortDescription: "fasdfdsfsd",
          content: "strifdasdfsadfsadfng"
        })
        .expect(201);
      post1 = responseCreatedPost.body;

      //user1 update a post
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog1.id}/posts/${post1.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({
          title: "new sting for me",
          shortDescription: "new short description for me",
          content: "new content  for me"
        })
        .expect(204);

      const responseFoundBlogs1 = await request(app.getHttpServer())
        .get(`/posts/${post1.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(200);

      expect(responseFoundBlogs1.body).toEqual({ ...postTestSchema, title: "new sting for me" });
    });
    it(`03-DELETE -> "/blogger/blogs/:blogId/posts/:postId": should delete post by blogger; status 204; used additional methods: POST -> /blogger/blogs, POST -> /blogger/blogs/:blogId/posts, GET -> /posts/:id;`, async () => {

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog1.id}/posts/${post1.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/posts/${post1.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(404);
    });
    it(`04-DELETE, PUT "/blogger/blogs/:blogId/posts/:postId", POST -> "/blogger/blogs/:blogId/posts: should return error if :id from uri param not found; status 404; used additional methods: POST -> /blogger/blogs, POST -> /blogger/blogs/:blogId/posts;`, async () => {
      //user1 creates a post
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${new ObjectId()}/posts`)
        .auth(accessToken, { type: "bearer" })
        .send({
          title: "string113231423",
          shortDescription: "fasdfdsfsd",
          content: "strifdasdfsadfsadfng"
        })
        .expect(404);

      //user1 update a post
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${new ObjectId()}/posts/${new ObjectId()}`)
        .auth(accessToken, { type: "bearer" })
        .send({
          title: "new sting for me",
          shortDescription: "new short description for me",
          content: "new content  for me"
        })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${new ObjectId()}/posts/${new ObjectId()}`)
        .auth(accessToken, { type: "bearer" })
        .expect(404);

    });
    it(`05-DELETE, PUT "/blogger/blogs/:blogId/posts/:postId", POST -> "/blogger/blogs/:blogId/posts: should return error if auth credentials is incorrect; status 401; used additional methods: POST -> /blogger/blogs, POST -> /blogger/blogs/:blogId/posts;`, async () => {
      //user1 creates a post
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${new ObjectId()}/posts`)
        .auth(accessToken + "d", { type: "bearer" })
        .send({
          title: "string113231423",
          shortDescription: "fasdfdsfsd",
          content: "strifdasdfsadfsadfng"
        })
        .expect(401);

      //user1 update a post
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${new ObjectId()}/posts/${new ObjectId()}`)
        .auth(accessToken + 3, { type: "bearer" })
        .send({
          title: "new sting for me",
          shortDescription: "new short description for me",
          content: "new content  for me"
        })
        .expect(401);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${new ObjectId()}/posts/${new ObjectId()}`)
        .auth(accessToken + "dd", { type: "bearer" })
        .expect(401);

    });
    it(`06-DELETE, PUT "/blogger/blogs/:blogId/posts/:postId", POST -> "/blogger/blogs/:blogId/posts: should return error if access denied; status 403; used additional methods: POST -> /blogger/blogs, POST -> /blogger/blogs/:blogId/posts;`, async () => {
      //user1 creates a post
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          title: "string113231423",
          shortDescription: "fasdfdsfsd",
          content: "strifdasdfsadfsadfng"
        })
        .expect(403);

      //user1 update a post
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}/posts/${post.id}`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          title: "new sting for me",
          shortDescription: "new short description for me",
          content: "new content  for me"
        })
        .expect(403);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}/posts/${post.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(403);
    });
    it(`07-POST -> "/blogger/blogs/:blogId/posts": should return error if passed body is incorrect; status 400; used additional methods: POST -> /blogs;`, async () => {
      const responseCreatedPost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          title: "string new string string new string string new string string new string ",
          shortDescription: "fasdfdsfsd",
          content: "strifdasdfsadfsadfng"
        })
        .expect(400);

      console.log(responseCreatedPost.body);
      expect(responseCreatedPost.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: "title"
          }
        ]
      });
    });
    it(`08-PUT -> "/blogger/blogs/:blogId/posts/:postId": should return error if passed body is incorrect; status 400; used additional methods: POST -> /blogs, POST -> /blogger/blogs/:blogId/posts;`, async () => {
      //user1 update a post
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}/posts/${post.id}`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          title: "new sting for me new sting for me new sting for me new sting for me",
          shortDescription: "new short description for me",
          content: "new content  for me"
        })
        .expect(400);

    });
  });
});





