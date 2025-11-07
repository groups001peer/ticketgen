import { useNavigate } from "react-router-dom";
import AvatarBalance from "../components/AvatarBalance";
import ListItem from "../components/ListItem";
import InstallPrompt from "../components/InstallPrompt";
import { useStore } from "../store";

export default function Account() {
  const nav = useNavigate();
  const { me } = useStore();

  return (
    <div>
      <div className="px-4 py-3">
        <button onClick={()=>nav(-1)} className="text-sm text-slate-500">×</button>
      </div>

      <h1 className="sr-only">My Account</h1>
  <AvatarBalance name={me?.displayName || "User"} balance={me?.credits ?? 0} />

      <div className="text-xs px-4 text-slate-500">Control Panel</div>
      <div className="mt-1 bg-white">
        <ListItem title="Create a Ticket ($2 per create)" onClick={()=>nav("/tickets/new")} />
        <ListItem title="Edit a Ticket info ($1 per edit)" onClick={()=>nav("/tickets/edit")} />
        <ListItem title="Delete tickets" onClick={()=>nav("/tickets/edit")} />
        <ListItem title="Show/hide tickets on My Events page" onClick={()=>nav("/tickets/edit")} />
        <ListItem title="Buy Credit on telegram (buy bulk for discount)" onClick={()=>nav("/buy-credits")} />
        <ListItem title="Contact Support Only (telegram only)" onClick={()=>nav("/support")} />
      </div>

      <div className="text-xs px-4 mt-6 text-slate-500">Account Controls</div>
      <div className="mt-1 bg-white">
        <ListItem title="Change Password" onClick={()=>nav("/settings/account")} />
        <ListItem title="Log out" onClick={()=>alert("Logged out (mock)")} />
      </div>
        <InstallPrompt />

      <div className="text-center text-xs py-10 text-slate-400">Back to Main App</div>
    </div>
  );
}
