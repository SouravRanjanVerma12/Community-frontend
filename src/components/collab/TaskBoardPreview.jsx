// src/components/collab/TaskBoardPreview.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mockApi } from "../../lib/mockApi";
import Navbar from "../../components/layout/Navbar";
import styles from "../../styles/Collab.module.css";
const statuses = ["todo", "in_progress", "done"];
const statusLabels = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const TaskBoardPreview = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams(); // get project ID from URL
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      mockApi.getProject(projectId),
      mockApi.getTasksByProject(projectId),
    ])
      .then(([proj, taskList]) => {
        setProject(proj);
        setTasks(taskList);
        if (taskList.length > 0) setSelectedTask(taskList[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [projectId]);

  const updateTaskLocal = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  const handleAddTask = async () => {
    const newTask = {
      projectId,
      title: "New task",
      status: "todo",
      priority: "medium",
      dueDate: "",
      assignees: [],
      checklist: [],
      comments: [],
      attachments: [],
    };
    const created = await mockApi.createTask(newTask);
    setTasks([...tasks, created]);
    setSelectedTask(created);
    mockApi.addActivity(`Task "${created.title}" created in ${project?.title}`);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const updated = await mockApi.updateTask(taskId, { status: newStatus });
    updateTaskLocal(updated);
    mockApi.addActivity(
      `Task "${updated.title}" moved to ${statusLabels[newStatus]}`,
    );
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Delete this task?")) {
      await mockApi.deleteTask(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      if (selectedTask?.id === taskId)
        setSelectedTask(tasks.find((t) => t.id !== taskId) || null);
      mockApi.addActivity(`Task deleted from ${project?.title}`);
    }
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", color: "var(--txt2)" }}>
        Loading board...
      </div>
    );
  if (!project) return <div>Project not found</div>;

  return (
    <div className={styles["board-container"]}>
      <Navbar />
      <div className={styles["board-topbar"]}>
        <button
          className={styles["back-btn"]}
          onClick={() => navigate("/collab")}
        >
          ← Back to Collab Hub
        </button>
        <span className={styles["board-title"]}>{project.title}</span>
        <span className={styles["badge badge-teal"]}>
          Lead: @{project.leadId}
        </span>
        <span className={styles["badge badge-amethyst"]}>{project.myRole}</span>
        <button
          className={styles["invite-btn"]}
          onClick={() => alert("Invite modal coming soon")}
        >
          Invite collaborators
        </button>
      </div>

      <div className={styles["board-main"]}>
        <div className={styles["kanban-pane"]}>
          <div className={styles["kanban-header"]}>
            <h3>Task Board</h3>
            <button className={styles["add-task-btn"]} onClick={handleAddTask}>
              + Add a task
            </button>
          </div>
          <div className={styles["kanban-columns"]}>
            {statuses.map((status) => (
              <div key={status} className={styles.column}>
                <div className={styles["column-header"]}>
                  <span>{statusLabels[status]}</span>
                  <span>{tasks.filter((t) => t.status === status).length}</span>
                </div>
                <div className={styles["column-tasks"]}>
                  {tasks
                    .filter((t) => t.status === status)
                    .map((task) => (
                      <div
                        key={task.id}
                        className={`${styles["task-card"]} ${
                          selectedTask?.id === task.id ? styles.active : ""
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--txt2)",
                            marginTop: 4,
                          }}
                        >
                          {task.assignees.length > 0 &&
                            `👤 ${task.assignees.join(", ")}`}
                          {task.dueDate && ` · 📅 ${task.dueDate}`}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: 8,
                          }}
                        >
                          <span
                            className={`badge ${task.priority === "high" ? "badge-coral" : task.priority === "medium" ? "badge" : "badge-teal"}`}
                            style={{ fontSize: 10 }}
                          >
                            {task.priority}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--txt3)" }}>
                            💬 {task.comments.length}
                          </span>
                        </div>
                      </div>
                    ))}
                  {tasks.filter((t) => t.status === status).length === 0 && (
                    <div
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        color: "var(--txt3)",
                        fontSize: 12,
                      }}
                    >
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles["detail-pane"]}>
          {selectedTask ? (
            <>
              <input
                className={styles["task-title-input"]}
                value={selectedTask.title}
                onChange={async (e) => {
                  const updated = await mockApi.updateTask(selectedTask.id, {
                    title: e.target.value,
                  });
                  updateTaskLocal(updated);
                }}
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--bd)",
                  borderRadius: "var(--radius)",
                  padding: "8px 12px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--txt1)",
                }}
              />
              <div>
                <label>Status</label>
                <select
                  value={selectedTask.status}
                  onChange={(e) =>
                    handleStatusChange(selectedTask.id, e.target.value)
                  }
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--radius)",
                    padding: "6px",
                    color: "var(--txt1)",
                    width: "100%",
                  }}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Assignees</label>
                <input
                  type="text"
                  placeholder="Comma separated usernames"
                  value={selectedTask.assignees.join(",")}
                  onChange={async (e) => {
                    const assignees = e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s);
                    const updated = await mockApi.updateTask(selectedTask.id, {
                      assignees,
                    });
                    updateTaskLocal(updated);
                  }}
                  style={{
                    width: "100%",
                    background: "var(--bg3)",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--radius)",
                    padding: "6px",
                    color: "var(--txt1)",
                  }}
                />
              </div>
              <div>
                <label>Due date</label>
                <input
                  type="date"
                  value={selectedTask.dueDate || ""}
                  onChange={async (e) => {
                    const updated = await mockApi.updateTask(selectedTask.id, {
                      dueDate: e.target.value,
                    });
                    updateTaskLocal(updated);
                  }}
                  style={{
                    background: "var(--bg3)",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--radius)",
                    padding: "6px",
                    color: "var(--txt1)",
                    width: "100%",
                  }}
                />
              </div>
              <div>
                <label>Checklist</label>
                {selectedTask.checklist.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={async () => {
                        const newChecklist = [...selectedTask.checklist];
                        newChecklist[idx].completed =
                          !newChecklist[idx].completed;
                        const updated = await mockApi.updateTask(
                          selectedTask.id,
                          { checklist: newChecklist },
                        );
                        updateTaskLocal(updated);
                      }}
                    />
                    <span style={{ flex: 1 }}>{item.text}</span>
                    <span style={{ fontSize: 11, color: "var(--txt3)" }}>
                      @{item.assignedTo || "unassigned"}
                    </span>
                  </div>
                ))}
                <button
                  className={styles["add-task-btn"]}
                  style={{ marginTop: 8 }}
                  onClick={async () => {
                    const newItem = {
                      id: Date.now().toString(),
                      text: "New item",
                      completed: false,
                      assignedTo: "",
                    };
                    const updated = await mockApi.updateTask(selectedTask.id, {
                      checklist: [...selectedTask.checklist, newItem],
                    });
                    updateTaskLocal(updated);
                  }}
                >
                  + Add item
                </button>
              </div>
              <div>
                <label>Comments</label>
                {selectedTask.comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "var(--bg2)",
                      padding: "8px",
                      borderRadius: "var(--radius)",
                      marginBottom: 6,
                    }}
                  >
                    <strong>{c.author}</strong>{" "}
                    <span style={{ fontSize: 10, color: "var(--txt3)" }}>
                      {new Date(c.time).toLocaleString()}
                    </span>
                    <div>{c.text}</div>
                  </div>
                ))}
                <textarea
                  placeholder="Write a comment... (press Enter to post)"
                  style={{
                    width: "100%",
                    background: "var(--bg3)",
                    border: "1px solid var(--bd)",
                    borderRadius: "var(--radius)",
                    padding: "8px",
                    color: "var(--txt1)",
                    marginTop: 8,
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const newComment = {
                        id: Date.now().toString(),
                        author: "currentUser",
                        text: e.target.value,
                        time: Date.now(),
                      };
                      const updated = await mockApi.updateTask(
                        selectedTask.id,
                        { comments: [...selectedTask.comments, newComment] },
                      );
                      updateTaskLocal(updated);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  className={styles["btn-teal"]}
                  onClick={() => handleStatusChange(selectedTask.id, "done")}
                >
                  Move to Done
                </button>
                <button
                  className={styles["btn-coral"]}
                  onClick={() => handleDeleteTask(selectedTask.id)}
                >
                  Delete Task
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--txt3)",
                padding: "2rem",
              }}
            >
              Select a task to view details
            </div>
          )}
        </div>
      </div>


      
    </div>
  );
};

export default TaskBoardPreview;
