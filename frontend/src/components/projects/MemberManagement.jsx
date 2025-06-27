import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { projectService } from '../../services/projects';
import UserDropdown from '../common/UserDropdown';
import Button from '../common/Button';
import Loading from '../common/Loading';

const MemberManagement = ({ project, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [project.id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjectMembers(project.id);
      setMembers(response.data || []);
    } catch (err) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setAddingMember(true);
    setError(null);
    setSuccess(null);

    try {
      await projectService.addProjectMember(project.id, selectedUserId);
      setSelectedUserId(null);
      setSuccess('Member added successfully!');
      fetchMembers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      setError(null);
      await projectService.removeProjectMember(project.id, userId);
      setSuccess('Member removed successfully!');
      fetchMembers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Stable exclude list to prevent UserDropdown remounting
  const excludeUserIds = useMemo(() => {
    const memberIds = members.map(member => member.user?.id).filter(Boolean);
    const creatorId = project.createdBy?.id;
    
    return creatorId ? [...memberIds, creatorId] : memberIds;
  }, [members, project.createdBy?.id]);

  // Stable user selection handler
  const handleUserSelect = useCallback((user) => {
    setSelectedUserId(user?.id || null);
  }, []);

  // Stable dropdown key to prevent remounting
  const dropdownKey = useMemo(() => 
    `member-dropdown-${project.id}-${excludeUserIds.join(',')}`, 
    [project.id, excludeUserIds]
  );

  if (loading) {
    return <Loading text="Loading members..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Project Members</h3>
        <p className="text-sm text-gray-600">Manage who has access to "{project.name}"</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Add Member Form */}
      <div className="card p-4 bg-gray-50">
        <h4 className="text-md font-medium text-gray-900 mb-4">Add New Member</h4>
        
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <UserDropdown
              key={dropdownKey}
              value={selectedUserId}
              onChange={handleUserSelect}
              placeholder="Search and select a user..."
              excludeUserIds={excludeUserIds}
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            loading={addingMember}
            disabled={!selectedUserId || addingMember}
            className="w-full"
          >
            {addingMember ? 'Adding Member...' : 'Add Member'}
          </Button>
        </form>
      </div>

      {/* Current Members List */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Current Members ({(members?.length || 0) + 1})
        </h4>

        <div className="space-y-3">
          {/* Project Creator */}
          {project.createdBy && (
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  {project.createdBy.firstName} {project.createdBy.lastName}
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Owner
                  </span>
                </p>
                <p className="text-sm text-gray-600">{project.createdBy.email}</p>
              </div>
              <span className="text-sm text-gray-500">Cannot remove</span>
            </div>
          )}

          {/* Members */}
          {!members || members.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm bg-gray-50 rounded-lg">
              No additional members yet. Add members using the form above.
            </p>
          ) : (
            members.map((member) => (
              <div key={`member-${member.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {member.user?.firstName} {member.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{member.user?.email}</p>
                  <p className="text-xs text-gray-500">
                    Added {new Date(member.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(member.user?.id)}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default React.memo(MemberManagement);