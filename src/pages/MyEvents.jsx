// import { useEffect, useMemo, useState } from "react";
// import EventCard from "../components/EventCard";
// import { db } from "../firebase";
// import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

// export default function MyEvents() {
//   const [events, setEvents] = useState([]);

//   useEffect(() => {
//     const q = query(collection(db, "events"), orderBy("dateISO", "desc"));
//     const unsub = onSnapshot(q, (snap) => {
//       const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//       setEvents(data);
//     });
//     return () => unsub();
//   }, []);

//   const list = useMemo(() => events?.filter(e => e.isVisible), [events]);
//   if (!list?.length) {
//     return <div className="px-4 py-8 text-center text-slate-500 text-sm">no tickets yet or all tickets are hidden</div>;
//   }
//   return <div className="pb-4">{list.map(e => <EventCard key={e.id} event={e} />)}</div>;
// }






















import { useEffect, useMemo, useState } from "react";
import EventCard from "../components/EventCard";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [uid, setUid] = useState(null);

  // Track logged-in user
  useEffect(() => {
    const auth = getAuth();
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsubAuth();
  }, []);
console.log(uid)
  // Subscribe to this user's events
  useEffect(() => {
    if (!uid) {
      setEvents([]);
      return;
    }

    const q = query(
      collection(db, "events"),
      where("ownerUid", "==", uid),
      orderBy("dateISO", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEvents(data);
    });

    return () => unsub();
  }, [uid]);

  const list = useMemo(() => events?.filter((e) => e.isVisible), [events]);

  if (!uid) {
    return (
      <div className="px-4 py-8 text-center text-slate-500 text-sm">
        please sign in to see your events
      </div>
    );
  }

  if (!list?.length) {
    return (
      <div className="px-4 py-8 text-center text-slate-500 text-sm">
        no tickets yet or all tickets are hidden
      </div>
    );
  }

  return <div className="pb-4">{list.map((e) => <EventCard key={e.id} event={e} />)}</div>;
}
