import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  CHROMIUM_EXECUTABLE: z.string().default("/usr/bin/chromium"),
  GOOGLE_COOKIES_FILE: z.string().default("data/cookies.json"),
  GOOGLE_PASSWORD: z.string().min(1),
});

const env = envSchema.parse(process.env);

export const {
  PORT,
  CHROMIUM_EXECUTABLE,
  GOOGLE_COOKIES_FILE,
  GOOGLE_PASSWORD,
} = env;
