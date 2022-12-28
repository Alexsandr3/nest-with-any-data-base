import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersViewType } from "../src/modules/users/infrastructure/query-reposirory/user-View-Model";
import { createdApp } from "../src/helpers/createdApp";
import { AccessTokenType } from "./types/types";
import { BlogViewModel } from "../src/modules/blogs/infrastructure/query-repository/blog-View-Model";
import { PostViewModel } from "../src/modules/posts/infrastructure/query-repositories/post-View-Model";



jest.setTimeout(120000);

describe.skip("Blogger (e2e)", () => {

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

  describe(`/blogger`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let validAccessToken: AccessTokenType;
    let blog: BlogViewModel;
    let post: PostViewModel;

    it(`01 - should create new blog; status 201; content: created blog, used additional methods: POST -> /sa/users, POST -> /blogger/blogs`, async () => {
      const response00 = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({ login: "asirius", password: "asirius321", email: "asirius@jive.com" })
        .expect(201);
      user = response00.body;
      expect(user).toEqual({
        id: expect.any(String),
        login: "asirius",
        email: "asirius@jive.com",
        createdAt: expect.any(String),
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null
        }
      });
      const response0 = await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: "asirius", password: "asirius321" })
        .expect(200);
      validAccessToken = response0.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });
      const responseBlog = await request(app.getHttpServer())
        .post("/blogger/blogs/")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(201);
      blog = responseBlog.body;
      expect(blog).toEqual({
        id: expect.any(String),
        name: "Mongoose",
        description: "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main",
        websiteUrl: "https://www.mongoose.com",
        createdAt: expect.any(String)
      });
    });
    it(`02 - should create new post for specific blog; status 201; content: created post; used additional methods: POST -> /blogs, POST -> /blogger/:id/posts`, async () => {
      const responsePost = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "title": "string113231423",
          "shortDescription": "fasdfdsfsd",
          "content": "strifdasdfsadfsadfng"
        })
        .expect(201);
      post = responsePost.body;
      expect(post).toEqual({
        id: expect.any(String),
        title: "string113231423",
        shortDescription: "fasdfdsfsd",
        content: "strifdasdfsadfsadfng",
        blogId: blog.id,
        blogName: "Mongoose",
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: "None",
          newestLikes: []
        }
      });
    });
    it(`03 - POST, GET -> "/blogger/blogs/:blogId/posts": should return error if :id from uri param not found; status 404`, async () => {
      await request(app.getHttpServer())
        .post(`/blogger/blogs/543646efv/posts`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          title: "01 - Way of the Samurai",
          shortDescription: "have basic knowledge of JS",
          content: "I just forgot to say: from the start you need to have basic knowledge of JS"
        })
        .expect(404);

    });
    it(`04 - GET -> "/blogger/blogs": should return status 200; content: posts for specific blog with pagination; used additional methods: POST -> /blogs, POST -> /posts`, async () => {
      const responseBlog = await request(app.getHttpServer())
        .post("/blogger/blogs/")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(201);
      blog = responseBlog.body;

      const result = await request(app.getHttpServer())
        .get(`/blogger/blogs`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .expect(200);
      expect(result.body).toEqual({
        "pagesCount": 1,
        "page": 1,
        "pageSize": 10,
        "totalCount": 2,
        "items": [expect.any(Object), expect.any(Object)]
      });

    });
    it(`05 - PUT -> "/blogger/blogs/:id": should update blog by id; status 204`, async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "raccoon",
          "description": "raccoon",
          "websiteUrl": "https://www.raccoon.com"
        })
        .expect(204);
    });
    it(`06 - DELETE -> "/blogs/:id": should delete blog by id; status 204; used additional methods: POST -> /blogs, GET -> /blogs/:id`, async () => {
      const responseBlog2 = await request(app.getHttpServer())
        .post("/blogger/blogs/")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(201);
      blog = responseBlog2.body;
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .expect(204);
    });
    it(`07 - PUT, DELETE, GET -> "/blogs/:id": should return error if :id from uri param not found; status 404`, async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/4354353`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(404);

      await request(app.getHttpServer())
        .delete(`/blogger/blogs/43543d53`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .expect(404);
    });
    it(`08 - GET,  find all created blogs`, async () => {
      const result = await request(app.getHttpServer())
        .get(`/blogger/blogs`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .expect(200);
      const model = result.body as { items: BlogViewModel[] };
      expect(model.items.length).toBe(2);
    });
    it(`09 - PUT, POST, DELETE -> "/blogs": should return error if auth credentials is incorrect; status 401;`, async () => {
      const responseBlog3 = await request(app.getHttpServer())
        .post("/blogger/blogs/")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(201);
      blog = responseBlog3.body;
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}`)
        .set("Authorization", `Basic qwerYWRtaW46cXdlcnR5`)   ///qwer
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(401);
      await request(app.getHttpServer())
        .post(`/blogger/blogs`)
        .auth(validAccessToken.accessToken + "b", { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(401);
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}`)
        .set("Authorization", `Basic qwYWRtaW46cXdlcnR5`)//qw
        .expect(401);
    });
    it(`10 - POST -> "/blogs": should return error if passed body is incorrect; status 400`, async () => {
      await request(app.getHttpServer())
        .post("/blogger/blogs/")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https//www.mongoose.com"
        })
        .expect(400);
      await request(app.getHttpServer())
        .post("/blogger/blogs/")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "MongooseMongooseMongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(400);
    });
    it(`11 - POST -> "/blogs/:blogId/posts": should return error if passed body is incorrect; status 400; used additional methods: POST -> /blogs`, async () => {
      const responseBlog4 = await request(app.getHttpServer())
        .post("/blogger/blogs/")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(201);
      blog = responseBlog4.body;
      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "title": "I just forgot to say: from the start you need to have basic knowledge of JS",
          "shortDescription": "string",
          "content": "string"
        })
        .expect(400);
    });
    it(`12 - PUT -> "/posts/:id": should update post by id; status 204; used additional methods: POST -> /blogs, POST -> /posts, GET -> /posts/:id`, async () => {
      const responseBlog5 = await request(app.getHttpServer())
        .post("/blogger/blogs")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(201);
      blog = responseBlog5.body;

      const responsePost2 = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          title: "01 - Way of the Samurai",
          shortDescription: "have basic knowledge of JS",
          content: "I just forgot to say: from the start you need to have basic knowledge of JS"
        })
        .expect(201);
      post = responsePost2.body;
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}/posts/${post.id}`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          title: "01 - Way of the Samurai",
          shortDescription: "have basic knowledge of JS",
          content: "I just forgot to say: from the start you need to have basic knowledge of JS"
        })
        .expect(204);
    });
    it(`13 - DELETE -> "/posts/:id": should delete post by id; status 204; used additional methods: POST -> /blogs, POST -> /posts, GET -> /posts/:id`, async () => {
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}/posts/${post.id}`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .expect(204);

    });
    it(`14 - PUT, DELETE, GET -> "/posts/:id": should return error if :id from uri param not found; status 404; used additional methods: POST -> /blogs;`, async () => {
      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id + 1}`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(404);
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/43543d53`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .expect(404);
    });
    it(`15 - PUT, POST, DELETE -> "/posts": should return error if auth credentials is incorrect; status 401; used additional methods: POST -> /blogs;`, async () => {
      const responseBlog6 = await request(app.getHttpServer())
        .post("/blogger/blogs/")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          "name": "Mongoose",
          "description": "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          "websiteUrl": "https://www.mongoose.com"
        })
        .expect(201);
      blog = responseBlog6.body;

      await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .set("Authorization", `Basic qwYWRtaW46cXdlcnR5`)//qw
        .send({
          "title": "I just forgot ",
          "shortDescription": "string",
          "content": "string"
        })
        .expect(401);

      await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}`)
        .set("Authorization", `Basic qwerYWRtaW46cXdlcnR5`)   ///qwer
        .send({
          "title": "I just forgot ",
          "shortDescription": "string",
          "content": "string"
        })
        .expect(401);
      await request(app.getHttpServer())
        .delete(`/blogger/blogs/${blog.id}`)
        .set("Authorization", `Basic qwYWRtaW46cXdlcnR5`)//qw
        .expect(401);
      const resBlogs = await request(app.getHttpServer())
        .get(`/blogger/blogs`)
        .auth(validAccessToken.accessToken, {type: "bearer"})
        .expect(200)

      const blogs = resBlogs.body as { items: BlogViewModel[] }
      expect(blogs.items.length).toBe(6)
    });

  });

});





