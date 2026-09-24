import { createCookie } from "react-router";

export function getSessionCookie(secret: string) {
  return createCookie("todo_session", {
    secrets: [secret],
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}
