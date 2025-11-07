import { useEffect } from "react";

export default function BottomSheet({ open, onClose, children, title }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl transition-transform
        ${open ? "translate-y-0" : "translate-y-full"}`}>
        <div className="h-1.5 w-10 bg-slate-300 rounded-full mx-auto mt-2" />
        {title ? <div className="px-4 pt-2 pb-1 font-medium">{title}</div> : null}
        <div className="max-h-[65vh] overflow-y-auto px-4 pb-6">{children}</div>
      </div>
    </div>
  );
}
