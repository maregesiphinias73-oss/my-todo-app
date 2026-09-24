import { TodoForm } from "../todo/TodoForm";

type TodoEditModalProps = {
  todo: {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
  };
  errors?: {
    title?: string[];
    description?: string[];
  };
  onClose: () => void;
};

export function TodoEditModal({ todo, errors, onClose }: TodoEditModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-todo-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 id="edit-todo-title" className="text-xl font-semibold text-gray-900">
            Edit Todo
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close edit todo modal"
          >
            ✕
          </button>
        </div>

        <TodoForm todo={todo} errors={errors} onDone={onClose} />

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
