import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';
import Button from '../common/Button';

const CommentForm = ({ taskId, onSubmit, placeholder = "Add a comment..." }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({
        content: content.trim(),
        taskId
      });
      setContent('');
    } catch (err) {
      console.error('Failed to post comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get user initials from different possible field names
  const userFirstName = user?.first_name || user?.firstName || '';
  const userLastName = user?.last_name || user?.lastName || '';

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {getInitials(userFirstName, userLastName)}
            </span>
          </div>
        </div>

        {/* Comment Input */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (error) setError(null); // Clear error on typing
            }}
            placeholder={placeholder}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />

          {/* Submit Button */}
          <div className="mt-2 flex justify-end">
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;