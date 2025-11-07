// import { useState } from "react";

// export default function AdminInvites() {
//   const [email, setEmail] = useState("");
//   const [rows, setRows] = useState([
//     { id: "inv_1", email: "demo@example.com", token: "abc123xyz", used: false }
//   ]);

//   const add = ()=>{
//     if(!email) return;
//     const token = Math.random().toString(36).slice(2, 10);
//     setRows([{ id: "inv_"+token, email, token, used:false }, ...rows]);
//     setEmail("");
//   };

//   const copy = (t)=> {
//     navigator.clipboard.writeText(`${location.origin}/auth/register?token=${t}`);
//     alert("Invite link copied");
//   };

//   return (
//     <div className="px-4 pb-24">
//       <h1 className="text-lg font-semibold py-3">Admin • Invites</h1>

//       <div className="bg-white rounded-xl p-4 shadow space-y-3">
//         <div className="flex gap-2">
//           <input className="input flex-1" placeholder="Email to invite" value={email} onChange={e=>setEmail(e.target.value)} />
//           <button className="px-4 rounded-lg bg-blue-600 text-white" onClick={add}>Generate</button>
//         </div>

//         <div className="overflow-scroll border rounded-lg overflow-hidden">
//           <table className=" w-full text-sm">
//             <thead className="bg-slate-50 text-left">
//               <tr>
//                 <th className="px-3 py-2">Email</th>
//                 <th className="px-3 py-2">Token</th>
//                 <th className="px-3 py-2">Status</th>
//                 <th className="px-3 py-2 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rows.map(r=>(
//                 <tr key={r.id} className="border-t">
//                   <td className="px-3 py-2">{r.email}</td>
//                   <td className="px-3 py-2 font-mono text-xs">{r.token}</td>
//                   <td className="px-3 py-2">{r.used ? "Used" : "Active"}</td>
//                   <td className="px-3 py-2 text-right">
//                     <button className="text-blue-600 text-xs" onClick={()=>copy(r.token)}>Copy link</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
















import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
} from "firebase/firestore";
import dayjs from "dayjs";

export default function AdminInvites() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [rows, setRows] = useState([]);

  // live fetch
  useEffect(() => {
    const q = query(collection(db, "invites"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRows(data);
    });
    return () => unsub();
  }, []);

  // create invite
  const add = async () => {
    if (!email) return alert("Enter email");
    const token = Math.random().toString(36).slice(2, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    // create the invite record (for listing / admin operations)
    const inviteRef = await addDoc(collection(db, "invites"), {
      email,
      token,
      // default credits for the invited user; can be updated later by admins
      credits: 0,
      role,
      used: false,
      createdAt: serverTimestamp(),
      expiresAt,
    });

    // create a pendingUsers doc keyed by the token so the register flow can
    // look up the pending user easily. Using token as the doc id keeps it simple.
    await setDoc(doc(db, "pendingUsers", token), {
      email,
      token,
      role,
      credits: 0,
      used: false,
      inviteId: inviteRef.id,
      createdAt: serverTimestamp(),
      expiresAt,
    });
    setEmail("");
    alert("Invite created");
  };

  const copy = (t) => {
    navigator.clipboard.writeText(`${location.origin}/auth/register?token=${t}`);
    alert("Invite link copied!");
  };

  return (
    <div className="px-4 pb-24">
      <h1 className="text-lg font-semibold py-3">Admin • Invites</h1>

      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            className="input flex-1"
            placeholder="Email to invite"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="input w-32"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            className="px-4 rounded-lg bg-blue-600 text-white"
            onClick={add}
          >
            Generate
          </button>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Token</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Expires</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2 font-mono text-xs">{r.token}</td>
                  <td className="px-3 py-2">{r.role}</td>
                  <td className="px-3 py-2">
                    {r.used ? "Used" : "Active"}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {r.expiresAt
                      ? dayjs(r.expiresAt.toDate()).format("MMM D")
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      className="text-blue-600 text-xs"
                      onClick={() => copy(r.token)}
                    >
                      Copy link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
