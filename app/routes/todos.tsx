// --- Imports ---

// React Router helpers: Form (progressive-enhanced <form>), redirect (server
// redirect response), and hooks to read loader/action data on the client.
import { Form, redirect, useActionData, useLoaderData } from "react-router";

// Auto-generated types for this specific route (based on its filename and
// position in routes.ts). Gives us typed `request`/`context` params below.
import type { Route } from "./+types/todos";

// Auth helper: confirms a session exists, otherwise redirects to /auth/login.
import { requireUser } from "../../workers/utils/require-user";

// Auth service: clears the session cookie.
import { logoutUser } from "../../workers/services/auth.server";

// Todo service layer: validates input, then calls the database layer.
import {
  createUserTodo,
  listUserTodos,
  updateUserTodo,
  deleteUserTodo,
} from "../../workers/services/todo";

// The typed context key used to retrieve { env, ctx } from React Router v8's
// RouterContextProvider (see workers/context.ts and workers/app.ts).
import { cloudflareContext } from "../../workers/context";

// UI components for adding/listing todos.
import { TodoForm } from "../components/todo/TodoForm";
import { TodoList } from "../components/todo/TodoList";

// React hooks: useState for modal open/close, useRef to programmatically
// submit the hidden logout form after the user confirms in the modal.
import { useRef, useState } from "react";

// Custom confirmation modal shown before actually logging the user out.
import { LogoutModal } from "../components/modal/LogoutModal";

// --- Loader ---
// Runs on the server before this route renders. Protects the page (redirects
// to /auth/login if not signed in) and fetches this user's todos.
export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const user = await requireUser(env, request);
  const todos = await listUserTodos(env.DB, user.id);

  return { user, todos };
}

// --- Action ---
// Runs on the server whenever a <Form method="post"> on this page submits.
// A single action handles four different operations, distinguished by the
// hidden "intent" field included in each form.
export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const user = await requireUser(env, request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  // Sign the user out: clear the session cookie and redirect to login.
  if (intent === "logout") {
    const { cookieHeader } = await logoutUser(env);
    return redirect("/auth/login", {
      headers: { "Set-Cookie": cookieHeader },
    });
  }

  // Create a new todo for the current user.
  if (intent === "create") {
    const result = await createUserTodo(env.DB, user.id, {
      title: formData.get("title"),
      description: formData.get("description"),
    });
    if (!result.success) return { errors: result.errors };
    return redirect("/todos");
  }

  // Update an existing todo (edit fields, or just toggle "completed").
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

  // Delete a todo (ownership is checked inside deleteUserTodo/deleteTodo).
  if (intent === "delete") {
    const id = String(formData.get("id"));
    await deleteUserTodo(env.DB, user.id, id);
    return redirect("/todos");
  }

  // Fallback: no recognized intent was sent.
  return { errors: { form: ["Invalid action."] } };
}

// --- Page component ---
export default function Todos() {
  // Data returned by the loader (typed automatically from `loader`'s return).
  const { user, todos } = useLoaderData<typeof loader>();

  // Data returned by the last action call, if any (e.g. validation errors).
  const actionData = useActionData<typeof action>();

  // Controls whether the logout confirmation modal is visible.
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Reference to the hidden logout <Form>, so we can submit it
  // programmatically only after the user confirms inside the modal.
  const logoutFormRef = useRef<HTMLFormElement>(null);

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header: page title + sign out button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Todos CI/CD Test
            </h1>
            <p className="text-sm text-gray-600">Welcome, {user.name}</p>
          </div>

          {/* This form is never submitted directly by the button below —
              the button only opens the confirmation modal. The modal's
              "Sign out" action calls logoutFormRef.current?.requestSubmit()
              to actually submit this form. */}
          <Form method="post" ref={logoutFormRef}>
            <input type="hidden" name="intent" value="logout" />
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              className="rounded-lg border bg-red-600 border-gray-300 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Sign Out
            </button>
          </Form>
        </div>

        {/* Add-todo form */}
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Add Todo
          </h2>
          <TodoForm
            // Changing `key` when the todo count changes forces React to
            // remount this form with fresh, empty fields after a successful
            // add (otherwise the browser keeps whatever text was typed).
            key={todos.length}
            errors={
              actionData && "errors" in actionData
                ? actionData.errors
                : undefined
            }
          />
        </section>

        {/* Todo list */}
        <TodoList
          todos={todos}
          errors={
            actionData && "errors" in actionData
              ? actionData.errors
              : undefined
          }
        />
      </div>

      {/* Logout confirmation modal — only rendered while open */}
      {isLogoutModalOpen && (
        <LogoutModal
          onConfirm={() => logoutFormRef.current?.requestSubmit()}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      )}
    </main>
  );
}