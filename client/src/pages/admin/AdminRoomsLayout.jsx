import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Database, Calendar } from 'lucide-react';
import RoomsInventory from './RoomsInventory';
import GlobalBookingsMatrix from './GlobalBookingsMatrix';

const AdminRoomsLayout = () => {
  const { 
    roomsList, 
    setRoomsList, 
    triggerToast 
  } = useOutletContext();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'matrix'

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 animate-fadeIn">
      
      {/* Top Header */}
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <Database className="w-4.5 h-4.5 text-blue-600" />
          <span>Institutional Venue Governance</span>
        </h3>
        <p className="text-[11px] text-slate-500 mt-1">
          Monitor room specifications and manage administrative scheduling overrides.
        </p>
      </div>

      {/* Sub-Module Tab Switcher Pill */}
      <div className="flex border-b border-slate-200 pb-px gap-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Rooms Inventory</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-2.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'matrix'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Global Bookings Matrix</span>
        </button>
      </div>

      {/* Nested Sub-Module Views */}
      {activeTab === 'inventory' ? (
        <RoomsInventory 
          roomsList={roomsList} 
          setRoomsList={setRoomsList} 
          triggerToast={triggerToast} 
        />
      ) : (
        <GlobalBookingsMatrix 
          roomsList={roomsList} 
          setRoomsList={setRoomsList} 
          triggerToast={triggerToast} 
        />
      )}

    </div>
  );
};

export default AdminRoomsLayout;
