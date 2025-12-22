
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import head from "../assets/head.jpg";
import phone from "../assets/phone.png";

import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
} from "firebase/firestore";
import { useStore } from "../store";
import Toast from "../components/Toast";
import { X, MapPin, CalendarDays, Ticket as TicketIcon } from "lucide-react";

/**
 * TicketTemplate:
 * - Before generate: search + preview
 * - After generate: template fills EXACTLY 100vh (no page scroll)
 *   and template body becomes scrollable INSIDE the 100vh frame,
 *   so "Go to Home" is only visible when user scrolls down.
 */

export default function TicketTemplate() {
  const nav = useNavigate();
  const { me } = useStore();

  const TEMPLATE_COST = 30;

  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventDoc, setEventDoc] = useState(null);
  const [toast, setToast] = useState("");

  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const canSearch = useMemo(() => searchId.trim().length > 3, [searchId]);

  const displayName =
    me?.displayName ||
    me?.name ||
    me?.fullName ||
    (me?.email ? me.email.split("@")[0] : "friend");

  async function findTicketByTemplateId() {
    const id = searchId.trim();
    if (!id) return setToast("Enter your Ticket ID");
    setLoading(true);
    setEventDoc(null);
    setGenerated(false);

    try {
      const q = query(
        collection(db, "events"),
        where("ticketTemplateId", "==", id)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setToast("No ticket found for that Ticket ID.");
        return;
      }

      const d = snap.docs[0];
      setEventDoc({ id: d.id, ...d.data() });
    } catch (err) {
      setToast(err?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function generateTemplate() {
    if (!me?.uid) return setToast("You must be signed in");
    if (!eventDoc?.id) return setToast("Search and select a ticket first");
    if (generated) return;

    setGenerating(true);
    try {
      await runTransaction(db, async (tx) => {
        const userRef = doc(db, "users", me.uid);
        const userSnap = await tx.get(userRef);

        const balance =
          userSnap.exists() && userSnap.data().balance
            ? userSnap.data().balance
            : 0;

        if (balance < TEMPLATE_COST) throw new Error("INSUFFICIENT_BALANCE");

        tx.update(userRef, { balance: balance - TEMPLATE_COST });

        const eventRef = doc(db, "events", eventDoc.id);
        tx.update(eventRef, {
          templateGeneratedAt: new Date().toISOString(),
          templateGeneratedBy: me.uid,
        });
      });

      setGenerated(true);
      setToast("Template generated!");
    } catch (err) {
      if (err?.message === "INSUFFICIENT_BALANCE") {
        setToast("Insufficient credits. You need 30 pts to generate a template.");
      } else {
        setToast(err?.message || "Failed to generate template");
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f16]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-12 bg-black/30">
        <button onClick={() => nav(-1)} className="text-white/70 text-sm">
          <X />
        </button>
        <div className="font-medium text-white">Ticket Template</div>
        <div className="w-5" />
      </div>

      {/* BEFORE generation */}
      {!generated ? (
        <div className="px-4 pb-24">
          <div className="mt-3">
            <div className="text-[11px] text-white/60 mb-2">
              Enter your Ticket ID (Template ID) to fetch ticket details.
            </div>

            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="E.g TCKT-20251222-8F3K2H9Q"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-white text-black text-sm disabled:opacity-60"
                onClick={findTicketByTemplateId}
                disabled={!canSearch || loading}
              >
                {loading ? "Searching…" : "Search"}
              </button>
            </div>

            {eventDoc ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white">
                      {eventDoc.title}
                    </div>
                    <div className="text-xs text-white/60">
                      {eventDoc.dateDisplay}
                    </div>
                    <div className="text-xs text-white/60">{eventDoc.venue}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-white/60">Ticket ID</div>
                    <code className="text-[11px] px-2 py-1 rounded bg-black/30 border border-white/10 text-white/80">
                      {eventDoc.ticketTemplateId || "—"}
                    </code>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-white/60">
                  Cost to generate template:{" "}
                  <span className="font-medium text-white">30 pts</span>
                </div>

                <button
                  type="button"
                  className="mt-3 w-full py-3 bg-[#3b82f6] text-white rounded-xl font-medium disabled:opacity-60"
                  onClick={generateTemplate}
                  disabled={generating}
                >
                  {generating ? "Generating…" : "Generate Template (30 pts)"}
                </button>
              </div>
            ) : (
              <div className="mt-4 text-xs text-white/60">
                Search to load ticket details.
              </div>
            )}
          </div>

          {/* Home button for non-generated state */}
          {/* <div className="mt-10">
            <button
              type="button"
              className="w-full py-3 bg-[#2563eb] text-white rounded-xl font-medium"
              onClick={() => nav("/event")}
            >
              Go to Home
            </button>
          </div> */}

          <Toast text={toast} open={!!toast} onClose={() => setToast("")} />
        </div>
      ) : (
        // AFTER generation: EXACT 100vh template, internal scroll
        <>
          <ExactTicketTemplate100vh
            ev={eventDoc}
            name={displayName}
            onHome={() => nav("/event")}
          />
          <Toast text={toast} open={!!toast} onClose={() => setToast("")} />
        </>
      )}
    </div>
  );
}

/**
 * 100vh frame:
 * - height: calc(100vh - topbarHeight) => we use "h-[calc(100vh-3rem)]" (3rem = 48px)
 * - internal scroll container so the page itself doesn't scroll
 * - "Go to Home" sits at the very bottom of the scroll content, so user must scroll down to see it
 */
function ExactTicketTemplate100vh({ ev, name, onHome }) {
  const tickets = Array.isArray(ev?.tickets) ? ev.tickets : [];
  const seatLine = buildSeatSummary(tickets);
  const orderNumber = ev?.ticketTemplateId || ev?.id || "—";

  const title = ev?.title || "—";
  const dateDisplay = ev?.dateDisplay || "—";
  const venue = ev?.venue || "—";
  const squareImage = ev?.bannerUrl || null;

  return (
    <div className="h-[calc(100vh-3rem)]">
      {/* The scrollable content */}
      <div className="h-full overflow-y-auto overscroll-contain">
        {/* Header image section */}
        <div className="relative w-full h-[150px] overflow-hidden">
          <img src={head} alt="Header" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="text-[22px] font-extrabold text-black drop-shadow">
              You Got the Tickets
              <br />
              You’re in {name}.
            </div>
            <div className="mt-2 text-xs text-black/90">
              Order <span className="font-semibold">#{orderNumber}</span>
            </div>
          </div>
        </div>

        {/* Main dark content */}
        <div className="bg-gray-800 px-4 pt-4 pb-6">
          {/* Ticket card */}
          <div className="mx-auto max-w-md rounded-lg p-2">
            <div className="flex gap-4">
              <div className="w-[120px] h-[150px] bg-[#0f141c] rounded-sm overflow-hidden shrink-0 border border-white/10">
                {squareImage ? (
                  <img
                    src={squareImage}
                    alt="Event"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5" />
                )}
              </div>

              <div className="flex-1">
                <div className="text-white text-md font-semibold leading-tight">
                  {title}
                </div>

                <div className="mt-1 space-y-1 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 text-white/40" />
                    <span>{dateDisplay}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-white/40" />
                    <span>{venue}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <TicketIcon className="w-3 h-3 text-white/40" />
                    <span>{seatLine || `${tickets.length || 0}x Ticket(s)`}</span>
                  </div>
                </div>

                <div className="mt-1 text-xs font-semibold text-[#60a5fa]">
                  Get Directions
                </div>

                <button
                  type="button"
                  className="mt-2 w-[140px] max-w-full py-2 rounded bg-[#3b82f6] text-white text-sm font-medium"
                >
                  View Mobile Ticket
                </button>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-md mt-6 h-px bg-blue-400/70" />

          <div className="mx-auto max-w-md mt-4 text-[11px] text-white/60 leading-relaxed bg-white/5 border border-white/10 rounded-md px-3 py-2">
            <span className="text-white/70 font-medium">Please Note:</span>{" "}
            As official local health guidelines evolve regarding safety protocols, the
            venue may shift seating configurations and increase capacity.
          </div>

          <div className="mx-auto max-w-md mt-6 flex items-center justify-center">
            <div className="w-44 h-14 rounded-md flex items-center justify-center">
              <img src={phone} alt="" />
            </div>
          </div>

          <div className="mx-auto max-w-md mt-6 text-center">
            <div className="text-[#60a5fa] font-semibold text-base">
              Going With Friends?
            </div>
            <div className="mt-2 text-[11px] text-white/60 leading-relaxed px-4">
              Transfer your tickets ahead of time to everyone in your crew to help make
              sure everyone gets in safely and quickly.
            </div>

            <button
              type="button"
              className="mt-4 w-full py-2 rounded border border-[#60a5fa]/40 text-[#93c5fd] text-sm bg-white/5"
            >
              Manage My Tickets
            </button>
          </div>
        </div>

        <div className="bg-[#2563eb] px-4 py-4">
          <div className="mx-auto max-w-md">
            <div className="text-white font-semibold text-sm">
              Your Phone’s Your Ticket
            </div>
            <div className="text-white/80 text-[11px] mt-1">
              Download our app and sign in.
            </div>
          </div>
        </div>

        {/* ✅ Home button ONLY at the bottom of the scroll content */}
        <div className="bg-[#0b0f16] px-4 pt-40 py-6">
          <div className="mx-auto max-w-md">
            <button
              type="button"
              className="w-full py-3 bg-[#2563eb] text-white rounded-xl font-medium"
              onClick={onHome}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSeatSummary(tickets) {
  if (!tickets?.length) return "";

  const count = tickets.length;

  const isGA = tickets.every(
    (t) => String(t?.section ?? "").toUpperCase() === "GA" || t?.row === "-"
  );
  if (isGA) return `${count}x Tickets - General Admission`;

  const sections = new Set(tickets.map((t) => String(t.section ?? "").trim()));
  const rows = new Set(tickets.map((t) => String(t.row ?? "").trim()));
  const sameSection = sections.size === 1 ? [...sections][0] : null;
  const sameRow = rows.size === 1 ? [...rows][0] : null;

  const seatNums = tickets
    .map((t) => String(t.seat ?? "").trim())
    .filter(Boolean);

  const seatRange = compressSeatRange(seatNums);

  let s = `${count}x Tickets`;
  if (sameSection) s += ` - Sec ${sameSection}`;
  if (sameRow) s += ` Row ${sameRow}`;
  if (seatRange) s += ` Seat (${seatRange})`;
  return s;
}

function compressSeatRange(seats) {
  const nums = seats.map((x) => Number(x)).filter((n) => Number.isFinite(n));

  if (nums.length === seats.length && nums.length > 0) {
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return min === max ? String(min) : `${min}-${max}`;
  }

  if (!seats.length) return "";
  if (seats.length <= 2) return seats.join("-");
  if (seats.length <= 3) return seats.join(", ");
  return `${seats[0]}, ${seats[1]}, ${seats[2]}…`;
}
