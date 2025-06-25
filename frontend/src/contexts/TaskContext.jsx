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
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  tasks: [],
  loading: false,
  error: null,
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

  const fetchTasks = useCallback(async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const mergedParams = { ...state.filters, ...params };
      const response = await taskService.getTasks(mergedParams);
      dispatch({ type: 'SET_TASKS', payload: response.data || [] });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tasks';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [state.filters]);

  const createTask = async (taskData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await taskService.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: response.data });
      
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
      
      const response = await taskService.updateTask(id, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      
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
      
      const response = await taskService.updateTaskStatus(id, status);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      
      return { success: true, task: response.data };
    } catch (error) {
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
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    setFilters,
    clearError
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