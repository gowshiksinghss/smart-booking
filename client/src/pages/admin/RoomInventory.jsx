import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Database, Plus, Trash2 } from 'lucide-react';

const RoomInventory = () => {
  const { 
    roomsList, setRoomsList,
    setShowAddRoomModal,
    triggerToast
  } = useOutletContext();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm text-slate-800 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
            <Database className="w-4.5 h-4.5 text-blue-600" />
            <span>Classroom Specification Inventory</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Catalog room capacities, block assignments, and visual equipment tags.</p>
        </div>

        <button
          onClick={() => setShowAddRoomModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2.5 px-4 rounded-xl shadow shadow-blue-500/10 uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Catalog Room</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roomsList.map((room) => (
          <div 
            key={room.id} 
            className="bg-slate-50 border border-slate-250 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-350 transition-all shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">{room.name}</h4>
                  <span className="text-[9px] font-mono text-[#0052cc] font-extrabold mt-1 block">ID: {room.id}</span>
                </div>
                <span className="text-[9px] bg-white border border-slate-200 text-slate-600 font-extrabold px-2 py-0.5 rounded">
                  {room.building}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-[10px] text-slate-500 border-t border-slate-200 pt-3 font-semibold">
                <p>Department: <span className="font-bold text-slate-800">{room.department}</span></p>
                <p>Seating Space: <span className="font-bold text-slate-800">{room.capacity} Chairs</span></p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {room.equipment?.map(eq => (
                    <span key={eq} className="bg-white text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end space-x-1">
              <button 
                onClick={() => {
                  setRoomsList(prev => prev.filter(r => r.id !== room.id));
                  triggerToast(`Room Specs for ${room.id} deleted.`);
                }}
                className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-slate-100 cursor-pointer"
                title="Delete Specs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomInventory;
