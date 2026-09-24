import { Form, Link, redirect, useActionData, useSearchParams } from "react-router";
import type { Route } from "./+types/login";
import { loginUser } from "../../../workers/services/auth.server";
import { cloudflareContext } from "../../../workers/context";
//import { getSessionCookie } from "../../../workers/utils/cookies.server";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const redirectTo = String(formData.get("redirectTo") || "/todos");

  const { env } = context.get(cloudflareContext);

  const result = await loginUser(env, {
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { errors: result.errors };
  }

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": result.cookieHeader,
    },
  });
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();

  const justRegistered = searchParams.get("registered") === "true";
  const redirectTo = searchParams.get("redirectTo") || "/todos";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Log in</h1>

        {justRegistered && (
          <p className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Account created successfully. Please log in.
          </p>
        )}

        {actionData?.errors?.form && (
          <p className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionData.errors.form[0]}
          </p>
        )}

        <Form method="post" className="space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {actionData?.errors?.email && (
              <p className="mt-1 text-sm text-red-600">
                {actionData.errors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {actionData?.errors?.password && (
              <p className="mt-1 text-sm text-red-600">
                {actionData.errors.password[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Log in
          </button>
        </Form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/auth/register" className="font-medium text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
