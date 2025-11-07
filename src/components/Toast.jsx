import { useEffect, useState } from "react";

export default function Toast({ text, open, onClose }) {
  const [show, setShow] = useState(open);
  useEffect(() => setShow(open), [open]);
  useEffect(() => {
    if (!show) return;
    const id = setTimeout(() => { setShow(false); onClose?.(); }, 1800);
    return () => clearTimeout(id);
  }, [show, onClose]);
  return (
    <div className={`fixed bottom-20 inset-x-0 flex justify-center z-50 pointer-events-none
      transition-all ${show ? "opacity-100" : "opacity-0 translate-y-2"}`}>
      <div className="pointer-events-auto bg-black text-white text-sm px-3 py-2 rounded-lg shadow">
        {text}
      </div>
    </div>
  );
}
