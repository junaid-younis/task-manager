import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProjectProvider } from '../contexts/ProjectContext';
import Navbar from '../components/common/Navbar';
import Stats from '../components/dashboard/Stats';
import ProjectList from '../components/projects/ProjectList';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin'; // Add this line

  return (
    <ProjectProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 space-y-8">
            {/* Welcome Section - Updated */}
            <div className="card p-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0)}
                  </span>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {user?.first_name || user?.username}! 👋
                  </h1>
                  <p className="text-gray-600">
                    {isAdmin 
                      ? "Here's what's happening with your projects and tasks"
                      : "Here are your assigned projects and tasks"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <Stats />

            {/* Projects Section */}
            <ProjectList />
          </div>
        </main>
      </div>
    </ProjectProvider>
  );
};

export default Dashboard;