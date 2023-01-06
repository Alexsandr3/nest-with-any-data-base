import { config } from "dotenv";

config();
import * as process from "process";

export const getConfiguration = () => ({
  PORT: parseInt(process.env.PORT, 10),
  tokens: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET
  },
  database: {
    DB_TYPE: process.env.DB_TYPE,
    MONGO_URL: process.env.MONGO_URL,
    PGSQL_URI: process.env.PGSQL_URI
  },
  email: {
    CLIENT_URL: process.env.CLIENT_URL,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_FROM: process.env.MAIL_FROM
  }
});

export type ConfigType = ReturnType<typeof getConfiguration>




