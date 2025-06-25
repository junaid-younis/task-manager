import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  UsersIcon, 
  CalendarIcon, 
  ClipboardDocumentListIcon,
  PencilIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import Navbar from '../components/common/Navbar';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import MemberManagement from '../components/projects/MemberManagement';
import { projectService } from '../services/projects';
import { formatDate, getInitials } from '../utils/helpers';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleEditProject = async (projectData) => {
    setIsSubmitting(true);
    try {
      const response = await projectService.updateProject(id, projectData);
      if (response.data) {
        setProject(response.data);
        setShowEditModal(false);
        // Show success message or toast here if you have one
      }
    } catch (err) {
      console.error('Error updating project:', err);
      // Show error message here if you have error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = () => {
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
  };

  const openMembersModal = () => {
    setShowMembersModal(true);
  };

  const closeMembersModal = () => {
    setShowMembersModal(false);
    // Refresh project data to get updated member count
    fetchProject();
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
          <div className="space-y-6">
            {/* Navigation and Edit Button */}
            <div className="flex items-center justify-between">
              <Link to="/projects">
                <Button variant="outline" size="sm">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Projects
                </Button>
              </Link>
              
              <Button variant="outline" onClick={openEditModal}>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </div>

            {/* Project Title and Description */}
            <div className="card p-8">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {project.name}
                </h1>
                {project.description ? (
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500">
                    <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {project.description}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 border-l-4 border-gray-300">
                    <p className="text-gray-500 italic">
                      No description provided for this project.
                    </p>
                    <button 
                      onClick={openEditModal}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 underline"
                    >
                      Add a description
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-100">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Created</p>
                  <p className="text-lg font-bold text-gray-900">{formatDate(project.createdAt)}</p>
                  <p className="text-xs text-gray-500">
                    by {project.createdBy?.firstName} {project.createdBy?.lastName}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-100">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasks</p>
                  <p className="text-lg font-bold text-gray-900">{project.taskCount || 0}</p>
                  <p className="text-xs text-gray-500">total tasks</p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Members</p>
                  <p className="text-lg font-bold text-gray-900">{project.memberCount || 0}</p>
                  <p className="text-xs text-gray-500">team members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Members Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Project Members</h2>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {(project.memberCount || 0) + 1} total (including creator)
                </span>
                <Button variant="outline" size="sm" onClick={openMembersModal}>
                  <CogIcon className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Project Creator */}
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {getInitials(project.createdBy?.firstName, project.createdBy?.lastName)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {project.createdBy?.firstName} {project.createdBy?.lastName}
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Creator
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">{project.createdBy?.email}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  Project Owner
                </span>
              </div>

              {/* Project Members */}
              {project.members && project.members.length > 0 ? (
                project.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {getInitials(member.user?.firstName, member.user?.lastName)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{member.user?.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      Added {formatDate(member.addedAt)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No additional members yet</p>
                  <p className="text-xs">Add members to collaborate on this project</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Link to={`/tasks?projectId=${project.id}`}>
                <Button variant="primary">
                  <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                  View Tasks
                </Button>
              </Link>
              <Button variant="outline" onClick={openMembersModal}>
                <UsersIcon className="h-4 w-4 mr-2" />
                Manage Members
              </Button>
            </div>
          </div>

          {/* Edit Project Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={closeEditModal}
            title="Edit Project"
            size="md"
          >
            <ProjectForm
              project={project}
              onSubmit={handleEditProject}
              onCancel={closeEditModal}
              isSubmitting={isSubmitting}
            />
          </Modal>

          {/* Manage Members Modal */}
          <Modal
            isOpen={showMembersModal}
            onClose={closeMembersModal}
            title="Manage Project Members"
            size="lg"
          >
            <MemberManagement
              project={project}
              onClose={closeMembersModal}
            />
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;