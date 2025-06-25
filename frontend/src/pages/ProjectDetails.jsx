import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/common/Navbar';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import { projectService } from '../services/projects';
import { formatDate } from '../utils/helpers';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectService.getProject(id);
      setProject(response.data);
    } catch (err) {
      setError('Failed to load project details');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" text="Loading project details..." />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Project not found'}
            </h3>
            <Link to="/projects">
              <Button variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/projects">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-600 mt-1">{project.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="mt-1 text-sm text-gray-900">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tasks</h3>
                <p className="mt-1 text-sm text-gray-900">{project._count?.tasks || 0} total</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created by</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {project.createdBy?.firstName} {project.createdBy?.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder for future features */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
            <p className="text-gray-600">
              This is a basic project details page. You can expand this to include:
            </p>
            <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
              <li>Task management board</li>
              <li>Project members list</li>
              <li>Project statistics</li>
              <li>Activity timeline</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;