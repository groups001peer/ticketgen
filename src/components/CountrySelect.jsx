import { useEffect, useMemo, useState } from "react";
import countriesData from "../data/countries.json";

export default function CountrySelect({ value, onChange }) {
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countriesData;
    return countriesData.filter(c =>
      c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (!value && countriesData.length) onChange?.(countriesData[0].code);
  }, []); // eslint-disable-line

  return (
    <div className="space-y-2">
      <input className="input" placeholder="Search country…" value={query} onChange={(e)=>setQuery(e.target.value)} />
      <div className="max-h-56 overflow-y-auto bg-white border rounded-lg">
        {list.map(c => (
          <button
            key={c.code}
            onClick={()=>onChange?.(c.code)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm border-b last:border-b-0
              ${value===c.code ? "bg-blue-50" : ""}`}
          >
            <span className={`fi fi-${c.code.toLowerCase()}`} />
            <span>{c.name}</span>
            <span className="ml-auto text-xs text-slate-500">{c.code}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
