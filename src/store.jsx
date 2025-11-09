// import React, { createContext, useContext, useMemo, useState } from "react";
// import { events as seed, me as seedMe } from "./mocks";

// const Ctx = createContext(null);

// export function StoreProvider({ children }) {
//   const [events, setEvents] = useState(seed.slice());
//   const [me, setMe] = useState({ ...seedMe });

//   const api = useMemo(() => ({
//     me,
//     events,

//     // Show/Hide toggle
//     toggleVisibility(eventId) {
//       setEvents(list =>
//         list.map(e => e.id === eventId ? { ...e, isVisible: !e.isVisible } : e)
//       );
//     },

//     // Delete event
//     deleteEvent(eventId) {
//       setEvents(list => list.filter(e => e.id !== eventId));
//     },

//     // Transfer selected seats (mock: just removes them from this owner)
//     transferSeats(eventId, seatIds, to = { name: "Recipient" }) {
//       setEvents(list =>
//         list.map(e => {
//           if (e.id !== eventId) return e;
//           const remaining = e.tickets.filter(t => !seatIds.includes(t.id || t.seat));
//           return { ...e, tickets: remaining };
//         })
//       );
//       console.log("Transferred to:", to);
//     },

//     // Record a top-up request (mock) and “open Telegram”
//     createTopupRequest(credits, note) {
//       console.log("Topup request:", { credits, note, user: me.name });
//     },

//     setMe
//   }), [events, me]);

//   return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
// }

// export function useStore() {
//   const v = useContext(Ctx);
//   if (!v) throw new Error("useStore must be used inside <StoreProvider>");
//   return v;
// }














import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setMe(null);
        setLoading(false);
        return;
      }
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      setMe(snap.exists() ? { uid: user.uid, ...snap.data() } : null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateMe = async () => {
    if (!auth.currentUser) return;
    const ref = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(ref);
    setMe(snap.exists() ? { uid: auth.currentUser.uid, ...snap.data() } : null);
  };

  const api = useMemo(() => ({
    me,
    loading,
    signOut: () => signOut(auth),
    updateMe,
  }), [me, loading]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used inside <StoreProvider>");
  return v;
}
