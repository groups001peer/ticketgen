// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth, db } from "../firebase";
// import { doc, getDocs, collection, query, where } from "firebase/firestore";

// export default function Login() {
//   const nav = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       // Allow login only for emails that exist in invites, pendingUsers, or users collections
//       const qInv = query(collection(db, "invites"), where("email", "==", email));
//       const invSnap = await getDocs(qInv);
//       const qPend = query(collection(db, "pendingUsers"), where("email", "==", email));
//       const pendSnap = await getDocs(qPend);
//       const qUsers = query(collection(db, "users"), where("email", "==", email));
//       const usersSnap = await getDocs(qUsers);

//       if (invSnap.empty && pendSnap.empty && usersSnap.empty) {
//         return setError("This email is not invited");
//       }

//       await signInWithEmailAndPassword(auth, email, password);
//       nav("/account");
//     } catch (err) {
//       // Provide friendlier messages for common auth errors
//       if (err.code === "auth/user-not-found") {
//         setError("No auth account found for this email. Please redeem your invite to create an account.");
//       } else if (err.code === "auth/wrong-password") {
//         setError("Incorrect password. If you forgot your password, use the password reset link.");
//       } else {
//         setError(err.message);
//       }
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-semibold bg-amber-200 mb-4">Login</h1>
//       {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
//       <form onSubmit={handleLogin} className="space-y-3">
//         <input
//           className="input"
//           placeholder="Email"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           className="input"
//           placeholder="Password"
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button className="w-full py-2 bg-blue-600 text-white rounded-lg">Login</button>
//       </form>
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
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Allow login only for emails that exist in invites, pendingUsers, or users collections
      const qInv = query(collection(db, "invites"), where("email", "==", email));
      const invSnap = await getDocs(qInv);
      const qPend = query(collection(db, "pendingUsers"), where("email", "==", email));
      const pendSnap = await getDocs(qPend);
      const qUsers = query(collection(db, "users"), where("email", "==", email));
      const usersSnap = await getDocs(qUsers);

      if (invSnap.empty && pendSnap.empty && usersSnap.empty) {
        setSubmitting(false);
        return setError("This email is not invited.");
      }

      await signInWithEmailAndPassword(auth, email, password);
      nav("/account");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError(
          "No auth account found for this email. Please redeem your invite to create an account."
        );
      } else if (err.code === "auth/wrong-password") {
        setError(
          "Incorrect password. If you forgot your password, use the password reset link."
        );
      } else {
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur shadow-2xl rounded-2xl p-8 border border-slate-100">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">
            Login with the email that received your invite.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="you@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
          >
            {submitting && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-xs text-center text-slate-400">
          Having trouble? Contact your admin to resend your invite.
        </p>
      </div>
    </div>
  );
}
