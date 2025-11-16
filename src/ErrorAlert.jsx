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
      className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto bg-red-500 text-white px-4 py-3 md:px-3 md:py-2 rounded-md shadow-lg z-50 md:top-10"
    >
      <div className="flex items-center gap-3">
        <p className="text-sm">{message}</p>
        <button
          aria-label="Close error"
          className="text-white/80 hover:text-white ml-auto"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
}