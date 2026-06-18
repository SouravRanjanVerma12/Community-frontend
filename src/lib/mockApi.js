// lib/mockApi.js

const STORAGE_KEYS = {
  PROJECTS: "devEcosystem_projects",
  TASKS: "devEcosystem_tasks",
  ROOMS: "devEcosystem_rooms",
  ACTIVITY: "devEcosystem_activity",
  REVIEW_REQUESTS: "devEcosystem_reviewRequests",
};

// Helper to get/set data
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Initialize with sample data if empty
const initSampleData = () => {
  if (getData(STORAGE_KEYS.PROJECTS).length === 0) {
    const sampleProjects = [
      {
        id: "proj1",
        title: "FinTrack Dashboard",
        leadId: "user1",
        myRole: "Frontend Contributor",
        techStack: ["React", "Node.js"],
        member: [
          { userId: "user2", name: "maya_r", role: "Contributor" },
          { userid: "user3", name: "tom_l", role: "Contributor" },
        ],
        createdAt: Date.now(),
      },
      {
        id: "proj2",
        title: "DevMetrics CLI",
        leadId: "user2",
        myRole: "Backend Lead",
        techStack: ["Python", "Click"],
        member: [{ userId: "user1", name: "anna_ko", role: "Contributor" }],
        createdAt: Date.now(),
      },
    ];
    setData(STORAGE_KEYS.PROJECTS, sampleProjects);

    const sampleTasks = [
      {
        id: "task1",
        projectId: "proj1",
        title: "Implement login form",
        status: "in_progress",
        priority: "high",
        dueDate: "2025-06-10",
        assignees: ["user1"],
        checklist: [
          {
            id: "c1",
            text: "Write unit tests",
            completed: false,
            assignedTo: "user2",
          },
        ],
        comments: [],
        attachments: [],
        createdAt: Date.now(),
      },
      {
        id: "task2",
        projectId: "proj1",
        title: "Design API schema",
        status: "todo",
        priority: "medium",
        dueDate: "2025-06-15",
        assignees: ["user2"],
        checklist: [],
        comments: [],
        attachments: [],
        createdAt: Date.now(),
      },
    ];
    setData(STORAGE_KEYS.TASKS, sampleTasks);

    setData(STORAGE_KEYS.ROOMS, [
      {
        id: "room1",
        projectId: "proj1",
        name: "Fintech UI – Frontend",
        members: ["user1", "user3"],
        lastActive: Date.now(),
      },
    ]);
    setData(STORAGE_KEYS.ACTIVITY, [
      {
        id: "act1",
        text: 'Anna assigned you to "Write unit tests"',
        time: Date.now() - 600000,
      },
    ]);
  }
};
initSampleData();

export const mockApi = {
  // Projects
  getProjects: () => Promise.resolve(getData(STORAGE_KEYS.PROJECTS)),
  getProject: (id) =>
    Promise.resolve(getData(STORAGE_KEYS.PROJECTS).find((p) => p.id === id)),
  createProject: (project) => {
    const projects = getData(STORAGE_KEYS.PROJECTS);
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    projects.push(newProject);
    setData(STORAGE_KEYS.PROJECTS, projects);
    return Promise.resolve(newProject);
  },

  // Tasks
  getTasksByProject: (projectId) =>
    Promise.resolve(
      getData(STORAGE_KEYS.TASKS).filter((t) => t.projectId === projectId),
    ),
  createTask: (task) => {
    const tasks = getData(STORAGE_KEYS.TASKS);
    const newTask = {
      ...task,
      id: Date.now().toString(),
      checklist: [],
      comments: [],
      attachments: [],
      createdAt: Date.now(),
    };
    tasks.push(newTask);
    setData(STORAGE_KEYS.TASKS, tasks);
    return Promise.resolve(newTask);
  },
  updateTask: (taskId, updates) => {
    let tasks = getData(STORAGE_KEYS.TASKS);
    tasks = tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
    setData(STORAGE_KEYS.TASKS, tasks);
    return Promise.resolve(tasks.find((t) => t.id === taskId));
  },
  deleteTask: (taskId) => {
    let tasks = getData(STORAGE_KEYS.TASKS);
    tasks = tasks.filter((t) => t.id !== taskId);
    setData(STORAGE_KEYS.TASKS, tasks);
    return Promise.resolve();
  },

  // Rooms
  getActiveRooms: () => Promise.resolve(getData(STORAGE_KEYS.ROOMS)),
  // inside mockApi object
  createRoom: async (room) => {
    const rooms = getData(STORAGE_KEYS.ROOMS);
    const newRoom = {
      ...room,
      id: Date.now().toString(),
      lastActive: Date.now(),
      createdAt: Date.now(),
    };
    rooms.push(newRoom);
    setData(STORAGE_KEYS.ROOMS, rooms);
    return newRoom;
  },
  // Activity
  getRecentActivity: () =>
    Promise.resolve(
      getData(STORAGE_KEYS.ACTIVITY)
        .sort((a, b) => b.time - a.time)
        .slice(0, 5),
    ),
  addActivity: (text) => {
    const activities = getData(STORAGE_KEYS.ACTIVITY);
    activities.unshift({ id: Date.now().toString(), text, time: Date.now() });
    setData(STORAGE_KEYS.ACTIVITY, activities.slice(0, 20));
  },

  // Get project members with names

  getProjectMembers: async (projectId) => {
    const projects = getData(STORAGE_KEYS.PROJECTS);
    const project = projects.find((p) => p.id === projectId);
    if (!project) return [];
    const members = [
      {
        userId: project.leadId,
        name: getUsername(project.leadId),
        role: "Lead",
      },
      ...(project.members || []).map((m) => ({
        userId: m.userId,
        name: m.name || getUsername(m.userId),
        role: m.role || "Contributor",
      })),
    ];
    return members;
  },

  // New: Create a review request
  createReviewRequest: async (request) => {
    const requests = getData(STORAGE_KEYS.REVIEW_REQUESTS) || [];
    const newRequest = {
      ...request,
      id: Date.now().toString(),
      status: "pending",
    };
    requests.push(newRequest);
    setData(STORAGE_KEYS.REVIEW_REQUESTS, requests);
    return newRequest;
  },

  // New: Add activity for a specific user (for notifications)
  addActivityForUser: async (userId, text) => {
    const activities = getData(STORAGE_KEYS.ACTIVITY);
    activities.unshift({
      id: Date.now().toString(),
      userId,
      text,
      time: Date.now(),
    });
    setData(STORAGE_KEYS.ACTIVITY, activities.slice(0, 30));
  },

  // New: Get current user info (mock)
  getCurrentUser: () => {
    // In real app, this would come from auth store
    return { id: "currentUser", name: "You" };
  },
};

// Helper to get a username from userId (for mock)
function getUsername(userId) {
  const names = { user1: "anna_ko", user2: "maya_r", user3: "tom_l" };
  return names[userId] || userId;
}
