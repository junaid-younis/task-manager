import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTasks } from '../../contexts/TaskContext';
import { useProjects } from '../../contexts/ProjectContext';
import TaskForm from './TaskForm';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Loading from '../common/Loading';

const TaskList = () => {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    clearError
  } = useTasks();

  const { fetchProjects } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openCreateModal = () => {
    clearError();
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    clearError();
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
        <Button
          variant="primary"
          onClick={openCreateModal}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Task
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Simple Task List */}
      <div className="space-y-4">
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
          tasks.map((task) => (
            <div key={task.id} className="card p-4">
              <h3 className="font-medium text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.project?.name}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {task.status?.replace('_', ' ') || 'To Do'}
              </span>
            </div>
          ))
        )}
      </div>

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
    </div>
  );
};

export default TaskList;