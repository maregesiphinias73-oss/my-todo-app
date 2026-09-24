import { redirect } from "react-router";
import { getUserFromSession } from "../services/auth.server";

export async function requireUser(env: Env, request: Request) {
  const user = await getUserFromSession(env, request);

  if (!user) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams([["redirectTo", url.pathname]]);
    throw redirect(`/auth/login?${searchParams.toString()}`);
  }

  return user;
}