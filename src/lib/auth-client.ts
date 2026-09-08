import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [adminClient()],
});
