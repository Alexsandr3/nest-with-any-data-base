export const getConfiguration = () => ({
  PORT: parseInt(process.env.PORT, 10) ?? 3010,
  tokens: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ?? "858585858",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  },
  database: {
    MONGO_URL: process.env.MONGO_URL,
  },
  email: {
    CLIENT_URL: process.env.CLIENT_URL,
    MAIL_USER:  process.env.MAIL_USER,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_FROM: process.env.MAIL_FROM,
  },
});

export type ConfigType = ReturnType<typeof getConfiguration>

