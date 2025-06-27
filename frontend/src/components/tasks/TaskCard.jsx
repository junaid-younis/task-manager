import React, { useState } from 'react';
import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon,
  ArrowPathIcon
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

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onViewComments, 
  variant = 'card' // 'card' or 'list'
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  const handleStatusChange = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      await onStatusChange(task.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleViewComments = () => {
    onViewComments(task);
  };

  const overdue = isOverdue(task.dueDate);
  const daysUntilDue = getDaysUntilDue(task.dueDate);

  // Quick action buttons based on current status
  const getQuickActions = () => {
    const actions = [];
    
    switch (task.status) {
      case 'to_do':
        actions.push({
          label: 'Start',
          icon: PlayIcon,
          action: () => handleStatusChange('in_progress'),
          color: 'text-blue-600 hover:text-blue-700'
        });
        break;
      case 'in_progress':
        actions.push({
          label: 'Complete',
          icon: CheckCircleIcon,
          action: () => handleStatusChange('done'),
          color: 'text-green-600 hover:text-green-700'
        });
        break;
      case 'done':
        actions.push({
          label: 'Reopen',
          icon: ArrowPathIcon,
          action: () => handleStatusChange('in_progress'),
          color: 'text-yellow-600 hover:text-yellow-700'
        });
        break;
    }
    
    return actions;
  };

  const quickActions = getQuickActions();

  if (variant === 'list') {
    return (
      <>
        <div className="card p-4 hover:shadow-lg transition-shadow relative">
          <div className="flex items-center justify-between">
            {/* Left side - Task info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start space-x-4">
                {/* Status indicator */}
                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                  task.status === 'done' ? 'bg-green-500' :
                  task.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {task.title}
                  </h3>
                  
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                      {formatPriority(task.priority)}
                    </span>
                    
                    {task.project && (
                      <span>{task.project.name}</span>
                    )}
                    
                    {task.assignedTo && (
                      <span>
                        Assigned to {task.assignedTo.firstName} {task.assignedTo.lastName}
                      </span>
                    )}
                    
                    {task.dueDate && (
                      <span className={overdue ? 'text-red-600 font-medium' : ''}>
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Status badge */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>

              {/* Quick actions */}
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  disabled={isUpdatingStatus}
                  className={`p-1 rounded-lg ${action.color} transition-colors disabled:opacity-50`}
                  title={action.label}
                >
                  <action.icon className="h-4 w-4" />
                </button>
              ))}

              {/* Comments button */}
              <button
                onClick={handleViewComments}
                className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded"
              >
                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                {task.commentCount || 0}
              </button>

              {/* Dropdown menu */}
              <div className="relative">
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
          </div>
        </div>

        {/* Delete Modal and Dropdown backdrop */}
        <TaskCardModals
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          task={task}
          confirmDelete={confirmDelete}
        />
      </>
    );
  }

  // Card variant (original design)
  return (
    <>
      <div className="card p-4 hover:shadow-lg transition-shadow cursor-pointer relative">
        {/* Overdue indicator */}
        {overdue && (
          <div className="absolute top-2 left-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-medium text-gray-900 flex-1 line-clamp-2 pr-2">
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
            onClick={handleViewComments}
            className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
            <span>{task.commentCount || 0} comments</span>
          </button>

          {/* Quick Status Actions */}
          <div className="flex space-x-1">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={action.action}
                disabled={isUpdatingStatus}
                className="text-xs"
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <TaskCardModals
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        task={task}
        confirmDelete={confirmDelete}
      />
    </>
  );
};

// Separate component for modals to reduce complexity
const TaskCardModals = ({
  showDeleteModal,
  setShowDeleteModal,
  showDropdown,
  setShowDropdown,
  task,
  confirmDelete
}) => (
  <>
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
        All comments and attachments will also be permanently removed.
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

export default TaskCard;