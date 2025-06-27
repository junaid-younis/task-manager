import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { taskService } from '../services/tasks';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id 
            ? { ...task, status: action.payload.status, updatedAt: new Date().toISOString() }
            : task
        )
      };
    case 'BULK_UPDATE_TASKS':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          const updatedTask = action.payload.find(t => t.id === task.id);
          return updatedTask || task;
        })
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { 
        ...state, 
        filters: {
          projectId: null,
          status: null,
          assignedToId: null,
          priority: null,
          search: ''
        }
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SUCCESS_MESSAGE':
      return { ...state, successMessage: action.payload };
    case 'CLEAR_SUCCESS_MESSAGE':
      return { ...state, successMessage: null };
    default:
      return state;
  }
};

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  successMessage: null,
  filters: {
    projectId: null,
    status: null,
    assignedToId: null,
    priority: null,
    search: ''
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // 🔧 Fixed: Removed state.filters from dependency array to prevent infinite loop
  const fetchTasks = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Use current filters from state or passed params
      const currentFilters = params.filters || state.filters;
      const mergedParams = { ...currentFilters, ...params };
      
      // Remove empty/null parameters
      const cleanParams = Object.entries(mergedParams).reduce((acc, [key, value]) => {
        if (value !== null && value !== '' && key !== 'filters') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await taskService.getTasks(cleanParams);
      dispatch({ type: 'SET_TASKS', payload: response.data || [] });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tasks';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []); // 🔧 Fixed: Empty dependency array

  const createTask = async (taskData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });

      const response = await taskService.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: response.data });
      dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: 'Task created successfully!' });

      // Clear success message after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });
      }, 3000);

      return { success: true, task: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });

      const response = await taskService.updateTask(id, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: 'Task updated successfully!' });

      // Clear success message after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });
      }, 3000);

      return { success: true, task: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      // Optimistic update
      dispatch({ type: 'UPDATE_TASK_STATUS', payload: { id, status } });

      const response = await taskService.updateTaskStatus(id, status);
      
      // Update with server response to ensure consistency
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      
      // Show success message
      const statusLabels = {
        'to_do': 'To Do',
        'in_progress': 'In Progress',
        'done': 'Completed'
      };
      dispatch({ 
        type: 'SET_SUCCESS_MESSAGE', 
        payload: `Task status updated to ${statusLabels[status]}!` 
      });

      // Clear success message after 2 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });
      }, 2000);

      return { success: true, task: response.data };
    } catch (error) {
      // 🔧 Fixed: Don't call fetchTasks here to avoid infinite loop
      const errorMessage = error.response?.data?.message || 'Failed to update task status';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const deleteTask = async (id) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      await taskService.deleteTask(id);
      dispatch({ type: 'DELETE_TASK', payload: id });
      dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: 'Task deleted successfully!' });

      // Clear success message after 3 seconds
      setTimeout(() => {
        dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });
      }, 3000);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const bulkUpdateTasks = async (updates) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      const promises = updates.map(({ id, data }) => 
        taskService.updateTask(id, data)
      );

      const responses = await Promise.all(promises);
      const updatedTasks = responses.map(response => response.data);
      
      dispatch({ type: 'BULK_UPDATE_TASKS', payload: updatedTasks });
      dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: `${updates.length} tasks updated successfully!` });

      setTimeout(() => {
        dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });
      }, 3000);

      return { success: true, tasks: updatedTasks };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update tasks';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const assignTask = async (taskId, userId) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await taskService.updateTask(taskId, { assignedTo: userId });
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: 'Task assigned successfully!' });

      setTimeout(() => {
        dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });
      }, 3000);

      return { success: true, task: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to assign task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const duplicateTask = async (taskId) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });

      // Get original task
      const originalTask = state.tasks.find(task => task.id === taskId);
      if (!originalTask) {
        throw new Error('Task not found');
      }

      // Create new task with duplicated data
      const duplicatedTaskData = {
        title: `${originalTask.title} (Copy)`,
        description: originalTask.description,
        projectId: originalTask.projectId,
        priority: originalTask.priority,
        dueDate: originalTask.dueDate
      };

      const response = await taskService.createTask(duplicatedTaskData);
      dispatch({ type: 'ADD_TASK', payload: response.data });
      dispatch({ type: 'SET_SUCCESS_MESSAGE', payload: 'Task duplicated successfully!' });

      setTimeout(() => {
        dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });
      }, 3000);

      return { success: true, task: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to duplicate task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const clearSuccessMessage = useCallback(() => {
    dispatch({ type: 'CLEAR_SUCCESS_MESSAGE' });
  }, []);

  // Computed values
  const getTasksByStatus = useCallback((status) => {
    return state.tasks.filter(task => task.status === status);
  }, [state.tasks]);

  const getTasksByProject = useCallback((projectId) => {
    return state.tasks.filter(task => task.projectId === projectId);
  }, [state.tasks]);

  const getTasksByPriority = useCallback((priority) => {
    return state.tasks.filter(task => task.priority === priority);
  }, [state.tasks]);

  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return state.tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'done'
    );
  }, [state.tasks]);

  const getTaskStatistics = useCallback(() => {
    const total = state.tasks.length;
    const completed = state.tasks.filter(task => task.status === 'done').length;
    const inProgress = state.tasks.filter(task => task.status === 'in_progress').length;
    const todo = state.tasks.filter(task => task.status === 'to_do').length;
    const overdue = getOverdueTasks().length;
    
    return {
      total,
      completed,
      inProgress,
      todo,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [state.tasks, getOverdueTasks]);

  const value = {
    // State
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    successMessage: state.successMessage,
    filters: state.filters,
    
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    bulkUpdateTasks,
    assignTask,
    duplicateTask,
    setFilters,
    clearFilters,
    clearError,
    clearSuccessMessage,
    
    // Computed values
    getTasksByStatus,
    getTasksByProject,
    getTasksByPriority,
    getOverdueTasks,
    getTaskStatistics
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};