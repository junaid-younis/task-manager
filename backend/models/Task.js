const prisma = require('../config/database');

class Task {
  // Create a new task
  static async create(taskData, createdById) {
    const { 
      title, 
      description, 
      projectId, 
      assignedToId = null, 
      priority = 1, 
      dueDate = null 
    } = taskData;

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        isActive: true,
        OR: [
          { createdById },
          { members: { some: { userId: createdById } } }
        ]
      }
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // If assignedToId is provided, verify user is a project member
    if (assignedToId) {
      const isMember = await this.verifyProjectMember(projectId, assignedToId);
      if (!isMember) {
        throw new Error('Cannot assign task to user who is not a project member');
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId: parseInt(projectId),
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        createdById: parseInt(createdById),
        priority: parseInt(priority),
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return this.formatTask(task);
  }

  // Find all tasks with filtering and pagination
  static async findAll(options = {}) {
    const { 
      userId, 
      isAdmin = false,
      projectId = null,
      assignedToId = null,
      status = null,
      priority = null,
      search = null,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1, 
      limit = 10 
    } = options;

    const skip = (page - 1) * limit;
    
    let whereClause = {};

    // Project access control
    if (!isAdmin) {
      if (projectId) {
        // Check if user has access to specific project
        const projectAccess = await prisma.project.findFirst({
          where: {
            id: parseInt(projectId),
            isActive: true,
            OR: [
              { createdById: userId },
              { members: { some: { userId } } }
            ]
          }
        });
        
        if (!projectAccess) {
          throw new Error('Project not found or access denied');
        }
        
        whereClause.projectId = parseInt(projectId);
      } else {
        // Show only tasks from projects user has access to
        whereClause.project = {
          isActive: true,
          OR: [
            { createdById: userId },
            { members: { some: { userId } } }
          ]
        };
      }
    } else if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }

    // Apply filters
    if (assignedToId) {
      whereClause.assignedToId = parseInt(assignedToId);
    }

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = parseInt(priority);
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Sorting
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          createdBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.task.count({ where: whereClause })
    ]);

    return {
      tasks: tasks.map(task => this.formatTask(task)),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Find task by ID
  static async findById(id, userId = null, isAdmin = false) {
    let whereClause = {
      id: parseInt(id)
    };

    // Access control for non-admin users
    if (!isAdmin && userId) {
      whereClause.project = {
        isActive: true,
        OR: [
          { createdById: userId },
          { members: { some: { userId } } }
        ]
      };
    }

    const task = await prisma.task.findFirst({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            createdById: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        comments: {
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
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return task ? this.formatTask(task) : null;
  }

  // Update task
  static async update(id, updateData, userId, isAdmin = false) {
    // Check if user has permission to update
    const existingTask = await this.findById(id, userId, isAdmin);
    
    if (!existingTask) {
      throw new Error('Task not found or access denied');
    }

    // If changing assignment, verify new assignee is project member
    if (updateData.assignedToId !== undefined && updateData.assignedToId !== null) {
      const isMember = await this.verifyProjectMember(
        existingTask.project.id, 
        updateData.assignedToId
      );
      if (!isMember) {
        throw new Error('Cannot assign task to user who is not a project member');
      }
    }

    // Prepare update data
    const updateFields = {};
    
    if (updateData.title !== undefined) updateFields.title = updateData.title;
    if (updateData.description !== undefined) updateFields.description = updateData.description;
    if (updateData.status !== undefined) updateFields.status = updateData.status;
    if (updateData.priority !== undefined) updateFields.priority = parseInt(updateData.priority);
    if (updateData.dueDate !== undefined) {
      updateFields.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null;
    }
    if (updateData.assignedToId !== undefined) {
      updateFields.assignedToId = updateData.assignedToId ? parseInt(updateData.assignedToId) : null;
    }

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateFields,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return this.formatTask(task);
  }

  // Delete task
  static async delete(id, userId, isAdmin = false) {
    // Check if user has permission to delete
    const existingTask = await this.findById(id, userId, isAdmin);
    
    if (!existingTask) {
      throw new Error('Task not found or access denied');
    }

    // Only project creators or admins can delete tasks
    if (!isAdmin && existingTask.project.createdById !== userId) {
      throw new Error('Only project creators can delete tasks');
    }

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Task deleted successfully' };
  }

  // Get task statistics
  static async getStatistics(projectId = null, userId = null, isAdmin = false) {
    let whereClause = {};

    if (!isAdmin && userId) {
      whereClause.project = {
        isActive: true,
        OR: [
          { createdById: userId },
          { members: { some: { userId } } }
        ]
      };
    }

    if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }

    const [
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks,
      myTasks
    ] = await Promise.all([
      prisma.task.count({ where: whereClause }),
      prisma.task.count({ where: { ...whereClause, status: 'to_do' } }),
      prisma.task.count({ where: { ...whereClause, status: 'in_progress' } }),
      prisma.task.count({ where: { ...whereClause, status: 'done' } }),
      prisma.task.count({ 
        where: { 
          ...whereClause, 
          dueDate: { lt: new Date() },
          status: { not: 'done' }
        } 
      }),
      userId ? prisma.task.count({ 
        where: { 
          ...whereClause, 
          assignedToId: userId 
        } 
      }) : 0
    ]);

    return {
      total: totalTasks,
      byStatus: {
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks
      },
      overdue: overdueTasks,
      assignedToMe: myTasks,
      completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    };
  }

  // Helper: Verify if user is project member
  static async verifyProjectMember(projectId, userId) {
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: parseInt(projectId),
          userId: parseInt(userId)
        }
      }
    });

    // Also check if user is project creator
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        createdById: parseInt(userId)
      }
    });

    return membership || project;
  }

  // Format task for response
  static formatTask(task) {
    const formatted = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: task.project,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy
    };

    // Add comments if included
    if (task.comments) {
      formatted.comments = task.comments;
    }

    // Add comment count
    if (task._count) {
      formatted.commentCount = task._count.comments;
    }

    return formatted;
  }
}

module.exports = Task;