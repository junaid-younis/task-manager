import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { projectService } from '../services/projects';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? action.payload : project
        )
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload)
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  projects: [],
  loading: false,
  error: null
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const { user } = useAuth();

  const fetchProjects = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await projectService.getProjects();
      dispatch({ type: 'SET_PROJECTS', payload: response.data || [] });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch projects';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, []);

  const createProject = async (projectData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await projectService.createProject(projectData);
      dispatch({ type: 'ADD_PROJECT', payload: response.data });
      
      return { success: true, project: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await projectService.updateProject(id, projectData);
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data });
      
      return { success: true, project: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update project';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const deleteProject = async (id) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      
      await projectService.deleteProject(id);
      dispatch({ type: 'DELETE_PROJECT', payload: id });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete project';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    projects: state.projects,
    loading: state.loading,
    error: state.error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearError
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};