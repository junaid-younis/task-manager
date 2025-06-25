import React from 'react';
import { ProjectProvider } from '../contexts/ProjectContext';
import Navbar from '../components/common/Navbar';
import ProjectList from '../components/projects/ProjectList';

const Projects = () => {
  return (
    <ProjectProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <ProjectList />
          </div>
        </main>
      </div>
    </ProjectProvider>
  );
};

export default Projects;