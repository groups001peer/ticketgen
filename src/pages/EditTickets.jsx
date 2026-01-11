// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import ConfirmDialog from "../components/ConfirmDialog";
// import Toast from "../components/Toast";
// import { db } from "../firebase";
// import {
//   collection,
//   query,
//   orderBy,
//   onSnapshot,
//   doc,
//   updateDoc,
//   deleteDoc,
// } from "firebase/firestore";
// import { useStore } from "../store";
// import { X, Copy, Check } from "lucide-react";

// export default function EditTickets() {
//   const nav = useNavigate();
//   const [events, setEvents] = useState([]);
//   const [confirmId, setConfirmId] = useState(null);
//   const [toast, setToast] = useState("");
//   const { me } = useStore();

//   // track which event id was copied (for UI feedback)
//   const [copiedFor, setCopiedFor] = useState(null);

//   useEffect(() => {
//     const q = query(collection(db, "events"), orderBy("dateISO", "desc"));
//     const unsub = onSnapshot(q, (snap) => {
//       const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setEvents(data);
//     });
//     return () => unsub();
//   }, []);

//   async function copyToClipboard(text, evId) {
//     if (!text) return setToast("No ticket template ID found for this event.");

//     try {
//       await navigator.clipboard.writeText(text);
//       setCopiedFor(evId);
//       setToast("Ticket Template ID copied!");
//       // reset the check icon after a short moment
//       window.clearTimeout(copyToClipboard._t);
//       copyToClipboard._t = window.setTimeout(() => setCopiedFor(null), 1200);
//     } catch (err) {
//       // fallback for older browsers / blocked permissions
//       try {
//         const ta = document.createElement("textarea");
//         ta.value = text;
//         ta.setAttribute("readonly", "");
//         ta.style.position = "fixed";
//         ta.style.left = "-9999px";
//         document.body.appendChild(ta);
//         ta.select();
//         document.execCommand("copy");
//         document.body.removeChild(ta);

//         setCopiedFor(evId);
//         setToast("Ticket Template ID copied!");
//         window.clearTimeout(copyToClipboard._t);
//         copyToClipboard._t = window.setTimeout(() => setCopiedFor(null), 1200);
//       } catch (e2) {
//         setToast("Copy failed. Please copy manually.");
//       }
//     }
//   }

//   return (
//     <div>
//       <div className="flex items-center justify-between px-4 h-12">
//         <button onClick={() => nav(-1)} className="text-slate-500 text-sm">
//           <X />
//         </button>
//         <div className="font-medium">Edit Tickets Information</div>
//         <div className="w-5" />
//       </div>

//       <div className="px-4 text-xs text-orange-600">
//         Balance: {((me?.balance) ?? 0).toFixed(2)}{" "}Pts
//       </div>

//       <div className="px-4 text-[11px] text-slate-500 mb-2">
//         update existing tickets info (venue, dates, time, ticket type and seat numbers)
//         features. 30 Points per ticket edit
//       </div>

//       <div className="bg-white">
//         {events.map((ev) => (
//           <div key={ev.id} className="px-4 py-3 border-b">
//             <div className="flex items-center justify-between">
//               <button onClick={() => nav(`/tickets/${ev.id}/edit`)} className="text-left">
//                 <div className="text-sm font-medium">{ev.title}</div>
//                 <div className="text-xs text-slate-500">{ev.venue}</div>
//               </button>

//               <button
//                 className="text-blue-600 text-sm"
//                 onClick={() => nav(`/tickets/${ev.id}/edit`)}
//               >
//                 Edit
//               </button>
//             </div>

//             {/* ✅ Ticket Template ID + copy */}
//             <div className="mt-2 flex items-center gap-2">
//               <div className="text-[11px] text-slate-500">Ticket ID:</div>

//               <div className="flex items-center gap-2">
//                 <code className="text-[11px] px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700">
//                   {ev.ticketTemplateId || "—"}
//                 </code>

//                 <button
//                   type="button"
//                   className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border border-slate-200 bg-white hover:bg-slate-50"
//                   onClick={() => copyToClipboard(ev.ticketTemplateId, ev.id)}
//                   disabled={!ev.ticketTemplateId}
//                   title={ev.ticketTemplateId ? "Copy Ticket ID" : "No Ticket ID available"}
//                 >
//                   {copiedFor === ev.id ? (
//                     <>
//                       <Check className="w-3.5 h-3.5" />
//                       Copied
//                     </>
//                   ) : (
//                     <>
//                       <Copy className="w-3.5 h-3.5" />
//                       Copy
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="flex gap-2 mt-3">
//               <button
//                 className={`px-3 py-1.5 rounded-lg text-xs ${
//                   ev.isVisible ? "bg-slate-100" : "bg-blue-600 text-white"
//                 }`}
//                 onClick={async () => {
//                   try {
//                     await updateDoc(doc(db, "events", ev.id), {
//                       isVisible: !ev.isVisible,
//                     });
//                     setToast(ev.isVisible ? "Hidden from My Events" : "Shown on My Events");
//                   } catch (err) {
//                     setToast(err.message || "Unable to update visibility");
//                   }
//                 }}
//               >
//                 {ev.isVisible ? "Hide from My Events" : "Show on My Events"}
//               </button>

//               <button
//                 className="px-3 py-1.5 rounded-lg text-xs bg-red-50 text-red-700"
//                 onClick={() => setConfirmId(ev.id)}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div
//         onClick={() => nav("/event")}
//         className="cursor-pointer text-center text-xs py-10 text-slate-400"
//       >
//         Back to Main App
//       </div>

//       <ConfirmDialog
//         open={!!confirmId}
//         title="Delete ticket?"
//         body="This removes the event from your account. This action cannot be undone."
//         onCancel={() => setConfirmId(null)}
//         onConfirm={async () => {
//           try {
//             await deleteDoc(doc(db, "events", confirmId));
//             setToast("Ticket deleted");
//           } catch (err) {
//             setToast(err.message || "Failed to delete");
//           }
//           setConfirmId(null);
//         }}
//       />

//       <Toast text={toast} open={!!toast} onClose={() => setToast("")} />
//     </div>
//   );
// }




























import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { useStore } from "../store";
import { X, Copy, Check } from "lucide-react";

export default function EditTickets() {
  const nav = useNavigate();
  const [events, setEvents] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState("");
  const { me } = useStore();

  const [copiedFor, setCopiedFor] = useState(null);

  useEffect(() => {
    // if user not loaded / not logged in
    if (!me?.uid) {
      setEvents([]);
      return;
    }

    // 🔒 only this user's events
    const q = query(
      collection(db, "events"),
      where("ownerUid", "==", me.uid),
      orderBy("dateISO", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEvents(data);
      },
      (err) => {
        setToast(err.message || "Failed to load tickets");
      }
    );

    return () => unsub();
  }, [me?.uid]);

  async function copyToClipboard(text, evId) {
    if (!text) return setToast("No ticket template ID found for this event.");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedFor(evId);
      setToast("Ticket Template ID copied!");
      window.clearTimeout(copyToClipboard._t);
      copyToClipboard._t = window.setTimeout(() => setCopiedFor(null), 1200);
    } catch (err) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);

        setCopiedFor(evId);
        setToast("Ticket Template ID copied!");
        window.clearTimeout(copyToClipboard._t);
        copyToClipboard._t = window.setTimeout(() => setCopiedFor(null), 1200);
      } catch (e2) {
        setToast("Copy failed. Please copy manually.");
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 h-12">
        <button onClick={() => nav(-1)} className="text-slate-500 text-sm">
          <X />
        </button>
        <div className="font-medium">Edit Tickets Information</div>
        <div className="w-5" />
      </div>

      <div className="px-4 text-xs text-orange-600">
        Balance: {((me?.balance) ?? 0).toFixed(2)}{" "}Pts
      </div>

      <div className="px-4 text-[11px] text-slate-500 mb-2">
        update existing tickets info (venue, dates, time, ticket type and seat numbers)
        features. 30 Points per ticket edit
      </div>

      <div className="bg-white">
        {events.map((ev) => (
          <div key={ev.id} className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <button onClick={() => nav(`/tickets/${ev.id}/edit`)} className="text-left">
                <div className="text-sm font-medium">{ev.title}</div>
                <div className="text-xs text-slate-500">{ev.venue}</div>
              </button>

              <button
                className="text-blue-600 text-sm"
                onClick={() => nav(`/tickets/${ev.id}/edit`)}
              >
                Edit
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="text-[11px] text-slate-500">Ticket ID:</div>

              <div className="flex items-center gap-2">
                <code className="text-[11px] px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-700">
                  {ev.ticketTemplateId || "—"}
                </code>

                <button
                  type="button"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border border-slate-200 bg-white hover:bg-slate-50"
                  onClick={() => copyToClipboard(ev.ticketTemplateId, ev.id)}
                  disabled={!ev.ticketTemplateId}
                  title={ev.ticketTemplateId ? "Copy Ticket ID" : "No Ticket ID available"}
                >
                  {copiedFor === ev.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  ev.isVisible ? "bg-slate-100" : "bg-blue-600 text-white"
                }`}
                onClick={async () => {
                  try {
                    await updateDoc(doc(db, "events", ev.id), {
                      isVisible: !ev.isVisible,
                    });
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

      <div
        onClick={() => nav("/event")}
        className="cursor-pointer text-center text-xs py-10 text-slate-400"
      >
        Back to Main App
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Delete ticket?"
        body="This removes the event from your account. This action cannot be undone."
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => {
          try {
            await deleteDoc(doc(db, "events", confirmId));
            setToast("Ticket deleted");
          } catch (err) {
            setToast(err.message || "Failed to delete");
          }
          setConfirmId(null);
        }}
      />

      <Toast text={toast} open={!!toast} onClose={() => setToast("")} />
    </div>
  );
}
