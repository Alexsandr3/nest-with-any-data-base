import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MongooseModule } from "@nestjs/mongoose";
import { BlogModule } from "./modules/blogs/blog.module";
import { PostModule } from "./modules/posts/post.module";
import { CommentModule } from "./modules/comments/comment.module";
import { UsersModule } from "./modules/users/usersModule";
import { MailModule } from "./modules/mail/mail.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TestingModule } from "./modules/testing/testing.module";
import { DeviceModule } from "./modules/security/device.module";
import { BloggerModule } from "./modules/blogger/blogger.module";
import { SaModule } from "./modules/sa/sa.module";
import { ConfigType, getConfiguration } from "./config/configuration";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [getConfiguration] }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => {
        const database = configService.get("database", { infer: true });
        return { uri: database.MONGO_URL };
      }
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
     // host: 'db.thin.dev',
      port: 5432,
      //username: 'wjAwVIGcCYqsGKcanuhfSWRmvFKeXUmK',
      //password: 'dltVsYUJmQJxMcYwmTzLoWMmOvfZNqhj',
      //database: '3efec63b-8094-4fa8-8583-2adf1954a134',
      url: 'postgresql://wjAwVIGcCYqsGKcanuhfSWRmvFKeXUmK:dltVsYUJmQJxMcYwmTzLoWMmOvfZNqhj@db.thin.dev/3efec63b-8094-4fa8-8583-2adf1954a134',
      //entities: [],
      synchronize: false,
      autoLoadEntities: false
    }),
    BlogModule,
    PostModule,
    CommentModule,
    UsersModule,
    MailModule,
    AuthModule,
    DeviceModule,
    TestingModule,
    BloggerModule,
    SaModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
