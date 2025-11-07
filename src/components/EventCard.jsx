import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <Link to={`/tickets/${event.id}`} >
    <div className="mx-2 mb-4 mt-2 rounded-xl overflow-hidden shadow-md">
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-100">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt="" className="w-full h-full object-cover opacity-80" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <div className="text-2xl font-bold mb-1">{event.title}</div>
          <div className="text-xs mb-0.5">{event.dateDisplay}</div>
          <div className="text-xs font-medium">{event.tickets.length} tickets</div>
        </div>
      </div>
    </div>
    </Link>
  );
}

