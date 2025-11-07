// import { useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import BottomSheet from "../components/BottomSheet";
// import SeatPill from "../components/SeatPill";
// import { useStore } from "../store";
// import Toast from "../components/Toast";

// export default function TicketDetails() {
//   const { id } = useParams();
//   const nav = useNavigate();
//   const { events, transferSeats } = useStore();
//   const ev = useMemo(() => events.find(e => e.id === id) || events[0], [events, id]);

//   const [sheet, setSheet] = useState(false);
//   const [selected, setSelected] = useState({});
//   const [recipient, setRecipient] = useState({ name: "", contact: "" });
//   const [stage, setStage] = useState(1); // 1: choose seats, 2: recipient
//   const [toast, setToast] = useState("");

//   if (!ev) return <div className="p-4">Not found.</div>;

//   const toggle = (seatId) => setSelected(s => ({ ...s, [seatId]: !s[seatId] }));
//   const chosen = Object.entries(selected).filter(([_, v]) => v).map(([k]) => k);

//   return (
//     <div className="pb-24">
//       {/* Header Card */}
//       <div className="mx-2 mt-3 bg-white rounded-2xl shadow overflow-hidden">
//         <div className="bg-blue-600 text-white text-center py-3">
//           <div className="text-xs uppercase">General Admission</div>
//           {ev.tickets[0] && (
//             <div className="flex items-center justify-center gap-8 text-[11px] mt-2">
//               <Badge label="SEC" value={ev.tickets[0].section} />
//               <Badge label="ROW" value={ev.tickets[0].row} />
//               <Badge label="SEAT" value={ev.tickets[0].seat} />
//             </div>
//           )}
//         </div>

//         <div className="p-4">
//           <div className="font-medium">{ev.title}</div>
//           <div className="text-xs text-slate-600 mt-1">{ev.dateDisplay}</div>
//           <div className="mt-4">
//             <button className="w-full py-3 bg-black text-white rounded-lg">Add to Apple Wallet</button>
//           </div>

//           <div className="flex justify-between text-xs text-blue-600 mt-3">
//             <button className="underline">View Barcode</button>
//             <button className="underline">Ticket Details</button>
//           </div>

//           <div className="mt-6 flex gap-3">
//             <button onClick={()=>{ setStage(1); setSheet(true); }} className="flex-1 py-3 bg-blue-600 text-white rounded-lg">
//               Transfer
//             </button>
//             <button disabled className="flex-1 py-3 bg-slate-200 text-slate-400 rounded-lg">Sell</button>
//           </div>
//         </div>
//       </div>

//       {/* Transfer Sheet */}
//       <BottomSheet open={sheet} onClose={()=>setSheet(false)} title={stage===1 ? "SELECT TICKETS TO TRANSFER" : "TRANSFER TO"}>
//         {stage === 1 ? (
//           <SeatPicker ev={ev} selected={selected} onToggle={toggle} />
//         ) : (
//           <RecipientForm recipient={recipient} setRecipient={setRecipient} />
//         )}

//         <div className="flex items-center justify-between mt-6">
//           <button className="text-sm text-slate-500" onClick={() => stage===1 ? setSheet(false) : setStage(1)}>Back</button>
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
//                 transferSeats(ev.id, chosen, recipient);
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

//       <Toast text={toast} open={!!toast} onClose={()=>setToast("")}/>
//     </div>
//   );
// }

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

// function Badge({ label, value }) {
//   return (
//     <div className="text-center">
//       <div className="text-[10px] opacity-80">{label}</div>
//       <div className="text-base font-semibold -mt-0.5">{value}</div>
//     </div>
//   );
// }



















import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomSheet from "../components/BottomSheet";
import SeatPill from "../components/SeatPill";
import Toast from "../components/Toast";
import { X } from "lucide-react";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export default function TicketDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [ev, setEv] = useState(null);

  useEffect(() => {
    const ref = doc(db, "events", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setEv(null);
        return;
      }
      setEv({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [id]);

  const [sheet, setSheet] = useState(false);
  const [selected, setSelected] = useState({});
  const [recipient, setRecipient] = useState({ name: "", contact: "" });
  const [stage, setStage] = useState(1);
  const [toast, setToast] = useState("");

  if (!ev) return <div className="p-4">Not found.</div>;

  const toggle = (seatId) => setSelected(s => ({ ...s, [seatId]: !s[seatId] }));
  const chosen = Object.keys(selected).filter((k) => selected[k]);

  // transferSeats: remove selected tickets from this event (mock transfer)
  const transferSeats = async (eventId, seatIds) => {
    if (!ev) return;
    const remaining = ev.tickets.filter(t => !seatIds.includes(t.id || t.seat));
    try {
      await updateDoc(doc(db, "events", eventId), { tickets: remaining });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* Fixed Header */}
      <div className="fixed top-0 inset-x-0 bg-slate-900 text-white z-30 md:max-w-sm mx-auto">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => nav("/events")} className="p-1">
            <X className="w-5 h-5" />
          </button>
          <div className="font-semibold text-sm">My Tickets</div>
          <button className="text-xs font-medium">Help</button>
        </div>
      </div>

      <div className="pt-12 pb-24 bg-slate-900 min-h-screen">
        {/* Ticket Card */}
        <div className="mx-4 mt-4 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Blue Header with Seat Info */}
          <div className="bg-blue-600 text-white px-6 py-5 rounded-t-3xl">
            <div className="text-xs font-semibold text-center mb-4">General Admission</div>
            {ev.tickets[0] && (
              <div className="flex items-center justify-center gap-12">
                <Badge label="SEC" value={ev.tickets[0].section} />
                <Badge label="ROW" value={ev.tickets[0].row} />
                <Badge label="SEAT" value={ev.tickets[0].seat} />
              </div>
            )}
          </div>

          {/* Event Image */}
          {ev.bannerUrl && (
            <div className="relative h-40 -mt-2">
              <img src={ev.bannerUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-4">
                <div className="text-white font-bold text-2xl">{ev.title}</div>
              </div>
            </div>
          )}

          {/* Event Details */}
          <div className="px-6 pb-6 pt-4">
            {!ev.bannerUrl && (
              <div className="text-center mb-4">
                <div className="font-bold text-xl mb-2">{ev.title}</div>
              </div>
            )}
            
            <div className="text-center text-xs text-slate-600 mb-1">{ev.dateDisplay}</div>
            <div className="text-center text-xs text-slate-500 mb-6">{ev.venue}</div>

            {/* Apple Wallet Button */}
            <button className="w-full py-3.5 bg-black text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 mb-4">
              <div className="w-4 h-4 bg-white/30 rounded-sm"></div>
              Add to Apple Wallet
            </button>

            {/* Links */}
            <div className="flex justify-center gap-12 text-xs text-blue-600 font-medium mb-6">
              <button className="underline">View Barcode</button>
              <button className="underline">Ticket Details</button>
            </div>

            {/* Verified Badge */}
            <div className="bg-blue-600 text-white text-center py-3 rounded-xl mb-8 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold">ticketmaster verified</span>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={() => { setStage(1); setSheet(true); }} 
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-semibold text-sm shadow-md"
              >
                Transfer
              </button>
              <button 
                disabled 
                className="flex-1 py-4 bg-slate-200 text-slate-400 rounded-2xl font-semibold text-sm"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Sheet */}
      <BottomSheet open={sheet} onClose={() => setSheet(false)} title={stage === 1 ? "SELECT TICKETS TO TRANSFER" : "TRANSFER TO"}>
        {stage === 1 ? (
          <SeatPicker ev={ev} selected={selected} onToggle={toggle} />
        ) : (
          <RecipientForm recipient={recipient} setRecipient={setRecipient} />
        )}

        <div className="flex items-center justify-between mt-6">
          <button className="text-sm text-slate-500" onClick={() => stage === 1 ? setSheet(false) : setStage(1)}>
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
                transferSeats(ev.id, chosen, recipient);
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

function SeatPicker({ ev, selected, onToggle }) {
  return (
    <>
      <div className="text-sm mb-2">
        {ev.tickets[0] ? `Sec ${ev.tickets[0].section}, Row ${ev.tickets[0].row}` : "No seats"}
        <span className="text-slate-500"> — {ev.tickets.length} Tickets</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ev.tickets.map((t) => {
          const id = t.id || t.seat;
          const sel = !!selected[id];
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className={`px-4 py-3 rounded-2xl shadow text-sm font-medium ${sel ? "bg-blue-600 text-white" : "bg-white"}`}
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
        onChange={e => setRecipient({ ...recipient, name: e.target.value })}
      />
      <input
        className="input"
        placeholder="Email or phone"
        value={recipient.contact}
        onChange={e => setRecipient({ ...recipient, contact: e.target.value })}
      />
      <p className="text-[11px] text-slate-500">We'll send the transfer link to this contact (mock).</p>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-[10px] font-medium opacity-80 tracking-wide">{label}</div>
      <div className="text-2xl font-bold mt-0.5">{value}</div>
    </div>
  );
}