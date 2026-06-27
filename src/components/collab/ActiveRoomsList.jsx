// components/collab/ActiveRoomsList.js
import  { useState } from 'react';
import { mockApi } from '../../lib/mockApi';

export default function ActiveRoomsList({ rooms }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    await mockApi.createRoom({ name: newRoomName, members: ['currentUser'], projectId: null });
    setNewRoomName('');
    setShowCreate(false);
    window.location.reload(); // refresh list; in real app you'd update state
  };

  return (
    <div>
      <div className="text-base font-bold text-text-primary mb-5 flex items-center gap-2.5 uppercase tracking-wider border-l-[3px] border-accent pl-3">
        Active Rooms
      </div>
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-card p-0">
        {rooms.length === 0 && <div className="p-4 text-text-muted">No active rooms. Create one →</div>}
        {rooms.map(room => (
          <div key={room.id} className="p-4 border-b border-border flex justify-between items-center">
            <div>
              <div className="font-semibold text-text-primary">{room.name}</div>
              <div className="text-xs text-text-secondary">{room.members.length} members · last active {new Date(room.lastActive).toLocaleTimeString()}</div>
            </div>
            <button
              className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold border border-domain-backend text-domain-backend bg-[rgba(5,150,105,0.08)] cursor-pointer"
              onClick={() => alert(`Join room ${room.id} (Phase 2 real-time)`)}
            >
              Join Live →
            </button>
          </div>
        ))}
        <div className="px-4 py-3 border-t border-border">
          {!showCreate ? (
            <button
              className="w-full justify-center bg-accent-dim border-[1.5px] border-accent-border text-accent px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:bg-accent-bg hover:border-accent hover:-translate-y-px"
              onClick={() => setShowCreate(true)}
            >
              + Create new room
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text" placeholder="Room name" value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
                className="flex-1 bg-surface-2 border border-border px-3 py-2 rounded-lg text-text-primary outline-none"
              />
              <button onClick={handleCreateRoom} className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold border border-domain-backend text-domain-backend bg-[rgba(5,150,105,0.08)] cursor-pointer">Create</button>
              <button onClick={() => setShowCreate(false)} className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold border border-border bg-surface-2 text-text-secondary cursor-pointer">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
