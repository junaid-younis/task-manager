import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { userService } from '../../services/users';
import Loading from './Loading';

// Global users cache to survive all component remounts
if (!window.USERS_GLOBAL_CACHE) {
  window.USERS_GLOBAL_CACHE = {
    data: [],
    timestamp: 0,
    loading: false,
    promise: null
  };
}

const UserDropdown = ({
  value,
  onChange,
  placeholder = "Select a user...",
  excludeUserIds = [],
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Use global cache for users and loading state
  const [users, setUsers] = useState(window.USERS_GLOBAL_CACHE.data);
  const [globalLoading, setGlobalLoading] = useState(window.USERS_GLOBAL_CACHE.loading);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Sync with global cache
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.USERS_GLOBAL_CACHE.data !== users) {
        setUsers([...window.USERS_GLOBAL_CACHE.data]);
      }
      if (window.USERS_GLOBAL_CACHE.loading !== globalLoading) {
        setGlobalLoading(window.USERS_GLOBAL_CACHE.loading);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [users, globalLoading]);

  // Fetch users function
  const fetchUsers = async () => {
    // Check if already loading globally
    if (window.USERS_GLOBAL_CACHE.loading) {
      if (window.USERS_GLOBAL_CACHE.promise) {
        try {
          await window.USERS_GLOBAL_CACHE.promise;
        } catch (e) {
          // Handle error silently
        }
      }
      return;
    }

    // Check if data is fresh (less than 5 minutes old)
    const now = Date.now();
    if (window.USERS_GLOBAL_CACHE.data.length > 0 && 
        (now - window.USERS_GLOBAL_CACHE.timestamp) < 5 * 60 * 1000) {
      setUsers([...window.USERS_GLOBAL_CACHE.data]);
      return;
    }

    try {
      window.USERS_GLOBAL_CACHE.loading = true;
      setGlobalLoading(true);
      setError(null);

      // Create a promise that other components can wait for
      window.USERS_GLOBAL_CACHE.promise = userService.getAllUsers();
      
      const response = await window.USERS_GLOBAL_CACHE.promise;
      
      const userData = response.data || response || [];
      
      // Update global cache
      window.USERS_GLOBAL_CACHE.data = userData;
      window.USERS_GLOBAL_CACHE.timestamp = now;
      window.USERS_GLOBAL_CACHE.loading = false;
      
      // Update local state
      setUsers([...userData]);
      setGlobalLoading(false);
      
    } catch (err) {
      window.USERS_GLOBAL_CACHE.loading = false;
      setGlobalLoading(false);
      setError('Failed to load users');
    } finally {
      window.USERS_GLOBAL_CACHE.promise = null;
    }
  };

  // Load users when dropdown opens
  useEffect(() => {
    if (isOpen && users.length === 0 && !globalLoading) {
      fetchUsers();
    }
  }, [isOpen, users.length, globalLoading]);

  // Filter users based on search and exclusions
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Exclude specified user IDs
      if (excludeUserIds.includes(user.id)) return false;

      // If no search query, return all users
      if (!searchQuery.trim()) return true;

      // Search in multiple fields
      const query = searchQuery.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery, excludeUserIds]);

  const handleSelect = (user) => {
    onChange(user);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
      setError(null);
    }
  };

  const handleRetry = () => {
    // Clear global cache and refetch
    window.USERS_GLOBAL_CACHE.data = [];
    window.USERS_GLOBAL_CACHE.timestamp = 0;
    setUsers([]);
    fetchUsers();
  };

  const selectedUser = users.find(user => user.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const isLoading = globalLoading || localLoading;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between hover:border-gray-400 transition-colors"
      >
        <span className={selectedUser ? 'text-gray-900' : 'text-gray-500'}>
          {selectedUser
            ? `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.email})`
            : placeholder
          }
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Users List */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <Loading size="sm" text="Loading users..." />
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="text-sm text-red-600 mb-3">{error}</div>
                <button
                  onClick={handleRetry}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-sm text-gray-500">
                  {searchQuery ? (
                    <>
                      No users found for "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery('')}
                        className="block mt-2 text-blue-600 hover:underline text-sm mx-auto"
                      >
                        Clear search
                      </button>
                    </>
                  ) : users.length === 0 ? (
                    <>
                      No users available
                      <button
                        onClick={handleRetry}
                        className="block mt-2 text-blue-600 hover:underline text-sm mx-auto"
                      >
                        Load Users
                      </button>
                    </>
                  ) : (
                    'All users are excluded from selection'
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Clear selection option */}
                {selectedUser && (
                  <button
                    onClick={() => handleSelect(null)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center border-b border-gray-100"
                  >
                    <span className="text-gray-500 italic">Clear selection</span>
                  </button>
                )}

                {/* User list */}
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(user)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {user.email} • @{user.username}
                      </div>
                      {user.role && (
                        <div className="text-xs text-gray-400 capitalize mt-1">
                          Role: {user.role}
                        </div>
                      )}
                    </div>
                    {selectedUser?.id === user.id && (
                      <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Footer with count */}
          {!isLoading && !error && filteredUsers.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(UserDropdown);