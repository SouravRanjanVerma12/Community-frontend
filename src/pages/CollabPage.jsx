// src/pages/CollabPage.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import ActiveRoomsList from "../components/collab/ActiveRoomsList";
import UserProjectsList from "../components/collab/UserProjectsList";
import CollaborationSidebar from "../components/collab/CollaborationSidebar";
import styles from "../styles/Collab.module.css";
import { mockApi } from "../lib/mockApi"; // ✅ named import

export default function CollabPage() {
  const [projects, setProjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Directly call mockApi methods (each returns a Promise)
    Promise.all([
      mockApi.getProjects(),
      mockApi.getActiveRooms(),
      mockApi.getRecentActivity(),
    ])
      .then(([proj, rm, act]) => {
        setProjects(proj);
        setRooms(rm);
        setActivity(act);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load collaboration data", err);
        setLoading(false);
      });
  }, []);

  // Inside CollabPage component
  const handleRoomCreated = (newRoom) => {
    setRooms((prev) => [newRoom, ...prev]); // add new room at top
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", color: "var(--txt2)" }}>
        Loading collaboration hub...
      </div>
    );
  }

  return (
    <div className={styles["collab-container"]}>
      <Navbar />
      <div className={styles["collab-main"]}>
        <div className={styles["collab-grid"]}>
          <div className={styles["left-col"]}>
            <ActiveRoomsList rooms={rooms} onRoomCreated={handleRoomCreated} />
            <UserProjectsList projects={projects} />
          </div>
          <div className={styles["right-col"]}>
            <CollaborationSidebar activity={activity} />
          </div>
        </div>
      </div>
    </div>
  );
}
