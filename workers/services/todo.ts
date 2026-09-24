import {
  createTodo,
  getUserTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
} from "../database/todos";
import {
  createTodoSchema,
  updateTodoSchema,
} from "../utils/validation";

export async function createUserTodo(
  d1: D1Database,
  userId: string,
  input: unknown
) {
  const result = createTodoSchema.safeParse(input);

  if (!result.success) {
    return { success: false as const, errors: result.error.flatten().fieldErrors };
  }

  const todo = await createTodo(d1, {
    userId,
    title: result.data.title,
    description: result.data.description || undefined,
  });

  return { success: true as const, todo };
}

export async function listUserTodos(d1: D1Database, userId: string) {
  return getUserTodos(d1, userId);
}

export async function updateUserTodo(
  d1: D1Database,
  userId: string,
  input: unknown
) {
  const result = updateTodoSchema.safeParse(input);

  if (!result.success) {
    return { success: false as const, errors: result.error.flatten().fieldErrors };
  }

  const existing = await getTodoById(d1, result.data.id, userId);

  if (!existing) {
    return { success: false as const, errors: { form: ["Todo not found."] } };
  }

  const todo = await updateTodo(d1, result.data.id, userId, {
    title: result.data.title,
    description: result.data.description,
    completed: result.data.completed,
  });

  return { success: true as const, todo };
}

export async function deleteUserTodo(
  d1: D1Database,
  userId: string,
  id: string
) {
  const existing = await getTodoById(d1, id, userId);

  if (!existing) {
    return { success: false as const, errors: { form: ["Todo not found."] } };
  }

  const todo = await deleteTodo(d1, id, userId);

  return { success: true as const, todo };
}
