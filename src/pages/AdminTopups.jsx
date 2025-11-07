import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  runTransaction,
  doc,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  increment,
} from "firebase/firestore";

export default function AdminTopups() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual adjust form
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(10);
  const [note, setNote] = useState("Manual adjust");

  // Live list of topup requests
  useEffect(() => {
    const q = query(collection(db, "topups"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Approve a pending request: atomically add credits to user, mark approved
  const approve = async (topupId) => {
    try {
      await runTransaction(db, async (trx) => {
        const topRef = doc(db, "topups", topupId);
        const topSnap = await trx.get(topRef);
        if (!topSnap.exists()) throw new Error("Topup not found");
        const top = topSnap.data();
        if (top.status !== "pending") return; // idempotent

        const userRef = doc(db, "users", top.userUid);
        const userSnap = await trx.get(userRef);
        if (!userSnap.exists()) throw new Error("User not found");

        // increment balance & mark approved
        trx.update(userRef, { balance: increment(top.credits) });
        trx.update(topRef, { status: "approved", approvedAt: serverTimestamp() });

        // optional: record a transaction log
        const txRef = collection(db, "transactions");
        trx.set(doc(txRef), {
          userUid: top.userUid,
          email: userSnap.data().email,
          delta: top.credits,
          kind: "topup",
          note: top.note || "",
          createdAt: serverTimestamp(),
        });
      });
      alert("Top-up approved");
    } catch (e) {
      alert(e.message);
    }
  };

  // Manual credit adjust by email (no pending request)
  const adjust = async () => {
    if (!email || !amount) return alert("Email and amount required");
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snap = await getDocs(q);
      if (snap.empty) return alert("User not found");

      const u = snap.docs[0];
      await runTransaction(db, async (trx) => {
        const uref = doc(db, "users", u.id);
        trx.update(uref, { balance: increment(Number(amount)) });

        const txRef = collection(db, "transactions");
        trx.set(doc(txRef), {
          userUid: u.id,
          email,
          delta: Number(amount),
          kind: "admin_adjust",
          note,
          createdAt: serverTimestamp(),
        });
      });
      setEmail("");
      setAmount(10);
      setNote("Manual adjust");
      alert("Balance updated");
    } catch (e) {
      alert(e.message);
    }
  };

  // (Optional) Seed: create a pending topup for testing
  const seedPending = async () => {
    // Find first user
    const u = await getDocs(query(collection(db, "users"), orderBy("email")));
    if (u.empty) return alert("No users to seed for");
    const first = u.docs[0];
    await addDoc(collection(db, "topups"), {
      userUid: first.id,
      email: first.data().email,
      credits: 20,
      note: "Telegram bulk",
      status: "pending",
      createdAt: serverTimestamp(),
    });
    alert("Seeded a pending topup");
  };

  return (
    <div className="px-4 pb-24">
      <h1 className="text-lg font-semibold py-3">Admin • Top-ups</h1>

      {/* Manual Adjust */}
      <div className="bg-white rounded-xl p-4 shadow space-y-2 mb-6">
        <div className="text-sm font-medium">Manual credit adjust</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="input" placeholder="User email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="number" placeholder="Credits (+/-)" value={amount} onChange={e=>setAmount(e.target.value)} />
          <input className="input" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
          <button className="px-4 rounded-lg bg-blue-600 text-white" onClick={adjust}>Apply</button>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Top-up requests</div>
          <button className="text-xs text-slate-500 underline" onClick={seedPending}>Seed pending</button>
        </div>

        {loading ? (
          <div className="p-3 text-sm text-slate-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Credits</th>
                  <th className="px-3 py-2">Note</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Requested</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r=>(
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-2">{r.email}</td>
                    <td className="px-3 py-2">{r.credits}</td>
                    <td className="px-3 py-2">{r.note || "-"}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2 text-xs">
                      {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {r.status === "pending" ? (
                        <button
                          onClick={()=>approve(r.id)}
                          className="text-xs px-3 py-1 rounded bg-blue-600 text-white"
                        >
                          Approve
                        </button>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td className="px-3 py-4 text-sm text-slate-500" colSpan={6}>No requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
