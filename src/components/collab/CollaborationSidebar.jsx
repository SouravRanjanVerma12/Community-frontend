// components/collab/CollaborationSidebar.jsx
import { useState, useEffect } from "react";
import { mockApi } from "../../lib/mockApi";
import styles from "../../styles/collab.module.css";

const CollaborationSidebar = ({ activity }) => {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (showModal) {
      mockApi.getProjects().then(setProjects);
    }
  }, [showModal]);

  useEffect(() => {
    if (selectedProjectId) {
      setLoadingTasks(true);
      mockApi.getTasksByProject(selectedProjectId).then((allTasks) => {
        const eligibleTasks = allTasks.filter((t) => t.status !== "done");
        setTasks(eligibleTasks);
        setLoadingTasks(false);
        setSelectedTaskId("");
      });
    } else {
      setTasks([]);
      setSelectedTaskId("");
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      setLoadingMembers(true);
      mockApi.getProjectMembers(selectedProjectId).then((members) => {
        setProjectMembers(members);
        setLoadingMembers(false);
        setSelectedReviewerId("");
      });
    } else {
      setProjectMembers([]);
      setSelectedReviewerId("");
    }
  }, [selectedProjectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedTaskId || !selectedReviewerId) {
      alert("Please select a project, task, and reviewer.");
      return;
    }
    const project = projects.find((p) => p.id === selectedProjectId);
    const task = tasks.find((t) => t.id === selectedTaskId);
    const reviewer = projectMembers.find(
      (m) => m.userId === selectedReviewerId,
    );
    const requester = mockApi.getCurrentUser();

    await mockApi.createReviewRequest({
      projectId: selectedProjectId,
      taskId: selectedTaskId,
      requesterId: requester.id,
      reviewerId: selectedReviewerId,
      notes: notes.trim(),
      status: "pending",
      createdAt: Date.now(),
    });

    await mockApi.addActivity(
      `You requested a review for task "${task?.title}" from ${reviewer?.name || reviewer?.userId}`,
    );
    await mockApi.addActivityForUser(
      selectedReviewerId,
      `${requester.name || requester.id} requested a review for task "${task?.title}" in project ${project?.title}`,
    );

    setShowModal(false);
    setSelectedProjectId("");
    setSelectedTaskId("");
    setSelectedReviewerId("");
    setNotes("");
    alert("Review request sent!");
  };

  return (
    <>
      <div className={styles.card} style={{ padding: "16px" }}>
        <div
          className={styles.sectionTitle}
          style={{ marginBottom: 12, borderLeftColor: "var(--coral)" }}
        >
          📢 Recent Activity
        </div>
        {activity.length === 0 && (
          <div style={{ color: "var(--txt3)" }}>No recent activity</div>
        )}
        {activity.map((act) => (
          <div key={act.id} className={styles.activityItem}>
            {act.text}
            <div className={styles.activityTime}>
              {new Date(act.time).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className={`${styles.card} ${styles.helpCard}`}>
        <div className={styles.helpTitle}>💡 Need help?</div>
        <div className={styles.helpText}>
          Ask AI Mentor or request a code review from the community.
        </div>
        <button className={styles.badgeTeal} onClick={() => setShowModal(true)}>
          Request Review →
        </button>
      </div>

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
              <h3>Request a Review</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Select Project *</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                >
                  <option value="">-- Choose project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Select Task *</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  required
                  disabled={!selectedProjectId}
                >
                  <option value="">-- Choose task --</option>
                  {loadingTasks ? (
                    <option disabled>Loading tasks...</option>
                  ) : (
                    tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.status})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Select Reviewer *</label>
                <select
                  value={selectedReviewerId}
                  onChange={(e) => setSelectedReviewerId(e.target.value)}
                  required
                  disabled={!selectedProjectId}
                >
                  <option value="">-- Choose reviewer --</option>
                  {loadingMembers ? (
                    <option disabled>Loading members...</option>
                  ) : (
                    projectMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name || m.userId} ({m.role})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Additional Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Explain what you need feedback on..."
                ></textarea>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CollaborationSidebar;
