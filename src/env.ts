import dotenv from "dotenv";
import { cleanEnv, str, url } from "envalid";

dotenv.config();

const Env = cleanEnv(process.env, {
  TURSO_AUTH_TOKEN: str(),
  TURSO_DATABASE_URL: url(),
  BETTER_AUTH_SECRET: str(),
  NEXT_PUBLIC_APP_URL: url(),
});

export default Env;
