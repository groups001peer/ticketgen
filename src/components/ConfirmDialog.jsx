export default function ConfirmDialog({ open, title="Confirm", body, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="absolute inset-x-6 top-1/3 bg-white rounded-xl shadow p-4">
        <div className="text-sm font-medium">{title}</div>
        {body && <div className="text-sm text-slate-600 mt-2">{body}</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-2 rounded-lg bg-slate-100" onClick={onCancel}>Cancel</button>
          <button className="px-3 py-2 rounded-lg bg-red-600 text-white" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
