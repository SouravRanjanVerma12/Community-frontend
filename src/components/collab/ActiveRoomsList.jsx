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
      <div className="section-title">
         Active Rooms
      </div>
      <div className="card" style={{ padding: '0' }}>
        {rooms.length === 0 && <div style={{ padding: '16px', color: 'var(--txt3)' }}>No active rooms. Create one →</div>}
        {rooms.map(room => (
          <div key={room.id} style={{ padding: '16px', borderBottom: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{room.name}</div>
              <div style={{ fontSize: 12, color: 'var(--txt2)' }}>{room.members.length} members · last active {new Date(room.lastActive).toLocaleTimeString()}</div>
            </div>
            <button className="badge badge-teal" style={{ cursor: 'pointer' }} onClick={() => alert(`Join room ${room.id} (Phase 2 real-time)`)}>Join Live →</button>
          </div>
        ))}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--bd)' }}>
          {!showCreate ? (
            <button className="add-task-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowCreate(true)}>+ Create new room</button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Room name" value={newRoomName} onChange={e => setNewRoomName(e.target.value)} style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--bd)', padding:'6px 10px', borderRadius:'var(--radius)', color:'var(--txt1)' }} />
              <button onClick={handleCreateRoom} className="badge badge-teal">Create</button>
              <button onClick={() => setShowCreate(false)} className="badge">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}