import { Form } from "react-router";

type TodoFormProps = {
  todo?: {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
  };
  errors?: {
    title?: string[];
    description?: string[];
  };
  onDone?: () => void;
};

export function TodoForm({ todo, errors, onDone }: TodoFormProps) {
  return (
    <Form method="post" className="space-y-4" onSubmit={onDone}>
      <input type="hidden" name="intent" value={todo ? "update" : "create"} />
      {todo && <input type="hidden" name="id" value={todo.id} />}

      <div>
        <input
  name="title"
  type="text"
  placeholder="Title"
  defaultValue={todo?.title ?? ""}
  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
/>
        {errors?.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>
        )}
      </div>

      <div>
<textarea
  name="description"
  placeholder="Description (optional)"
  defaultValue={todo?.description ?? ""}
  className="min-h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
/>
        {errors?.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
        )}
      </div>

      {todo && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            name="completed"
            type="checkbox"
            defaultChecked={todo.completed}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          Completed
        </label>
      )}

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        {todo ? "Save changes" : "Add Todo"}
      </button>
    </Form>
  );
}
