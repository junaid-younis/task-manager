import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TaskProvider, useTasks } from '../contexts/TaskContext';
import { ProjectProvider } from '../contexts/ProjectContext';
import Navbar from '../components/common/Navbar';
import TaskList from '../components/tasks/TaskList';
import Notification, { useNotifications } from '../components/common/Notification';

// Inner component that uses the contexts
const TasksContent = () => {
  const [searchParams] = useSearchParams();
  const { 
    successMessage, 
    error, 
    clearSuccessMessage, 
    clearError,
    setFilters 
  } = useTasks();
  
  const { showSuccess, showError, notifications, removeNotification } = useNotifications();
  const hasSetInitialFilters = useRef(false); // 🔧 Fix: Prevent multiple filter sets

  // Handle URL parameters for filtering - only once
  useEffect(() => {
    if (!hasSetInitialFilters.current) {
      const projectId = searchParams.get('projectId');
      const status = searchParams.get('status');
      const assignedTo = searchParams.get('assignedTo');
      
      if (projectId || status || assignedTo) {
        setFilters({
          projectId: projectId ? parseInt(projectId) : null,
          status: status || null,
          assignedToId: assignedTo ? parseInt(assignedTo) : null
        });
      }
      hasSetInitialFilters.current = true;
    }
  }, [searchParams, setFilters]);

  // Handle success messages
  useEffect(() => {
    if (successMessage) {
      showSuccess(successMessage);
      clearSuccessMessage();
    }
  }, [successMessage, showSuccess, clearSuccessMessage]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, showError, clearError]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <TaskList />
          </div>
        </main>
      </div>

      {/* Notifications */}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          isVisible={true}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};

const Tasks = () => {
  return (
    <ProjectProvider>
      <TaskProvider>
        <TasksContent />
      </TaskProvider>
    </ProjectProvider>
  );
};

export default Tasks;