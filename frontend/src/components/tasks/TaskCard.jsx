import React, { useState } from 'react';
import { 
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  getStatusColor, 
  getPriorityColor, 
  formatDate, 
  formatPriority,
  isOverdue,
  getDaysUntilDue
} from '../../utils/helpers';
import Button from '../common/Button';
import Modal from '../common/Modal';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onViewComments }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = () => {
    setShowDropdown(false);
    onEdit(task);
  };

  const handleDelete = () => {
    setShowDropdown(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    onDelete(task.id);
    setShowDeleteModal(false);
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(task.id, newStatus);
  };

  const overdue = isOverdue(task.dueDate);
  const daysUntilDue = getDaysUntilDue(task.dueDate);

  return (
    <>
      <div className="card p-4 hover:shadow-lg transition-shadow cursor-pointer relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-gray-900 flex-1 line-clamp-2">
            {task.title}
          </h3>
          
          {/* Actions Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={handleEdit}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Task
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Priority */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
            {formatPriority(task.priority)}
          </span>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className={`flex items-center text-xs mb-3 ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
            {overdue && <ExclamationTriangleIcon className="h-4 w-4 mr-1" />}
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>
              Due {formatDate(task.dueDate)}
              {daysUntilDue !== null && (
                <span className="ml-1">
                  ({daysUntilDue === 0 ? 'Today' : 
                    daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                    `${daysUntilDue} days left`})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Assigned User */}
        {task.assignedTo && (
          <div className="flex items-center text-xs text-gray-500 mb-3">
            <UserIcon className="h-4 w-4 mr-1" />
            <span>Assigned to {task.assignedTo.firstName} {task.assignedTo.lastName}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          {/* Comments */}
          <button
            onClick={() => onViewComments(task)}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
            <span>{task.commentCount || 0} comments</span>
          </button>

          {/* Quick Status Actions */}
          <div className="flex space-x-1">
            {task.status === 'to_do' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('in_progress')}
                className="text-xs"
              >
                Start
              </Button>
            )}
            {task.status === 'in_progress' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('done')}
                className="text-xs"
              >
                Complete
              </Button>
            )}
            {task.status === 'done' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange('in_progress')}
                className="text-xs"
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Task
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{task.title}"? This action cannot be undone.
        </p>
      </Modal>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
};

export default TaskCard;