import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ConfigType } from "./config/configuration";
import { createdApp } from "./helpers/createdApp";


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { credentials: true },
  });
  const configService = app.get(ConfigService<ConfigType>)
  const port = configService.get('PORT', {infer: true})
  const finishedApp = createdApp(app)
  await finishedApp.listen(port).then(async () => console.log(`Server is listening on ${await app.getUrl()}`));
}

bootstrap();
