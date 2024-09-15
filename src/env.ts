import zod from "zod";

const envSchema = zod.object({
  DATABASE_URL: zod.string().url(),
  PORT: zod.string(),
});

export const env = envSchema.parse(process.env);
