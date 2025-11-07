// import { NavLink, useLocation, useNavigate } from "react-router-dom";

// function Header() {
//   const navigate = useNavigate();
//   return (
//     <div className="sticky top-0 z-20 bg-slate-900 text-white">
//       <div className="flex items-center justify-between px-4 h-12">
//         <button onClick={() => navigate(-1)} className="text-sm opacity-80">×</button>
//         <div className="font-black tracking-tight">ticketmaster<span className="align-top text-[10px] ml-1">®</span></div>
//         <button className="text-xs opacity-80">Help</button>
//       </div>
//       <div className="flex">
//         <Tab to="/events" label="Upcoming" />
//         <Tab to="/events?tab=past" label="Past" />
//       </div>
//     </div>
//   );
// }
// function Tab({ to, label }) {
//   const loc = useLocation();
//   const active = loc.pathname === "/events" && (!new URLSearchParams(loc.search).get("tab") && label==="Upcoming" || new URLSearchParams(loc.search).get("tab")==="past" && label==="Past");
//   return (
//     <NavLink to={to} className={`flex-1 text-center py-2 text-sm ${active ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}>
//       {label}
//     </NavLink>
//   );
// }

// function BottomNav() {
//   const link = (to, label) => (
//     <NavLink
//       to={to}
//       className={({ isActive }) =>
//         `flex-1 text-center py-3 text-xs ${isActive ? "text-blue-600" : "text-slate-500"}`
//       }
//     >
//       {label}
//     </NavLink>
//   );
//   return (
//     <div className="fixed bottom-0 inset-x-0 bg-white border-t md:max-w-sm mx-auto">
//       <div className="flex">{link("/discover","Discover")}{link("/for-you","For You")}{link("/events","My Events")}{link("/sell","Sell")}{link("/account","My Account")}</div>
//     </div>
//   );
// }

// export default function Shell({ children }) {
//   const loc = useLocation();
//   const showTicketTabs = loc.pathname.startsWith("/events") || loc.pathname.startsWith("/tickets/");
//   return (
//     <div className="min-h-screen bg-slate-50 md:max-w-sm mx-auto relative">
//       {showTicketTabs ? <Header/> : null}
//       <div className={`pb-16 ${showTicketTabs ? "" : "pt-2"}`}>{children}</div>
//       <BottomNav />
//     </div>
//   );
// }











import { NavLink, useLocation, Outlet } from "react-router-dom";
import { Search, Heart, Ticket, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { countries as COUNTRIES_MAP } from "countries-list";
import { useStore } from "../store";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

function Header() {
  return (
    <div className="sticky top-0 z-20 bg-slate-900 text-white">
      <div className="flex items-center justify-between px-3 h-12">
        <div className="flex items-center gap-2">
          <span className="font-black tracking-tight text-lg">ticketmaster</span>
        </div>

        {/* Center area: country selector (matches screenshot) */}
        <div className="flex items-center gap-3">
          <CountrySelector />
        </div>

        <div className="flex items-center gap-3">
          <button className="text-xs font-medium">Help</button>
        </div>
      </div>

      <div className="flex">
        <Tab to="/events" label="Upcoming" />
        <Tab to="/events?tab=past" label="Past" />
      </div>
    </div>
  );
}

function CountrySelector() {
  const { me } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  // Build country array once
  const countries = useMemo(() => {
    return Object.entries(COUNTRIES_MAP).map(([code, data]) => ({ code, name: data.name })).sort((a,b)=>a.name.localeCompare(b.name));
  }, []);

  const [selected, setSelected] = useState(() => {
    try {
      const ls = localStorage.getItem("selectedCountry");
      return (ls && ls.toUpperCase()) || (me?.countryCode || "US");
    } catch {
      return (me?.countryCode || "US");
    }
  });

  useEffect(() => {
    // prefer me.countryCode when available
    if (me?.countryCode && me.countryCode !== selected) setSelected(me.countryCode.toUpperCase());
    // close on outside click
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [me?.countryCode, selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [countries, query]);

  const saveSelection = async (code) => {
    setSelected(code);
    setOpen(false);
    try {
      if (me?.uid) {
        const refDoc = doc(db, "users", me.uid);
        await updateDoc(refDoc, { countryCode: code });
      } else {
        localStorage.setItem("selectedCountry", code);
      }
    } catch {
      // ignore update failures (rules may block); still persist locally
      try {
        localStorage.setItem("selectedCountry", code);
      } catch (e) {
        // best effort only — log to console for dev awareness
        console.warn("could not persist selected country", e);
      }
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-800/60 hover:bg-slate-800/70">
        <span className={`fi rounded-full fi-${selected?.toLowerCase()} w-4 h-4 bg-contain bg-center`} />
        {/* <span className="text-sm font-semibold">{selected}</span> */}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-auto bg-white text-slate-800 rounded-lg shadow-lg z-50">
          <div className="p-2 border-b">
            <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search country…" className="input w-full" />
          </div>
          <div>
            {filtered.map(c => (
              <button key={c.code} onClick={()=>saveSelection(c.code)} className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-100 ${selected===c.code?"bg-slate-50":""}`}>
                <span className={`fi fi-${c.code.toLowerCase()}`} />
                <span className="truncate">{c.name}</span>
                <span className="ml-auto text-xs text-slate-500">{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Tab({ to, label }) {
  const loc = useLocation();
  const active = loc.pathname === "/events" && (!new URLSearchParams(loc.search).get("tab") && label==="Upcoming" || new URLSearchParams(loc.search).get("tab")==="past" && label==="Past");
  return (
    <NavLink 
      to={to} 
      className={`flex-1 text-center py-3 text-sm font-semibold transition-colors ${
        active 
          ? "bg-blue-600 text-white" 
          : "bg-blue-700/50 text-blue-100"
      }`}
    >
      {label}
    </NavLink>
  );
}

function BottomNav() {
  const NavItem = ({ to, icon, label, customIcon }) => {
    const IconComp = icon;
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 ${
            isActive ? "text-blue-600" : "text-slate-600"
          }`
        }
      >
        {customIcon ? (
          <span className="text-xl font-bold leading-none mb-0.5">£</span>
        ) : (
          IconComp ? <IconComp className="w-5 h-5" strokeWidth={2} /> : null
        )}
        <span className={`text-xs ${to === "/events" ? "font-medium" : ""}`}>{label}</span>
      </NavLink>
    );
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 md:max-w-sm mx-auto z-20">
      <div className="flex items-stretch">
        <NavItem to="/discover" icon={Search} label="Discover" />
        <NavItem to="/for-you" icon={Heart} label="For You" />
        <NavItem to="/events" icon={Ticket} label="My Events" />
        <NavItem to="/sell" customIcon label="Sell" />
        <NavItem to="/account" icon={User} label="My Account" />
      </div>
    </div>
  );
}

export default function Shell() {
  const loc = useLocation();
  const showTicketTabs = loc.pathname.startsWith("/events") || loc.pathname.startsWith("/tickets/");
  return (
    <div className="min-h-screen bg-slate-50 md:max-w-sm mx-auto relative">
      {showTicketTabs ? <Header/> : null}
      <div className={`pb-16 ${showTicketTabs ? "" : "pt-2"}`}>
        {/* Render nested routes here */}
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}