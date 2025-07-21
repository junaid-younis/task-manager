// src/hooks/useCopilotActions.js
import { useCopilotAction } from "@copilotkit/react-core";
import { useAuth } from "../contexts/AuthContext";
import { useProjects } from "../contexts/ProjectContext";
import { useTasks } from "../contexts/TaskContext";
import { useCallback } from "react";

export const useCopilotActions = () => {
  const { user, isAuthenticated } = useAuth();
  const { createProject, projects } = useProjects();
  const { createTask, updateTaskStatus, tasks } = useTasks();

  // Create Project Handler
  const handleCreateProject = useCallback(async ({ name, description = "" }) => {
    if (!isAuthenticated) {
      return "Please log in to create projects.";
    }

    if (user?.role !== "admin") {
      return "Only administrators can create projects.";
    }

    try {
      const result = await createProject({
        name: name.trim(),
        description: description.trim()
      });

      if (result.success) {
        return `✅ Project "${name}" created successfully!`;
      } else {
        return `❌ Failed to create project: ${result.error}`;
      }
    } catch (error) {
      return `❌ Error: ${error.message}`;
    }
  }, [isAuthenticated, user?.role, createProject]);

  // Create Task Handler
  const handleCreateTask = useCallback(async ({ title, projectId, description = "", priority = 3 }) => {
    if (!isAuthenticated) {
      return "Please log in to create tasks.";
    }

    try {
      const result = await createTask({
        title: title.trim(),
        description: description.trim(),
        projectId: parseInt(projectId),
        priority: parseInt(priority),
        status: "to_do"
      });

      if (result.success) {
        return `✅ Task "${title}" created successfully!`;
      } else {
        return `❌ Failed to create task: ${result.error}`;
      }
    } catch (error) {
      return `❌ Error: ${error.message}`;
    }
  }, [isAuthenticated, createTask]);

  // Update Task Status Handler
  const handleUpdateTaskStatus = useCallback(async ({ taskId, status }) => {
    if (!isAuthenticated) {
      return "Please log in to update tasks.";
    }

    const validStatuses = ["to_do", "in_progress", "done"];
    if (!validStatuses.includes(status)) {
      return `❌ Invalid status. Use: ${validStatuses.join(", ")}`;
    }

    try {
      const result = await updateTaskStatus(parseInt(taskId), status);
      if (result.success) {
        return `✅ Task status updated to "${status}"!`;
      } else {
        return `❌ Failed to update status: ${result.error}`;
      }
    } catch (error) {
      return `❌ Error: ${error.message}`;
    }
  }, [isAuthenticated, updateTaskStatus]);

  // Get Summary Handler
  const handleGetSummary = useCallback(async () => {
    if (!isAuthenticated) {
      return "Please log in to view summary.";
    }

    const todoCount = tasks.filter(t => t.status === 'to_do').length;
    const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
    const doneCount = tasks.filter(t => t.status === 'done').length;

    return `📊 **Summary:**
- Projects: ${projects.length}
- Total Tasks: ${tasks.length}
  - To Do: ${todoCount}
  - In Progress: ${inProgressCount}
  - Completed: ${doneCount}
- Completion Rate: ${tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%`;
  }, [isAuthenticated, projects.length, tasks]);

  // Always register actions (hooks must always be called)
  // The handlers will check authentication status
  useCopilotAction({
    name: "createProject",
    description: "Create a new project",
    parameters: [
      {
        name: "name",
        type: "string",
        required: true,
        description: "Project name"
      },
      {
        name: "description",
        type: "string",
        required: false,
        description: "Project description"
      }
    ],
    handler: handleCreateProject
  });

  useCopilotAction({
    name: "createTask",
    description: "Create a new task",
    parameters: [
      {
        name: "title",
        type: "string",
        required: true,
        description: "Task title"
      },
      {
        name: "projectId",
        type: "number",
        required: true,
        description: "Project ID"
      },
      {
        name: "description",
        type: "string",
        required: false,
        description: "Task description"
      },
      {
        name: "priority",
        type: "number",
        required: false,
        description: "Priority (1-5)"
      }
    ],
    handler: handleCreateTask
  });

  useCopilotAction({
    name: "updateTaskStatus",
    description: "Update task status",
    parameters: [
      {
        name: "taskId",
        type: "number",
        required: true,
        description: "Task ID"
      },
      {
        name: "status",
        type: "string",
        required: true,
        description: "New status (to_do, in_progress, done)"
      }
    ],
    handler: handleUpdateTaskStatus
  });

  useCopilotAction({
    name: "getSummary",
    description: "Get summary of projects and tasks",
    parameters: [],
    handler: handleGetSummary
  });

  // List Projects Action
  const handleListProjects = useCallback(async () => {
    if (!isAuthenticated) {
      return "Please log in to view projects.";
    }

    if (projects.length === 0) {
      return "No projects found. Create your first project to get started!";
    }

    const projectList = projects
      .slice(0, 10)
      .map((p, i) => `${i + 1}. **${p.name}** (ID: ${p.id})${p.description ? `\n   ${p.description}` : ''}`)
      .join('\n');

    return `📁 **Projects (${projects.length} total):**\n${projectList}${projects.length > 10 ? '\n\n...and more' : ''}`;
  }, [isAuthenticated, projects]);

  useCopilotAction({
    name: "listProjects",
    description: "List all projects",
    parameters: [],
    handler: handleListProjects
  });

  // List Tasks Action
  const handleListTasks = useCallback(async ({ projectId, status }) => {
    if (!isAuthenticated) {
      return "Please log in to view tasks.";
    }

    let filteredTasks = tasks;

    if (projectId) {
      filteredTasks = filteredTasks.filter(t => t.project?.id === parseInt(projectId));
    }

    if (status) {
      filteredTasks = filteredTasks.filter(t => t.status === status);
    }

    if (filteredTasks.length === 0) {
      return "No tasks found with the specified criteria.";
    }

    const taskList = filteredTasks
      .slice(0, 10)
      .map((t, i) => {
        const statusEmoji = t.status === 'done' ? '✅' : t.status === 'in_progress' ? '🔄' : '📋';
        return `${i + 1}. ${statusEmoji} **${t.title}** (ID: ${t.id})\n   Project: ${t.project?.name || 'N/A'} | Priority: ${t.priority}`;
      })
      .join('\n');

    return `📋 **Tasks (${filteredTasks.length} found):**\n${taskList}${filteredTasks.length > 10 ? '\n\n...and more' : ''}`;
  }, [isAuthenticated, tasks]);

  useCopilotAction({
    name: "listTasks",
    description: "List tasks with optional filters",
    parameters: [
      {
        name: "projectId",
        type: "number",
        required: false,
        description: "Filter by project ID"
      },
      {
        name: "status",
        type: "string",
        required: false,
        description: "Filter by status (to_do, in_progress, done)"
      }
    ],
    handler: handleListTasks
  });
};