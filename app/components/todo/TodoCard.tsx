import { useState } from "react";
import { Form } from "react-router";
import { TodoEditModal } from "../modal/TodoEditModal";

type Todo = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
};

type TodoCardProps = {
  todo: Todo;
  errors?: {
    title?: string[];
    description?: string[];
  };
};

export function TodoCard({ todo, errors }: TodoCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className={`font-semibold ${
                todo.completed ? "text-gray-400 line-through" : "text-gray-900"
              }`}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p className="mt-1 text-sm text-gray-600">{todo.description}</p>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Edit
            </button>

            <Form method="post">
              <input type="hidden" name="intent" value="update" />
              <input type="hidden" name="id" value={todo.id} />
              <input
                type="hidden"
                name="completed"
                value={todo.completed ? "" : "on"}
              />
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {todo.completed ? "Undo" : "Complete"}
              </button>
            </Form>

            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={todo.id} />
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </Form>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <TodoEditModal
          todo={todo}
          errors={errors}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
}
