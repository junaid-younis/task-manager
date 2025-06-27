import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import TaskCard from './TaskCard';
import Button from '../common/Button';

const TaskBoard = ({ 
  tasks = [], 
  onEditTask, 
  onDeleteTask, 
  onStatusChange, 
  onViewComments,
  onCreateTask 
}) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Group tasks by status
  const tasksByStatus = {
    to_do: tasks.filter(task => task.status === 'to_do'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    done: tasks.filter(task => task.status === 'done')
  };

  const columns = [
    {
      id: 'to_do',
      title: 'To Do',
      color: 'border-yellow-300 bg-yellow-50',
      headerColor: 'text-yellow-800',
      headerBg: 'bg-yellow-100',
      addButtonColor: 'text-yellow-600 hover:text-yellow-700'
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: 'border-blue-300 bg-blue-50',
      headerColor: 'text-blue-800',
      headerBg: 'bg-blue-100',
      addButtonColor: 'text-blue-600 hover:text-blue-700'
    },
    {
      id: 'done',
      title: 'Done',
      color: 'border-green-300 bg-green-50',
      headerColor: 'text-green-800',
      headerBg: 'bg-green-100',
      addButtonColor: 'text-green-600 hover:text-green-700'
    }
  ];

  // Drag and Drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.dataTransfer.setDragImage(e.target, 0, 0);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    // Only clear drag over if we're leaving the column entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== newStatus) {
      onStatusChange(draggedTask.id, newStatus);
    }
    
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getColumnStats = (columnId) => {
    const columnTasks = tasksByStatus[columnId];
    const total = columnTasks.length;
    const overdue = columnTasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      return new Date(task.dueDate) < new Date();
    }).length;
    
    return { total, overdue };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => {
        const stats = getColumnStats(column.id);
        const isDragOver = dragOverColumn === column.id;
        const canDrop = draggedTask && draggedTask.status !== column.id;
        
        return (
          <div
            key={column.id}
            className={`rounded-lg border-2 transition-all duration-200 ${
              isDragOver && canDrop
                ? `${column.color} border-opacity-100 shadow-lg scale-105`
                : column.color
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className={`p-4 ${column.headerBg} rounded-t-lg border-b-2 border-gray-200`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className={`font-semibold text-lg ${column.headerColor}`}>
                  {column.title}
                </h3>
                <div className="flex items-center space-x-2">
                  {stats.overdue > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      {stats.overdue} overdue
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${column.headerColor} bg-white shadow-sm`}>
                    {stats.total}
                  </span>
                </div>
              </div>

              {/* Quick Add Button */}
              {onCreateTask && (
                <button
                  onClick={() => onCreateTask(column.id)}
                  className={`flex items-center w-full p-2 border-2 border-dashed border-gray-300 rounded-lg ${column.addButtonColor} hover:border-gray-400 transition-colors`}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Add task</span>
                </button>
              )}
            </div>

            {/* Tasks Container */}
            <div className="p-4">
              <div className={`space-y-3 min-h-[400px] transition-all duration-200 ${
                isDragOver && canDrop ? 'bg-white bg-opacity-50 rounded-lg' : ''
              }`}>
                {tasksByStatus[column.id].length === 0 ? (
                  <div className="text-center py-8">
                    {isDragOver && canDrop ? (
                      <div className="text-gray-600">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                          <PlusIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium">Drop task here</p>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                          <PlusIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm">No tasks</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {column.id === 'to_do' ? 'Add tasks to get started' :
                           column.id === 'in_progress' ? 'Move tasks here when you start working' :
                           'Completed tasks will appear here'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  tasksByStatus[column.id].map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className={`transition-transform duration-200 ${
                        draggedTask?.id === task.id ? 'opacity-50 rotate-2 scale-95' : 'hover:scale-105'
                      }`}
                    >
                      <TaskCard
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        onStatusChange={onStatusChange}
                        onViewComments={onViewComments}
                      />
                    </div>
                  ))
                )}

                {/* Drop Zone Indicator */}
                {isDragOver && canDrop && tasksByStatus[column.id].length > 0 && (
                  <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-white bg-opacity-70">
                    <div className="text-center text-gray-600">
                      <PlusIcon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Drop here to move task</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Column Footer with Summary */}
            <div className="px-4 pb-4">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Total tasks:</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                {stats.overdue > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Overdue:</span>
                    <span className="font-medium">{stats.overdue}</span>
                  </div>
                )}
                {column.id === 'done' && stats.total > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Completed:</span>
                    <span className="font-medium">{stats.total}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;