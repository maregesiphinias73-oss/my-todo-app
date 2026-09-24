import { Form, redirect, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/todos";
import { requireUser } from "../../workers/utils/require-user";
import { logoutUser } from "../../workers/services/auth.server";
import {
  createUserTodo,
  listUserTodos,
  updateUserTodo,
  deleteUserTodo,
} from "../../workers/services/todo";
import { cloudflareContext } from "../../workers/context";
import { TodoForm } from "../components/todo/TodoForm";
import { TodoList } from "../components/todo/TodoList";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const user = await requireUser(env, request);
  const todos = await listUserTodos(env.DB, user.id);

  return { user, todos };
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const user = await requireUser(env, request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "logout") {
    const { cookieHeader } = await logoutUser(env);
    return redirect("/auth/login", { headers: { "Set-Cookie": cookieHeader } });
  }

  if (intent === "create") {
    const result = await createUserTodo(env.DB, user.id, {
      title: formData.get("title"),
      description: formData.get("description"),
    });
    if (!result.success) return { errors: result.errors };
    return redirect("/todos");
  }

  if (intent === "update") {
    const result = await updateUserTodo(env.DB, user.id, {
      id: formData.get("id"),
      title: formData.get("title") || undefined,
      description: formData.get("description"),
      completed: formData.get("completed") === "on",
    });
    if (!result.success) return { errors: result.errors };
    return redirect("/todos");
  }

  if (intent === "delete") {
    const id = String(formData.get("id"));
    await deleteUserTodo(env.DB, user.id, id);
    return redirect("/todos");
  }

  return { errors: { form: ["Invalid action."] } };
}

export default function Todos() {
  const { user, todos } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Todos</h1>
            <p className="text-sm text-gray-600">Welcome, {user.name}</p>
          </div>
          <Form method="post">
            <input type="hidden" name="intent" value="logout" />
            <button
              type="submit"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Log out
            </button>
          </Form>
        </div>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Add a todo</h2>
          <TodoForm
          key={todos.length}
            errors={
              actionData && "errors" in actionData ? actionData.errors : undefined
            }
          />
        </section>

        <TodoList
          todos={todos}
          errors={
            actionData && "errors" in actionData ? actionData.errors : undefined
          }
        />
      </div>
    </main>
  );
}
