// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";

// export default function Login() {
//   const nav = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const set = (k,v)=>setForm(s=>({...s,[k]:v}));

//   const submit = (e)=>{
//     e.preventDefault();
//     // mock login
//     if(!form.email || !form.password) return alert("Enter email and password");
//     nav("/account");
//   };

//   return (
//     <div className="px-4 pt-8 pb-24">
//       <h1 className="text-xl font-semibold mb-2">Log in</h1>
//       <p className="text-sm text-slate-500 mb-6">Welcome back.</p>

//       <form className="space-y-3" onSubmit={submit}>
//         <input className="input" placeholder="Email" value={form.email} onChange={e=>set("email",e.target.value)} />
//         <input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>set("password",e.target.value)} />
//         <button className="w-full py-3 bg-blue-600 text-white rounded-lg">Continue</button>
//       </form>

//       <div className="text-xs text-slate-500 mt-6">
//         New here?{" "}
//         <Link to="/auth/register" className="text-blue-600">Create an account</Link>
//       </div>
//     </div>
//   );
// }

























import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDocs, collection, query, where } from "firebase/firestore";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Allow login only for emails that exist in invites, pendingUsers, or users collections
      const qInv = query(collection(db, "invites"), where("email", "==", email));
      const invSnap = await getDocs(qInv);
      const qPend = query(collection(db, "pendingUsers"), where("email", "==", email));
      const pendSnap = await getDocs(qPend);
      const qUsers = query(collection(db, "users"), where("email", "==", email));
      const usersSnap = await getDocs(qUsers);

      if (invSnap.empty && pendSnap.empty && usersSnap.empty) {
        return setError("This email is not invited");
      }

      await signInWithEmailAndPassword(auth, email, password);
      nav("/account");
    } catch (err) {
      // Provide friendlier messages for common auth errors
      if (err.code === "auth/user-not-found") {
        setError("No auth account found for this email. Please redeem your invite to create an account.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. If you forgot your password, use the password reset link.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold bg-amber-200 mb-4">Login</h1>
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          className="input"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full py-2 bg-blue-600 text-white rounded-lg">Login</button>
      </form>
    </div>
  );
}
