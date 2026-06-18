// components/collab/ActiveRoomsList.jsx
import { useState, useEffect } from "react";
import { mockApi } from "../../lib/mockApi";
import styles from "../../styles/collab.module.css";

const ActiveRoomsList = ({ rooms, onRoomCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [membersInput, setMembersInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user's projects when modal opens
  useEffect(() => {
    if (showModal) {
      mockApi.getProjects().then(setProjects);
    }
  }, [showModal]);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert("Room name is required.");
      return;
    }

    setLoading(true);
    // Parse members: split by comma, trim, remove empty
    const memberIds = membersInput
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m && m !== "currentUser");
    // Always add current user
    const allMembers = ["currentUser", ...memberIds];

    const roomData = {
      name: newRoomName.trim(),
      members: allMembers,
      projectId: selectedProjectId || null,
      lastActive: Date.now(),
    };
    const newRoom = await mockApi.createRoom(roomData);
    setLoading(false);

    // Notify parent to refresh rooms list (without page reload)
    if (onRoomCreated) onRoomCreated(newRoom);
    // Reset and close
    setShowModal(false);
    setNewRoomName("");
    setSelectedProjectId("");
    setMembersInput("");
    alert(`Room "${newRoom.name}" created!`);
  };

  return (
    <div>
      <div className={styles.sectionTitle}>Active Rooms</div>
      <div className={styles.card} style={{ padding: "0" }}>
        {rooms.length === 0 && (
          <div style={{ padding: "16px", color: "var(--txt3)" }}>
            No active rooms. Create one →
          </div>
        )}
        {rooms.map((room) => (
          <div
            key={room.id}
            style={{
              padding: "16px",
              borderBottom: "1px solid var(--bd)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{room.name}</div>
              <div style={{ fontSize: 12, color: "var(--txt2)" }}>
                {room.members.length} members · last active{" "}
                {new Date(room.lastActive).toLocaleTimeString()}
                {room.projectId && ` · Project: ${room.projectId}`}
              </div>
            </div>
            <button
              className={styles.badgeTeal}
              onClick={() => alert(`Join room ${room.id} (Phase 2 real-time)`)}
            >
              Join Live →
            </button>
          </div>
        ))}
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--bd)" }}>
          <button
            className={styles.addTaskBtn}
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => setShowModal(true)}
          >
            + Create new room
          </button>
        </div>
      </div>

      {/* Modal for creating room */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Create a New Room</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.formGroup}>
              <label>Room Name *</label>
              <input
                type="text"
                placeholder=" Frontend weekly "
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Link to Project (optional)</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">-- None --</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Invite Members  </label>
              <input
                type="text"
                placeholder="e.g sourav, ritik"
                value={membersInput}
                onChange={(e) => setMembersInput(e.target.value)}
                className={styles.input}
              />
              <small style={{ fontSize: "10px", color: "var(--txt3)" }}>
                You will be added automatically.
              </small>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                className={styles.btnSecondary}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className={styles.btnPrimary}
              >
                {loading ? "Creating..." : "Create Room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveRoomsList;
