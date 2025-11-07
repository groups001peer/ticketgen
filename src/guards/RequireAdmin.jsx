// import { Navigate } from "react-router-dom";
// import { useStore } from "../store";

// export default function RequireAdmin({ children }) {
//   const { me } = useStore();
//   if (!me) return <Navigate to="/auth/login" replace />;
//   if (!me.isAdmin) return <div className="p-4">Admins only.</div>;
//   return children;
// }











import { Navigate } from "react-router-dom";
import { useStore } from "../store";

export default function RequireAdmin({ children }) {
  const { me, loading } = useStore();
  if (loading) return null;
  if (!me) return <Navigate to="/auth/login" replace />;
  if (me.role !== "admin") return <div className="p-4">Admins only.</div>;
  return children;
}
