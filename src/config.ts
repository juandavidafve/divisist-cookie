import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  GOOGLE_EMAIL: z.email(),
  GOOGLE_PASSWORD: z.string().min(1),
  GOOGLE_TOTP_SECRET: z.string().min(1),
  CHROMIUM_EXECUTABLE: z.string().default("/usr/bin/chromium"),
});

const env = envSchema.parse(process.env);

export const {
  PORT,
  GOOGLE_EMAIL,
  GOOGLE_PASSWORD,
  GOOGLE_TOTP_SECRET,
  CHROMIUM_EXECUTABLE,
} = env;
