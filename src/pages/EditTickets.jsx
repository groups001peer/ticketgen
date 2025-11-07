import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function EditTickets() {
  const nav = useNavigate();
  const [events, setEvents] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("dateISO", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEvents(data);
    });
    return () => unsub();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between px-4 h-12">
        <button onClick={()=>nav(-1)} className="text-slate-500 text-sm">×</button>
        <div className="font-medium">Edit Tickets Information</div>
        <div className="w-5" />
      </div>

      <div className="px-4 text-xs text-orange-600">Balance: $0.00</div>
      <div className="px-4 text-[11px] text-slate-500 mb-2">
        update existing tickets info (venue, dates, time, ticket type and seat numbers) features. $1 per ticket edit
      </div>

      <div className="bg-white">
        {events.map(ev => (
          <div key={ev.id} className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <button onClick={()=>nav(`/tickets/${ev.id}/edit`)} className="text-left">
                <div className="text-sm font-medium">{ev.title}</div>
                <div className="text-xs text-slate-500">{ev.venue}</div>
              </button>
              <button className="text-blue-600 text-sm" onClick={()=>nav(`/tickets/${ev.id}/edit`)}>Edit</button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                className={`px-3 py-1.5 rounded-lg text-xs ${ev.isVisible ? "bg-slate-100" : "bg-blue-600 text-white"}`}
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, "events", ev.id), { isVisible: !ev.isVisible });
                    setToast(ev.isVisible ? "Hidden from My Events" : "Shown on My Events");
                  } catch (err) {
                    setToast(err.message || "Unable to update visibility");
                  }
                }}
              >
                {ev.isVisible ? "Hide from My Events" : "Show on My Events"}
              </button>
              <button
                className="px-3 py-1.5 rounded-lg text-xs bg-red-50 text-red-700"
                onClick={() => setConfirmId(ev.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4">
        <button onClick={()=>nav("/account")} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Back to Home</button>
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete ticket?"
        body="This removes the event from your account. This action cannot be undone."
        onCancel={()=>setConfirmId(null)}
        onConfirm={async ()=>{
          try {
            await deleteDoc(doc(db, "events", confirmId));
            setToast("Ticket deleted");
          } catch (err) {
            setToast(err.message || "Failed to delete");
          }
          setConfirmId(null);
        }}
      />
      <Toast text={toast} open={!!toast} onClose={()=>setToast("")}/>
    </div>
  );
}
