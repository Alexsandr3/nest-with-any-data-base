import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersViewType } from "../src/modules/users/infrastructure/query-reposirory/user-View-Model";
import { createdApp } from "../src/helpers/createdApp";
import { AccessTokenType } from "./types/types";


const delay = async (delay: number = 1000) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, delay);
  });
};

jest.setTimeout(120000);

describe.skip("Auth (e2e)", () => {

  let app: INestApplication;
  //let mongoServer: MongoMemoryServer;
  //let blogsController: BlogsController;
  // let paginationInputModel: PaginationDto = new PaginationDto();
  //let blogsQueryRepositories: BlogsQueryRepositories

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
  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello free Belarus!");
  });
  describe(`/auth`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let validAccessToken: AccessTokenType, oldAccessToken: AccessTokenType;
    let refreshTokenKey: string, validRefreshToken: string, oldRefreshToken: string;
    it("POST shouldn`t authenticate user with incorrect data", async () => {
      const result = await request(app.getHttpServer())
        .post(`/sa/users`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({ login: "asirius", password: "asirius321", email: "asirius@jive.com" })
        .expect(201);
      user = result.body;

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

      const response = await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: "", password: "asirius321" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        errorsMessages: [{
          message: expect.any(String),
          field: "loginOrEmail"
        }]
      });

      await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: "asirius@jiveeee.com", password: "password" })
        .expect(401);
    });
    it("POST should authenticate user with correct login; content: AccessToken, RefreshToken in cookie (http only, secure)", async () => {
      const result = await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({
          loginOrEmail: "asirius",
          password: "asirius321"
        })
        .expect(200);

      await delay();
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });
      expect(result.headers["set-cookie"][0]).toBeTruthy();
      if (!result.headers["set-cookie"]) return;
      [refreshTokenKey, validRefreshToken] = result.headers["set-cookie"][0].split(";")[0].split("=");
      expect(refreshTokenKey).toBe(`refreshToken`);
      expect(result.headers["set-cookie"][0].includes(`HttpOnly`)).toBeTruthy();
      expect(result.headers["set-cookie"][0].includes(`Secure`)).toBeTruthy();
    });
    it("GET shouldn`t get data about user by bad token", async () => {
      await request(app.getHttpServer())
        .get("/auth/me")
        .auth(validAccessToken.accessToken + "d", { type: "bearer" })
        .expect(401);
      await request(app.getHttpServer())
        .get("/auth/me")
        .auth("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MzcxMzkzNTQ5OTYxNWM1MTAwZGM5YjQiLCJpYXQiOjE2NjgzNjU0MDUsImV4cCI6MTY3NTAxODIwNX0.Mb02J2SwIzjfXVX0RIihvR1ioj-rcP0fVt3TQcY-BlY", { type: "bearer" })
        .expect(401);

      await request(app.getHttpServer())
        .get("/auth/me")
        .expect(401);
    });
    it("GET should get data about user by token", async () => {
      const user = await request(app.getHttpServer())
        .get("/auth/me")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .expect(200);
      expect(user.body).toEqual({
        email: "asirius@jive.com",
        login: "asirius",
        userId: expect.any(String)
      });
    });
    it("GET shouldn`t get data about user when the AccessToken has expired", async () => {
      await delay(10000);
      await request(app.getHttpServer())
        .get("/auth/me")
        .auth(validAccessToken.accessToken, { type: "bearer" })
        .expect(401);
    }, 15000);
    it("POST should return an error when the \"refresh\" token has expired or there is no one in the cookie", async () => {
      await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .expect(401);
      await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", ``)
        .expect(401);
      await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", `refreshToken=${validRefreshToken}1`)
        .expect(401);

      await delay(10000);
      await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(401);
    }, 15000);
    it("POST should authenticate user with correct email", async () => {
      const result = await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({
          loginOrEmail: "asirius@jive.com",
          password: "asirius321"
        })
        .expect(200);

      await delay();
      oldAccessToken = validAccessToken;
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });
      expect(validAccessToken).not.toEqual(oldAccessToken);

      expect(result.headers["set-cookie"]).toBeTruthy();
      if (!result.headers["set-cookie"]) return;

      oldRefreshToken = validRefreshToken;
      [refreshTokenKey, validRefreshToken] = result.headers["set-cookie"][0].split(";")[0].split("=");
      expect(refreshTokenKey).toBe("refreshToken");
      expect(oldRefreshToken).not.toEqual(validRefreshToken);

    });
    it("POST should return new tokens; content: AccessToken, RefreshToken in cookie (http only, secure)", async () => {
      const result = await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(200);
      //.expect('set-cookie', `refreshToken=${refreshToken}; Path=/; HttpOnly; Secure`)

      await delay();
      oldAccessToken = validAccessToken;
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });
      expect(validAccessToken).not.toEqual(oldAccessToken);

      expect(result.headers["set-cookie"]).toBeTruthy();
      if (!result.headers["set-cookie"]) return;

      oldRefreshToken = validRefreshToken;
      [refreshTokenKey, validRefreshToken] = result.headers["set-cookie"][0].split(";")[0].split("=");
      expect(refreshTokenKey).toBe("refreshToken");
      expect(oldRefreshToken).not.toEqual(validRefreshToken);
      expect(result.headers["set-cookie"][0].includes("HttpOnly")).toBe(true);
      expect(result.headers["set-cookie"][0].includes("Secure")).toBe(true);

    });
    it("POST shouldn`t return new tokens when \"refresh\" token in BL", async () => {
      await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", `refreshToken=${oldRefreshToken}`)
        .expect(401);
    });
    it("POST should return new tokens 2", async () => {
      const result = await request(app.getHttpServer())
        .post("/auth/refresh-token")
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(200);

      await delay();
      oldAccessToken = validAccessToken;
      validAccessToken = result.body;
      expect(validAccessToken).toEqual({ accessToken: expect.any(String) });
      expect(validAccessToken).not.toEqual(oldAccessToken);

      expect(result.headers["set-cookie"]).toBeTruthy();
      if (!result.headers["set-cookie"]) return;

      oldRefreshToken = validRefreshToken;
      [refreshTokenKey, validRefreshToken] = result.headers["set-cookie"][0].split(";")[0].split("=");
      expect(refreshTokenKey).toBe("refreshToken");
      expect(oldRefreshToken).not.toEqual(validRefreshToken);

    });
    it("POST shouldn`t logout user when \"refresh\" token in BL", async () => {
      await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Cookie", `refreshToken=${oldRefreshToken}`)
        .expect(401);
    });
    it("POST should logout user", async () => {
      await request(app.getHttpServer())
        .post("/auth/logout")
        .set(`Cookie`, `refreshToken=${validRefreshToken}`)
        .expect(204);
    });
    it("POST shouldn`t logout user", async () => {
      await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(401);
    });
  });
  describe(`/auth/registration-email-resending and registration`, () => {
    let validAccessToken: AccessTokenType;
    let refreshTokenKey: string;
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    it("POST - `/auth/registration` should create user and send email, status - 204", async () => {
      await request(app.getHttpServer())
        .post("/auth/registration")
        .send({
          login: "asirius1",
          password: "asirius12",
          email: "asirius1@jive.com"
        })
        .expect(204);
    });
    it("POST - `/auth/registration` shouldn`t create user with valid login or email, return - 400 status code errors", async () => {
      await request(app.getHttpServer())
        .post("/auth/registration")
        .send({
          login: "asirius1",
          password: "asirius1",
          email: "asirius12@jive.com"
        })
        .expect(400);
      await request(app.getHttpServer())
        .post("/auth/registration")
        .send({
          login: "asirius12",
          password: "asirius1",
          email: "asirius1@jive.com"
        })
        .expect(400);
      await request(app.getHttpServer())
        .post("/auth/registration")
        .send({
          login: "asirius1",
          password: "",
          email: "asirius1@jive.com"
        })
        .expect(400);
    });
    it("POST - `/auth/registration-email-resending` should resend email and return status code 204", async () => {
      await request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "asirius1@jive.com"
        })
        .expect(204);
    });
    it("POST - `/auth/registration-email-resending` shouldn`t resend email because time to resend isn`t come, 400 code", async () => {
      await request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "asirius@jive.com"
        })
        .expect(400);
    });
    it("POST - `/auth/registration-email-resending` shouldn`t resend email, 400", async () => {
      await request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "test@test.ts"
        })
        .expect(400);
    });
    it("POST - `/auth/registration-confirmation` shouldn`t confirm registration because code is old, 400", async () => {
      await request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({
          code: "test"
        })
        .expect(400);
    });
    it("POST - `/auth/login` shouldn`t authenticate not confirmed user, - 401 ", async function() {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          loginOrEmail: "NewUser",
          password: "password"
        })
        .expect(401);
    });
    it("POST - `/auth/login` should authenticate confirmed user, - 200 ", async function() {
      const response = await request(app.getHttpServer())
        .post(`/auth/login`)
        .set(`User-Agent`, `for test`)
        .send({
          loginOrEmail: "asirius1",
          password: "asirius12"
        })
        .expect(200);
      validAccessToken = response.body;
      refreshTokenKey = response.headers["set-cookie"];

    });
    it("POST - `/auth/registration-confirmation` shouldn`t confirm registration if already confirm, - 400", async () => {
      await request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({
          code: "test"
        })
        .expect(400);
    });
    it("POST - `/auth/registration-confirmation` shouldn`t confirm registration if valid code, - 400", async () => {
      await request(app.getHttpServer())
        .post("/auth/registration-confirmation")
        .send({
          code: "6"
        })
        .expect(400);
    });
    it("POST shouldn`t resend email if registration already confirmed, - 204", async () => {
      await request(app.getHttpServer())
        .post("/auth/registration-email-resending")
        .send({
          email: "asirius1@jive.com"
        })
        .expect(204);
    });
    it("GET - `/sa/users` should return created user with pagination and status code - 200", async () => {
      const users = await request(app.getHttpServer())
        .get("/sa/users")
        .auth("admin", "qwerty", { type: "basic" })
        .expect(200);

      expect(users.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [{
          "id": expect.any(String),
          "login": expect.any(String),
          "email": expect.any(String),
          "createdAt": expect.any(String),
          "banInfo": {
            "isBanned": false,
            "banDate": null,
            "banReason": null
          }
        }]
      });
    });
  });
});





