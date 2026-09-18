import dotenv from "dotenv";
import { cleanEnv, str, url } from "envalid";

dotenv.config();

const Env = cleanEnv(process.env, {
  BETTER_AUTH_SECRET: str(),
  NEXT_PUBLIC_APP_URL: url(),
  DATABASE_URL: url(),
  DATABASE_URL_DIRECT: url(),
});

export default Env;
