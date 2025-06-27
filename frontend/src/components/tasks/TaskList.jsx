import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTasks } from '../../contexts/TaskContext';
import { useProjects } from '../../contexts/ProjectContext';
import TaskForm from './TaskForm';
import TaskBoard from './TaskBoard';
import TaskFilters from './TaskFilters';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import CommentList from '../comments/CommentList';

const TaskList = () => {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    clearError
  } = useTasks();

  const { fetchProjects } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingComments, setViewingComments] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed viewMode state - always use board view

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks]);

  const handleCreateTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      const result = await createTask(taskData);
      if (result.success) {
        setShowCreateModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskData) => {
    if (!editingTask) return;

    setIsSubmitting(true);
    try {
      const result = await updateTask(editingTask.id, taskData);
      if (result.success) {
        setEditingTask(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleEditTask = (task) => {
    clearError();
    setEditingTask(task);
  };

  const handleViewComments = (task) => {
    setViewingComments(task);
  };

  const openCreateModal = () => {
    clearError();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    clearError();
  };

  const closeEditModal = () => {
    setEditingTask(null);
    clearError();
  };

  const closeCommentsModal = () => {
    setViewingComments(null);
  };

  if (loading && tasks.length === 0) {
    return <Loading size="lg" text="Loading tasks..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-gray-600">Manage and track your project tasks</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Removed View Mode Toggle - always show board view */}
          <Button
            variant="primary"
            onClick={openCreateModal}
            className="flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Task Filters */}
      <TaskFilters />

      {/* Task Content - Always show board view */}
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PlusIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first task</p>
          <Button variant="primary" onClick={openCreateModal}>
            Create Task
          </Button>
        </div>
      ) : (
        <TaskBoard
          tasks={tasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onStatusChange={handleStatusChange}
          onViewComments={handleViewComments}
        />
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Create New Task"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={closeCreateModal}
          isSubmitting={isSubmitting}
        />
        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={closeEditModal}
        title="Edit Task"
        size="lg"
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleUpdateTask}
          onCancel={closeEditModal}
          isSubmitting={isSubmitting}
        />
        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </Modal>

      {/* Comments Modal */}
      <Modal
        isOpen={!!viewingComments}
        onClose={closeCommentsModal}
        title="Task Comments"
        size="xl"
      >
        {viewingComments && (
          <CommentList task={viewingComments} />
        )}
      </Modal>
    </div>
  );
};

export default TaskList;