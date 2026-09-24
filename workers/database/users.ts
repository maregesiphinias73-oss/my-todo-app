import { eq } from "drizzle-orm";
import { getDb } from "./index";
import { users } from "./schema";

export async function createUser(
  d1: D1Database,
  data: {
    email: string;
    passwordHash: string;
    name: string;
  }
) {
  const db = getDb(d1);

  const [user] = await db
    .insert(users)
    .values(data)
    .returning();

  return user;
}

export async function getUserByEmail(d1: D1Database, email: string) {
  const db = getDb(d1);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  return user ?? null;
}

export async function getUserById(d1: D1Database, id: string) {
  const db = getDb(d1);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .get();

  return user ?? null;
}
