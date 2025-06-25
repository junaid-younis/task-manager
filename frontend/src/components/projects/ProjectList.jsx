import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useProjects } from '../../contexts/ProjectContext';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import MemberManagement from './MemberManagement';

const ProjectList = () => {
  const {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearError
  } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managingMembers, setManagingMembers] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (projectData) => {
    setIsSubmitting(true);
    try {
      const result = await createProject(projectData);
      if (result.success) {
        setShowCreateModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProject = async (projectData) => {
    if (!editingProject) return;
    
    setIsSubmitting(true);
    try {
      const result = await updateProject(editingProject.id, projectData);
      if (result.success) {
        setEditingProject(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    await deleteProject(projectId);
  };

  const openMemberManagement = (project) => {
  setManagingMembers(project);
};

const closeMemberManagement = () => {
  setManagingMembers(null);
};

  const openCreateModal = () => {
    clearError();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    clearError();
  };

  const openEditModal = (project) => {
    clearError();
    setEditingProject(project);
  };

  const closeEditModal = () => {
    setEditingProject(null);
    clearError();
  };

  if (loading && projects.length === 0) {
    return <Loading size="lg" text="Loading projects..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600">Manage and organize your work projects</p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Project
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PlusIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first project</p>
          <Button variant="primary" onClick={openCreateModal}>
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEditModal}
              onDelete={handleDeleteProject}
              onManageMembers={openMemberManagement}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Create New Project"
        size="md"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={closeCreateModal}
          isSubmitting={isSubmitting}
        />
        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={closeEditModal}
        title="Edit Project"
        size="md"
      >
        <ProjectForm
          project={editingProject}
          onSubmit={handleUpdateProject}
          onCancel={closeEditModal}
          isSubmitting={isSubmitting}
        />
        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </Modal>

      {/* Member Management Modal */}
      <Modal
        isOpen={!!managingMembers}
        onClose={closeMemberManagement}
        title="Manage Project Members"
        size="lg"
      >
        {managingMembers && (
          <MemberManagement
            project={managingMembers}
            onClose={closeMemberManagement}
          />
        )}
      </Modal>
    </div>
  );
};

export default ProjectList;