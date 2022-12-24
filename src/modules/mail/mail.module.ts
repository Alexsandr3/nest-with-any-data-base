import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ConfigType } from "../../config/configuration";

@Global() // 👈 global module
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => {
        const settings = configService.get('email', {infer: true})
        return {
          transport: {
            service: 'gmail',
            // host: 'smtp.example.com',
            secure: false,
            auth: {
              user: settings.MAIL_USER,
              //user: 'forexperienceinincubatore@gmail.com',
              pass: settings.MAIL_PASSWORD, //for nest.js
            },
          },
          /*defaults: {
            from: '"Free help 🔐" <forexperienceinincubatore@gmail.com>', // sender address
          },*/
          template: {
            //dir: join(__dirname, `templates`),
            dir: __dirname + '/templates',
            adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
            options: {
              strict: true,
            },
          },
        }
      }
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or

    }),
    ConfigModule,
  ],
  providers: [MailService],
  exports: [MailService], // 👈 export for DI
})
export class MailModule {}
