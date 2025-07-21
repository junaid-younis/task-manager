// src/providers/CopilotStateProvider.jsx
import React from 'react';
import { useCopilotReadable } from "@copilotkit/react-core";
import { useAuth } from '../contexts/AuthContext';
import { useProjects } from '../contexts/ProjectContext';
import { useTasks } from '../contexts/TaskContext';
import { useCopilotActions } from '../hooks/useCopilotActions';

const CopilotStateProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  // Register actions
  useCopilotActions();

  // Always call hooks, but conditionally set their values
  // User state
  useCopilotReadable({
    description: "Current user information",
    value: isAuthenticated && user ? {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim()
    } : null
  });

  // Projects state
  useCopilotReadable({
    description: "All projects",
    value: isAuthenticated ? projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      taskCount: p.taskCount || 0,
      memberCount: p.memberCount || 0
    })) : []
  });

  // Tasks state
  useCopilotReadable({
    description: "All tasks",
    value: isAuthenticated ? tasks.map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      projectId: t.project?.id,
      assignedToId: t.assignedTo?.id,
      dueDate: t.dueDate
    })) : []
  });

  // Summary state
  useCopilotReadable({
    description: "Application summary",
    value: isAuthenticated ? {
      totalProjects: projects.length,
      totalTasks: tasks.length,
      todoTasks: tasks.filter(t => t.status === 'to_do').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      userRole: user?.role || 'user'
    } : {
      totalProjects: 0,
      totalTasks: 0,
      todoTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      userRole: 'guest'
    }
  });

  return <>{children}</>;
};

export default CopilotStateProvider;