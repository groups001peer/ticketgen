import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mail, 
  Bell, 
  MapPin, 
  Navigation, 
  Heart, 
  CreditCard, 
  HelpCircle, 
  MessageSquare, 
  Shield, 
  FileText,
  ChevronRight,
  Search,
  Ticket,
  Tag,
  User,
  Edit,
  X,
  Check
} from 'lucide-react';
import { useStore } from '../store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { countries as COUNTRIES_MAP } from "countries-list";

function AccountCountrySelector({ me, updateMe, initialCountry, onCountryChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  // build country list once
  const countries = useMemo(() => {
    return Object.entries(COUNTRIES_MAP)
      .map(([code, data]) => ({ code, name: data.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // filter list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countries, query]);

  // handle click outside to close dropdown
  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const choose = async (code) => {
    try {
      if (me?.balance < 20) {
        alert('Insufficient balance. You need 20 points to edit profile information.');
        return;
      }

      // Update Firestore
      const userRef = doc(db, 'users', me.uid);
      await updateDoc(userRef, {
        country: code,
        balance: me.balance - 20
      });

      // Update local state
      onCountryChange(code);
      await updateMe();
      setOpen(false);
    } catch (error) {
      console.error('Error updating country:', error);
      alert('Failed to update country. Please try again.');
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
      >
        <span className="font-medium">
          {initialCountry ? countries.find(c => c.code === initialCountry)?.name : 'Select Country'}
        </span>
        <Edit className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-xl z-50 border border-slate-200/10">
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country…"
              className="w-full px-3 py-1.5 text-base bg-slate-50 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="max-h-[280px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 text-center">
                No countries found
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  onClick={() => choose(c.code)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                    initialCountry === c.code ? "bg-blue-50 text-blue-600" : ""
                  }`}
                >
                  <span className={`fi fi-${c.code.toLowerCase()}`} />
                  <span className="truncate text-sm">{c.name}</span>
                  <span className="ml-auto text-xs text-slate-400 font-medium">
                    {c.code}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyAccount() {
  const nav = useNavigate();

  const { me, updateMe } = useStore();
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [locationBased, setLocationBased] = useState(false);
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    location: false,
    country: false
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    country: ''
  });

  useEffect(() => {
    if (me) {
      setFormData({
        name: me.displayName || '',
        email: me.email || '',
        location: me.location || '',
        country: me.country || ''
      });
    }
  }, [me]);
  
  const handleEdit = async (field) => {
    if (editMode[field]) {
      // Save changes
      if (me?.balance < 20) {
        alert('Insufficient balance. You need 20 points to edit profile information.');
        return;
      }

      try {
        const userRef = doc(db, 'users', me.uid);
        const updates = {
          balance: me.balance - 20
        };
        
        // Map fields to their database field names
        if (field === 'name') {
          updates.displayName = formData.name;
        } else if (field === 'email') {
          updates.email = formData.email;
        } else {
          updates[field] = formData[field];
        }

        await updateDoc(userRef, updates);
        await updateMe();
        setEditMode(prev => ({ ...prev, [field]: false }));
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    } else {
      // Enter edit mode
      setEditMode(prev => ({ ...prev, [field]: true }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Account Info Section */}
      <div className="bg-[#2C3E50] text-white px-6 pt-4 pb-6">
        <h1 className="text-2xl text-center font-semibold mb-4">My Account</h1>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex flex-col">
              {editMode.name ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-transparent border-b border-white text-xl font-medium focus:outline-none w-full mr-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleEdit('name');
                    }}
                    autoFocus
                  />
                  <button 
                    onClick={() => handleEdit('name')}
                    className="text-white"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <h2 
                  onClick={() => handleEdit('name')}
                  className="text-xl font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center"
                >
                  {formData.name || 'Add Name'}
                </h2>
              )}
              
              {editMode.email ? (
                <div className="flex items-center mt-1">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-transparent border-b border-white text-sm text-gray-300 focus:outline-none w-full mr-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleEdit('email');
                    }}
                    autoFocus
                  />
                  <button 
                    onClick={() => handleEdit('email')}
                    className="text-white"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <p 
                  onClick={() => handleEdit('email')}
                  className="text-gray-300 text-sm cursor-pointer hover:opacity-80 transition-opacity mt-1"
                >
                  {formData.email || 'Add Email'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        {/* Notifications Section */}
        <div className="px-6 pt-6">
          <h3 className="text-gray-800 font-semibold text-lg mb-4">Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">My Notifications</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Receive Notifications?</span>
              </div>
              <button
                onClick={() => setReceiveNotifications(!receiveNotifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  receiveNotifications ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    receiveNotifications ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 mx-6 my-6" />

        {/* Location Setting Section */}
        <div className="px-6">
          <h3 className="text-gray-800 font-semibold text-lg mb-4">Location Setting</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">My Location</span>
              </div>
              <div className="flex items-center gap-2">
                {editMode.location ? (
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Enter location"
                  />
                ) : (
                  <span className="text-blue-500 font-medium">{formData.location || 'Not set'}</span>
                )}
                <button 
                  onClick={() => handleEdit('location')}
                  className="text-blue-500"
                >
                  {editMode.location ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-5 rounded-full overflow-hidden">
                  <span className={`fi fi-${formData.country?.toLowerCase() || 'xx'} w-6 h-6 rounded-full`} />
                </div>
                <span className="text-gray-700">My Country</span>
              </div>
              <AccountCountrySelector 
                me={me} 
                updateMe={updateMe} 
                initialCountry={formData.country}
                onCountryChange={(country) => setFormData(prev => ({ ...prev, country }))}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Location Based Content</span>
              </div>
              <button
                onClick={() => setLocationBased(!locationBased)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  locationBased ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    locationBased ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 mx-6 my-6" />

        {/* Preference Section */}
        <div className="px-6">
          <h3 className="text-gray-800 font-semibold text-lg mb-4">Preference</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">My Favorites</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Saved Payment Methods</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 mx-6 my-6" />

        {/* Help & Guidance Section */}
        <div className="px-6 pb-24">
          <h3 className="text-gray-800 font-semibold text-lg mb-4">Help & Guidance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Need Help?</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Give Us Feedback</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Privacy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Legal</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
       <div onClick={()=>nav("/event")} className="cursor-pointer text-center text-xs py-10 text-slate-400">
        Back to Main App
      </div>
      </div>

    </div>
  );
}
