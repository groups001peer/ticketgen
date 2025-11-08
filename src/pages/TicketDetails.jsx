import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomSheet from "../components/BottomSheet";
import Toast from "../components/Toast";
import { Dot, WalletCards, X } from "lucide-react";
import { db } from "../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

/**
 * Ticketmaster-like slide card:
 * - Blue rounded header "General Admission" + SEC/ROW/SEAT
 * - Banner image with gradient and title
 * - Wallet button, links row, verified pill
 * - Dots + Transfer/Sell
 */

export default function TicketDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [ev, setEv] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [selected, setSelected] = useState({});
  const [recipient, setRecipient] = useState({ name: "", contact: "" });
  const [stage, setStage] = useState(1);
  const [toast, setToast] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  // fetch event
  useEffect(() => {
    const ref = doc(db, "events", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) { setEv(null); return; }
      setEv({ id: snap.id, ...snap.data() });
      setActiveIdx(0);
    });
    return () => unsub();
  }, [id]);

  // transfer (remove selected tickets)
  const transferSeats = async (eventId, seatIds) => {
    if (!ev) return;
    const remaining = ev.tickets.filter(t => !seatIds.includes(t.id || t.seat));
    try {
      await updateDoc(doc(db, "events", eventId), { tickets: remaining });
    } catch (err) {
      console.error(err);
    }
  };

  const toggle = (seatId) =>
    setSelected(s => ({ ...s, [seatId]: !s[seatId] }));
  const chosen = Object.keys(selected).filter(k => selected[k]);
  if (!ev) return <div className="p-4">Not found.</div>;

  return (
    <>
      {/* Header bar */}
      <div className="fixed top-0 inset-x-0 bg-[#1f2937] text-white z-30 md:max-w-sm mx-auto">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => nav("/events")} className="p-1">
            <X className="w-5 h-5" />
          </button>
          <div className="font-semibold text-sm">My Tickets</div>
          <button className="text-xs font-medium opacity-80">Help</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="pt-16 px-2 pb-28 min-h-screen">

        {/* SLIDES */}
        <TicketCarousel
          tickets={ev.tickets || []}
          bannerUrl={ev.bannerUrl}
          title={ev.title}
          date={ev.dateDisplay}
          venue={ev.venue}
          activeIdx={activeIdx}
          gate={ev.gate}
          setActiveIdx={setActiveIdx}
        />

        {/* Action buttons under the carousel (fixed spacing like reference) */}
        <div className="mt-12 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => { setStage(1); setSheet(true); }}
              className="flex-1 py-3.5 bg-[#2563eb] text-white rounded-2xl font-semibold text-sm shadow-md"
            >
              Transfer
            </button>
            <button
              disabled
              className="flex-1 py-3.5 bg-slate-200 text-slate-400 rounded-2xl font-semibold text-sm"
            >
              Sell
            </button>
          </div>
        </div>
      </div>

      {/* Transfer Sheet */}
      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        title={stage === 1 ? "SELECT TICKETS TO TRANSFER" : "TRANSFER TO"}
      >
        {stage === 1 ? (
          <SeatPicker ev={ev} selected={selected} onToggle={toggle} />
        ) : (
          <RecipientForm recipient={recipient} setRecipient={setRecipient} />
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            className="text-sm text-slate-500"
            onClick={() => (stage === 1 ? setSheet(false) : setStage(1))}
          >
            Back
          </button>
          {stage === 1 ? (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
              disabled={!chosen.length}
              onClick={() => setStage(2)}
            >
              TRANSFER TO &gt;
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
              disabled={!recipient.name || !recipient.contact || !chosen.length}
              onClick={() => {
                transferSeats(ev.id, chosen);
                setSheet(false);
                setSelected({});
                setRecipient({ name: "", contact: "" });
                setStage(1);
                setToast("Transfer started");
                nav("/events");
              }}
            >
              Confirm Transfer
            </button>
          )}
        </div>
      </BottomSheet>

      <Toast text={toast} open={!!toast} onClose={() => setToast("")} />
    </>
  );
}

/* ===================================================================================== */
/* Carousel (Ticketmaster style)                                                          */
/* - horizontal scroll-snap                                                               */
/* - page width card with subtle side peek on small screens                               */
/* - dots indicator                                                                       */
/* ===================================================================================== */

function TicketCarousel({ tickets, gate, bannerUrl, title, date, venue, activeIdx, setActiveIdx }) {
  const timerRef = useRef(null);

  // Auto-advance slides every 2 seconds
  useEffect(() => {
    if (tickets.length <= 1) return;
    
    const advance = () => {
      setActiveIdx(current => (current + 1) % tickets.length);
    };

    timerRef.current = setInterval(advance, 2000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [tickets.length, setActiveIdx]);

  // Handle dot click
  const goToSlide = (index) => {
    setActiveIdx(index);
    // Reset timer when manually changing slides
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveIdx(current => (current + 1) % tickets.length);
      }, 2000);
    }
  };

  return (
    <div className="mt-3">
      {/* track */}
      <div className="relative px-4">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${activeIdx * 100}%)`,
            }}
          >
            {tickets.map((t, idx) => (
              <SlideCard
                key={t.id || t.seat || idx}
                seat={t}
                gate={gate}
                bannerUrl={bannerUrl}
                title={title}
                date={date}
                venue={venue}
                className="w-full shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="flex justify-center gap-2 mt-16">
        {tickets.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === activeIdx ? "bg-blue-600 scale-125" : "bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function SlideCard({ seat, gate, bannerUrl, title, date, venue, className = "" }) {
  return (
    <div className={`bg-white rounded-[22px] overflow-hidden ${className}`}>
      {/* Blue header pill */}
      <div className="bg-[#1E5BFF] text-white px-6 pt-4 pb-5 rounded-t-[22px]">
        <div className="text-[15px] font-semibold text-center mb-3 tracking-wide">
          General Admission
        </div>
        <div className="w-full flex items-center justify-between">
          <Badge label="SEC" value={seat.section} />
          <Badge label="ROW" value={seat.row} />
          <Badge label="SEAT" value={seat.seat} />
        </div>
      </div>

      {/* Banner with overlay title */}
      {bannerUrl && (
        <div className="relative h-40">
          <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/30 to-transparent" />
          <div className="absolute text-center bottom-3 left-4 right-4 text-white">
            <div className="font-semibold text-lg leading-tight">{title}</div>
            <div className="text-[15px] opacity-90 mt-1 flex justify-center items-center">{date} <Dot /> {venue}</div>
            {/* <div className="text-[11px] opacity-80">{venue}</div> */}
          </div>
        </div>
      )}
      <h1 className="text-center py-2 font-medium text-gray-800 text-[13px]">{gate}</h1>
      {/* Content */}
      <div className="px-6 pb-5">
        {/* Wallet button */}
        <button className="w-full py-3 bg-black text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2">
          {/* <span className="w-4 h-4 bg-white/30 rounded-sm" /> */}
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b2/Apple_Wallet_Icon.svg" className="w-4 h-4" alt="" />
          Add to Apple Wallet
        </button>

        {/* Links row */}
        <div className="flex justify-center gap-12 text-xs text-blue-600 font-medium mt-7">
          <button className="text-[16px] font-semibold">View Barcode</button>
          <button className="text-[16px] font-semibold">Ticket Details</button>
        </div>

      </div>
        {/* Verified pill */}
        <button className="mt-8 w-full bg-[#1E5BFF] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
          <img src="https://omwtfyh69.site/progress/vendor/slick/fonts/tixapp/assets/img/icon/verifiedbytix.png" className="w-full scale-75 object-cover" alt="" />
          {/* ticketmaster verified */}
        </button>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-[11px] font-medium opacity-90 tracking-wide">{label}</div>
      <div className="text-[15px] font-bold leading-5">{value}</div>
    </div>
  );
}

/* ========================= Transfer Sheet pieces ========================= */

function SeatPicker({ ev, selected, onToggle }) {
  return (
    <>
      <div className="text-sm mb-2">
        {ev.tickets[0] ? `Sec ${ev.tickets[0].section}, Row ${ev.tickets[0].row}` : "No seats"}
        <span className="text-slate-500"> — {ev.tickets.length} Tickets</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ev.tickets.map((t) => {
          const id = t.id || t.seat;
          const sel = !!selected[id];
          return (
            <button
              key={id}
              onClick={() => onToggle(id)}
              className={`px-4 py-3 rounded-2xl shadow text-sm font-medium ${sel ? "bg-blue-600 text-white" : "bg-white"}`}
            >
              {`SEAT ${t.seat}`}
            </button>
          );
        })}
      </div>
    </>
  );
}

function RecipientForm({ recipient, setRecipient }) {
  return (
    <div className="space-y-3">
      <div className="text-sm">Enter recipient details</div>
      <input
        className="input"
        placeholder="Recipient name"
        value={recipient.name}
        onChange={e => setRecipient({ ...recipient, name: e.target.value })}
      />
      <input
        className="input"
        placeholder="Email or phone"
        value={recipient.contact}
        onChange={e => setRecipient({ ...recipient, contact: e.target.value })}
      />
      <p className="text-[11px] text-slate-500">We’ll send the transfer link to this contact (mock).</p>
    </div>
  );
}
