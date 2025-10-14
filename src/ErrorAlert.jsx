import { useState, useEffect } from "react";

export default function ErrorAlert({ isOpen = false, message = "" }) {
  const [open, setOpen] = useState(!!isOpen);

  useEffect(() => {
    setOpen(!!isOpen && message?.length > 0);
    if (isOpen && message) {
      const timer = setTimeout(() => setOpen(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, message]);

  if (!open) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white px-3 py-2 rounded-md shadow-lg z-50"
    >
      <div className="flex items-center gap-3">
        <p className="text-sm">{message}</p>
        <button
          aria-label="Close error"
          className="text-white/80 hover:text-white"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
}