import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { createdApp } from "../src/helpers/createdApp";
import {
  createUniqeUserByLoginEmail,
  createUserByLoginEmail
} from "./helpers/create-user-by-login-email";
import { BlogViewModel } from "../src/modules/blogs/infrastructure/query-repository/blog-View-Model";
import { PostViewModel } from "../src/modules/posts/infrastructure/query-repositories/post-View-Model";
import { MailService } from "../src/modules/mail/mail.service";
import { MailServiceMock } from "./mock/mailService.mock";
import { delay } from "./auth.e2e-spec";
import { createBlogsAndPostForTest } from "./helpers/create-blog-and-post-for-test";
import { CommentsViewType } from "../src/modules/comments/infrastructure/query-repository/comments-View-Model";
import { randomUUID } from "crypto";
import { createCommentForTest } from "./helpers/create-comment-for-test";


jest.setTimeout(120000);


describe.skip(`Homework 19`, () => {

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

  describe.skip(`public api comments`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let blog: BlogViewModel;
    let post: PostViewModel;
    let comment: CommentsViewType;
    let accessToken: string;
    let refreshToken: string;
    let accessToken1: string;
    let refreshTokenKey: string;
    it(`01 - POST -> "/sa/users": should create new user; status 201; content: created user; used additional methods: GET => /sa/users;`, async () => {
      const res = await createUserByLoginEmail(2, app);
      accessToken = res[0].accessToken;
      accessToken1 = res[1].accessToken;
      refreshToken = res[0].refreshToken;

      const responseStatusInfoUser = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ pageSize: 10, sorBy: "login", sortDirection: "desc" })
        .expect(200);
      expect(responseStatusInfoUser.body.items).toHaveLength(2);
    });
    it(`02 - POST -> "/auth/login": should sign in user; status 200; content: JWT 'access' token, JWT 'refresh' token in cookie (http only, secure);`, async () => {
      await delay();
      // expect(accessToken).toEqual({ accessToken: expect.any(String) });
      expect(refreshToken[0].includes(`HttpOnly`)).toBeTruthy();
      expect(refreshToken[0].includes(`Secure`)).toBeTruthy();
      expect(accessToken).toEqual(expect.any(String));
      expect(refreshToken).toBeTruthy();
      if (!refreshToken) return;
      [refreshTokenKey, refreshToken] = refreshToken[0].split(";")[0].split("=");
      expect(refreshTokenKey).toBe(`refreshToken`);
    });
    it(`03 - POST -> "/posts/:postId/comments": should create new comment; status 201; content: created comment; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, GET -> /comments/:commentId;`, async () => {
      const resBlogAndPost = await createBlogsAndPostForTest(1, accessToken, app);
      blog = resBlogAndPost[0].blog;
      post = resBlogAndPost[0].post;

      const resComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          content: "This is a new comment for post"
        })
        .expect(201);

      comment = resComment.body;


      const resComments = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(200);


      expect(resComments.body).toEqual({
        id: expect.any(String),
        content: "This is a new comment for post",
        userId: expect.any(String),
        userLogin: "asirius-1",
        createdAt: expect.any(String),
        likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: "None" }
      });

    });
    it(`04 - DELETE -> "/comments/:id": should delete comment by id; status 204; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST -> /posts/:postId/comments, GET -> /comments/:id;`, async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(204);

      await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(404);
    });
    it(`05 - PUT -> "/comments/:commentId": should update comment by id; status 204; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST -> /posts/:postId/comments, GET -> /comments/:commentId;`, async () => {
      const resComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          content: "This is a new new comment for post"
        })
        .expect(201);
      comment = resComment.body;

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          content: "This is a new new new comment for post"
        })
        .expect(204);

      const resComments = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(200);

      expect(resComments.body.content).toEqual("This is a new new new comment for post");
    });
    it(`06 - GET -> "/posts/:postId/comments": should return status 200; content: comments with pagination; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments;`, async () => {
      const responseComments = await request(app.getHttpServer())
        .get(`/posts/${post.id}/comments`)
        .query({ pageSize: 13, sorBy: "login", sortDirection: "desc" })
        .expect(200);

      expect(responseComments.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 13,
        totalCount: 1,
        items: expect.any(Array)
      });
      expect(responseComments.body.items).toHaveLength(1);
      expect(responseComments.body.items[0]).toEqual({
        id: expect.any(String),
        content: "This is a new new new comment for post",
        userId: expect.any(String),
        userLogin: "asirius-1",
        createdAt: expect.any(String),
        likesInfo: { likesCount: 0, dislikesCount: 0, myStatus: "None" }
      });
    });
    it(`07 - DELETE, PUT -> "/comments/:id", GET, POST -> "posts/:postId/comments": should return error if :id from uri param not found; status 404;`, async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${randomUUID()}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(404);

      await request(app.getHttpServer())
        .put(`/comments/${randomUUID()}`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          content: "This is a new new new comment for post"
        })
        .expect(404);

      await request(app.getHttpServer())
        .post(`/posts/${randomUUID()}/comments`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          content: "This is a new new comment for post"
        })
        .expect(404);

      await request(app.getHttpServer())
        .get(`/posts/${randomUUID()}/comments`)
        .query({ pageSize: 13, sorBy: "login", sortDirection: "desc" })
        .expect(404);
    });

    it(`08 - DELETE, PUT -> "/comments/:id", POST -> "posts/:postId/comments": should return error if auth credentials is incorrect; status 401; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments;`, async () => {
      await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken1 + 1, { type: "bearer" })
        .send({
          content: "This is a new new comment for post"
        })
        .expect(401);

      await request(app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .auth(accessToken1 + 1, { type: "bearer" })
        .expect(401);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}`)
        .auth(accessToken1 + 1, { type: "bearer" })
        .send({
          content: "This is a new new new comment for post"
        })
        .expect(401);
    });
    it(`09 - PUT, DELETE -> "/comments/:id": should return error if access denied; status 403; used additional methods: POST => /sa/users, POST => /auth/login, POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments;`, async () => {
      await request(app.getHttpServer())
        .delete(`/comments/${comment.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(403);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({
          content: "This is a new new new comment for post"
        })
        .expect(403);
    });
  });
  describe.skip(`Posts likes - 01`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });

    let post: PostViewModel;
    let accessToken: string;
    let accessToken1: string;
    let accessToken2: string;
    let accessToken3: string;
    let accessToken4: string;
    it(`01 - POST -> "/sa/users", "/auth/login": should create and login 4 users; status 201; content: created users;`, async () => {
      const res = await createUserByLoginEmail(4, app);
      const resS = await createUniqeUserByLoginEmail(1, "S", app);
      accessToken = resS[0].accessToken;
      accessToken1 = res[0].accessToken;
      accessToken2 = res[1].accessToken;
      accessToken3 = res[2].accessToken;
      accessToken4 = res[3].accessToken;

      const responseStatusInfoUser = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ pageSize: 10, sorBy: "login", sortDirection: "desc" })
        .expect(200);
      expect(responseStatusInfoUser.body.items).toHaveLength(5);
    });
    it(`02 - PUT -> "/posts/:postId/like-status": create post then: like the post by user 1, user 2, user 3, user 4. get the post after each like by user 1. NewestLikes should be sorted in descending; status 204; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, GET => /posts/:id;`, async () => {
      const res = await createBlogsAndPostForTest(1, accessToken, app);
      post = res[0].post;

      const resPosts = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200);

      expect(resPosts.body.extendedLikesInfo.likesCount).toBe(0);
      expect(resPosts.body.extendedLikesInfo.dislikesCount).toBe(0);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken3, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken4, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      const resPosts2 = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200);

      expect(resPosts2.body).toEqual({
        id: expect.any(String),
        title: "string title",
        shortDescription: "string shortDescription",
        content: "string content",
        blogId: expect.any(String),
        blogName: "Mongoose00",
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 4,
          dislikesCount: 0,
          myStatus: "None",
          newestLikes: expect.any(Array)
        }
      });
      expect(resPosts2.body.extendedLikesInfo.likesCount).toBe(4);
      expect(resPosts2.body.extendedLikesInfo.dislikesCount).toBe(0);
    });
    it(`03 - PUT -> "/posts/:postId/like-status": create post then: dislike the post by user 1, user 2; like the post by user 3; get the post after each like by user 1; status 204; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, GET => /posts/:id;`, async () => {
      const resPosts = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200);

      expect(resPosts.body.extendedLikesInfo.likesCount).toBe(4);
      expect(resPosts.body.extendedLikesInfo.dislikesCount).toBe(0);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Dislike"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({
          likeStatus: "Dislike"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken3, { type: "bearer" })
        .send({
          likeStatus: "Dislike"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken4, { type: "bearer" })
        .send({
          likeStatus: "Dislike"
        })
        .expect(204);

      const resPosts2 = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200);

      expect(resPosts2.body).toEqual({
        id: expect.any(String),
        title: "string title",
        shortDescription: "string shortDescription",
        content: "string content",
        blogId: expect.any(String),
        blogName: "Mongoose00",
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 4,
          myStatus: "None",
          newestLikes: expect.any(Array)
        }
      });
      expect(resPosts2.body.extendedLikesInfo.likesCount).toBe(0);
      expect(resPosts2.body.extendedLikesInfo.dislikesCount).toBe(4);
    });
    it(`04 - PUT -> "/posts/:postId/like-status": create post then: like the post twice by user 1; get the post after each like by user 1. Should increase like's count once; status 204; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, GET => /posts/:id;`, async () => {
      const resPosts = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200);

      expect(resPosts.body.extendedLikesInfo.likesCount).toBe(0);
      expect(resPosts.body.extendedLikesInfo.dislikesCount).toBe(4);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({
          likeStatus: "None"
        })
        .expect(204);

      const resPosts2 = await request(app.getHttpServer())
        .get(`/posts/${post.id}`)
        .expect(200);

      expect(resPosts2.body.extendedLikesInfo.likesCount).toBe(1);
      expect(resPosts2.body.extendedLikesInfo.dislikesCount).toBe(2);
    });

  });
  describe.skip(`Posts likes - 02`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let post: PostViewModel;
    let post1: PostViewModel;
    let post2: PostViewModel;
    let post3: PostViewModel;
    let post4: PostViewModel;
    let post5: PostViewModel;
    let accessToken: string;
    let accessToken1: string;
    let accessToken2: string;
    let accessToken3: string;
    let accessToken4: string;
    it(`01 - GET -> "/posts": create 6 posts then: like post 1 by user 1, user 2; like post 2 by user 2, user 3; dislike post 3 by user 1; like post 4 by user 1, user 4, user 2, user 3; like post 5 by user 2, dislike by user 3; like post 6 by user 1, dislike by user 2. Get the posts by user 1 after all likes NewestLikes should be sorted in descending; status 200; content: posts array with pagination; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, PUT -> posts/:postId/like-status;`, async () => {

      const res = await createUserByLoginEmail(4, app);
      const resS = await createUniqeUserByLoginEmail(1, "S", app);
      accessToken = resS[0].accessToken;
      accessToken1 = res[0].accessToken;
      accessToken2 = res[1].accessToken;
      accessToken3 = res[2].accessToken;
      accessToken4 = res[3].accessToken;

      const responseStatusInfoUser = await request(app.getHttpServer())
        .get(`/sa/users/`)
        .auth("admin", "qwerty", { type: "basic" })
        .query({ pageSize: 10, sorBy: "login", sortDirection: "desc" })
        .expect(200);
      expect(responseStatusInfoUser.body.items).toHaveLength(5);

      const resPost = await createBlogsAndPostForTest(6, accessToken, app);
      post = resPost[0].post;
      post1 = resPost[1].post;
      post2 = resPost[2].post;
      post3 = resPost[3].post;
      post4 = resPost[4].post;
      post5 = resPost[5].post;

      const resPosts = await request(app.getHttpServer())
        .get(`/posts`)
        .query({ sortDirection: "asc", sortBy: "blogName" })
        .expect(200);

      expect(resPosts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 6,
        items: expect.any(Array)
      });
      expect(resPosts.body.items).toHaveLength(6);
      expect(resPosts.body.items[5].extendedLikesInfo).toEqual({
        likesCount: 0,
        dislikesCount: 0,
        myStatus: "None",
        newestLikes: []
      });
      expect(resPosts.body.items[0]).toEqual({
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

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post1.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post1.id}/like-status`)
        .auth(accessToken3, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post2.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Dislike"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post3.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post3.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post3.id}/like-status`)
        .auth(accessToken3, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post3.id}/like-status`)
        .auth(accessToken4, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post4.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post4.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({
          likeStatus: "Dislike"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post5.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({
          likeStatus: "Like"
        })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/posts/${post4.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({
          likeStatus: "Dislike"
        })
        .expect(204);

      const resPosts2 = await request(app.getHttpServer())
        .get(`/posts`)
        .expect(200);

      expect(resPosts2.body.items).toEqual([
        {
          id: expect.any(String),
          title: "string title",
          shortDescription: "string shortDescription",
          content: "string content",
          blogId: expect.any(String),
          blogName: "Mongoose55",
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [{
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: "asirius-0"
            }]
          }
        },
        {
          id: expect.any(String),
          title: "string title",
          shortDescription: "string shortDescription",
          content: "string content",
          blogId: expect.any(String),
          blogName: "Mongoose44",
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 1,
            dislikesCount: 1,
            myStatus: "None",
            newestLikes: [{
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: "asirius-0"
            }]
          }
        },
        {
          id: expect.any(String),
          title: "string title",
          shortDescription: "string shortDescription",
          content: "string content",
          blogId: expect.any(String),
          blogName: "Mongoose33",
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 4,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [{
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: "asirius-3"
            },
              {
                addedAt: expect.any(String),
                userId: expect.any(String),
                login: "asirius-2"
              },
              {
                addedAt: expect.any(String),
                userId: expect.any(String),
                login: "asirius-1"
              }]
          }
        },
        {
          id: expect.any(String),
          title: "string title",
          shortDescription: "string shortDescription",
          content: "string content",
          blogId: expect.any(String),
          blogName: "Mongoose22",
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 1,
            myStatus: "None",
            newestLikes: []
          }
        },
        {
          id: expect.any(String),
          title: "string title",
          shortDescription: "string shortDescription",
          content: "string content",
          blogId: expect.any(String),
          blogName: "Mongoose11",
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 2,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [{
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: "asirius-2"
            },
              {
                addedAt: expect.any(String),
                userId: expect.any(String),
                login: "asirius-1"
              }]
          }
        },
        {
          id: expect.any(String),
          title: "string title",
          shortDescription: "string shortDescription",
          content: "string content",
          blogId: expect.any(String),
          blogName: "Mongoose00",
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 2,
            dislikesCount: 0,
            myStatus: "None",
            newestLikes: [{
              addedAt: expect.any(String),
              userId: expect.any(String),
              login: "asirius-1"
            },
              {
                addedAt: expect.any(String),
                userId: expect.any(String),
                login: "asirius-0"
              }]
          }
        }
      ]);

    });


  });
  describe.skip(`Comment likes`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });

    let post: PostViewModel;
    let comment: CommentsViewType;
    let accessToken: string;
    let accessToken1: string;
    let accessToken2: string;
    let accessToken3: string;
    let accessToken4: string;
    it(`01 - POST -> "/sa/users", "/auth/login": should create and login 4 users; status 201; content: created users;`, async () => {
      const res = await createUserByLoginEmail(5, app);
      accessToken = res[0].accessToken;
      accessToken1 = res[1].accessToken;
      accessToken2 = res[2].accessToken;
      accessToken3 = res[3].accessToken;
      accessToken4 = res[4].accessToken;
      const response = await createBlogsAndPostForTest(1, accessToken, app);
      post = response[0].post;
      const resComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken, { type: "bearer" })
        .send({
          content: "This is a new comment for post"
        })
        .expect(201);

      comment = resComment.body;
    });
    it(`02 - PUT -> "/comments/:commentId/like-status": create comment then: like the comment by user 1, user 2, user 3, user 4. get the comment after each like by user 1. ; status 204; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments, GET => /comments/:id;`, async () => {

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken3, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken4, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      const responseComments = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(200);


      expect(responseComments.body).toEqual({
        id: expect.any(String),
        content: "This is a new comment for post",
        userId: expect.any(String),
        userLogin: "asirius-0",
        createdAt: expect.any(String),
        likesInfo: { likesCount: 4, dislikesCount: 0, myStatus: "None" }
      });

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken, { type: "bearer" })
        .send({ likeStatus: "Dislike" })
        .expect(204);


      const responseComments1 = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .auth(accessToken, { type: "bearer" })
        .expect(200);

      expect(responseComments1.body).toEqual({
        id: expect.any(String),
        content: "This is a new comment for post",
        userId: expect.any(String),
        userLogin: "asirius-0",
        createdAt: expect.any(String),
        likesInfo: { likesCount: 4, dislikesCount: 1, myStatus: "Dislike" }
      });
    });
    it(`03 - PUT -> "/comments/:commentId/like-status": create comment then: dislike the comment by user 1, user 2; like the comment by user 3; get the comment after each like by user 1; status 204; used additional methods: POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments, GET => /comments/:id;`, async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: "Dislike" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({ likeStatus: "Dislike" })
        .expect(204);


      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken3, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);


      const responseComments = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .expect(200);

      expect(responseComments.body).toEqual({
        id: expect.any(String),
        content: "This is a new comment for post",
        userId: expect.any(String),
        userLogin: "asirius-0",
        createdAt: expect.any(String),
        likesInfo: { likesCount: 2, dislikesCount: 3, myStatus: "None" }
      });
    });
  });
  describe(`Comment likes - 02`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });

    let post: PostViewModel;
    let comment: CommentsViewType;
    let comment1: CommentsViewType;
    let comment2: CommentsViewType;
    let comment3: CommentsViewType;
    let comment4: CommentsViewType;
    let comment5: CommentsViewType;
    let accessToken: string;
    let accessToken1: string;
    let accessToken2: string;
    let accessToken3: string;
    let accessToken4: string;
    it(`01 - POST -> "/sa/users", "/auth/login": should create and login 4 users; status 201; content: created users;`, async () => {
      const res = await createUserByLoginEmail(5, app);
      accessToken = res[0].accessToken;
      accessToken1 = res[1].accessToken;
      accessToken2 = res[2].accessToken;
      accessToken3 = res[3].accessToken;
      accessToken4 = res[4].accessToken;
      const response = await createBlogsAndPostForTest(1, accessToken, app);
      post = response[0].post;
      const resComment = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken, { type: "bearer" })
        .send({
          content: "This is a new comment for post"
        })
        .expect(201);

      comment = resComment.body;
    });
    it(`02 - PUT -> "/comments/:commentId/like-status": create comment then: 
      like the comment by user 1 then get by user 2; dislike the comment by 
      user 2 then get by the user 1; status 204; used additional methods: 
      POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, 
      POST => /posts/:postId/comments, GET => /comments/:id;`, async () => {
      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      const res = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .auth(accessToken2, { type: "bearer" })
        .expect(200);


      expect(res.body).toEqual({
        id: expect.any(String),
        content: "This is a new comment for post",
        userId: expect.any(String),
        userLogin: "asirius-0",
        createdAt: expect.any(String),
        likesInfo: { likesCount: 1, dislikesCount: 0, myStatus: "None" }
      });


      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({ likeStatus: "Dislike" })
        .expect(204);

      const res1 = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(200);

      expect(res1.body).toEqual({
        id: expect.any(String),
        content: "This is a new comment for post",
        userId: expect.any(String),
        userLogin: "asirius-0",
        createdAt: expect.any(String),
        likesInfo: { likesCount: 1, dislikesCount: 1, myStatus: "Like" }
      });

    });
    it(`03 - GET -> "/posts/:postId/comments": 
      like comment 1 by user 1, user 2; 
      like comment 2 by user 2, user 3; 
      dislike comment 3 by user 1;
      like comment 4 by user 1, user 4, user 2, user 3;
      like comment 5 by user 2, dislike by user 3;
      like comment 6 by user 1, dislike by user 2.
      Get the comments by user 1 after all likes;
      status 200; content: comments array for post with pagination; used additional methods: 
      POST => /blogger/blogs, POST => /blogger/blogs/:blogId/posts, POST => /posts/:postId/comments, 
      PUT -> /posts/:postId/like-status;`, async () => {
      const res = await createCommentForTest(6, accessToken, post.id, app);
      comment = res[0].comment;
      comment1 = res[1].comment;
      comment2 = res[2].comment;
      comment3 = res[3].comment;
      comment4 = res[4].comment;
      comment5 = res[5].comment;

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment1.id}/like-status`)
        .auth(accessToken3, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment2.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: "Dislike" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment3.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment3.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment3.id}/like-status`)
        .auth(accessToken3, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment3.id}/like-status`)
        .auth(accessToken4, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment4.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment4.id}/like-status`)
        .auth(accessToken3, { type: "bearer" })
        .send({ likeStatus: "Dislike" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment5.id}/like-status`)
        .auth(accessToken1, { type: "bearer" })
        .send({ likeStatus: "Like" })
        .expect(204);

      await request(app.getHttpServer())
        .put(`/comments/${comment5.id}/like-status`)
        .auth(accessToken2, { type: "bearer" })
        .send({ likeStatus: "Dislike" })
        .expect(204);

      const res0 = await request(app.getHttpServer())
        .get(`/comments/${comment.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(200);

      expect(res0.body.likesInfo).toEqual({ likesCount: 2, dislikesCount: 0, myStatus: "Like" });

      const res01 = await request(app.getHttpServer())
        .get(`/comments/${comment1.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(200);

      expect(res01.body.likesInfo).toEqual({ likesCount: 2, dislikesCount: 0, myStatus: "None" });

      const res02 = await request(app.getHttpServer())
        .get(`/comments/${comment2.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(200);

      expect(res02.body.likesInfo).toEqual({ likesCount: 0, dislikesCount: 1, myStatus: "Dislike" });

      const res03 = await request(app.getHttpServer())
        .get(`/comments/${comment3.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(200);

      expect(res03.body.likesInfo).toEqual({ likesCount: 4, dislikesCount: 0, myStatus: "Like" });

      const res04 = await request(app.getHttpServer())
        .get(`/comments/${comment4.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(200);

      expect(res04.body.likesInfo).toEqual({ likesCount: 1, dislikesCount: 1, myStatus: "None" });

      const res05 = await request(app.getHttpServer())
        .get(`/comments/${comment5.id}`)
        .auth(accessToken1, { type: "bearer" })
        .expect(200);

      expect(res05.body.likesInfo).toEqual({ likesCount: 1, dislikesCount: 1, myStatus: "Like" });

      const result = await request(app.getHttpServer())
        .get(`/posts/${post.id}/comments`)
        .auth(accessToken1, { type: "bearer" })
        .expect(200);

      console.log(result.body.items);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 7,
        items: expect.any(Array)
      });
    });
  });
});





