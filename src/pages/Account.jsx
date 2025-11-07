import { useNavigate } from "react-router-dom";
import AvatarBalance from "../components/AvatarBalance";
import ListItem from "../components/ListItem";
import InstallPrompt from "../components/InstallPrompt";
import { useStore } from "../store";
import { X } from "lucide-react";

export default function Account() {
  const nav = useNavigate();
  const { me, signOut } = useStore();

  const handleLogout = async () => {
    try {
      await signOut();
      nav("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div>
      <div className="px-4 py-3">
        <button onClick={()=>nav(-1)} className="text-sm text-slate-500"><X /></button>
      </div>

      {/* <h1 className="sr-only text-black text-lg">My Account</h1> */}
      {/* <div className="px-4 text-xs text-slate-500">Balance: {((me?.balance) ?? 0).toFixed(2)} {" "} Pts</div> */}
      <AvatarBalance name={me?.displayName || "User"} balance={me?.balance ?? 0} />

      <div className="text-xs px-4 text-slate-500">Control Panel</div>
      <div className="mt-1 bg-white">
        <ListItem title="Create a Ticket (50 Pts per create)" onClick={()=>nav("/tickets/new")} />
        <ListItem title="Edit a Ticket info (30 Pts per edit)" onClick={()=>nav("/tickets/edit")} />
        <ListItem title="Delete tickets" onClick={()=>nav("/tickets/edit")} />
        <ListItem title="Show/hide tickets on My Events page" onClick={()=>nav("/tickets/edit")} />
        <ListItem title="Buy Credit on telegram (buy bulk for discount)" onClick={()=>nav("/buy-credits")} />
        <ListItem title="Contact Support Only (telegram only)" onClick={()=>nav("/support")} />
      </div>

      <div className="text-xs px-4 mt-6 text-slate-500">Account Controls</div>
      <div className="mt-1 bg-white">
        <ListItem title="Change Password" onClick={()=>nav("/settings/account")} />
        <ListItem title="Log out" onClick={handleLogout} />
      </div>
        <InstallPrompt />

      <div onClick={()=>nav("/event")} className="cursor-pointer text-center text-xs py-10 text-slate-400">
        Back to Main App
      </div>
    </div>
  );
}
