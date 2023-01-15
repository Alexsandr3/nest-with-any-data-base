import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogModule } from './modules/blogs/blog.module';
import { PostModule } from './modules/posts/post.module';
import { CommentModule } from './modules/comments/comment.module';
import { UsersModule } from './modules/users/usersModule';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { TestingModule } from './modules/testing/testing.module';
import { DeviceModule } from './modules/security/device.module';
import { BloggerModule } from './modules/blogger/blogger.module';
import { SaModule } from './modules/sa/sa.module';
import { ConfigType, getConfiguration } from './config/configuration';
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailConfirmation } from './entities/emailConfirmation.entity';
import { EmailRecovery } from './entities/emailRecovery.entity';
import { DeviceT } from './entities/device.entity';
import { BlogT } from "./entities/blog.entity";
import { PostT } from "./entities/post.entity";
import { CommentT } from "./entities/comment.entity";
import { LikePost } from './entities/likePost.entity';
import { LikeComment } from './entities/likeComment.entity';
import { BannedBlogUser } from './entities/bannedBlogUser.entity';
import { Usser } from './entities/user.entity';

const modules = [
  UsersModule,
  DeviceModule,
  BlogModule,
  BloggerModule,
  PostModule,
  CommentModule,
  AuthModule,
  MailModule,
  TestingModule,
  SaModule,
];
const entities = [
  Usser,
  EmailConfirmation,
  EmailRecovery,
  DeviceT,
  BlogT,
  PostT,
  CommentT,
  LikePost,
  LikeComment,
  BannedBlogUser,
];


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [getConfiguration] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => {
        const database = configService.get('database', { infer: true });
        return { uri: database.MONGO_URL };
      },
    }),
    TypeOrmModule.forRootAsync({
      // imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => {
        const database = configService.get('database', { infer: true });
        return {
          type: 'postgres',
          // host: configService.get('MAIN_DB_HOST'),
          // port: parseInt(configService.get('MAIN_DB_PORT')),
          // database: configService.get('MAIN_DB_DATABASE'),
          // username: configService.get('MAIN_DB_USERNAME'),
          // password: configService.get('MAIN_DB_PASSWORD'),
          // schema: configService.get('MAIN_DB_SCHEMA'),
          entities: [...entities],
          // entities: ["/entities/*.entity.ts"],
          // migrations: [],
          //postgresql://ep-falling-lake-311641.eu-central-1.aws.neon.tech:5432/postgres
          // url: "postgres://Alexsandr3:ruJ4v3kcoabl@ep-falling-lake-311641.eu-central-1.aws.neon.tech:5432/postgres",
          url: database.PGSQL_NEON_URI,
          autoLoadEntities: true,
          synchronize: true,
          ssl: true,
        };
      },
    }),
    ...modules,
    TypeOrmModule.forRootAsync({
      // imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => {
        const database = configService.get('database', { infer: true });
        return {
          type: 'postgres',
          url: database.PGSQL_URI,
          autoLoadEntities: false,
          synchronize: false,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



// const options: TypeOrmModuleOptions = {
//   type: "postgres",
//   // host: "db.thin.dev",
//   // port: 5432,
//   // username: "wjAwVIGcCYqsGKcanuhfSWRmvFKeXUmK",
//   // password: "dltVsYUJmQJxMcYwmTzLoWMmOvfZNqhj",
//   // database: "3efec63b-8094-4fa8-8583-2adf1954a134",
//   url: "postgresql://wLjoUVUEoGPesZQZWUfFpbGlgALmADiw:sTyvDcUdHXBjVNIkrVmwLUFskrexHxEX@db.thin.dev/b76168db-7f53-4e42-8393-63c227017d05",
//   // entities: [],
//   autoLoadEntities: false,
//   synchronize: false
// };