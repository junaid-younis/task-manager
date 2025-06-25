import React from 'react';
import { TaskProvider } from '../contexts/TaskContext';
import { ProjectProvider } from '../contexts/ProjectContext';
import Navbar from '../components/common/Navbar';
import TaskList from '../components/tasks/TaskList';

const Tasks = () => {
  return (
    <ProjectProvider>
      <TaskProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <TaskList />
            </div>
          </main>
        </div>
      </TaskProvider>
    </ProjectProvider>
  );
};

export default Tasks;