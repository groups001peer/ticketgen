import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { useStore } from "../store";
import Toast from "../components/Toast";

export default function EditTicketForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [ev, setEv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ dateText: "", venue: "", gate: "", type: "", withSeats: true, seats: [] });
  const [toast, setToast] = useState("");
  const { me } = useStore();
  const EDIT_COST = 30; // cost in credits to edit a ticket

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ref = doc(db, "events", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setLoading(false);
        return;
      }
      const data = { id: snap.id, ...snap.data() };
      if (!mounted) return;
      setEv(data);
      setForm({
        dateText: data.dateDisplay || "",
        venue: data.venue || "",
        gate: data.gate || "",
        type: data.type || "",
        withSeats: Array.isArray(data.tickets) && data.tickets.length > 0,
        seats: Array.isArray(data.tickets) ? data.tickets.map(t => ({ section: t.section || "", row: t.row || "", seat: t.seat || "" })) : [],
      });
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    if (!ev) return;
    if (!me?.uid) return setToast("You must be signed in to edit events");
    try {
      const tickets = form.withSeats ? form.seats : [];
      // Use transaction to atomically update event and deduct user balance
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", me.uid);
        const userSnap = await transaction.get(userRef);
        const currentBalance = (userSnap.exists() && userSnap.data().balance) ? userSnap.data().balance : 0;
        if (currentBalance < EDIT_COST) {
          const err = new Error("INSUFFICIENT_BALANCE");
          throw err;
        }

        const eventRef = doc(db, "events", ev.id);
        transaction.update(eventRef, {
          dateDisplay: form.dateText,
          venue: form.venue,
          gate: form.gate,
          type: form.type,
          tickets,
        });

        transaction.update(userRef, { balance: currentBalance - EDIT_COST });
      });

      setToast(`Saved and charged ${EDIT_COST} credits.`);
      nav("/tickets/edit");
    } catch (err) {
      if (err?.message === "INSUFFICIENT_BALANCE") {
        setToast("Insufficient credits. Please top up to edit this ticket.");
      } else {
        setToast(err.message || "Failed to save");
      }
    }
  };

  function updateSeat(i, k, v) {
    setForm(s => {
      const seats = s.seats.slice();
      seats[i] = { ...seats[i], [k]: v };
      return { ...s, seats };
    });
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!ev) return <div className="p-4">Not found.</div>;

  return (
    <div className="px-4">
      <div className="flex items-center justify-between h-12">
        <div className="font-medium">Edit this ticket</div>
        <button onClick={()=>nav(-1)} className="text-sm text-blue-600">Close</button>
      </div>
      <p className="text-xs text-slate-500 mb-4">Please use the exact format you see</p>

      <div className="text-xs text-slate-600 mb-2">You are editing: <span className="font-medium">{ev.title}</span></div>

      <form className="space-y-4 pb-24" onSubmit={save}>
        <Field label="Date and Time">
          <input className="input" value={form.dateText} onChange={e=>set("dateText", e.target.value)} />
        </Field>
        <Field label="Event Venue">
          <input className="input" value={form.venue} onChange={e=>set("venue", e.target.value)} />
        </Field>
        <Field label="Entrance Gate">
          <input className="input" value={form.gate} onChange={e=>set("gate", e.target.value)} />
        </Field>
        <Field label="Ticket Type">
          <input className="input" value={form.type} onChange={e=>set("type", e.target.value)} />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.withSeats} onChange={e=>set("withSeats", e.target.checked)} />
          Add Seats to tickets
        </label>

        <button type="button" onClick={()=>set("seats",[...form.seats, {section:"",row:"",seat:""}])} className="px-3 py-2 bg-blue-600 text-white rounded-lg w-max">Add Seats</button>

        {form.seats.map((s, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <input className="input" placeholder="Section" value={s.section} onChange={e=>updateSeat(i,"section",e.target.value)} />
            <input className="input" placeholder="Row" value={s.row} onChange={e=>updateSeat(i,"row",e.target.value)} />
            <input className="input" placeholder="Seat" value={s.seat} onChange={e=>updateSeat(i,"seat",e.target.value)} />
          </div>
        ))}

        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium">{`Save (cost ${EDIT_COST} credits)`}</button>
      </form>
      <Toast text={toast} open={!!toast} onClose={()=>setToast("")} />
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      {children}
    </div>
  );
}
