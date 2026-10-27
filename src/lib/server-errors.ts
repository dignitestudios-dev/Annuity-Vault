import { UseFormSetError, Path } from "react-hook-form";
import toast from "react-hot-toast";

export function handleFormServerErrors<T extends Record<string, any>>(
  err: any,
  setError: UseFormSetError<T>,
  fallbackMessage = "Operation failed"
) {
  const backendErrors = err?.response?.data?.error;
  if (Array.isArray(backendErrors) && backendErrors.length > 0) {
    let matchedAny = false;
    backendErrors.forEach((e: { path?: string; message: string }) => {
      if (e.path && e.message) {
        const fieldName = e.path.replace(/^body\./, "") as Path<T>;
        try {
          setError(fieldName, { type: "server", message: e.message });
          matchedAny = true;
        } catch {
          // ignore if field name not in form
        }
      }
    });

    const firstMsg = backendErrors[0]?.message || fallbackMessage;
    toast.error(firstMsg);
    return;
  }

  const message = err?.response?.data?.message || err?.message || fallbackMessage;
  toast.error(message);
}
