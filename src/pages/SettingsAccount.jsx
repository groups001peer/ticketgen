import { useMemo, useState } from "react";
import useClock from "../hooks/useClock";
import CountrySelect from "../components/CountrySelect";

export default function SettingsLocation() {
  const [city, setCity] = useState("Miami");
  const [region, setRegion] = useState("FL");
  const [country, setCountry] = useState("US");
  const now = useClock();

  const dateStr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "numeric", second: "numeric"
      }).format(now);
    } catch {
      return now.toLocaleString();
    }
  }, [now]);

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
          <CountrySelect value={country} onChange={setCountry} />
          <div className="flex items-center gap-2 text-sm mt-2">
            <span className={`fi fi-${country.toLowerCase()}`} />
            <span>{city}, {region}</span>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Current time: <span className="text-slate-800">{dateStr}</span>
        </div>
      </div>
    </div>
  );
}
