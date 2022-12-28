import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { UsersViewType } from "../src/modules/users/infrastructure/query-reposirory/user-View-Model";
import { createdApp } from "../src/helpers/createdApp";
import { AccessTokenType } from "./types/types";
import { DeviceViewModel } from "../src/modules/security/infrastructure/query-repository/device-View-Model";


const delay = async (delay: number = 1000) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, delay);
  });
};

jest.setTimeout(120000)

describe("Secury (e2e)", () => {

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
  describe(`/auth`, () => {
    beforeAll(async () => {
      await request(app.getHttpServer())
        .delete(`/testing/all-data`).expect(204);
    });
    let user: UsersViewType;
    let validAccessToken: AccessTokenType;
    let refreshTokenKey: string, validRefreshToken: string, oldRefreshToken: string, validRefreshToken0: string
    let devices: DeviceViewModel[]
    it('01 - POST - `/sa/users` should authenticate user with correct data and return status code 200', async () => {
      const resultUser = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', {type: 'basic'})
        .send({ login: "asirius", password: "asirius321", email: "asirius@jive.com" })
        .expect(201)

      user = resultUser.body

      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: "asirius", password: "asirius321" })
        .expect(200)

      await delay()
      validAccessToken = result.body
      expect(validAccessToken).toEqual({accessToken: expect.any(String)})

      expect(result.headers['set-cookie']).toBeTruthy()
      if (!result.headers['set-cookie']) return

      [refreshTokenKey, validRefreshToken0] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken')
      expect(result.headers['set-cookie'][0].includes('HttpOnly')).toBe(true)
      expect(result.headers['set-cookie'][0].includes('Secure')).toBe(true)

    })
    it('02 - GET - `/auth/me` should get data about user by token and return status code - 200', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .auth(validAccessToken.accessToken, {type: "bearer"})
        .expect(200)

    })
    it('03 - POST - `/auth/login` should authenticate user +2 times', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set(`User-Agent`, `for test`)
        .send({
          loginOrEmail: "asirius",
          password: "asirius321"
        })
        .expect(200)
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .set(`User-Agent`, `for test`)
        .send({
          loginOrEmail: "asirius",
          password: "asirius321"
        })
        .expect(200)

      await delay()
      validAccessToken = result.body
      expect(validAccessToken).toEqual({accessToken: expect.any(String)})

      expect(result.headers['set-cookie']).toBeTruthy()
      if (!result.headers['set-cookie']) return

      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken')
      expect(result.headers['set-cookie'][0].includes('HttpOnly')).toBe(true)
      expect(result.headers['set-cookie'][0].includes('Secure')).toBe(true)
    })
    it('04 - GET - `/security/devices` should get device list, return status code 200', async () => {
      const result = await request(app.getHttpServer())
        .get('/security/devices')
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(200)

      devices = result.body
      expect(devices).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        }])
    })
    it('05 - DELETE - `/security/devices/:id`  should return error if Id param not found, 404', async () => {
      await request(app.getHttpServer())
        .delete('/security/devices/someId')
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(404)
    })
    it('06 - DELETE - `/security/devices/:id` should return error if auth credentials is incorrect, 401', async () => {
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices[0].deviceId}`)
        .set("Cookie", `refreshToken=${validRefreshToken}+1`)
        .expect(401)
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices[0].deviceId}`)
        .expect(401)

      await request(app.getHttpServer())
        .delete(`/security/devices`)
        .set("Cookie", `refreshToken=${validRefreshToken}+1`)
        .expect(401)
      await request(app.getHttpServer())
        .delete(`/security/devices`)
        .expect(401)
    })
    it('07 - DELETE -  `/security/devices/:id` should return error if access denied, 403', async () => {
      await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty', {type: 'basic'})
        .send({
          login: "asirius2",
          password: "asirius3212",
          email: "asirius2@jive.com"
        })
        .expect(201)

      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .set(`User-Agent`, `for test`)
        .send({ loginOrEmail: "asirius2", password: "asirius3212" })
        .expect(200)

      await delay();

      const refreshToken2 = result.headers['set-cookie'][0].split(';')[0].split('=')[1];

      await request(app.getHttpServer())
        .delete(`/security/devices/${devices[1].deviceId}`)
        .set("Cookie", `refreshToken=${refreshToken2}`)
        .expect(403)

    })
    it('08 - POST - `/security/devices` should not change deviceId after refresh-token, LastActiveDate should be changed, 200', async function () {
      const result = await request(app.getHttpServer())
        .post('/auth/refresh-token')
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(200)

      await delay()
      expect(result.body).toEqual({accessToken: expect.any(String)})
      expect(result.body).not.toEqual(validAccessToken)

      expect(result.headers['set-cookie']).toBeTruthy()
      if (!result.headers['set-cookie']) return

      oldRefreshToken = validRefreshToken;
      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');
      expect(refreshTokenKey).toBe('refreshToken')
      expect(oldRefreshToken).not.toEqual(validRefreshToken)
      expect(result.headers['set-cookie'][0].includes('HttpOnly')).toBe(true)
      expect(result.headers['set-cookie'][0].includes('Secure')).toBe(true)

      const resultDeviceList = await request(app.getHttpServer())
        .get('/security/devices')
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(200)

      const newDeviceList: DeviceViewModel[] = resultDeviceList.body
      expect(newDeviceList).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        }])
      expect(devices.map(d => d.deviceId)).toEqual(newDeviceList.map(d => d.deviceId))
      expect(devices.map(d => d.lastActiveDate)).not.toEqual(newDeviceList.map(d => d.lastActiveDate))
    });
    it('09 - GET - `/security/devices` should delete device, used additional methods: DELETE -> /security/devices/:id, GET -> /security/devices', async () => {
      await request(app.getHttpServer())
        .delete(`/security/devices/${devices[1].deviceId}`)
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(204)

      const resultDeviceList = await request(app.getHttpServer())
        .get('/security/devices')
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(200)

      const newDeviceList: DeviceViewModel[] = resultDeviceList.body
      expect(newDeviceList).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        }])
      expect(devices).not.toEqual(newDeviceList)
      devices = newDeviceList
    })
    it('10 - DELETE - `/security/devices` should delete devices', async () => {
      await request(app.getHttpServer())
        .delete(`/security/devices`)
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(204)

      await delay()
      const resultDeviceList = await request(app.getHttpServer())
        .get('/security/devices')
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(200)

      const newDeviceList: DeviceViewModel[] = resultDeviceList.body
      expect(newDeviceList).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        }])
      expect(devices).not.toEqual(newDeviceList)
      devices = newDeviceList
    })
    it('11 - POST - `` should logout device', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(204)

      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'for test')
        .send({
          loginOrEmail: "asirius",
          password: "asirius321"
        })
        .expect(200)

      await delay()

      expect(result.headers['set-cookie']).toBeTruthy()
      if (!result.headers['set-cookie']) return

      [refreshTokenKey, validRefreshToken] = result.headers['set-cookie'][0].split(';')[0].split('=');

      const resultDeviceList = await request(app.getHttpServer())
        .get('/security/devices')
        .set("Cookie", `refreshToken=${validRefreshToken}`)
        .expect(200)

      const newDeviceList: DeviceViewModel[] = resultDeviceList.body
      expect(newDeviceList).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        }])
      expect(devices).not.toEqual(newDeviceList)
    })
    it.skip('12 - POST - /registration should return status code 429 if more than 5 requests in 10 seconds, and 204 after waiting', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: "asirius",
          password: "asirius321",
          email: ""
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: "asirius",
          password: "asirius321",
          email: ""
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: "asirius",
          password: "asirius321",
          email: ""
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: "asirius",
          password: "asirius321",
          email: ""
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: "asirius",
          password: "asirius321",
          email: ""
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: "asirius",
          password: "asirius321",
          email: ""
        })
        .expect(429)

      await delay(10001)

      await request(app.getHttpServer())
        .post('/auth/registration')
        .send({
          login: "asirius",
          password: "asirius321",
          email: ""
        })
        .expect(400)
    }, 35000)
    it.skip('13 -POST - /login should return status code 429 if more than 5 requests in 10 seconds, and 401 after waiting ', async function () {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'for test')
        .send({
          loginOrEmail: "login0",
          password: "password0"
        })
        .expect(401)
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'for test')
        .send({
          loginOrEmail: "login0",
          password: "password0"
        })
        .expect(401)
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'for test')
        .send({
          loginOrEmail: "login0",
          password: "password0"
        })
        .expect(401)
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'for test')
        .send({
          loginOrEmail: "login0",
          password: "password0"
        })
        .expect(401)
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'for test')
        .send({
          loginOrEmail: "login0",
          password: "password0"
        })
        .expect(401)
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'for test')
        .send({
          loginOrEmail: "login0",
          password: "password0"
        })
        .expect(429)

      await delay(10000)

      await request(app.getHttpServer())
        .post('/auth/login')
        .set('User-Agent', 'for test')
        .send({
          loginOrEmail: "login0",
          password: "password0"
        })
        .expect(401)

    }, 15000);
    it.skip('14 - POST/resending should return status code 429 if more than 5 requests in 10 seconds, and 400 after waiting', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: "stringx@sdf.eee"
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: "stringx@sdf.eee"
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: "stringx@sdf.eee"
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: "stringx@sdf.eee"
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration-email-resending')
        .send({
          email: "stringx@sdf.eee"
        })
        .expect(400)
      await request(app)
        .post('/auth/registration-email-resending')
        .send({
          email: "stringx@sdf.eee"
        })
        .expect(429)

      await delay(10000)

      await request(app)
        .post('/auth/registration-email-resending')
        .send({
          email: "stringx@sdf.eee"
        })
        .expect(400)
    }, 15000)
    it.skip('15 - POST/confirmation should return status code 429 if more than 5 requests in 10 seconds, and 400 after waiting', async () => {
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: "6"
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: "6"
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: "6"
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: "6"
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: "6"
        })
        .expect(400)
      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: "6"
        })
        .expect(429)

      await delay(10000)

      await request(app.getHttpServer())
        .post('/auth/registration-confirmation')
        .send({
          code: "6"
        })
        .expect(400)
    }, 15000)
  });
});



