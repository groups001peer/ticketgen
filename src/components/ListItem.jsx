import { ChevronRight } from "lucide-react"; // optional if installed; else replace with >
export default function ListItem({ title, subtitle, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between py-3 px-4 border-b bg-white">
      <div className="text-left">
        <div className="text-sm font-medium">{title}</div>
        {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400" />
    </button>
  );
}
