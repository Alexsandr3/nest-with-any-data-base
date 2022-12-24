import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersViewType } from "../src/modules/users/infrastructure/query-reposirory/user-View-Model";
import { createdApp } from "../src/helpers/createdApp";
import {
  BlogViewForSaModel,
  BlogViewModel
} from "../src/modules/blogs/infrastructure/query-repository/blog-View-Model";
import { AccessTokenType } from "./types/types";


jest.setTimeout(120000);

describe.skip("Admin endpoints (e2e)", () => {
  let app: INestApplication;
  beforeAll(async () => {
    // Create a NestJS application
    const module: TestingModule = await Test.createTestingModule({ imports: [AppModule] })
      // .overrideProvider()
      .compile();
    app = module.createNestApplication();
    //created me
    app = createdApp(app);
    //blogsController = app.get<BlogsController>(BlogsController);
    //blogsQueryRepositories = app.get<BlogsQueryRepositories>(BlogsQueryRepositories);
    // Connect to the in-memory server
    await app.init();
    //Create a new MongoDB in-memory server
    //mongoServer = await MongoMemoryServer.create();
    //const mongoUri = mongoServer.getUri();
    // Get the connection string for the in-memory server
    //await mongoose.connect(mongoUri);
  });
  afterAll(async () => {
    await app.close();
    //await mongoose.disconnect();
    //await mongoServer.stop();
  });
  describe(`/sa`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let createdUser: UsersViewType;
    let blogs: BlogViewForSaModel;
    let createdBlog: BlogViewModel;
    let validAccessToken: AccessTokenType;
    it(`01 - POST -> "sa/users": should create new user; status 201; content: created user; used additional methods: GET => /users`, async () => {
      const response = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({ login: "asirius", password: "asirius321", email: "asirius@jive.com" })
        .expect(201);
      createdUser = response.body; //first user
      expect(createdUser).toEqual({
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
    });
    it(`02 - GET -> "/sa/blogs": should be return all blogs (array[]) wit pagination`, async () => {
      let resultView = {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: []
      };
      //jest.spyOn(blogsQueryRepositories, "findBlogs").mockImplementation(() => result);
      const responseBlog = await request(app.getHttpServer())
        .get(`/sa/blogs`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(200);
      blogs = responseBlog.body;
      expect(blogs).toStrictEqual(resultView);
    });
    it(`03 - GET -> "sa/users": should return status 200; content: users array with pagination; used additional methods: POST -> /users, DELETE -> /users;`, async () => {
      const response = await request(app.getHttpServer())
        .post("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .send({ login: "asirius2", password: "asirius2321", email: "asirius2@jive.com" })
        .expect(201);
      createdUser = response.body;  //second user
      await request(app.getHttpServer())
        .delete(`/sa/users/${createdUser.id}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(204);

      const response2 = await request(app.getHttpServer())
        .get(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(200);

      const modelUsers = response2.body as { items: UsersViewType[] };
      let resultView = {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [expect.any(Object)]
      };
      expect(modelUsers).toEqual(resultView);
      expect(modelUsers.items.length).toBe(1);
    });
    it(`04 - POST, DELETE -> "sa/users": should return error if auth credentials is incorrect; status 401; used additional methods: POST -> /users;`, async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({ login: "asirius2", password: "asirius2321", email: "asirius2@jive.com" })
        .expect(201);
      await request(app.getHttpServer())
        .delete(`/sa/users/${createResponse.body.id}`)
        .auth("admin", "123", { type: "basic" })
        .expect(401, "Unauthorized");
    });
    it(`05 - DELETE -> "sa/users/:id": should delete user by id; status 204; used additional methods: POST -> /users, GET -> /users`, async () => {
      const createResponse = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({ login: "asirius22", password: "asirius2321", email: "asirius22@jive.com" })
        .expect(201);
      createdUser = createResponse.body;
      await request(app.getHttpServer())
        .get(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(200);

      await request(app.getHttpServer())
        .delete(`/sa/users/${createdUser.id}`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(204);

    });
    it(`06 - POST -> "sa/users": should return error if passed body is incorrect; status 400`, async () => {
      const response = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({ login: "", password: "raccoon6", email: "wer@tut.by" })
        .expect(400);

      expect(response.body).toStrictEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: "login"
          }
        ]
      });

      const response2 = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth(`admin`, `qwerty`, { type: "basic" })
        .send({ login: "jiveBelarus", password: "", email: "wer@tut.by" })
        .expect(400);

      expect(response2.body).toStrictEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: "login"
          },
          {
            message: expect.any(String),
            field: "password"
          }
        ]
      });
    });
    it(`07 - POST -> "sa/users": should create new user; status 201; content: created user; used additional methods: GET => /users;`, async () => {
      const response = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          login: "jive",
          password: "1231231",
          email: "wer@tut.by"
        })
        .expect(201);

      createdUser = response.body;

      const resultByUsers = await request(app.getHttpServer())
        .get(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(200);
      const modelUser = resultByUsers.body as { items: UsersViewType[] };
      expect(modelUser.items.length).toBe(3);

    });
    it(`08 - PUT -> "sa/users/:id/ban": should update status ban user; and return status 204; `, async () => {
      await request(app.getHttpServer())
        .put(`/sa/users/${createdUser.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          "isBanned": true,
          "banReason": "the user wanted a lot of money"
        })
        .expect(204);


    });
    it(`09 - PUT -> "sa/users/:id/ban": should return error status 400, if incorrect input data; `, async () => {
      await request(app.getHttpServer())
        .put(`/sa/users/${createdUser.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          "isBanned": true,
          "banReason": "the user"
        })
        .expect(400);

      await request(app.getHttpServer())
        .put(`/sa/users/${createdUser.id}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          "isBanned": "true",
          "banReason": "the user wanted a lot of many"
        })
        .expect(400);


    });
    it(`10 - GET -> "/sa/blogs": should be return all blogs (array[]) wit pagination`, async () => {
      const result = await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({
          loginOrEmail: "asirius",
          password: "asirius321"
        })
        .expect(200);

      validAccessToken = result.body;

      const responseB = await request(app.getHttpServer())
        .post(`/blogger/blogs`)
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .send({
          name: "supertest_01",
          description: "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main ",
          websiteUrl: "https://www.youtube.com/watch?v=vuzKKCYXISA"
        })
        .expect(201)

      createdBlog = responseB.body
      expect(createdBlog).toEqual({
        id: expect.any(String),
        name: "supertest_01",
        description: "A mongoose is a small terrestrial carnivorous mammal belonging to the family Herpestidae. This family is currently split into two subfamilies, the Herpestinae and the Mungotinae. The Herpestinae comprises 23 living species that are native to southern Europe, Africa and Asia, whereas the Mungotinae comprises 11 species native to Africa.[2] The Herpestidae originated about 21.8 ± 3.6 million years ago in the Early Miocene and genetically diverged into two main",
        websiteUrl: 'https://www.youtube.com/watch?v=vuzKKCYXISA',
        createdAt: expect.any(String)
      })

      const responseBlogs = await request(app.getHttpServer())
        .get(`/sa/blogs`)
        .auth("admin", "qwerty", { type: "basic" })
        .expect(200);
      blogs = responseBlogs.body;
      expect(blogs).toStrictEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [expect.any(Object)]
      });
    });
  });
});










