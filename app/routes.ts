import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth/register", "routes/auth/register.tsx"),
  route("auth/login", "routes/auth/login.tsx"),
  route("todos", "routes/todos.tsx"),
] satisfies RouteConfig;