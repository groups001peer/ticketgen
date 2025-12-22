// import { useState } from "react";
// import { useStore } from "../store";

// export default function BuyCredits(){
//   const { createTopupRequest } = useStore();
//   // minimum points is 250 (₦5,000). conversion: 1 point = ₦20
//   const [credits, setCredits] = useState(250);
//   const [note, setNote] = useState("");



//   return (
//     <div className="px-4 pt-6 pb-24">
//       <h1 className="text-lg font-semibold mb-3">Buy Credit on Telegram</h1>
//       <div className="bg-white rounded-xl p-4 shadow space-y-3">
//         <div className="text-sm text-slate-600">Choose amount (minimum 250 points = $10)</div>
//         <select className="input" value={credits} onChange={e=>setCredits(Number(e.target.value))}>
//           {[250,500,1000,2000,5000].map(n => <option key={n} value={n}>{n} points</option>)}
//         </select>
//         <input className="input" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />

//         <button
//           className="w-full py-3 bg-blue-600 text-white rounded-lg"
//           onClick={() => {
//             // create a topup request if the store exposes the function
//             if (typeof createTopupRequest === 'function') {
//               try { createTopupRequest(credits, note); } catch (e) { console.warn(e); }
//             }

//             // build a prefilled Telegram share message with points and naira amount
//             const naira = credits * 20;
//             const text = `Hello, I'd like to buy ${credits} points (${naira.toLocaleString()} NGN). ${note || ''}`;
//             const tgUrl = `https://t.me/share/url?url=&text=${encodeURIComponent(text)}`;
//             window.open(tgUrl, "_blank", "noopener");
//           }}
//         >
//           Open Telegram & Create Request
//         </button>
//       </div>
//     </div>
//   );
// }






import { useState } from "react";
import { useStore } from "../store";

export default function BuyCredits(){
  const { createTopupRequest } = useStore();

  // minimum points is 250 ($30). conversion: 1 point = $0.12
  const [credits, setCredits] = useState(250);
  const [note, setNote] = useState("");

  // === Configuration Update ===
  // 1. Set the correct Telegram ID/Username for direct messaging.
  const telegramTarget = "ticketgen"; // <<< REPLACE THIS

  // Correct conversion
  const usdPerPoint = 0.12; // 1 point = $0.12 → 250 pts = $30
  const usdAmount = credits * usdPerPoint;

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-lg font-semibold mb-3">Buy Credit on Telegram</h1>
      <div className="bg-white rounded-xl p-4 shadow space-y-3">
        {/* Updated text for minimum and currency */}
        <div className="text-sm text-slate-600">Choose amount (minimum 250 points = $10)</div>
        <select className="input" value={credits} onChange={e=>setCredits(Number(e.target.value))}>
          {[250,500,1000,2000,5000].map(n => <option key={n} value={n}>{n} points</option>)}
        </select>

        <input
          className="input"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <button
          className="w-full py-3 bg-blue-600 text-white rounded-lg"
          onClick={() => {
            if (typeof createTopupRequest === "function") {
              try { createTopupRequest(credits, note); } catch (e) { console.warn(e); }
            }

            // Prefilled Telegram message
            const text = `Hello, I'd like to buy ${credits} points (${usdAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}). ${note || ''}`;

            // Open Telegram DM
            const tgUrl = `https://t.me/${telegramTarget}?text=${encodeURIComponent(text)}`;

            window.open(tgUrl, "_blank", "noopener");
          }}
        >
          Open Telegram & Create Request
        </button>
      </div>
    </div>
  );
}
