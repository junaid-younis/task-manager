import React, { useState, useEffect } from 'react';
import { commentService } from '../../services/comments';
import Comment from './Comment';
import CommentForm from './CommentForm';
import Loading from '../common/Loading';

const CommentList = ({ task }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [task.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getTaskComments(task.id);
      setComments(response.data || []);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (commentData) => {
    try {
      const response = await commentService.createComment(commentData);
      setComments(prev => [response.data, ...prev]);
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      const response = await commentService.updateComment(commentId, { content });
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? response.data : comment
      ));
    } catch (err) {
      setError('Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      setError('Failed to delete comment');
    }
  };

  const handleReplyComment = async (parentCommentId, content) => {
    try {
      const response = await commentService.createComment({
        content,
        taskId: task.id,
        parentCommentId
      });
      
      // Add reply to parent comment
      setComments(prev => prev.map(comment => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), response.data]
          };
        }
        return comment;
      }));
    } catch (err) {
      setError('Failed to add reply');
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
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
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