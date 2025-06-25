const prisma = require('../config/database');

class Comment {
  // Create a new comment
  static async create(commentData, userId) {
    const { content, taskId, parentCommentId = null } = commentData;

    // Verify task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        project: {
          isActive: true,
          OR: [
            { createdById: userId },
            { members: { some: { userId } } }
          ]
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!task) {
      throw new Error('Task not found or access denied');
    }

    // If replying to a comment, verify parent comment exists
    if (parentCommentId) {
      const parentComment = await prisma.comment.findFirst({
        where: {
          id: parseInt(parentCommentId),
          taskId: parseInt(taskId)
        }
      });

      if (!parentComment) {
        throw new Error('Parent comment not found');
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: parseInt(taskId),
        userId: parseInt(userId),
        parentCommentId: parentCommentId ? parseInt(parentCommentId) : null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        parentComment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    return this.formatComment(comment);
  }

  // Find all comments for a task
  static async findByTask(taskId, userId, isAdmin = false) {
    // Verify user has access to the task
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        ...(isAdmin ? {} : {
          project: {
            isActive: true,
            OR: [
              { createdById: userId },
              { members: { some: { userId } } }
            ]
          }
        })
      }
    });

    if (!task) {
      throw new Error('Task not found or access denied');
    }

    const comments = await prisma.comment.findMany({
      where: {
        taskId: parseInt(taskId),
        parentCommentId: null // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            },
            _count: {
              select: {
                replies: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return comments.map(comment => this.formatComment(comment));
  }

  // Find comment by ID
  static async findById(id, userId, isAdmin = false) {
    let whereClause = {
      id: parseInt(id)
    };

    // Access control for non-admin users
    if (!isAdmin && userId) {
      whereClause.task = {
        project: {
          isActive: true,
          OR: [
            { createdById: userId },
            { members: { some: { userId } } }
          ]
        }
      };
    }

    const comment = await prisma.comment.findFirst({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        parentComment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    return comment ? this.formatComment(comment) : null;
  }

  // Update comment
  static async update(id, updateData, userId, isAdmin = false) {
    const { content } = updateData;

    // Find existing comment
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: parseInt(id),
        ...(isAdmin ? {} : { userId }) // Only allow updating own comments (unless admin)
      }
    });

    if (!existingComment) {
      throw new Error('Comment not found or access denied');
    }

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: {
        content,
        isEdited: true,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        parentComment: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        task: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    return this.formatComment(comment);
  }

  // Delete comment
  static async delete(id, userId, isAdmin = false) {
    // Find existing comment
    const existingComment = await prisma.comment.findFirst({
      where: {
        id: parseInt(id),
        ...(isAdmin ? {} : { userId }) // Only allow deleting own comments (unless admin)
      },
      include: {
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    if (!existingComment) {
      throw new Error('Comment not found or access denied');
    }

    // Check if comment has replies
    if (existingComment._count.replies > 0) {
      throw new Error('Cannot delete comment with replies. Please delete replies first.');
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Comment deleted successfully' };
  }

  // Get comment statistics
  static async getStatistics(taskId = null, projectId = null, userId = null, isAdmin = false) {
    let whereClause = {};

    // Access control
    if (!isAdmin && userId) {
      whereClause.task = {
        project: {
          isActive: true,
          OR: [
            { createdById: userId },
            { members: { some: { userId } } }
          ]
        }
      };
    }

    if (taskId) {
      whereClause.taskId = parseInt(taskId);
    }

    if (projectId) {
      whereClause.task = {
        ...whereClause.task,
        projectId: parseInt(projectId)
      };
    }

    const [
      totalComments,
      myComments,
      recentComments,
      commentsToday
    ] = await Promise.all([
      prisma.comment.count({ where: whereClause }),
      userId ? prisma.comment.count({ 
        where: { 
          ...whereClause, 
          userId 
        } 
      }) : 0,
      prisma.comment.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.comment.count({
        where: {
          ...whereClause,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today
          }
        }
      })
    ]);

    return {
      total: totalComments,
      myComments,
      recent: recentComments,
      today: commentsToday
    };
  }

  // Get recent comments
  static async getRecentComments(limit = 10, userId = null, isAdmin = false) {
    let whereClause = {};

    // Access control
    if (!isAdmin && userId) {
      whereClause.task = {
        project: {
          isActive: true,
          OR: [
            { createdById: userId },
            { members: { some: { userId } } }
          ]
        }
      };
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return comments.map(comment => this.formatComment(comment));
  }

  // Format comment for response
  static formatComment(comment) {
    const formatted = {
      id: comment.id,
      content: comment.content,
      isEdited: comment.isEdited,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: comment.user
    };

    // Add parent comment if exists
    if (comment.parentComment) {
      formatted.parentComment = {
        id: comment.parentComment.id,
        content: comment.parentComment.content.substring(0, 100) + '...', // Preview
        user: comment.parentComment.user
      };
    }

    // Add replies if exists
    if (comment.replies) {
      formatted.replies = comment.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        isEdited: reply.isEdited,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        user: reply.user,
        replyCount: reply._count?.replies || 0
      }));
    }

    // Add task info if exists
    if (comment.task) {
      formatted.task = comment.task;
    }

    // Add reply count
    if (comment._count) {
      formatted.replyCount = comment._count.replies;
    }

    return formatted;
  }
}

module.exports = Comment;