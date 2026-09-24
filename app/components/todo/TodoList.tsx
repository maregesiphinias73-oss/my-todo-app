import { TodoCard } from "./TodoCard";

type Todo = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
};

type TodoErrors = {
  title?: string[];
  description?: string[];
  form?: string[];
  todoId?: string;
};

type TodoListProps = {
  todos: Todo[];
  errors?: TodoErrors;
};

export function TodoList({ todos, errors }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
        <p className="text-gray-500">You don't have any todos yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => {
        const todoErrors = errors?.todoId === todo.id ? errors : undefined;
        return <TodoCard key={todo.id} todo={todo} errors={todoErrors} />;
      })}
    </div>
  );
}
