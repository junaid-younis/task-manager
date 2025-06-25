import React from 'react';
import TaskCard from './TaskCard';

const TaskBoard = ({ tasks = [], onEditTask, onDeleteTask, onStatusChange, onViewComments }) => {
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
      headerColor: 'text-yellow-800'
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: 'border-blue-300 bg-blue-50',
      headerColor: 'text-blue-800'
    },
    {
      id: 'done',
      title: 'Done',
      color: 'border-green-300 bg-green-50',
      headerColor: 'text-green-800'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4`}>
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${column.headerColor}`}>
              {column.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${column.headerColor} bg-white`}>
              {tasksByStatus[column.id].length}
            </span>
          </div>

          {/* Tasks */}
          <div className="space-y-3 min-h-[400px]">
            {tasksByStatus[column.id].length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No tasks</p>
              </div>
            ) : (
              tasksByStatus[column.id].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                  onViewComments={onViewComments}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;