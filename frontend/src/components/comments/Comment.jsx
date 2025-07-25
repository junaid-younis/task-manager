import React, { useState } from 'react';
import {
  PencilIcon,
  TrashIcon,
  ArrowUturnRightIcon
} from '@heroicons/react/24/outline';
import { formatDateTime, getInitials } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

const Comment = ({ comment, onEdit, onDelete, onReply, level = 0 }) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle different user field structures
  const commentUser = comment.user || comment.User || {};
  const currentUser = user || {};
  
  const isOwner = currentUser.id === commentUser.id;
  const maxLevel = 5; // Allow deeper nesting (increased from 2 to 5)

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      setIsLoading(true);
      try {
        await onEdit(comment.id, editContent.trim());
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving edit:', error);
        // Reset content on error
        setEditContent(comment.content);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleReply = async () => {
    if (replyContent.trim()) {
      setIsLoading(true);
      try {
        await onReply(comment.id, replyContent.trim());
        setReplyContent('');
        setIsReplying(false);
      } catch (error) {
        console.error('Error posting reply:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setIsLoading(true);
      try {
        await onDelete(comment.id);
        setShowActions(false);
      } catch (error) {
        console.error('Error deleting comment:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Get user display info with fallbacks
  const userFirstName = commentUser.firstName || commentUser.first_name || '';
  const userLastName = commentUser.lastName || commentUser.last_name || '';

  return (
    <div className={`${level > 0 ? 'ml-8 mt-4' : 'mb-6'}`}>
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {getInitials(userFirstName, userLastName)}
            </span>
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {userFirstName} {userLastName}
            </span>
            <span className="text-xs text-gray-500">
              {formatDateTime(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}

            {/* Actions */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="text-gray-400 hover:text-gray-600 text-xs p-1"
                >
                  •••
                </button>

                {showActions && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleEdit}
                      className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      <PencilIcon className="h-3 w-3 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <TrashIcon className="h-3 w-3 mr-2" />
                      {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                rows={3}
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveEdit}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Reply Button - show even at deeper levels but with visual indication */}
              {level < maxLevel ? (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center mt-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  <ArrowUturnRightIcon className="h-3 w-3 mr-1" />
                  Reply
                </button>
              ) : (
                <p className="mt-2 text-xs text-gray-400 italic">
                  Maximum reply depth reached
                </p>
              )}
            </div>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                rows={2}
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleReply}
                  disabled={!replyContent.trim() || isLoading}
                  loading={isLoading}
                >
                  {isLoading ? 'Posting...' : 'Reply'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsReplying(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies - with visual depth indicators */}
          {comment.replies && comment.replies.length > 0 && (
            <div className={`mt-3 ${level >= 3 ? 'border-l-2 border-gray-200 pl-3' : ''}`}>
              {level >= 3 && (
                <p className="text-xs text-gray-400 mb-2">
                  {comment.replies.length} repl{comment.replies.length === 1 ? 'y' : 'ies'}
                </p>
              )}
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReply={onReply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close actions */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default Comment;