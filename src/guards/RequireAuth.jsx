// import { me } from "../mocks";

// export default function RequireAuth({ children }) {
//   // Mocked auth: if no me, show simple message.
//   if (!me) return <div className="p-4">Please log in.</div>;
//   return children;
// }



import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "../store";

export default function RequireAuth({ children }) {
  const { me } = useStore();
  const loc = useLocation();
  if (!me) return <Navigate to={`/auth/login?next=${encodeURIComponent(loc.pathname+loc.search)}`} replace />;
  return children;
}
