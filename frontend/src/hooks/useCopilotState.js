// // src/hooks/useCopilotState.js
// import { useCopilotReadable } from "@copilotkit/react-core";
// import { useAuth } from "../contexts/AuthContext";
// import { useProjects } from "../contexts/ProjectContext";
// import { useTasks } from "../contexts/TaskContext";
// import { useMemo, useRef, useEffect } from "react";

// export const useCopilotState = () => {
//   const auth = useAuth();
//   const projects = useProjects();
//   const tasks = useTasks();

//   // ✅ Prevent unnecessary state updates and re-renders
//   const lastStateHashRef = useRef({});
//   const stableStateRef = useRef({});
//   const initializationRef = useRef(false);

//   const isAuthenticated = auth?.isAuthenticated || false;
//   const user = auth?.user || null;

//   // ✅ Initialize tracking
//   useEffect(() => {
//     if (!initializationRef.current) {
//       initializationRef.current = true;
//       console.log('🤖 CopilotKit State: Initializing state tracking');
//     }
//   }, []);

//   // ✅ USER STATE - Only update when authentication data actually changes
//   const userState = useMemo(() => {
//     if (!isAuthenticated || !user) {
//       const guestState = {
//         isAuthenticated: false,
//         user: null,
//         loading: auth?.loading || false,
//         capabilities: {
//           canCreateProjects: false,
//           canCreateTasks: false,
//           canManageUsers: false,
//           canUpdateTasks: false,
//         }
//       };

//       const stateHash = JSON.stringify(guestState);
//       if (lastStateHashRef.current.user !== stateHash) {
//         lastStateHashRef.current.user = stateHash;
//         stableStateRef.current.user = guestState;
//         console.log('🤖 CopilotKit State: User state updated (guest)');
//       }
      
//       return stableStateRef.current.user || guestState;
//     }

//     const authenticatedState = {
//       isAuthenticated: true,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email,
//         firstName: user.first_name || user.firstName,
//         lastName: user.last_name || user.lastName,
//         role: user.role,
//         fullName: `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim(),
//       },
//       loading: auth?.loading || false,
//       capabilities: {
//         canCreateProjects: user.role === 'admin',
//         canCreateTasks: true,
//         canManageUsers: user.role === 'admin',
//         canUpdateTasks: true,
//       }
//     };

//     const stateHash = JSON.stringify(authenticatedState);
//     if (lastStateHashRef.current.user !== stateHash) {
//       lastStateHashRef.current.user = stateHash;
//       stableStateRef.current.user = authenticatedState;
//       console.log('🤖 CopilotKit State: User state updated (authenticated)', user.username);
//     }
    
//     return stableStateRef.current.user || authenticatedState;
//   }, [isAuthenticated, user, auth?.loading]);

//   // ✅ PROJECTS STATE - Only update when project data actually changes
//   const projectsState = useMemo(() => {
//     const safeProjects = projects?.projects || [];
    
//     if (!isAuthenticated) {
//       const guestProjectState = {
//         projects: [],
//         totalProjects: 0,
//         loading: false,
//         error: "User not authenticated",
//         summary: "Please log in to view projects"
//       };

//       const stateHash = 'guest-projects';
//       if (lastStateHashRef.current.projects !== stateHash) {
//         lastStateHashRef.current.projects = stateHash;
//         stableStateRef.current.projects = guestProjectState;
//       }
      
//       return stableStateRef.current.projects || guestProjectState;
//     }

//     const authenticatedProjectState = {
//       projects: safeProjects.map((project) => ({
//         id: project.id,
//         name: project.name,
//         description: project.description || "",
//         createdAt: project.createdAt,
//         updatedAt: project.updatedAt,
//         memberCount: project.memberCount || 0,
//         taskCount: project.taskCount || 0,
//         isActive: project.isActive !== false,
//         createdBy: project.createdBy ? {
//           id: project.createdBy.id,
//           firstName: project.createdBy.firstName,
//           lastName: project.createdBy.lastName,
//           email: project.createdBy.email,
//           fullName: `${project.createdBy.firstName || ''} ${project.createdBy.lastName || ''}`.trim(),
//         } : null,
//         members: project.members || [],
//       })),
//       totalProjects: safeProjects.length,
//       loading: projects?.loading || false,
//       error: projects?.error || null,
//       summary: safeProjects.length > 0 
//         ? `${safeProjects.length} project(s): ${safeProjects.slice(0, 3).map(p => p.name).join(", ")}${safeProjects.length > 3 ? '...' : ''}`
//         : "No projects available"
//     };

//     // Create a hash based on essential data to detect real changes
//     const stateHash = JSON.stringify({
//       projectIds: safeProjects.map(p => p.id),
//       projectNames: safeProjects.map(p => p.name),
//       projectCounts: safeProjects.map(p => ({ memberCount: p.memberCount, taskCount: p.taskCount })),
//       loading: projects?.loading,
//       error: projects?.error,
//     });

//     if (lastStateHashRef.current.projects !== stateHash) {
//       lastStateHashRef.current.projects = stateHash;
//       stableStateRef.current.projects = authenticatedProjectState;
//       console.log(`🤖 CopilotKit State: Projects state updated (${safeProjects.length} projects)`);
//     }
    
//     return stableStateRef.current.projects || authenticatedProjectState;
//   }, [
//     isAuthenticated,
//     projects?.projects,
//     projects?.loading,
//     projects?.error
//   ]);

//   // ✅ TASKS STATE - Only update when task data actually changes
//   const tasksState = useMemo(() => {
//     const safeTasks = tasks?.tasks || [];
    
//     if (!isAuthenticated) {
//       const guestTaskState = {
//         tasks: [],
//         taskStatistics: {
//           total: 0,
//           completed: 0,
//           inProgress: 0,
//           todo: 0,
//           overdue: 0,
//           completionRate: 0,
//         },
//         currentFilters: {},
//         loading: false,
//         error: "User not authenticated",
//         summary: "Please log in to view tasks"
//       };

//       const stateHash = 'guest-tasks';
//       if (lastStateHashRef.current.tasks !== stateHash) {
//         lastStateHashRef.current.tasks = stateHash;
//         stableStateRef.current.tasks = guestTaskState;
//       }
      
//       return stableStateRef.current.tasks || guestTaskState;
//     }

//     // Calculate task statistics
//     const taskStats = {
//       total: safeTasks.length,
//       completed: safeTasks.filter(task => task.status === 'done').length,
//       inProgress: safeTasks.filter(task => task.status === 'in_progress').length,
//       todo: safeTasks.filter(task => task.status === 'to_do').length,
//       overdue: safeTasks.filter(task => {
//         if (!task.dueDate || task.status === 'done') return false;
//         return new Date(task.dueDate) < new Date();
//       }).length,
//     };
//     taskStats.completionRate = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

//     const authenticatedTaskState = {
//       tasks: safeTasks.map((task) => ({
//         id: task.id,
//         title: task.title,
//         description: task.description || "",
//         status: task.status,
//         priority: task.priority,
//         dueDate: task.dueDate,
//         createdAt: task.createdAt,
//         updatedAt: task.updatedAt,
//         isOverdue: task.dueDate && task.status !== 'done' ? new Date(task.dueDate) < new Date() : false,
//         project: task.project ? {
//           id: task.project.id,
//           name: task.project.name,
//         } : null,
//         assignedTo: task.assignedTo ? {
//           id: task.assignedTo.id,
//           firstName: task.assignedTo.firstName,
//           lastName: task.assignedTo.lastName,
//           email: task.assignedTo.email,
//           fullName: `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.trim(),
//         } : null,
//         commentCount: task.commentCount || 0,
//       })),
//       taskStatistics: taskStats,
//       currentFilters: tasks?.filters || {},
//       loading: tasks?.loading || false,
//       error: tasks?.error || null,
//       summary: taskStats.total > 0 
//         ? `${taskStats.total} task(s): ${taskStats.todo} todo, ${taskStats.inProgress} in progress, ${taskStats.completed} completed`
//         : "No tasks available"
//     };

//     // Create a hash based on essential data to detect real changes
//     const stateHash = JSON.stringify({
//       taskIds: safeTasks.map(t => t.id),
//       taskStatuses: safeTasks.map(t => ({ id: t.id, status: t.status, updatedAt: t.updatedAt })),
//       statistics: taskStats,
//       filters: tasks?.filters,
//       loading: tasks?.loading,
//       error: tasks?.error,
//     });

//     if (lastStateHashRef.current.tasks !== stateHash) {
//       lastStateHashRef.current.tasks = stateHash;
//       stableStateRef.current.tasks = authenticatedTaskState;
//       console.log(`🤖 CopilotKit State: Tasks state updated (${safeTasks.length} tasks, ${taskStats.completionRate}% complete)`);
//     }
    
//     return stableStateRef.current.tasks || authenticatedTaskState;
//   }, [
//     isAuthenticated,
//     tasks?.tasks,
//     tasks?.filters,
//     tasks?.loading,
//     tasks?.error
//   ]);

//   // ✅ SYSTEM CONTEXT - Contextual information for better AI assistance
//   const systemContext = useMemo(() => {
//     const context = {
//       currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
//       timestamp: new Date().toISOString(),
//       userCapabilities: userState.capabilities || {},
//       systemStats: {
//         totalProjects: projectsState.totalProjects,
//         totalTasks: tasksState.taskStatistics?.total || 0,
//         completionRate: tasksState.taskStatistics?.completionRate || 0,
//         overdueTasks: tasksState.taskStatistics?.overdue || 0,
//         activeFilters: Object.keys(tasksState.currentFilters || {}).filter(key => 
//           tasksState.currentFilters[key] !== null && tasksState.currentFilters[key] !== ''
//         ),
//       },
//       recentActivity: {
//         hasProjects: projectsState.totalProjects > 0,
//         hasTasks: (tasksState.taskStatistics?.total || 0) > 0,
//         hasOverdueTasks: (tasksState.taskStatistics?.overdue || 0) > 0,
//         hasInProgressTasks: (tasksState.taskStatistics?.inProgress || 0) > 0,
//       },
//       quickActions: {
//         suggestedActions: isAuthenticated ? [
//           ...(userState.capabilities?.canCreateProjects ? ["createProject"] : []),
//           ...(userState.capabilities?.canCreateTasks && projectsState.totalProjects > 0 ? ["createTask"] : []),
//           ...(tasksState.taskStatistics?.todo > 0 ? ["updateTaskStatus"] : []),
//           "getTaskSummary",
//           "getProjectSummary"
//         ] : [],
//       }
//     };

//     const contextHash = JSON.stringify(context);
//     if (lastStateHashRef.current.system !== contextHash) {
//       lastStateHashRef.current.system = contextHash;
//       stableStateRef.current.system = context;
//       console.log('🤖 CopilotKit State: System context updated');
//     }
    
//     return stableStateRef.current.system || context;
//   }, [
//     isAuthenticated,
//     userState.capabilities,
//     projectsState.totalProjects,
//     tasksState.taskStatistics,
//     tasksState.currentFilters
//   ]);

//   // ✅ REGISTER READABLE STATE WITH COPILOTKIT
//   useCopilotReadable({
//     description: "Current user authentication state, profile, and capabilities",
//     value: userState,
//   });

//   useCopilotReadable({
//     description: "All projects data including details, member counts, task counts, and project relationships",
//     value: projectsState,
//   });

//   useCopilotReadable({
//     description: "All tasks data including status, priority, assignments, due dates, filtering information, and comprehensive statistics",
//     value: tasksState,
//   });

//   useCopilotReadable({
//     description: "Current application context, user capabilities, system statistics, and suggested actions for intelligent assistance",
//     value: systemContext,
//   });

//   // ✅ Performance monitoring and debugging
//   useEffect(() => {
//     const perfStart = performance.now();
    
//     return () => {
//       const perfEnd = performance.now();
//       if (perfEnd - perfStart > 100) {
//         console.warn(`⚠️ CopilotKit State: Slow render detected (${Math.round(perfEnd - perfStart)}ms)`);
//       }
//     };
//   });

//   // ✅ Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       console.log('🧹 CopilotKit State: Cleaning up state tracking');
//       lastStateHashRef.current = {};
//       stableStateRef.current = {};
//       initializationRef.current = false;
//     };
//   }, []);

//   // ✅ Log state registration for debugging
//   useEffect(() => {
//     if (isAuthenticated) {
//       console.log('🤖 CopilotKit State: Registered states for authenticated user', {
//         projects: projectsState.totalProjects,
//         tasks: tasksState.taskStatistics?.total || 0,
//         capabilities: userState.capabilities
//       });
//     }
//   }, [isAuthenticated, projectsState.totalProjects, tasksState.taskStatistics?.total, userState.capabilities]);

//   return { 
//     auth, 
//     projects, 
//     tasks,
//     // Export stable state references for direct access if needed
//     stableUserState: userState,
//     stableProjectsState: projectsState,
//     stableTasksState: tasksState,
//     systemContext
//   };
// };