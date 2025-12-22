// import { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { auth, db } from "../firebase";
// import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
// import {
//   doc,
//   getDoc,
//   setDoc,
//   updateDoc,
//   collection,
//   query,
//   where,
//   getDocs,
//   limit,
// } from "firebase/firestore";

// export default function Register() {
//   const nav = useNavigate();
//   const [params] = useSearchParams();
//   const token = params.get("token");

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [invite, setInvite] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!token) return setError("Invite token required");
//     (async () => {
//       // Prefer a pendingUsers doc keyed by the token (created by admin).
//       const pendingRef = doc(db, "pendingUsers", token);
//       let pendingSnap = await getDoc(pendingRef);

//       if (pendingSnap.exists()) {
//         const p = pendingSnap.data();
//         if (p.used) return setError("Token already used");
//         if (p.expiresAt?.toDate() < new Date()) return setError("Token expired");
//         setInvite({ ...p, pendingId: pendingSnap.id, from: "pendingUsers" });
//         setEmail(p.email);
//         return;
//       }

//       // Fallback: support legacy invites collection lookup by token or doc id
//       let snap = await getDoc(doc(db, "invites", token));
//       if (!snap.exists()) {
//         const q = query(
//           collection(db, "invites"),
//           where("token", "==", token),
//           limit(1)
//         );
//         const qs = await getDocs(q);
//         if (qs.empty) return setError("Invalid token");
//         snap = qs.docs[0];
//       }

//       const data = snap.data();
//       if (data.used) return setError("Token already used");
//       if (data.expiresAt?.toDate() < new Date()) return setError("Token expired");

//       setInvite({ ...data, id: snap.id, from: "invites" });
//       setEmail(data.email);
//     })();
//   }, [token]);

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (!invite) return;
//     try {
//       // Create Auth account
//       const userCred = await createUserWithEmailAndPassword(auth, email, password);
//       const role = invite.role || "user";

//       // Create the real users/{uid} document using invite/pending data
//       await setDoc(doc(db, "users", userCred.user.uid), {
//         email,
//         displayName: email.split("@")[0],
//         role,
//         credits: invite?.credits || 0,
//       });

//       // Consume pendingUsers if present
//       if (invite?.from === "pendingUsers" && invite?.pendingId) {
//         await updateDoc(doc(db, "pendingUsers", invite.pendingId), { used: true });
//         // Also mark the linked invite used if present
//         if (invite.inviteId) {
//           await updateDoc(doc(db, "invites", invite.inviteId), { used: true });
//         }
//       }

//       // Fallback: mark invites used if we came from the legacy invites collection
//       if (invite?.from === "invites" && invite?.id) {
//         await updateDoc(doc(db, "invites", invite.id), { used: true });
//       }

//       updateProfile(userCred.user, { displayName: email.split("@")[0] });
//       nav("/account");
//     } catch (err) {
//       if (err.code === "auth/email-already-in-use") {
//         try {
//           await sendPasswordResetEmail(auth, email);
//           setError(
//             "An account already exists for this email. We've sent a password reset link — please use it to set your password and then log in."
//           );
//         } catch (resetErr) {
//           setError(resetErr.message || "Unable to send password reset email.");
//         }
//       } else {
//         setError(err.message);
//       }
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-semibold mb-4">Register</h1>
//       {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
//       {!invite && !error && <p>Checking invite...</p>}
//       {invite && (
//         <form onSubmit={handleRegister} className="space-y-3">
//           <input className="input" value={email} disabled />
//           <input
//             className="input"
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button className="w-full py-2 bg-blue-600 text-white rounded-lg">Register</button>
//         </form>
//       )}
//     </div>
//   );
// }



































import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
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
  const [checkingInvite, setCheckingInvite] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invite token required.");
      setCheckingInvite(false);
      return;
    }

    (async () => {
      try {
        // Prefer a pendingUsers doc keyed by the token (created by admin).
        const pendingRef = doc(db, "pendingUsers", token);
        let pendingSnap = await getDoc(pendingRef);

        if (pendingSnap.exists()) {
          const p = pendingSnap.data();
          if (p.used) {
            setError("Token already used.");
          } else if (p.expiresAt?.toDate() < new Date()) {
            setError("Token expired.");
          } else {
            setInvite({ ...p, pendingId: pendingSnap.id, from: "pendingUsers" });
            setEmail(p.email);
          }
          setCheckingInvite(false);
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
          if (qs.empty) {
            setError("Invalid token.");
            setCheckingInvite(false);
            return;
          }
          snap = qs.docs[0];
        }

        const data = snap.data();
        if (data.used) {
          setError("Token already used.");
        } else if (data.expiresAt?.toDate() < new Date()) {
          setError("Token expired.");
        } else {
          setInvite({ ...data, id: snap.id, from: "invites" });
          setEmail(data.email);
        }
      } catch (err) {
        setError("Error checking invite. Please try again or contact support.");
      } finally {
        setCheckingInvite(false);
      }
    })();
  }, [token]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!invite) return;

    setSubmitting(true);
    setError("");

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

      await updateProfile(userCred.user, { displayName: email.split("@")[0] });
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur shadow-2xl rounded-2xl p-8 border border-slate-100">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">
            You&apos;re joining with an invite. Set your password to continue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Checking invite state */}
        {checkingInvite && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-sm text-slate-500">
            <span className="inline-block w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-3" />
            Checking your invite link...
          </div>
        )}

        {/* Form */}
        {!checkingInvite && invite && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={email}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Create Password
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                type="password"
                placeholder="Choose a secure password"
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
              {submitting ? "Creating account..." : "Register"}
            </button>
          </form>
        )}

        {/* No invite + no specific error (edge) */}
        {!checkingInvite && !invite && !error && (
          <p className="text-sm text-slate-500 text-center">
            Unable to load invite. Please check your link or contact support.
          </p>
        )}

        <p className="mt-6 text-xs text-center text-slate-400">
          If this invite looks wrong, close this page and ask your admin to resend a new link.
        </p>
      </div>
    </div>
  );
}
