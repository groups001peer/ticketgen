import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Check } from "lucide-react";

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const { me, updateMe } = useStore();
  const [editMode, setEditMode] = useState({
    title: false,
    dateDisplay: false,
    gate: false,
  });
  const [formData, setFormData] = useState({
    title: event.title,
    dateDisplay: event.dateDisplay,
    gate: event.gate,
  });

  const handleEdit = async (field) => {
    if (editMode[field]) {
      // Save changes
      if (me?.balance < 15) {
        alert('Insufficient balance. You need 15 points to edit event information.');
        setFormData(prev => ({ ...prev, [field]: event[field] })); // Reset to original
        setEditMode(prev => ({ ...prev, [field]: false }));
        return;
      }

      try {
        const eventRef = doc(db, "events", event.id);
        const userRef = doc(db, "users", me.uid);
        
        // Update event
        await updateDoc(eventRef, {
          [field]: formData[field]
        });
        
        // Deduct points
        await updateDoc(userRef, {
          balance: me.balance - 15
        });
        
        await updateMe();
        setEditMode(prev => ({ ...prev, [field]: false }));
      } catch (error) {
        console.error('Error updating event:', error);
        alert('Failed to update event. Please try again.');
        setFormData(prev => ({ ...prev, [field]: event[field] })); // Reset to original
      }
    } else {
      setEditMode(prev => ({ ...prev, [field]: true }));
    }
  };

  const handleClick = (e, field) => {
    if (Object.values(editMode).some(mode => mode)) {
      // If any field is being edited, prevent navigation
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    if (field) {
      e.preventDefault();
      e.stopPropagation();
      handleEdit(field);
    }
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') {
      handleEdit(field);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/tickets/${event.id}`)}
      className="mx-2 mb-4 mt-2 rounded-xl overflow-hidden shadow-md cursor-pointer"
    >
      <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-100">
        {event.bannerUrl ? (
          <img src={event.bannerUrl} alt="" className="w-full h-full object-cover opacity-80" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          {editMode.title ? (
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-transparent border-b border-white text-2xl font-bold focus:outline-none w-full"
                onKeyPress={(e) => handleKeyPress(e, 'title')}
                autoFocus
              />
              <button 
                onClick={(e) => handleEdit('title')}
                className="text-white p-1 hover:bg-white/20 rounded transition-colors"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div 
              className="text-2xl font-bold mb-1 cursor-text hover:opacity-80 transition-opacity"
              onClick={(e) => handleClick(e, 'title')}
            >
              {event.title}
            </div>
          )}

          <div className="flex items-center gap-1 mb-0.5">
            {editMode.dateDisplay ? (
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={formData.dateDisplay}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateDisplay: e.target.value }))}
                  className="bg-transparent border-b border-white text-xs focus:outline-none"
                  onKeyPress={(e) => handleKeyPress(e, 'dateDisplay')}
                  autoFocus
                />
                <button 
                  onClick={() => handleEdit('dateDisplay')}
                  className="text-white p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="text-xs cursor-text hover:opacity-80 transition-opacity"
                onClick={(e) => handleClick(e, 'dateDisplay')}
              >
                {event.dateDisplay}
              </div>
            )}
            
            <span className="text-xs mx-1">-</span>

            {editMode.gate ? (
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={formData.gate}
                  onChange={(e) => setFormData(prev => ({ ...prev, gate: e.target.value }))}
                  className="bg-transparent border-b border-white text-xs focus:outline-none"
                  onKeyPress={(e) => handleKeyPress(e, 'gate')}
                  autoFocus
                />
                <button 
                  onClick={() => handleEdit('gate')}
                  className="text-white p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="text-xs cursor-text hover:opacity-80 transition-opacity"
                onClick={(e) => handleClick(e, 'gate')}
              >
                {event.gate}
              </div>
            )}
          </div>
          
          <div className="text-xs font-medium">{event.tickets.length} tickets</div>
        </div>
      </div>
    </div>
  );
}

