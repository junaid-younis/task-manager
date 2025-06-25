import React, { useState, useEffect } from 'react';
import { 
  FolderIcon, 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { taskService } from '../../services/tasks';
import { useProjects } from '../../contexts/ProjectContext';

const Stats = () => {
  const { projects } = useProjects();
  const [taskStats, setTaskStats] = useState({
    total: 0,
    byStatus: { todo: 0, inProgress: 0, done: 0 },
    overdue: 0,
    assignedToMe: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        const response = await taskService.getTaskStatistics();
        setTaskStats(response.data);
      } catch (error) {
        console.error('Error fetching task statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskStats();
  }, []);

  const stats = [
    {
      name: 'Total Projects',
      value: projects.length,
      icon: FolderIcon,
      color: 'blue',
      description: 'Active projects'
    },
    {
      name: 'Total Tasks',
      value: taskStats.total,
      icon: ClipboardDocumentListIcon,
      color: 'indigo',
      description: 'All tasks'
    },
    {
      name: 'Completed Tasks',
      value: taskStats.byStatus.done,
      icon: CheckCircleIcon,
      color: 'green',
      description: `${taskStats.completionRate}% completion rate`
    },
    {
      name: 'In Progress',
      value: taskStats.byStatus.inProgress,
      icon: ClockIcon,
      color: 'yellow',
      description: 'Active tasks'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gray-200 w-12 h-12"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
              <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;