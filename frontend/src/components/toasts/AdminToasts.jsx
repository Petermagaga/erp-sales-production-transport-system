import toast from "react-hot-toast";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

export const successToast = (message, actionLabel, onAction) => {
  toast.custom((t) => (
    <div
      className={`
        flex items-center gap-4 bg-white shadow-lg border rounded-xl p-4
        ${t.visible ? "animate-enter" : "animate-leave"}
      `}
    >
      <CheckCircle className="text-green-600 w-6 h-6" />

      <div className="flex-1">
        <p className="font-medium text-gray-800">{message}</p>

        {actionLabel && (
          <button
            onClick={() => {
              onAction();
              toast.dismiss(t.id);
            }}
            className="text-sm text-blue-600 hover:underline mt-1"
          >
            {actionLabel}
          </button>
        )}
      </div>

      <button onClick={() => toast.dismiss(t.id)}>
        ✕
      </button>
    </div>
  ));
};

export const errorToast = (message, onRetry) => {
  toast.custom((t) => (
    <div className="flex items-center gap-4 bg-white shadow-lg border rounded-xl p-4">
      <XCircle className="text-red-600 w-6 h-6" />

      <div className="flex-1">
        <p className="font-medium text-gray-800">{message}</p>

        <button
          onClick={() => {
            onRetry();
            toast.dismiss(t.id);
          }}
          className="flex items-center gap-1 text-sm text-red-600 hover:underline mt-1"
        >
          <RotateCcw className="w-4 h-4" />
          Retry
        </button>
      </div>

      <button onClick={() => toast.dismiss(t.id)}>
        ✕
      </button>
    </div>
  ));
};
