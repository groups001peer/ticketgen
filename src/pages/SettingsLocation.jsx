import { useEffect, useMemo, useState } from "react";
import { countries as COUNTRIES_MAP } from "countries-list";
import { useStore } from "../store";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function SettingsLocation() {
  const { me } = useStore();

  // Build a full country array from the package; sort by name
  const countries = useMemo(() => {
    const arr = Object.entries(COUNTRIES_MAP).map(([code, data]) => ({
      code,               // "US"
      name: data.name,    // "United States"
    }));
    return arr.sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("US"); // ISO-3166 alpha2
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countries, query]);

  // Load existing values from Firestore users/{uid}
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!me?.uid) return;
      setLoading(true);
      const ref = doc(db, "users", me.uid);
      const snap = await getDoc(ref);
      if (!ignore && snap.exists()) {
        const d = snap.data();
        setCity(d.city || "");
        setRegion(d.region || "");
        setCountry((d.countryCode || "US").toUpperCase());
      }
      setLoading(false);
    })();
    return () => { ignore = true; };
  }, [me?.uid]);

  const save = async () => {
    if (!me?.uid) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", me.uid);
      await updateDoc(ref, {
        city,
        region,
        countryCode: country.toUpperCase(),
      });
      alert("Location updated");
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();
  const nowStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric"
      }).format(now);
    } catch {
      return now.toLocaleString();
    }
  }, [now]);

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="px-4 pb-20">
      <h1 className="text-lg font-semibold py-3">Location Setting</h1>

      <div className="bg-white rounded-xl p-4 space-y-3 shadow">
        <div>
          <div className="text-xs text-slate-500 mb-1">My Location</div>
          <div className="grid grid-cols-2 gap-2">
            <input className="input" placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
            <input className="input" placeholder="State/Region" value={region} onChange={e=>setRegion(e.target.value)} />
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">My Country</div>
          <input
            className="input mb-2"
            placeholder="Search country…"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
          <div className="max-h-56 overflow-y-auto border rounded-lg bg-white">
            {filtered.map(c => (
              <button
                key={c.code}
                onClick={()=>setCountry(c.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm border-b last:border-b-0
                  ${country===c.code ? "bg-blue-50" : ""}`}
              >
                <span className={`fi fi-${c.code.toLowerCase()}`} />
                <span className="truncate">{c.name}</span>
                <span className="ml-auto text-xs text-slate-500">{c.code}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm mt-3">
            <span className={`fi fi-${country.toLowerCase()}`} />
            <span>{city || "—"}, {region || "—"}</span>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Current time: <span className="text-slate-800">{nowStr}</span>
        </div>

        <div className="pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
