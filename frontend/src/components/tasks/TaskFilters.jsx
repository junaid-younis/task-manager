import React, { useCallback, useMemo } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useTasks } from '../../contexts/TaskContext';
import { useProjects } from '../../contexts/ProjectContext';
import { PRIORITY_LEVELS } from '../../utils/constants';
import Button from '../common/Button';

const TaskFilters = () => {
  const { filters, setFilters, fetchTasks } = useTasks();
  const { projects } = useProjects();

  // 🔧 Fixed: Debounced filter change to prevent too many API calls
  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // 🔧 Fixed: Use setTimeout to debounce API calls
    const timeoutId = setTimeout(() => {
      fetchTasks({ filters: newFilters });
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, setFilters, fetchTasks]);

  // 🔧 Fixed: Optimized search handler with debouncing
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchTasks({ filters: newFilters });
    }, 500); // 500ms debounce for search

    return () => clearTimeout(timeoutId);
  }, [filters, setFilters, fetchTasks]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
      projectId: null,
      status: null,
      assignedToId: null,
      priority: null,
      search: ''
    };
    setFilters(clearedFilters);
    fetchTasks({ filters: clearedFilters });
  }, [setFilters, fetchTasks]);

  // 🔧 Fixed: Memoize computed values to prevent unnecessary re-renders
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value !== null && value !== '');
  }, [filters]);

  const activeFiltersDisplay = useMemo(() => {
    const activeFilters = [];
    
    if (filters.search) {
      activeFilters.push({
        type: 'search',
        label: `Search: "${filters.search}"`,
        color: 'bg-blue-100 text-blue-800'
      });
    }
    
    if (filters.projectId) {
      const project = projects.find(p => p.id === parseInt(filters.projectId));
      if (project) {
        activeFilters.push({
          type: 'project',
          label: `Project: ${project.name}`,
          color: 'bg-green-100 text-green-800'
        });
      }
    }
    
    if (filters.status) {
      activeFilters.push({
        type: 'status',
        label: `Status: ${filters.status.replace('_', ' ')}`,
        color: 'bg-yellow-100 text-yellow-800'
      });
    }
    
    if (filters.priority) {
      activeFilters.push({
        type: 'priority',
        label: `Priority: ${PRIORITY_LEVELS[filters.priority]}`,
        color: 'bg-purple-100 text-purple-800'
      });
    }
    
    return activeFilters;
  }, [filters, projects]);

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Project Filter */}
        <select
          value={filters.projectId || ''}
          onChange={(e) => handleFilterChange('projectId', e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="to_do">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          {Object.entries(PRIORITY_LEVELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center"
          >
            <FunnelIcon className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFiltersDisplay.map((filter, index) => (
            <span
              key={`${filter.type}-${index}`}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${filter.color}`}
            >
              {filter.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;