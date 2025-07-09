import React, { useState, useEffect } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import Button from '../common/Button';
import Input from '../common/Input';
import UserDropdown from '../common/UserDropdown';
import { PRIORITY_LEVELS } from '../../utils/constants';
import { CalendarIcon, UserIcon, FlagIcon } from '@heroicons/react/24/outline';

const TaskForm = ({ task, onSubmit, onCancel, isSubmitting = false, defaultStatus = 'to_do' }) => {
  const { projects } = useProjects();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: null,
    priority: 3,
    status: defaultStatus,
    dueDate: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        projectId: task.project?.id || task.projectId || '',
        assignedTo: task.assignedTo?.id || null,
        priority: task.priority || 3,
        status: task.status || 'to_do',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
      
      if (task.project) {
        setSelectedProject(task.project);
      }
    } else if (projects.length === 1) {
      // Auto-select project if only one exists
      setFormData(prev => ({ ...prev, projectId: projects[0].id }));
      setSelectedProject(projects[0]);
    }
  }, [task, projects]);

  // Update selected project when projectId changes
  useEffect(() => {
    if (formData.projectId) {
      const project = projects.find(p => p.id === parseInt(formData.projectId));
      setSelectedProject(project);
    } else {
      setSelectedProject(null);
    }
  }, [formData.projectId, projects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority' || name === 'projectId' ? parseInt(value) : value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleUserSelect = (user) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: user ? user.id : null
    }));

    if (errors.assignedTo) {
      setErrors(prev => ({
        ...prev,
        assignedTo: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Task title must be at least 2 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Task title must be less than 200 characters';
    }

    // Project validation
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    // Description validation
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    // Due date validation
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    // Priority validation
    if (formData.priority < 1 || formData.priority > 5) {
      newErrors.priority = 'Priority must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      projectId: formData.projectId,
      assignedTo: formData.assignedTo,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate || null
    };

    onSubmit(submitData);
  };

  const getPriorityIcon = (priority) => {
    const colors = {
      1: 'text-green-500',
      2: 'text-blue-500',
      3: 'text-yellow-500',
      4: 'text-orange-500',
      5: 'text-red-500'
    };
    return <FlagIcon className={`h-4 w-4 ${colors[priority] || 'text-gray-500'}`} />;
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <Input
        label={<span>Task Title <span className="text-red-500">*</span></span>}
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter task title"
        required
      />

      {/* Project Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project <span className="text-red-500">*</span>
        </label>
        <select
          name="projectId"
          value={formData.projectId}
          onChange={handleChange}
          className={`input-field ${errors.projectId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          required
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
        )}
        {selectedProject && (
          <p className="mt-1 text-sm text-gray-500">
            Project: {selectedProject.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`input-field resize-none ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="Enter task description (optional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/2000 characters
        </p>
      </div>

      {/* Assignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UserIcon className="h-4 w-4 inline mr-1" />
          Assign To
        </label>
        <UserDropdown
          value={formData.assignedTo}
          onChange={handleUserSelect}
          placeholder="Select a team member (optional)"
          className="w-full"
        />
        {errors.assignedTo && (
          <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
        )}
      </div>

      {/* Priority and Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FlagIcon className="h-4 w-4 inline mr-1" />
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="input-field"
          >
            {Object.entries(PRIORITY_LEVELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            {getPriorityIcon(formData.priority)}
            <span className="ml-1">{PRIORITY_LEVELS[formData.priority]}</span>
          </div>
        </div>

        {/* Status (only show for editing) */}
        {task && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <CalendarIcon className="h-4 w-4 inline mr-1" />
          Due Date <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={getTodayDate()}
            className={`input-field ${errors.dueDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          
          {/* Quick date selection buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, dueDate: getTodayDate() }))}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setFormData(prev => ({ ...prev, dueDate: tomorrow.toISOString().split('T')[0] }));
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, dueDate: getNextWeekDate() }))}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
            >
              Next Week
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, dueDate: '' }))}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        
        {errors.dueDate && (
          <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
        )}
      </div>

      {/* Form Summary */}
      {formData.title && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Task Summary</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Title:</strong> {formData.title}</p>
            {selectedProject && <p><strong>Project:</strong> {selectedProject.name}</p>}
            <p><strong>Priority:</strong> {PRIORITY_LEVELS[formData.priority]}</p>
            {formData.dueDate && <p><strong>Due:</strong> {new Date(formData.dueDate).toLocaleDateString()}</p>}
            {task && <p><strong>Status:</strong> {formData.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>}
          </div>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            task ? 'Updating Task...' : 'Creating Task...'
          ) : (
            task ? 'Update Task' : 'Create Task'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 pt-2">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="mt-1 space-y-1 list-disc list-inside">
          <li>Use clear, actionable titles (e.g., "Review user feedback" instead of "Feedback")</li>
          <li>Set due dates for time-sensitive tasks</li>
          <li>Assign tasks to team members for better collaboration</li>
          <li>Use priority levels to help focus on what matters most</li>
        </ul>
      </div>
    </form>
  );
};

export default TaskForm;