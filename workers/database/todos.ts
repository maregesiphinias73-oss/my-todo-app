import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./index";
import { todos } from "./schema";

export async function createTodo(
  d1: D1Database,
  data: {
    userId: string;
    title: string;
    description?: string;
  }
) {
  const db = getDb(d1);

  const [todo] = await db
    .insert(todos)
    .values(data)
    .returning();

  return todo;
}

export async function getUserTodos(d1: D1Database, userId: string) {
  const db = getDb(d1);

  const results = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));

  return results;
}

export async function getTodoById(
  d1: D1Database,
  id: string,
  userId: string
) {
  const db = getDb(d1);

  const todo = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .get();

  return todo ?? null;
}

export async function updateTodo(
  d1: D1Database,
  id: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string | null;
    completed: boolean;
  }>
) {
  const db = getDb(d1);

  const [todo] = await db
    .update(todos)
    .set(data)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();

  return todo ?? null;
}

export async function deleteTodo(
  d1: D1Database,
  id: string,
  userId: string
) {
  const db = getDb(d1);

  const [todo] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();

  return todo ?? null;
}
