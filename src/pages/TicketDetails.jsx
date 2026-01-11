// import { useEffect, useRef, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import BottomSheet from "../components/BottomSheet";
// import Toast from "../components/Toast";
// import { Dot, WalletCards, X } from "lucide-react";
// import { db } from "../firebase";
// import { doc, onSnapshot, updateDoc } from "firebase/firestore";

// /**
//  * Ticketmaster-like slide card:
//  * - Blue rounded header "General Admission" + SEC/ROW/SEAT
//  * - Banner image with gradient and title
//  * - Wallet button, links row, verified pill
//  * - Dots + Transfer/Sell
//  */

// export default function TicketDetails() {
//   const { id } = useParams();
//   const nav = useNavigate();

//   const [ev, setEv] = useState(null);
//   const [sheet, setSheet] = useState(false);
//   const [selected, setSelected] = useState({});
//   const [recipient, setRecipient] = useState({ name: "", contact: "" });
//   const [stage, setStage] = useState(1);
//   const [toast, setToast] = useState("");
//   const [activeIdx, setActiveIdx] = useState(0);

//   // fetch event
//   useEffect(() => {
//     const ref = doc(db, "events", id);
//     const unsub = onSnapshot(ref, (snap) => {
//       if (!snap.exists()) { setEv(null); return; }
//       setEv({ id: snap.id, ...snap.data() });
//       setActiveIdx(0);
//     });
//     return () => unsub();
//   }, [id]);

//   // transfer (remove selected tickets)
//   const transferSeats = async (eventId, seatIds) => {
//     if (!ev) return;
//     const remaining = ev.tickets.filter(t => !seatIds.includes(t.id || t.seat));
//     try {
//       await updateDoc(doc(db, "events", eventId), { tickets: remaining });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const toggle = (seatId) =>
//     setSelected(s => ({ ...s, [seatId]: !s[seatId] }));
//   const chosen = Object.keys(selected).filter(k => selected[k]);
//   if (!ev) return <div className="p-4">Not found.</div>;

//   return (
//     <>
//       {/* Header bar */}
//       <div className="fixed top-0 inset-x-0 bg-[#1f2937] text-white z-30 md:max-w-sm mx-auto">
//         <div className="flex items-center justify-between px-4 h-12">
//           <button onClick={() => nav("/events")} className="p-1">
//             <X className="w-5 h-5" />
//           </button>
//           <div className="font-semibold text-sm">My Tickets</div>
//           <button className="text-xs font-medium opacity-80">Help</button>
//         </div>
//       </div>

//       {/* CONTENT */}
//       <div className="pt-16 px-2 pb-28 min-h-screen">

//         {/* SLIDES */}
//         <TicketCarousel
//           tickets={ev.tickets || []}
//           bannerUrl={ev.bannerUrl}
//           title={ev.title}
//           date={ev.dateDisplay}
//           venue={ev.venue}
//           activeIdx={activeIdx}
//           gate={ev.gate}
//           setActiveIdx={setActiveIdx}
//         />

//         {/* Action buttons under the carousel (fixed spacing like reference) */}
//         <div className="mt-12 px-6">
//           <div className="flex gap-4">
//             <button
//               onClick={() => { setStage(1); setSheet(true); }}
//               className="flex-1 py-3.5 bg-[#2563eb] text-white rounded-2xl font-semibold text-sm shadow-md"
//             >
//               Transfer
//             </button>
//             <button
//               disabled
//               className="flex-1 py-3.5 bg-slate-200 text-slate-400 rounded-2xl font-semibold text-sm"
//             >
//               Sell
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Transfer Sheet */}
//       <BottomSheet
//         open={sheet}
//         onClose={() => setSheet(false)}
//         title={stage === 1 ? "SELECT TICKETS TO TRANSFER" : "TRANSFER TO"}
//       >
//         {stage === 1 ? (
//           <SeatPicker ev={ev} selected={selected} onToggle={toggle} />
//         ) : (
//           <RecipientForm recipient={recipient} setRecipient={setRecipient} />
//         )}

//         <div className="flex items-center justify-between mt-6">
//           <button
//             className="text-sm text-slate-500"
//             onClick={() => (stage === 1 ? setSheet(false) : setStage(1))}
//           >
//             Back
//           </button>
//           {stage === 1 ? (
//             <button
//               className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
//               disabled={!chosen.length}
//               onClick={() => setStage(2)}
//             >
//               TRANSFER TO &gt;
//             </button>
//           ) : (
//             <button
//               className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
//               disabled={!recipient.name || !recipient.contact || !chosen.length}
//               onClick={() => {
//                 transferSeats(ev.id, chosen);
//                 setSheet(false);
//                 setSelected({});
//                 setRecipient({ name: "", contact: "" });
//                 setStage(1);
//                 setToast("Transfer started");
//                 nav("/events");
//               }}
//             >
//               Confirm Transfer
//             </button>
//           )}
//         </div>
//       </BottomSheet>

//       <Toast text={toast} open={!!toast} onClose={() => setToast("")} />
//     </>
//   );
// }

// /* ===================================================================================== */
// /* Carousel (Ticketmaster style)                                                          */
// /* - horizontal scroll-snap                                                               */
// /* - page width card with subtle side peek on small screens                               */
// /* - dots indicator                                                                       */
// /* ===================================================================================== */

// function TicketCarousel({ tickets, gate, bannerUrl, title, date, venue, activeIdx, setActiveIdx }) {
//   const timerRef = useRef(null);

//   // Auto-advance slides every 2 seconds
//   useEffect(() => {
//     if (tickets.length <= 1) return;
    
//     const advance = () => {
//       setActiveIdx(current => (current + 1) % tickets.length);
//     };

//     timerRef.current = setInterval(advance, 2000);

//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//     };
//   }, [tickets.length, setActiveIdx]);

//   // Handle dot click
//   const goToSlide = (index) => {
//     setActiveIdx(index);
//     // Reset timer when manually changing slides
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = setInterval(() => {
//         setActiveIdx(current => (current + 1) % tickets.length);
//       }, 2000);
//     }
//   };

//   return (
//     <div className="mt-3">
//       {/* track */}
//       <div className="relative px-4">
//         <div className="overflow-hidden">
//           <div
//             className="flex transition-transform duration-500 ease-out"
//             style={{
//               transform: `translateX(-${activeIdx * 100}%)`,
//             }}
//           >
//             {tickets.map((t, idx) => (
//               <SlideCard
//                 key={t.id || t.seat || idx}
//                 seat={t}
//                 gate={gate}
//                 bannerUrl={bannerUrl}
//                 title={title}
//                 date={date}
//                 venue={venue}
//                 className="w-full shrink-0"
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* dots */}
//       <div className="flex justify-center gap-2 mt-16">
//         {tickets.map((_, i) => (
//           <button
//             key={i}
//             onClick={() => goToSlide(i)}
//             className={`w-3 h-3 rounded-full transition-all ${
//               i === activeIdx ? "bg-blue-600 scale-125" : "bg-slate-300 hover:bg-slate-400"
//             }`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// function SlideCard({ seat, gate, bannerUrl, title, date, venue, className = "" }) {
//   return (
//     <div className={`bg-white rounded-[22px] overflow-hidden ${className}`}>
//       {/* Blue header pill */}
//       <div className="bg-[#1E5BFF] text-white px-6 pt-4 pb-5 rounded-t-[22px]">
//         <div className="text-[15px] font-semibold text-center mb-3 tracking-wide">
//           General Admission
//         </div>
//         <div className="w-full flex items-center justify-between">
//           <Badge label="SEC" value={seat.section} />
//           <Badge label="ROW" value={seat.row} />
//           <Badge label="SEAT" value={seat.seat} />
//         </div>
//       </div>

//       {/* Banner with overlay title */}
//       {bannerUrl && (
//         <div className="relative h-40">
//           <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
//           <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/30 to-transparent" />
//           <div className="absolute text-center bottom-3 left-4 right-4 text-white">
//             <div className="font-semibold text-lg leading-tight">{title}</div>
//             <div className="text-[15px] opacity-90 mt-1 flex justify-center items-center">{date} <Dot /> {venue}</div>
//             {/* <div className="text-[11px] opacity-80">{venue}</div> */}
//           </div>
//         </div>
//       )}
//       <h1 className="text-center py-2 font-medium text-gray-800 text-[15px]">{gate}</h1>
//       {/* Content */}
//       <div className="px-6 pb-5">
//         {/* Wallet button */}
//         <button className="w-full py-3 bg-black text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">
//           {/* <span className="w-4 h-4 bg-white/30 rounded-sm" /> */}
//           <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Apple_Wallet_Icon.svg" className="w-4 h-4" alt="" />
//           Add to Apple Wallet
//         </button>

//         {/* Links row */}
//         <div className="flex justify-center gap-12 text-xs text-blue-600 font-medium mt-7">
//           <button className="text-[16px] font-semibold">View Barcode</button>
//           <button className="text-[16px] font-semibold">Ticket Details</button>
//         </div>

//       </div>
//         {/* Verified pill */}
//         <button className="mt-8 w-full bg-[#1E5BFF] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
//           <img src="https://omwtfyh69.site/progress/vendor/slick/fonts/tixapp/assets/img/icon/verifiedbytix.png" className="w-full scale-75 object-cover" alt="" />
//           {/* ticketmaster verified */}
//         </button>
//     </div>
//   );
// }

// function Badge({ label, value }) {
//   return (
//     <div className="text-center">
//       <div className="text-[11px] font-medium opacity-90 tracking-wide">{label}</div>
//       <div className="text-[15px] font-bold leading-5">{value}</div>
//     </div>
//   );
// }

// /* ========================= Transfer Sheet pieces ========================= */

// function SeatPicker({ ev, selected, onToggle }) {
//   return (
//     <>
//       <div className="text-sm mb-2">
//         {ev.tickets[0] ? `Sec ${ev.tickets[0].section}, Row ${ev.tickets[0].row}` : "No seats"}
//         <span className="text-slate-500"> — {ev.tickets.length} Tickets</span>
//       </div>
//       <div className="grid grid-cols-2 gap-3">
//         {ev.tickets.map((t) => {
//           const id = t.id || t.seat;
//           const sel = !!selected[id];
//           return (
//             <button
//               key={id}
//               onClick={() => onToggle(id)}
//               className={`px-4 py-3 rounded-2xl shadow text-sm font-medium ${sel ? "bg-blue-600 text-white" : "bg-white"}`}
//             >
//               {`SEAT ${t.seat}`}
//             </button>
//           );
//         })}
//       </div>
//     </>
//   );
// }

// function RecipientForm({ recipient, setRecipient }) {
//   return (
//     <div className="space-y-3">
//       <div className="text-sm">Enter recipient details</div>
//       <input
//         className="input"
//         placeholder="Recipient name"
//         value={recipient.name}
//         onChange={e => setRecipient({ ...recipient, name: e.target.value })}
//       />
//       <input
//         className="input"
//         placeholder="Email or phone"
//         value={recipient.contact}
//         onChange={e => setRecipient({ ...recipient, contact: e.target.value })}
//       />
//       <p className="text-[11px] text-slate-500">We’ll send the transfer link to this contact (mock).</p>
//     </div>
//   );
// }
























































import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomSheet from "../components/BottomSheet";
import Toast from "../components/Toast";
import { Dot, X, Check } from "lucide-react";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc, runTransaction } from "firebase/firestore";
import { useStore } from "../store";

/**
 * TicketDetails (UPDATED)
 * - Inline edit any ticket details (SEC/ROW/SEAT + title/date/venue/gate)
 * - Deduct 15pts per saved change ONLY if value changed
 * - Block editing if user balance < 15 (alert)
 * - Uses transaction to atomically update event + deduct user balance
 * - Keeps your Transfer bottom sheet logic
 */

export default function TicketDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { me, updateMe } = useStore();

  const EDIT_COST = 15;

  const [ev, setEv] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [selected, setSelected] = useState({});
  const [recipient, setRecipient] = useState({ name: "", contact: "" });
  const [stage, setStage] = useState(1);
  const [toast, setToast] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  // inline edit state
  // key format: "event:title" or "ticket:<ticketKey>:seat"
  const [editKey, setEditKey] = useState(null);
  const [draft, setDraft] = useState("");

  // fetch event
  useEffect(() => {
    const ref = doc(db, "events", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setEv(null);
        return;
      }
      setEv({ id: snap.id, ...snap.data() });
      setActiveIdx(0);

      // if we are editing and the underlying value changes, don't override draft mid-edit
    });
    return () => unsub();
  }, [id]);

  // transfer (remove selected tickets)
  const transferSeats = async (eventId, seatIds) => {
    if (!ev) return;
    const remaining = (ev.tickets || []).filter((t) => !seatIds.includes(t.id || t.seat));
    try {
      await updateDoc(doc(db, "events", eventId), { tickets: remaining });
    } catch (err) {
      console.error(err);
      setToast(err?.message || "Transfer failed");
    }
  };

  const toggle = (seatId) => setSelected((s) => ({ ...s, [seatId]: !s[seatId] }));
  const chosen = Object.keys(selected).filter((k) => selected[k]);

  // Helpers to read current values (so draft starts correctly)
  const getEventFieldValue = (field) => (ev?.[field] ?? "").toString();

  const getTicketFieldValue = (ticketKey, field) => {
    const t = (ev?.tickets || []).find((x) => (x.id || x.seat) === ticketKey);
    return (t?.[field] ?? "").toString();
  };

  // Begin editing
  const startEditEvent = (field) => {
    if (!me?.uid) return alert("You must be signed in to edit ticket information.");
    if ((me?.balance ?? 0) < EDIT_COST) {
      alert(`Insufficient balance. You need ${EDIT_COST} points to edit ticket information.`);
      return;
    }
    const key = `event:${field}`;
    setEditKey(key);
    setDraft(getEventFieldValue(field));
  };

  const startEditTicket = (ticketKey, field) => {
    if (!me?.uid) return alert("You must be signed in to edit ticket information.");
    if ((me?.balance ?? 0) < EDIT_COST) {
      alert(`Insufficient balance. You need ${EDIT_COST} points to edit ticket information.`);
      return;
    }
    const key = `ticket:${ticketKey}:${field}`;
    setEditKey(key);
    setDraft(getTicketFieldValue(ticketKey, field));
  };

  const cancelEdit = () => {
    setEditKey(null);
    setDraft("");
  };

  // Save edit (transaction: update event/tickets + deduct user balance)
  const saveEdit = async () => {
    if (!ev?.id) return;
    if (!me?.uid) return alert("You must be signed in to edit ticket information.");

    // Parse editKey
    if (!editKey) return;

    // Current balance check BEFORE attempting transaction (fast UX)
    if ((me?.balance ?? 0) < EDIT_COST) {
      alert(`Insufficient balance. You need ${EDIT_COST} points to edit ticket information.`);
      cancelEdit();
      return;
    }

    const next = (draft ?? "").toString();
    let prev = "";

    try {
      if (editKey.startsWith("event:")) {
        const field = editKey.split(":")[1];
        prev = getEventFieldValue(field);

        // Only save/charge if changed
        if (prev.trim() === next.trim()) {
          cancelEdit();
          return;
        }

        await runTransaction(db, async (tx) => {
          const userRef = doc(db, "users", me.uid);
          const userSnap = await tx.get(userRef);
          const bal = userSnap.exists() ? (userSnap.data()?.balance ?? 0) : 0;
          if (bal < EDIT_COST) throw new Error("INSUFFICIENT_BALANCE");

          const eventRef = doc(db, "events", ev.id);
          tx.update(eventRef, { [field]: next });
          tx.update(userRef, { balance: bal - EDIT_COST });
        });
      } else if (editKey.startsWith("ticket:")) {
        // ticket:<ticketKey>:<field>
        const parts = editKey.split(":");
        const ticketKey = parts[1];
        const field = parts[2];

        prev = getTicketFieldValue(ticketKey, field);

        // Only save/charge if changed
        if (prev.trim() === next.trim()) {
          cancelEdit();
          return;
        }

        const tickets = Array.isArray(ev.tickets) ? ev.tickets : [];
        const idx = tickets.findIndex((t) => (t.id || t.seat) === ticketKey);
        if (idx < 0) {
          alert("Ticket not found.");
          cancelEdit();
          return;
        }

        const updatedTickets = tickets.slice();
        updatedTickets[idx] = { ...updatedTickets[idx], [field]: next };

        await runTransaction(db, async (tx) => {
          const userRef = doc(db, "users", me.uid);
          const userSnap = await tx.get(userRef);
          const bal = userSnap.exists() ? (userSnap.data()?.balance ?? 0) : 0;
          if (bal < EDIT_COST) throw new Error("INSUFFICIENT_BALANCE");

          const eventRef = doc(db, "events", ev.id);
          tx.update(eventRef, { tickets: updatedTickets });
          tx.update(userRef, { balance: bal - EDIT_COST });
        });
      }

      // refresh balance in store (your store already has updateMe)
      await updateMe?.();
      setToast(`Updated. Charged ${EDIT_COST} pts.`);
      cancelEdit();
    } catch (err) {
      console.error(err);
      if (err?.message === "INSUFFICIENT_BALANCE") {
        alert(`Insufficient balance. You need ${EDIT_COST} points to edit ticket information.`);
      } else {
        alert(err?.message || "Failed to update. Please try again.");
      }
      cancelEdit();
    }
  };

  // Prevent transfer UI from being affected by edit mode
  const isEditing = !!editKey;

  if (!ev) return <div className="p-4">Not found.</div>;

  return (
    <>
      {/* Header bar */}
      <div className="fixed top-0 inset-x-0 bg-[#1f2937] text-white z-30 md:max-w-sm mx-auto">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => nav("/events")} className="p-1">
            <X className="w-5 h-5" />
          </button>
          <div className="font-semibold text-sm">My Tickets</div>
          <button className="text-xs font-medium opacity-80">Help</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="pt-16 px-2 pb-28 min-h-screen">
        {/* SLIDES */}
        <TicketCarousel
          tickets={ev.tickets || []}
          bannerUrl={ev.bannerUrl}
          title={ev.title}
          date={ev.dateDisplay}
          venue={ev.venue}
          activeIdx={activeIdx}
          gate={ev.gate}
          setActiveIdx={setActiveIdx}
          // inline edit props
          editKey={editKey}
          draft={draft}
          setDraft={setDraft}
          saveEdit={saveEdit}
          cancelEdit={cancelEdit}
          startEditEvent={startEditEvent}
          startEditTicket={startEditTicket}
        />

        {/* Action buttons under the carousel */}
        <div className="mt-12 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (isEditing) return;
                setStage(1);
                setSheet(true);
              }}
              className="flex-1 py-3.5 bg-[#2563eb] text-white rounded-2xl font-semibold text-sm shadow-md"
            >
              Transfer
            </button>
            <button
              disabled
              className="flex-1 py-3.5 bg-slate-200 text-slate-400 rounded-2xl font-semibold text-sm"
            >
              Sell
            </button>
          </div>

          <div className="mt-3 text-center text-[11px] text-slate-500">
            Balance: {((me?.balance) ?? 0).toFixed(2)} pts • {EDIT_COST} pts per saved edit
          </div>
        </div>
      </div>

      {/* Transfer Sheet */}
      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        title={stage === 1 ? "SELECT TICKETS TO TRANSFER" : "TRANSFER TO"}
      >
        {stage === 1 ? (
          <SeatPicker ev={ev} selected={selected} onToggle={toggle} />
        ) : (
          <RecipientForm recipient={recipient} setRecipient={setRecipient} />
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            className="text-sm text-slate-500"
            onClick={() => (stage === 1 ? setSheet(false) : setStage(1))}
          >
            Back
          </button>
          {stage === 1 ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
              disabled={!chosen.length}
              onClick={() => setStage(2)}
            >
              TRANSFER TO &gt;
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
              disabled={!recipient.name || !recipient.contact || !chosen.length}
              onClick={() => {
                transferSeats(ev.id, chosen);
                setSheet(false);
                setSelected({});
                setRecipient({ name: "", contact: "" });
                setStage(1);
                setToast("Transfer started");
                nav("/events");
              }}
            >
              Confirm Transfer
            </button>
          )}
        </div>
      </BottomSheet>

      <Toast text={toast} open={!!toast} onClose={() => setToast("")} />
    </>
  );
}

/* ===================================================================================== */
/* Carousel                                                                              */
/* ===================================================================================== */

function TicketCarousel({
  tickets,
  gate,
  bannerUrl,
  title,
  date,
  venue,
  activeIdx,
  setActiveIdx,

  editKey,
  draft,
  setDraft,
  saveEdit,
  cancelEdit,
  startEditEvent,
  startEditTicket,
}) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (tickets.length <= 1) return;

    const advance = () => setActiveIdx((current) => (current + 1) % tickets.length);
    timerRef.current = setInterval(advance, 2000);

    return () => timerRef.current && clearInterval(timerRef.current);
  }, [tickets.length, setActiveIdx]);

  const goToSlide = (index) => {
    setActiveIdx(index);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveIdx((current) => (current + 1) % tickets.length);
      }, 2000);
    }
  };

  return (
    <div className="mt-3">
      <div className="relative px-4">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIdx * 100}%)` }}
          >
            {tickets.map((t, idx) => (
              <SlideCard
                key={t.id || t.seat || idx}
                seat={t}
                gate={gate}
                bannerUrl={bannerUrl}
                title={title}
                date={date}
                venue={venue}
                className="w-full shrink-0"
                // edit props
                editKey={editKey}
                draft={draft}
                setDraft={setDraft}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                startEditEvent={startEditEvent}
                startEditTicket={startEditTicket}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-16">
        {tickets.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === activeIdx ? "bg-blue-600 scale-125" : "bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SlideCard({
  seat,
  gate,
  bannerUrl,
  title,
  date,
  venue,
  className = "",

  editKey,
  draft,
  setDraft,
  saveEdit,
  cancelEdit,
  startEditEvent,
  startEditTicket,
}) {
  const ticketKey = seat?.id || seat?.seat;

  return (
    <div className={`bg-white rounded-[22px] overflow-hidden ${className}`}>
      {/* Blue header pill */}
      <div className="bg-[#1E5BFF] text-white px-6 pt-4 pb-5 rounded-t-[22px]">
        <div className="text-[15px] font-semibold text-center mb-3 tracking-wide">
          General Admission
        </div>

        <div className="w-full flex items-center justify-between">
          <Badge
            label="SEC"
            value={
              <InlineField
                dark
                fieldKey={`ticket:${ticketKey}:section`}
                value={seat.section}
                editKey={editKey}
                draft={draft}
                setDraft={setDraft}
                onStartEdit={() => startEditTicket(ticketKey, "section")}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            }
          />
          <Badge
            label="ROW"
            value={
              <InlineField
                dark
                fieldKey={`ticket:${ticketKey}:row`}
                value={seat.row}
                editKey={editKey}
                draft={draft}
                setDraft={setDraft}
                onStartEdit={() => startEditTicket(ticketKey, "row")}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            }
          />
          <Badge
            label="SEAT"
            value={
              <InlineField
                dark
                fieldKey={`ticket:${ticketKey}:seat`}
                value={seat.seat}
                editKey={editKey}
                draft={draft}
                setDraft={setDraft}
                onStartEdit={() => startEditTicket(ticketKey, "seat")}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            }
          />
        </div>
      </div>

      {/* Banner with overlay title */}
      {bannerUrl && (
        <div className="relative h-40">
          <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/30 to-transparent" />
          <div className="absolute text-center bottom-3 left-4 right-4 text-white">
            {/* Title inline */}
            <div className="font-semibold text-lg leading-tight">
              <InlineField
                dark
                fieldKey="event:title"
                value={title}
                editKey={editKey}
                draft={draft}
                setDraft={setDraft}
                onStartEdit={() => startEditEvent("title")}
                onSave={saveEdit}
                onCancel={cancelEdit}
                inputClassName="text-lg font-semibold"
              />
            </div>

            {/* Date + Venue inline */}
            <div className="text-[15px] opacity-90 mt-1 flex justify-center items-center gap-2">
              <InlineField
                dark
                fieldKey="event:dateDisplay"
                value={date}
                editKey={editKey}
                draft={draft}
                setDraft={setDraft}
                onStartEdit={() => startEditEvent("dateDisplay")}
                onSave={saveEdit}
                onCancel={cancelEdit}
                inputClassName="text-[15px] font-medium"
              />
              <Dot />
              <InlineField
                dark
                fieldKey="event:venue"
                value={venue}
                editKey={editKey}
                draft={draft}
                setDraft={setDraft}
                onStartEdit={() => startEditEvent("venue")}
                onSave={saveEdit}
                onCancel={cancelEdit}
                inputClassName="text-[15px] font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Gate inline */}
      <h1 className="text-center py-2 font-medium text-gray-800 text-[15px]">
        <InlineField
          fieldKey="event:gate"
          value={gate}
          editKey={editKey}
          draft={draft}
          setDraft={setDraft}
          onStartEdit={() => startEditEvent("gate")}
          onSave={saveEdit}
          onCancel={cancelEdit}
          inputClassName="text-[15px] font-medium text-gray-800"
        />
      </h1>

      {/* Content */}
      <div className="px-6 pb-5">
        <button className="w-full py-3 bg-black text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Apple_Wallet_Icon.svg"
            className="w-4 h-4"
            alt=""
          />
          Add to Apple Wallet
        </button>

        <div className="flex justify-center gap-12 text-xs text-blue-600 font-medium mt-7">
          <button className="text-[16px] font-semibold">View Barcode</button>
          <button className="text-[16px] font-semibold">Ticket Details</button>
        </div>
      </div>

      {/* Verified pill */}
      <button className="mt-8 w-full bg-[#1E5BFF] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
        <img
          src="https://omwtfyh69.site/progress/vendor/slick/fonts/tixapp/assets/img/icon/verifiedbytix.png"
          className="w-full scale-75 object-cover"
          alt=""
        />
      </button>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-[11px] font-medium opacity-90 tracking-wide">{label}</div>
      <div className="text-[15px] font-bold leading-5">{value}</div>
    </div>
  );
}

/**
 * InlineField
 * - Displays text; click to edit (inline)
 * - Shows check icon to submit
 * - Enter saves, Esc cancels
 * - Uses parent editKey/draft so only one field edits at a time (like your EventCard pattern)
 */
function InlineField({
  fieldKey,
  value,
  editKey,
  draft,
  setDraft,
  onStartEdit,
  onSave,
  onCancel,
  dark = false,
  inputClassName = "",
}) {
  const isEditing = editKey === fieldKey;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditing) onStartEdit?.();
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSave?.();
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave?.();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel?.();
    }
  };

  if (!isEditing) {
    return (
      <span
        onClick={handleClick}
        className={`cursor-text hover:opacity-80 transition-opacity inline-flex items-center ${
          dark ? "text-white" : "text-slate-900"
        }`}
        title="Click to edit"
      >
        {value || "—"}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-1 rounded ${
        dark ? "bg-white/10" : "bg-slate-100"
      }`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`bg-transparent outline-none border-b ${
          dark ? "border-white/60 text-white placeholder:text-white/60" : "border-slate-300 text-slate-900"
        } ${inputClassName}`}
      />
      <button
        onClick={handleSave}
        className={`p-1 rounded hover:opacity-90 ${dark ? "text-white" : "text-blue-700"}`}
        title="Save"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={handleCancel}
        className={`p-1 rounded hover:opacity-90 ${dark ? "text-white/80" : "text-slate-600"}`}
        title="Cancel"
      >
        <X className="w-4 h-4" />
      </button>
    </span>
  );
}

/* ========================= Transfer Sheet pieces ========================= */

function SeatPicker({ ev, selected, onToggle }) {
  return (
    <>
      <div className="text-sm mb-2">
        {ev.tickets?.[0] ? `Sec ${ev.tickets[0].section}, Row ${ev.tickets[0].row}` : "No seats"}
        <span className="text-slate-500"> — {ev.tickets?.length || 0} Tickets</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(ev.tickets || []).map((t) => {
          const id = t.id || t.seat;
          const sel = !!selected[id];
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className={`px-4 py-3 rounded-2xl shadow text-sm font-medium ${
                sel ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {`SEAT ${t.seat}`}
            </button>
          );
        })}
      </div>
    </>
  );
}

function RecipientForm({ recipient, setRecipient }) {
  return (
    <div className="space-y-3">
      <div className="text-sm">Enter recipient details</div>
      <input
        className="input"
        placeholder="Recipient name"
        value={recipient.name}
        onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
      />
      <input
        className="input"
        placeholder="Email or phone"
        value={recipient.contact}
        onChange={(e) => setRecipient({ ...recipient, contact: e.target.value })}
      />
      <p className="text-[11px] text-slate-500">We’ll send the transfer link to this contact (mock).</p>
    </div>
  );
}
