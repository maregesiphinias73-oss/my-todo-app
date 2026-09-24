import { createUser, getUserByEmail, getUserById } from "../database/users";
import { hashPassword, verifyPassword } from "../utils/password.server";
import { getSessionCookie } from "../utils/cookies.server";
import { registerSchema, loginSchema } from "../utils/validation";

export async function registerUser(
  env: Env,
  input: unknown
) {
  const result = registerSchema.safeParse(input);

  if (!result.success) {
    return { success: false as const, errors: result.error.flatten().fieldErrors };
  }

  const { name, email, password } = result.data;

  const existing = await getUserByEmail(env.DB, email);

  if (existing) {
    return {
      success: false as const,
      errors: { email: ["An account with this email already exists."] },
    };
  }

  const passwordHash = await hashPassword(password);

  const user = await createUser(env.DB, { name, email, passwordHash });

  // Note: no session cookie is created here on purpose.
  // The user must explicitly log in after registering.
  return { success: true as const, user };
}

export async function loginUser(env: Env, input: unknown) {
  const result = loginSchema.safeParse(input);

  if (!result.success) {
    return { success: false as const, errors: result.error.flatten().fieldErrors };
  }

  const { email, password } = result.data;

  const user = await getUserByEmail(env.DB, email);

  if (!user) {
    return {
      success: false as const,
      errors: { form: ["Invalid email or password."] },
    };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);

  if (!validPassword) {
    return {
      success: false as const,
      errors: { form: ["Invalid email or password."] },
    };
  }

  const cookie = getSessionCookie(env.SESSION_SECRET);
  const cookieHeader = await cookie.serialize({ userId: user.id });

  return { success: true as const, user, cookieHeader };
}

export async function logoutUser(env: Env) {
  const cookie = getSessionCookie(env.SESSION_SECRET);
  const cookieHeader = await cookie.serialize("", { maxAge: 0 });

  return { cookieHeader };
}

export async function getUserFromSession(
  env: Env,
  request: Request
) {
  const cookie = getSessionCookie(env.SESSION_SECRET);
  const cookieHeader = request.headers.get("Cookie");
  const session = await cookie.parse(cookieHeader);

  if (!session?.userId) return null;

  const user = await getUserById(env.DB, session.userId);
  return user;
}
