import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { createdApp } from "../src/helpers/createdApp";
import {
  createUserByLoginEmail
} from "./helpers/create-user-by-login-email";


jest.setTimeout(120000);


describe(`Ban blog by super admin`, () => {

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

  describe(`Super admin Api > Users`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });


    it(`01 - POST -> "/auth/login": Shouldn't login banned user. Should login unbanned user; status 401; used additional methods: POST => /sa/users, PUT => /sa/users/:id/ban;`, async () => {
      const res = await createUserByLoginEmail(1, app);
      // const res2 = await createUniqeUserByLoginEmail(1, "S",app);


      await request(app.getHttpServer())
        .put(`/sa/users/${res[0].userId}/ban`)
        .auth("admin", "qwerty", { type: "basic" })
        .send({
          isBanned: true,
          banReason: "too much talking, bad user"
        })
        .expect(204)

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

  });


});





