import { TASK_STATUS_LABELS, PRIORITY_LEVELS } from './constants';

export const getStatusColor = (status) => {
  switch (status) {
    case 'to_do':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'done':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority) => {
  switch(priority) {
    case 1:
      return 'text-green-600';
    case 2:
      return 'text-blue-600';
    case 3:
      return 'text-yellow-600';
    case 4:
      return 'text-orange-600';
    case 5:
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const formatTaskStatus = (status) => {
  return TASK_STATUS_LABELS[status] || status;
};

export const formatPriority = (priority) => {
  return PRIORITY_LEVELS[priority] || `Priority ${priority}`;
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};