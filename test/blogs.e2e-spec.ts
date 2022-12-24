import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersViewType } from "../src/modules/users/infrastructure/query-reposirory/user-View-Model";
import { createdApp } from "../src/helpers/createdApp";
import { AccessTokenType } from "./types/types";
import { BlogViewModel } from "../src/modules/blogs/infrastructure/query-repository/blog-View-Model";



jest.setTimeout(120000);

describe("Blogs (e2e)", () => {

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

  describe(`/blogs`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let validAccessToken: AccessTokenType;
    let blog: BlogViewModel;

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

  });

});





