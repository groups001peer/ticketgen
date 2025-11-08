// import { NavLink, useLocation, Outlet } from "react-router-dom";
// import { Search, Heart, Ticket, User } from "lucide-react";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { countries as COUNTRIES_MAP } from "countries-list";
// import { useStore } from "../store";
// import { db } from "../firebase";
// import { doc, updateDoc } from "firebase/firestore";

// function Header() {
//   return (
//     <div className="sticky top-0 z-20 bg-gray-800 text-white">
//       <div className="flex items-center justify-between px-3 h-12">
//         <div className="flex items-center gap-2">
//           <div className="flex items-center gap-1.5">
//             {/* <span className="font-semibold italic text-xl">ticketmaster <span className="text-[9px]">®</span></span> */}
//             <span className="font-semibold italic text-xl">
//               ticketmaster <span className="relative -left-1 -top-1 font-light text-gray-300 text-[10px] leading-none">®</span>
//             </span>

//             <CountrySelector />
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <button className="text-xs font-medium">Help</button>
//         </div>
//       </div>

//       <div className="flex">
//         <Tab to="/events" label="Upcoming" />
//         <Tab to="/events?tab=past" label="Past" />
//       </div>
//     </div>
//   );
// }

// function CountrySelector() {
//   const { me } = useStore();
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const ref = useRef(null);

//   // Build country array once
//   const countries = useMemo(() => {
//     return Object.entries(COUNTRIES_MAP).map(([code, data]) => ({ code, name: data.name })).sort((a,b)=>a.name.localeCompare(b.name));
//   }, []);

//   const [selected, setSelected] = useState(() => {
//     try {
//       const ls = localStorage.getItem("selectedCountry");
//       return (ls && ls.toUpperCase()) || (me?.countryCode || "US");
//     } catch {
//       return (me?.countryCode || "US");
//     }
//   });

//   useEffect(() => {
//     // prefer me.countryCode when available
//     if (me?.countryCode && me.countryCode !== selected) setSelected(me.countryCode.toUpperCase());

//     // close on outside click
//     function onDoc(e) {
//       if (ref.current && !ref.current.contains(e.target)) setOpen(false);
//     }

//     // allow other parts of the app to broadcast country updates
//     function onCountry(e) {
//       const code = e?.detail || (e && e.code);
//       if (code) setSelected(String(code).toUpperCase());
//     }

//     document.addEventListener("click", onDoc);
//     window.addEventListener("countryChange", onCountry);
//     return () => {
//       document.removeEventListener("click", onDoc);
//       window.removeEventListener("countryChange", onCountry);
//     };
//   }, [me?.countryCode, selected]);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return countries;
//     return countries.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
//   }, [countries, query]);

//   const saveSelection = async (code) => {
//     setSelected(code);
//     setOpen(false);
//     try {
//       if (me?.uid) {
//         const refDoc = doc(db, "users", me.uid);
//         await updateDoc(refDoc, { countryCode: code });
//       } else {
//         localStorage.setItem("selectedCountry", code);
//       }
//     } catch {
//       // ignore update failures (rules may block); still persist locally
//       try {
//         localStorage.setItem("selectedCountry", code);
//       } catch (e) {
//         // best effort only — log to console for dev awareness
//         console.warn("could not persist selected country", e);
//       }
//     }
//     // broadcast change so other components (or other CountrySelector instances)
//     // can react immediately without a full reload
//     try {
//       window.dispatchEvent(new CustomEvent("countryChange", { detail: code }));
//     } catch {
//       // ignore (non-browser envs)
//     }
//   };

//   return (
//     <div className="relative" ref={ref}>
//       <button onClick={()=>setOpen(v=>!v)} className="flex items-center gap-2  hover:bg-slate-800/70">
//         <span className={` rounded-full fi-${selected?.toLowerCase()} w-6 h-6 bg-contain bg-center`} />
//         {/* <span className="text-[10px] font-medium text-slate-300">{selected}</span> */}
//       </button>

//       {open && (
//         <div className="absolute -left-5 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-xl z-50 border border-slate-200/10">
//           <div className="p-2 border-b border-slate-100">
//             <input 
//               autoFocus 
//               value={query} 
//               onChange={e=>setQuery(e.target.value)} 
//               placeholder="Search country…" 
//               className="w-full px-3 py-1.5 text-sm bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
//           </div>
//           <div className="max-h-[280px] overflow-y-auto">
//             {filtered.length === 0 ? (
//               <div className="px-3 py-2 text-sm text-slate-500 text-center">No countries found</div>
//             ) : (
//               filtered.map(c => (
//                 <button 
//                   key={c.code} 
//                   onClick={()=>saveSelection(c.code)} 
//                   className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors ${
//                     selected===c.code ? "bg-blue-50 text-blue-600" : ""
//                   }`}
//                 >
//                   <span className={`fi fi-${c.code.toLowerCase()}`} />
//                   <span className="truncate text-sm">{c.name}</span>
//                   <span className="ml-auto text-xs text-slate-400 font-medium">{c.code}</span>
//                 </button>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function Tab({ to, label }) {
//   const loc = useLocation();
//   const active = loc.pathname === "/events" && (!new URLSearchParams(loc.search).get("tab") && label==="Upcoming" || new URLSearchParams(loc.search).get("tab")==="past" && label==="Past");
//   return (
//     <NavLink 
//       to={to} 
//       className={`flex-1 text-center py-3 text-sm font-semibold transition-colors ${
//         active 
//           ? "bg-blue-600 text-white" 
//           : "bg-blue-700/50 text-blue-100"
//       }`}
//     >
//       {label}
//     </NavLink>
//   );
// }

// function BottomNav() {
//   const NavItem = ({ to, icon, label, customIcon }) => {
//     const IconComp = icon;
//     return (
//       <NavLink
//         to={to}
//         className={({ isActive }) =>
//           `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 ${
//             isActive ? "text-blue-600" : "text-slate-600"
//           }`
//         }
//       >
//         {customIcon ? (
//           <span className="text-xl font-bold leading-none mb-0.5">£</span>
//         ) : (
//           IconComp ? <IconComp className="w-5 h-5" strokeWidth={2} /> : null
//         )}
//         <span className={`text-xs ${to === "/events" ? "font-medium" : ""}`}>{label}</span>
//       </NavLink>
//     );
//   };

//   return (
//     <div className="fixed bottom-0 inset-x-0 h-20 bg-white border-t border-slate-200 md:max-w-sm mx-auto z-20">
//       <div className="flex items-stretch">
//         <NavItem to="/discover" icon={Search} label="Discover" />
//         <NavItem to="/for-you" icon={Heart} label="For You" />
//         <NavItem to="/events" icon={Ticket} label="My Events" />
//         <NavItem to="/sell" customIcon label="Sell" />
//         <NavItem to="/account" icon={User} label="My Account" />
//       </div>
//     </div>
//   );
// }

// export default function Shell() {
//   const loc = useLocation();
//   const showTicketTabs = loc.pathname.startsWith("/events") || loc.pathname.startsWith("/tickets/");
//   return (
//     <div className="min-h-screen bg-slate-50 md:max-w-sm mx-auto relative">
//       {showTicketTabs ? <Header/> : null}
//       <div className={`pb-16 ${showTicketTabs ? "" : "pt-2"}`}>
//         {/* Render nested routes here */}
//         <Outlet />
//       </div>
//       <BottomNav />
//     </div>
//   );
// }
































import { NavLink, useLocation, Outlet } from "react-router-dom";
import { Search, Heart, Ticket, User, Tag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { countries as COUNTRIES_MAP } from "countries-list";
import { useStore } from "../store";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

/* ───────────────────────────────── HEADER ───────────────────────────────── */

function Header() {
  return (
    <div className="sticky top-0 z-20 bg-gray-800 text-white">
      <div className="flex items-center justify-between px-3 h-12">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold italic text-xl">
              ticketmaster <sup className="text-[9px] leading-none">®</sup>
            </span>
            <CountrySelector />
          </div>
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

/* ───────────────────────────── COUNTRY SELECTOR ─────────────────────────── */

function CountrySelector() {
  const { me } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  // build country list once
  const countries = useMemo(() => {
    return Object.entries(COUNTRIES_MAP)
      .map(([code, data]) => ({ code, name: data.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // local immediate value (drives the flag UI instantly)
  const [selected, setSelected] = useState(() => {
    const ls = localStorage.getItem("selectedCountry");
    return (ls && ls.toUpperCase()) || (me?.countryCode || "US");
  });

  // sync from Firestore user doc when it changes
  useEffect(() => {
    if (me?.countryCode && me.countryCode.toUpperCase() !== selected) {
      setSelected(me.countryCode.toUpperCase());
    }
    // close when clicking outside
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.countryCode]); // do not depend on `selected` to avoid re-binding

  // filter list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countries, query]);

  // persist change (async) — UI already updated via local state
  const persist = async (code) => {
    try {
      if (me?.uid) {
        await updateDoc(doc(db, "users", me.uid), { countryCode: code });
      }
      localStorage.setItem("selectedCountry", code);
    } catch (e) {
      // best-effort local cache
      try { localStorage.setItem("selectedCountry", code); } catch {}
      console.warn("could not persist selected country", e);
    }
    // broadcast to other components that might care
    try {
      window.dispatchEvent(new CustomEvent("countryChange", { detail: code }));
    } catch {}
  };

  const choose = (code) => {
    // instant UI update
    setSelected(code.toUpperCase());
    setOpen(false);
    // persist in background (no reload)
    persist(code.toUpperCase());
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 hover:bg-slate-800/70 rounded-md"
        aria-label="Choose country"
      >
        {/* IMPORTANT: include base 'fi' class so the flag updates instantly */}
        <span className={`fi fi-${selected?.toLowerCase()} w-6 h-6 rounded-full`} />
      </button>

      {open && (
        <div className="absolute -left-5 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-xl z-50 border border-slate-200/10">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country…"
              className="w-full px-3 py-1.5 text-base bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            /> 
          </div>
          <div className="max-h-[280px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 text-center">
                No countries found
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  onClick={() => choose(c.code)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                    selected === c.code ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  <span className={`fi fi-${c.code.toLowerCase()}`} />
                  <span className="truncate text-sm">{c.name}</span>
                  <span className="ml-auto text-xs text-slate-400 font-medium">
                    {c.code}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────  TABS  ───────────────────────────────── */

function Tab({ to, label }) {
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const isPast = params.get("tab") === "past";
  const active =
    loc.pathname === "/events" &&
    ((label === "Upcoming" && !isPast) || (label === "Past" && isPast));

  return (
    <NavLink
      to={to}
      className={`flex-1 text-center py-3 text-sm font-semibold transition-colors ${
        active ? "bg-blue-600 text-white" : "bg-blue-700/50 text-blue-100"
      }`}
    >
      {label}
    </NavLink>
  );
}

/* ─────────────────────────────  BOTTOM NAV  ─────────────────────────────── */

function BottomNav() {
  const NavItem = ({ to, icon, label }) => {
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
        <IconComp className="w-5 h-5" strokeWidth={2} />
        <span className={`text-xs ${to === "/events" ? "font-medium" : ""}`}>
          {label}
        </span>
      </NavLink>
    );
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t pb-4 border-slate-200 md:max-w-sm mx-auto z-20">
      <div className="flex items-stretch">
        <NavItem to="/discover" icon={Search} label="Discover" />
        <NavItem to="/for-you" icon={Heart} label="For You" />
        <NavItem to="/events" icon={Ticket} label="My Events" />
        <NavItem to="/sell" icon={Tag} label="Sell" />
        <NavItem to="/account" icon={User} label="My Account" />
      </div>
    </div>
  );
}

/* ────────────────────────────────  SHELL  ───────────────────────────────── */

export default function Shell() {
  const loc = useLocation();
  const showTicketTabs =
    loc.pathname.startsWith("/events") || loc.pathname.startsWith("/tickets/");

  // optional: listen for external countryChange events (keeps multiple selectors in sync)
  const [, force] = useState(0);
  useEffect(() => {
    const bump = () => force((n) => n + 1);
    window.addEventListener("countryChange", bump);
    return () => window.removeEventListener("countryChange", bump);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 md:max-w-sm mx-auto relative">
      {showTicketTabs ? <Header /> : null}
      <div className={`pb-16 ${showTicketTabs ? "" : "pt-2"}`}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
