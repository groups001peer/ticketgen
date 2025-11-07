import { useState } from "react";
import { useStore } from "../store";

export default function BuyCredits(){
  const { createTopupRequest } = useStore();
  const [credits, setCredits] = useState(10);
  const [note, setNote] = useState("Telegram bulk");

  const openTelegram = () => {
    const url = "https://t.me/";
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-lg font-semibold mb-3">Buy Credit on Telegram</h1>
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        <div className="text-sm text-slate-600">Choose amount</div>
        <select className="input" value={credits} onChange={e=>setCredits(Number(e.target.value))}>
          {[10,20,50,100,200].map(n => <option key={n} value={n}>{n} credits</option>)}
        </select>
        <input className="input" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />

        <button
          className="w-full py-3 bg-blue-600 text-white rounded-lg"
          onClick={() => {
            createTopupRequest(credits, note);
            openTelegram();
          }}
        >
          Open Telegram & Create Request
        </button>
      </div>
    </div>
  );
}
