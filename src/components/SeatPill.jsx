export default function SeatPill({ seat, selected, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-3 rounded-2xl shadow text-sm font-medium
        ${selected ? "bg-blue-600 text-white" : "bg-white"}`
      }
    >
      {`SEAT ${seat.seat}`}
    </button>
  );
}
