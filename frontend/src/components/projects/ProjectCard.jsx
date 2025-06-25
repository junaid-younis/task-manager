import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  EllipsisVerticalIcon, 
  PencilIcon, 
  TrashIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/helpers';
import Button from '../common/Button';
import Modal from '../common/Modal';

const ProjectCard = ({ project, onEdit, onDelete, onManageMembers }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = () => {
    setShowDropdown(false);
    onEdit(project);
  };

  const handleDelete = () => {
    setShowDropdown(false);
    setShowDeleteModal(true);
  };

  const handleManageMembers = () => {
    setShowDropdown(false);
    onManageMembers(project);
  };

  const confirmDelete = () => {
    onDelete(project.id);
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="card p-6 hover:shadow-lg transition-shadow relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link 
              to={`/projects/${project.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {project.name}
            </Link>
            {project.description && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          
          {/* Actions Dropdown */}
          <div className="relative ml-4">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Project
                </button>
                <button
                  onClick={handleManageMembers}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Manage Members
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <UsersIcon className="h-4 w-4 mr-1" />
              <span>{project.memberCount || 0} members</span>
            </div>
            <div className="flex items-center">
              <ClipboardDocumentListIcon className="h-4 w-4 mr-1" />
              <span>{project.taskCount || 0} tasks</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Created {formatDate(project.createdAt)}</span>
          </div>
          
          <Link to={`/projects/${project.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        </div>

        {/* Created by info */}
        {project.createdBy && (
          <div className="mt-3 text-xs text-gray-500">
            Created by {project.createdBy.firstName} {project.createdBy.lastName}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Project
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{project.name}"? This action cannot be undone.
          All tasks and data associated with this project will be permanently removed.
        </p>
      </Modal>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
};

export default ProjectCard;