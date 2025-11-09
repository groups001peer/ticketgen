// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import MyEvents from "./pages/MyEvents";
// import Account from "./pages/Account";
// import CreateTicket from "./pages/CreateTicket";
// import EditTickets from "./pages/EditTickets";
// import EditTicketForm from "./pages/EditTicketForm";
// import TicketDetails from "./pages/TicketDetails";
// import SettingsLocation from "./pages/SettingsLocation";
// import SettingsAccount from "./pages/SettingsAccount";
// import Support from "./pages/Support";
// import BuyCredits from "./pages/BuyCredits";
// import AdminInvites from "./pages/AdminInvites";
// import AdminTopups from "./pages/AdminTopups";
// import AdminUsers from "./pages/AdminUsers";
// import RequireAuth from "./guards/RequireAuth";
// import RequireAdmin from "./guards/RequireAdmin";
// import Shell from "./components/Shell";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Shell>
//         <Routes>
//           <Route path="/" element={<Navigate to="/account" replace />} />
//           <Route
//             path="/account"
//             element={
//               <RequireAuth>
//                 <Account />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/events"
//             element={
//               <RequireAuth>
//                 <MyEvents />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/tickets/new"
//             element={
//               <RequireAuth>
//                 <CreateTicket />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/tickets/edit"
//             element={
//               <RequireAuth>
//                 <EditTickets />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/tickets/:id/edit"
//             element={
//               <RequireAuth>
//                 <EditTicketForm />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/tickets/:id"
//             element={
//               <RequireAuth>
//                 <TicketDetails />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/settings/location"
//             element={
//               <RequireAuth>
//                 <SettingsLocation />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/settings/account"
//             element={
//               <RequireAuth>
//                 <SettingsAccount />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/support"
//             element={
//               <RequireAuth>
//                 <Support />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/buy-credits"
//             element={
//               <RequireAuth>
//                 <BuyCredits />
//               </RequireAuth>
//             }
//           />
//           <Route
//             path="/admin/invites"
//             element={
//               <RequireAdmin>
//                 <AdminInvites />
//               </RequireAdmin>
//             }
//           />
//           <Route
//             path="/admin/topups"
//             element={
//               <RequireAdmin>
//                 <AdminTopups />
//               </RequireAdmin>
//             }
//           />
//           <Route
//             path="/admin/users"
//             element={
//               <RequireAdmin>
//                 <AdminUsers />
//               </RequireAdmin>
//             }
//           />
//           {/* Auth pages will be added in Section 2 */}
//           <Route path="*" element={<Navigate to="/events" replace />} />
//         </Routes>
//       </Shell>
//     </BrowserRouter>
//   );
// }












import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./store";
import Shell from "./components/Shell";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Regular user pages
import MyEvents from "./pages/MyEvents";
import CreateTicket from "./pages/CreateTicket";
import EditTickets from "./pages/EditTickets";
import EditTicketForm from "./pages/EditTicketForm";
import TicketDetails from "./pages/TicketDetails";
import SettingsLocation from "./pages/SettingsLocation";
import SettingsAccount from "./pages/SettingsAccount";
import Support from "./pages/Support";
import BuyCredits from "./pages/BuyCredits";

// Admin pages
import AdminInvites from "./pages/AdminInvites";
import AdminTopups from "./pages/AdminTopups";
import AdminUsers from "./pages/AdminUsers";

// Guards
import RequireAuth from "./guards/RequireAuth";
import RequireAdmin from "./guards/RequireAdmin";
import AdminLogin from "./pages/AdminLogin";
import InstallButton from "./components/InstallButton";
import ForYou from "./pages/ForYou";
import MyAccount from "./pages/Account";

export default function App() {
  const { loading } = useStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes (public) */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        <Route path="/auth/admin" element={<AdminLogin />} />
        {/* Protected routes (inside Shell) */}
        {/* Ticket details route is intentionally outside Shell but still requires auth */}
        <Route
          path="/tickets/:id"
          element={
            <RequireAuth>
              <TicketDetails />
            </RequireAuth>
          }
        />
        <Route
          path="tickets/new" 
          element={
            <RequireAuth>
              <CreateTicket />
            </RequireAuth>
          }
        />
        <Route
          path="tickets/edit" 
          element={
            <RequireAuth>
              <EditTickets />
            </RequireAuth>
          }
        />
        <Route
          path="tickets/:id/edit" 
          element={
            <RequireAuth>
              <EditTicketForm />
            </RequireAuth>
          }
        />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="account" element={<MyAccount />} />
          <Route path="for-you" element={<ForYou />} />
          <Route path="events" element={<MyEvents />} />
          {/* <Route path="tickets/new" element={<CreateTicket />} /> */}
          {/* <Route path="tickets/edit" element={<EditTickets />} /> */}
          {/* <Route path="tickets/:id/edit" element={<EditTicketForm />} /> */}
          <Route path="settings/location" element={<SettingsLocation />} />
          <Route path="settings/account" element={<SettingsAccount />} />
          <Route path="support" element={<Support />} />
          <Route path="buy-credits" element={<BuyCredits />} />

          {/* Admin routes */}
          <Route
            path="admin/invites"
            element={
              <RequireAdmin>
                <AdminInvites />
              </RequireAdmin>
            }
          />
          <Route
            path="admin/topups"
            element={
              <RequireAdmin>
                <AdminTopups />
              </RequireAdmin>
            }
          />
          <Route
            path="admin/users"
            element={
              <RequireAdmin>
                <AdminUsers />
              </RequireAdmin>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Route>
      </Routes>
            <InstallButton />

    </BrowserRouter>
  );
}
