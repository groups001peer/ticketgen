// import { useState, useEffect } from "react";
// import { useSearchParams, useNavigate, Link } from "react-router-dom";

// export default function Register() {
//   const [params] = useSearchParams();
//   const token = params.get("token") || "";
//   const nav = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "", name: "" });
//   const set = (k,v)=>setForm(s=>({...s,[k]:v}));
//   const [valid, setValid] = useState(true);

//   useEffect(()=>{
//     // mock token check
//     if (token && token.length < 5) setValid(false);
//   }, [token]);

//   const submit = (e)=>{
//     e.preventDefault();
//     if(!token) return alert("Invite token required");
//     if(!valid) return alert("Invalid/expired token");
//     if(!form.email || !form.password) return alert("Fill all fields");
//     nav("/account");
//   };

//   return (
//     <div className="px-4 pt-8 pb-24">
//       <h1 className="text-xl font-semibold mb-2">Create account</h1>
//       <p className="text-sm text-slate-500 mb-4">Invite-only registration.</p>

//       <div className={`text-xs mb-4 ${valid ? "text-green-600" : "text-red-600"}`}>
//         Token: {token ? token : "— none —"} {token ? (valid ? "(looks valid)" : "(invalid)") : ""}
//       </div>

//       <form className="space-y-3" onSubmit={submit}>
//         <input className="input" placeholder="Full name" value={form.name} onChange={e=>set("name",e.target.value)} />
//         <input className="input" placeholder="Email (must match invite)" value={form.email} onChange={e=>set("email",e.target.value)} />
//         <input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>set("password",e.target.value)} />
//         <button className="w-full py-3 bg-blue-600 text-white rounded-lg">Create Account</button>
//       </form>

//       <div className="text-xs text-slate-500 mt-6">
//         Already have an account?{" "}
//         <Link to="/auth/login" className="text-blue-600">Log in</Link>
//       </div>
//     </div>
//   );
// }





























import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";

export default function Register() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return setError("Invite token required");
    (async () => {
      // Prefer a pendingUsers doc keyed by the token (created by admin).
      const pendingRef = doc(db, "pendingUsers", token);
      let pendingSnap = await getDoc(pendingRef);

      if (pendingSnap.exists()) {
        const p = pendingSnap.data();
        if (p.used) return setError("Token already used");
        if (p.expiresAt?.toDate() < new Date()) return setError("Token expired");
        setInvite({ ...p, pendingId: pendingSnap.id, from: "pendingUsers" });
        setEmail(p.email);
        return;
      }

      // Fallback: support legacy invites collection lookup by token or doc id
      let snap = await getDoc(doc(db, "invites", token));
      if (!snap.exists()) {
        const q = query(
          collection(db, "invites"),
          where("token", "==", token),
          limit(1)
        );
        const qs = await getDocs(q);
        if (qs.empty) return setError("Invalid token");
        snap = qs.docs[0];
      }

      const data = snap.data();
      if (data.used) return setError("Token already used");
      if (data.expiresAt?.toDate() < new Date()) return setError("Token expired");

      setInvite({ ...data, id: snap.id, from: "invites" });
      setEmail(data.email);
    })();
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!invite) return;
    try {
      // Create Auth account
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const role = invite.role || "user";

      // Create the real users/{uid} document using invite/pending data
      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        displayName: email.split("@")[0],
        role,
        credits: invite?.credits || 0,
      });

      // Consume pendingUsers if present
      if (invite?.from === "pendingUsers" && invite?.pendingId) {
        await updateDoc(doc(db, "pendingUsers", invite.pendingId), { used: true });
        // Also mark the linked invite used if present
        if (invite.inviteId) {
          await updateDoc(doc(db, "invites", invite.inviteId), { used: true });
        }
      }

      // Fallback: mark invites used if we came from the legacy invites collection
      if (invite?.from === "invites" && invite?.id) {
        await updateDoc(doc(db, "invites", invite.id), { used: true });
      }

      updateProfile(userCred.user, { displayName: email.split("@")[0] });
      nav("/account");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        try {
          await sendPasswordResetEmail(auth, email);
          setError(
            "An account already exists for this email. We've sent a password reset link — please use it to set your password and then log in."
          );
        } catch (resetErr) {
          setError(resetErr.message || "Unable to send password reset email.");
        }
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      {!invite && !error && <p>Checking invite...</p>}
      {invite && (
        <form onSubmit={handleRegister} className="space-y-3">
          <input className="input" value={email} disabled />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full py-2 bg-blue-600 text-white rounded-lg">Register</button>
        </form>
      )}
    </div>
  );
}
