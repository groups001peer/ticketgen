// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import UploadDrop from "../components/UploadDrop";
// import { db } from "../firebase";
// import { collection, serverTimestamp, doc, runTransaction } from "firebase/firestore";
// import { useStore } from "../store";
// import Toast from "../components/Toast";
// import { X } from "lucide-react";

// export default function CreateTicket() {
//   const nav = useNavigate();
//   const { me } = useStore();

//   const [form, setForm] = useState({
//     title: "",
//     dateText: "",
//     venue: "",
//     gate: "",
//     type: "",
//     banner: null,            // { preview, cloudinary:{url, publicId,...} }
//     withSeats: false,
//     seats: [{ section: "", row: "", seat: "" }],
//     quantity: 1,
//   });
//   const [toast, setToast] = useState("");

//   const CREATE_COST = 50; // cost in credits for creating a ticket

//   const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

//   const addSeat = () => setForm(s => ({ ...s, seats: [...s.seats, { section:"", row:"", seat:"" }] }));

//   const submit = async (e) => {
//     e.preventDefault();
//     if (!me?.uid) return setToast("You must be signed in to create events");

//     if (!form.title || !form.dateText || !form.venue || !form.type) {
//       return setToast("Fill all required fields");
//     }

//     // If an upload is in-flight, ask user to wait
//     if (form.banner?.uploading) {
//       return setToast("Image is still uploading — please wait until the upload completes before submitting.");
//     }

//     // Ensure Cloudinary upload completed successfully (final data present)
//     if (!form.banner?.cloudinary?.url || !form.banner?.cloudinary?.publicId) {
//       return setToast("Please upload a banner image (Cloudinary)");
//     }

//     const tickets = form.withSeats
//       ? form.seats.filter(s => s.section && s.row && s.seat)
//       : Array.from({ length: form.quantity }).map((_, i) => ({
//           id: "t" + (i + 1),
//           section: "GA",
//           row: "-",
//           seat: String(i + 1)
//         }));

//     try {
//       // Use a transaction to atomically check balance and create event + deduct
//       await runTransaction(db, async (transaction) => {
//         const userRef = doc(db, "users", me.uid);
//         const userSnap = await transaction.get(userRef);
//         const currentBalance = (userSnap.exists() && userSnap.data().balance) ? userSnap.data().balance : 0;
//         if (currentBalance < CREATE_COST) {
//           const err = new Error("INSUFFICIENT_BALANCE");
//           throw err;
//         }

//         const newEventRef = doc(collection(db, "events"));
//         transaction.set(newEventRef, {
//           title: form.title,
//           dateDisplay: form.dateText,
//           dateISO: new Date().toISOString(),
//           venue: form.venue,
//           gate: form.gate || "",
//           type: form.type,
//           bannerUrl: form.banner?.cloudinary?.url,
//           bannerPublicId: form.banner?.cloudinary?.publicId,
//           tickets,
//           ownerUid: me.uid,
//           isVisible: true,
//           createdAt: serverTimestamp(),
//         });

//         transaction.update(userRef, { balance: currentBalance - CREATE_COST });
//       });

//       nav("/events");
//     } catch (err) {
//       if (err?.message === "INSUFFICIENT_BALANCE") {
//         setToast("Insufficient credits. Please top up to create a ticket.");
//       } else {
//         setToast(err.message || "Failed to create event");
//       }
//     }
//   };

//   return (
//     <div className="px-4">
//       <div className="flex items-center justify-between h-12">
//         <button onClick={()=>nav(-1)} className="text-slate-500 text-sm"><X /></button>
//         <div className="font-medium">Create new ticket</div>
//         <div className="w-5" />
//       </div>

//       <div className="px-0 text-xs text-slate-500">Balance: {((me?.balance) ?? 0).toFixed(2)} {" "} Pts</div>
//       <p className="text-xs text-slate-500 mb-4">Please use the exact format you see</p>

//       <form className="space-y-4 pb-24" onSubmit={submit}>
//         <Field label="Event Name">
//           <input className="input" placeholder="E.g Beyonce Live" value={form.title} onChange={e=>set("title", e.target.value)} />
//         </Field>

//         <Field label="Date and Time">
//           <input className="input" placeholder="E.g Mon Dec, 12 - 10AM" value={form.dateText} onChange={e=>set("dateText", e.target.value)} />
//         </Field>

//         <Field label="Event Venue">
//           <input className="input" placeholder="E.g O2, Arena London" value={form.venue} onChange={e=>set("venue", e.target.value)} />
//         </Field>

//         <Field label="Entrance Gate">
//           <input className="input" placeholder="E.g Southwest" value={form.gate} onChange={e=>set("gate", e.target.value)} />
//         </Field>

//         <Field label="Ticket Type">
//           <input className="input" placeholder="E.g General Admission" value={form.type} onChange={e=>set("type", e.target.value)} />
//         </Field>

//         <UploadDrop value={form.banner} onChange={(v)=>set("banner", v)} />

//         <p className="text-[11px] text-slate-500">
//           if you are not adding seats numbers and rows, make sure you select number of tickets to show from the drop down
//         </p>

//         <label className="flex items-center gap-2 text-sm">
//           <input type="checkbox" checked={form.withSeats} onChange={e=>set("withSeats", e.target.checked)} />
//           Add Seats to tickets
//         </label>

//         {form.withSeats ? (
//           <div className="space-y-3">
//             <button type="button" onClick={addSeat} className="px-3 py-2 bg-blue-600 text-white rounded-lg w-max">Add Seats</button>
//             {form.seats.map((s, i) => (
//               <div key={i} className="grid grid-cols-3 gap-2">
//                 <input className="input" placeholder="Section" value={s.section} onChange={e=>updateSeat(i,"section",e.target.value)} />
//                 <input className="input" placeholder="Row" value={s.row} onChange={e=>updateSeat(i,"row",e.target.value)} />
//                 <input className="input" placeholder="Seat" value={s.seat} onChange={e=>updateSeat(i,"seat",e.target.value)} />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div>
//             <select className="input" value={form.quantity} onChange={e=>set("quantity", Number(e.target.value))}>
//               {Array.from({length:10}).map((_,i)=><option key={i} value={i+1}>{i+1} ticket(s)</option>)}
//             </select>
//           </div>
//         )}

//         <button
//           className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-60"
//           disabled={form.banner?.uploading}
//         >
//           {form.banner?.uploading ? "Uploading…" : `Create Ticket (cost ${CREATE_COST} credits)`}
//         </button>
//       </form>
//       <div onClick={()=>nav("/event")} className="cursor-pointer text-center text-xs py-10 text-slate-400">
//         Back to Main App
//       </div>
//       <Toast text={toast} open={!!toast} onClose={()=>setToast("")} />
//     </div>
//   );

//   function updateSeat(i, k, v) {
//     setForm(s => {
//       const seats = s.seats.slice();
//       seats[i] = { ...seats[i], [k]: v };
//       return { ...s, seats };
//     });
//   }
// }

// function Field({ label, children }) {
//   return (
//     <div>
//       <div className="text-xs text-slate-600 mb-1">{label}</div>
//       {children}
//     </div>
//   );
// }



































// 

























import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadDrop from "../components/UploadDrop";
import { db } from "../firebase";
import {
  collection,
  serverTimestamp,
  doc,
  runTransaction,
} from "firebase/firestore";
import { useStore } from "../store";
import Toast from "../components/Toast";
import { X } from "lucide-react";

export default function CreateTicket() {
  const nav = useNavigate();
  const { me } = useStore();

  const [form, setForm] = useState({
    title: "",
    dateText: "",
    venue: "",
    gate: "",
    type: "",
    banner: null, // { preview, cloudinary:{url, publicId,...}, uploading?: boolean }
    withSeats: false,
    seats: [{ section: "", row: "", seat: "" }],
    quantity: 1,
  });
  const [toast, setToast] = useState("");

  const CREATE_COST = 50; // cost in credits for creating a ticket

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const addSeat = () =>
    setForm((s) => ({
      ...s,
      seats: [...s.seats, { section: "", row: "", seat: "" }],
    }));

  // Client-safe unique ID generator (no libs)
  // Example: TCKT-20251222-8F3K2H9Q
  function generateTicketTemplateId() {
    const d = new Date();
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const datePart = `${yyyy}${mm}${dd}`;

    // crypto is available in modern browsers
    const bytes = new Uint8Array(8);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      // fallback (still ok, just less strong)
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
    }

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randPart = "";
    for (let i = 0; i < bytes.length; i++) {
      randPart += alphabet[bytes[i] % alphabet.length];
    }

    return `TCKT-${datePart}-${randPart}`;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!me?.uid) return setToast("You must be signed in to create events");

    if (!form.title || !form.dateText || !form.venue || !form.type) {
      return setToast("Fill all required fields");
    }

    // If an upload is in-flight, ask user to wait
    if (form.banner?.uploading) {
      return setToast(
        "Image is still uploading — please wait until the upload completes before submitting."
      );
    }

    // Ensure Cloudinary upload completed successfully (final data present)
    if (!form.banner?.cloudinary?.url || !form.banner?.cloudinary?.publicId) {
      return setToast("Please upload a banner image (Cloudinary)");
    }

    // Seat / ticket entries
    const tickets = form.withSeats
      ? form.seats
          .filter((s) => s.section && s.row && s.seat)
          .map((s, idx) => ({
            id: `t${idx + 1}`,
            section: s.section,
            row: s.row,
            seat: s.seat,
          }))
      : Array.from({ length: form.quantity }).map((_, i) => ({
          id: "t" + (i + 1),
          section: "GA",
          row: "-",
          seat: String(i + 1),
        }));

    if (form.withSeats && tickets.length === 0) {
      return setToast("Please add at least one complete seat (section/row/seat).");
    }

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", me.uid);
        const userSnap = await transaction.get(userRef);
        const currentBalance =
          userSnap.exists() && userSnap.data().balance ? userSnap.data().balance : 0;

        if (currentBalance < CREATE_COST) {
          const err = new Error("INSUFFICIENT_BALANCE");
          throw err;
        }

        const newEventRef = doc(collection(db, "events"));

        // ✅ Unique ID stored on the event for later template generation
        const ticketTemplateId = generateTicketTemplateId();

        transaction.set(newEventRef, {
          ticketTemplateId, // <--- THIS is your unique ticket id for template usage later

          title: form.title,
          dateDisplay: form.dateText,
          dateISO: new Date().toISOString(),
          venue: form.venue,
          gate: form.gate || "",
          type: form.type,

          bannerUrl: form.banner?.cloudinary?.url,
          bannerPublicId: form.banner?.cloudinary?.publicId,

          tickets,
          ownerUid: me.uid,
          isVisible: true,
          createdAt: serverTimestamp(),
        });

        transaction.update(userRef, { balance: currentBalance - CREATE_COST });
      });

      nav("/events");
    } catch (err) {
      if (err?.message === "INSUFFICIENT_BALANCE") {
        setToast("Insufficient credits. Please top up to create a ticket.");
      } else {
        setToast(err?.message || "Failed to create event");
      }
    }
  };

  return (
    <div className="px-4">
      <div className="flex items-center justify-between h-12">
        <button onClick={() => nav(-1)} className="text-slate-500 text-sm">
          <X />
        </button>
        <div className="font-medium">Create new ticket</div>
        <div className="w-5" />
      </div>

      <div className="px-0 text-xs text-slate-500">
        Balance: {((me?.balance) ?? 0).toFixed(2)} {" "} Pts
      </div>
      <p className="text-xs text-slate-500 mb-4">Please use the exact format you see</p>

      <form className="space-y-4 pb-24" onSubmit={submit}>
        <Field label="Event Name">
          <input
            className="input"
            placeholder="E.g Beyonce Live"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>

        <Field label="Date and Time">
          <input
            className="input"
            placeholder="E.g Mon Dec, 12 - 10AM"
            value={form.dateText}
            onChange={(e) => set("dateText", e.target.value)}
          />
        </Field>

        <Field label="Event Venue">
          <input
            className="input"
            placeholder="E.g O2, Arena London"
            value={form.venue}
            onChange={(e) => set("venue", e.target.value)}
          />
        </Field>

        <Field label="Entrance Gate">
          <input
            className="input"
            placeholder="E.g Southwest"
            value={form.gate}
            onChange={(e) => set("gate", e.target.value)}
          />
        </Field>

        <Field label="Ticket Type">
          <input
            className="input"
            placeholder="E.g General Admission"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
          />
        </Field>

        <UploadDrop value={form.banner} onChange={(v) => set("banner", v)} />

        <p className="text-[11px] text-slate-500">
          if you are not adding seats numbers and rows, make sure you select number of
          tickets to show from the drop down
        </p>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.withSeats}
            onChange={(e) => set("withSeats", e.target.checked)}
          />
          Add Seats to tickets
        </label>

        {form.withSeats ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={addSeat}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg w-max"
            >
              Add Seats
            </button>

            {form.seats.map((s, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <input
                  className="input"
                  placeholder="Section"
                  value={s.section}
                  onChange={(e) => updateSeat(i, "section", e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Row"
                  value={s.row}
                  onChange={(e) => updateSeat(i, "row", e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Seat"
                  value={s.seat}
                  onChange={(e) => updateSeat(i, "seat", e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <select
              className="input"
              value={form.quantity}
              onChange={(e) => set("quantity", Number(e.target.value))}
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1} ticket(s)
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium disabled:opacity-60"
          disabled={form.banner?.uploading}
        >
          {form.banner?.uploading
            ? "Uploading…"
            : `Create Ticket (cost ${CREATE_COST} credits)`}
        </button>
      </form>

      <div
        onClick={() => nav("/event")}
        className="cursor-pointer text-center text-xs py-10 text-slate-400"
      >
        Back to Main App
      </div>

      <Toast text={toast} open={!!toast} onClose={() => setToast("")} />
    </div>
  );

  function updateSeat(i, k, v) {
    setForm((s) => {
      const seats = s.seats.slice();
      seats[i] = { ...seats[i], [k]: v };
      return { ...s, seats };
    });
  }
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      {children}
    </div>
  );
}
