import React, { useState, useEffect, useCallback } from 'react';
import { commentService } from '../../services/comments';
import Comment from './Comment';
import CommentForm from './CommentForm';
import Loading from '../common/Loading';

const CommentList = ({ task }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate total comment count including all nested replies
  const getTotalCommentCount = () => {
    const countReplies = (comment) => {
      let count = 1; // Count the comment itself
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => {
          count += countReplies(reply); // Recursively count nested replies
        });
      }
      return count;
    };

    return comments.reduce((total, comment) => total + countReplies(comment), 0);
  };

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await commentService.getTaskComments(task.id);
      
      // Handle Prisma backend response structure
      let commentData = [];
      if (response.success && response.data) {
        commentData = response.data;
      } else if (response.data) {
        commentData = response.data;
      } else if (Array.isArray(response)) {
        commentData = response;
      }
      
      // Comments from Prisma backend should already be in correct format
      // No transformation needed as Prisma model handles formatting
      const transformedComments = commentData.map(comment => ({
        ...comment,
        // Ensure user object has required fields (already formatted by Prisma model)
        user: comment.user || {},
        replies: comment.replies || []
      }));
      
      setComments(transformedComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [task.id]);

  useEffect(() => {
    if (task?.id) {
      fetchComments();
    }
  }, [task?.id, fetchComments]);

  const handleAddComment = async (commentData) => {
    try {
      setError(null);
      const response = await commentService.createComment(commentData);
      
      // Handle Prisma response structure
      let newComment = response.data || response;
      
      // Prisma backend already formats the comment correctly
      setComments(prev => [newComment, ...prev]);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      setError(null);
      const response = await commentService.updateComment(commentId, { content });
      
      let updatedComment = response.data || response;
      
      // Recursively update comment at any nesting level
      const updateCommentRecursively = (comments, id, updated) => {
        return comments.map(comment => {
          // If this is the comment to update
          if (comment.id === id) {
            return { ...updated, replies: comment.replies };
          }
          
          // If this comment has replies, check them recursively
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = updateCommentRecursively(comment.replies, id, updated);
            // Only update if a change was made in the replies
            if (updatedReplies !== comment.replies) {
              return { ...comment, replies: updatedReplies };
            }
          }
          
          return comment;
        });
      };

      setComments(prev => updateCommentRecursively(prev, commentId, updatedComment));
    } catch (err) {
      console.error('Error editing comment:', err);
      setError('Failed to edit comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setError(null);
      await commentService.deleteComment(commentId);
      
      // Recursively remove comment from any nesting level
      const removeCommentRecursively = (comments, id) => {
        return comments
          .filter(comment => comment.id !== id) // Remove if it's this comment
          .map(comment => {
            // If this comment has replies, check them recursively
            if (comment.replies && comment.replies.length > 0) {
              const filteredReplies = removeCommentRecursively(comment.replies, id);
              // Only update if replies actually changed
              if (filteredReplies.length !== comment.replies.length) {
                return { ...comment, replies: filteredReplies };
              }
            }
            return comment;
          });
      };

      setComments(prev => removeCommentRecursively(prev, commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleReplyComment = async (parentCommentId, content) => {
    try {
      setError(null);
      const response = await commentService.createComment({
        content,
        taskId: task.id,
        parentCommentId
      });

      let newReply = response.data || response;
      
      // Recursively add reply to the correct parent (handles nested replies)
      const addReplyToComment = (comments, parentId, reply) => {
        return comments.map(comment => {
          // If this is the direct parent
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply]
            };
          }
          
          // If this comment has replies, check them recursively
          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = addReplyToComment(comment.replies, parentId, reply);
            // Only update if a change was made in the replies
            if (updatedReplies !== comment.replies) {
              return {
                ...comment,
                replies: updatedReplies
              };
            }
          }
          
          return comment;
        });
      };

      setComments(prev => addReplyToComment(prev, parentCommentId, newReply));
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply. Please try again.');
    }
  };

  if (loading) {
    return <Loading text="Loading comments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Task Info */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {getTotalCommentCount()} total comment{getTotalCommentCount() !== 1 ? 's' : ''} 
          ({comments.length} main, {getTotalCommentCount() - comments.length} replies)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-800 hover:text-red-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add Comment Form */}
      <CommentForm taskId={task.id} onSubmit={handleAddComment} />

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReply={handleReplyComment}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentList;