// models/Task.js - CORRECTED to match your Prisma schema

const prisma = require('../config/database');

class Task {
  // Create a new task - CORRECTED field names
  static async create(taskData, createdById) {
    const { 
      title, 
      description, 
      projectId, 
      assignedTo = null,      // Frontend sends this
      assignedToId = null,    // Legacy support
      priority = 1, 
      dueDate = null 
    } = taskData;

    // Use assignedTo if provided, fallback to assignedToId
    const finalAssignedToId = assignedTo || assignedToId;

    console.log('📝 Task creation data:', {
      title,
      description,
      projectId,
      assignedTo,
      assignedToId,
      finalAssignedToId,
      priority,
      dueDate
    });

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        isActive: true,
        OR: [
          { createdById }, // ✅ This matches your schema
          { members: { some: { userId: createdById } } }
        ]
      }
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // If finalAssignedToId is provided, verify user is a project member
    if (finalAssignedToId) {
      console.log('🔍 Verifying assignment for user:', finalAssignedToId, 'in project:', projectId);
      
      const isMember = await this.verifyProjectMember(projectId, finalAssignedToId);
      if (!isMember) {
        console.log('❌ User is not a project member');
        throw new Error('Cannot assign task to user who is not a project member');
      }
      
      console.log('✅ Assignment verification passed');
    }

    const taskCreateData = {
      title,
      description,
      projectId: parseInt(projectId),
      assignedToId: finalAssignedToId ? parseInt(finalAssignedToId) : null, // ✅ This matches your schema
      createdById: parseInt(createdById), // ✅ This matches your schema
      priority: parseInt(priority),
      dueDate: dueDate ? new Date(dueDate) : null
    };

    console.log('💾 Creating task with data:', taskCreateData);

    const task = await prisma.task.create({
      data: taskCreateData,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignedTo: { // ✅ This matches your schema relation name
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        createdBy: { // ✅ This matches your schema relation name
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

    console.log('✅ Task created successfully:', {
      id: task.id,
      title: task.title,
      assignedToId: task.assignedToId,
      assignedTo: task.assignedTo
    });

    return this.formatTask(task);
  }

  // Update task - CORRECTED field names
  static async update(id, updateData, userId, isAdmin = false) {
    // Check if user has permission to update
    const existingTask = await this.findById(id, userId, isAdmin);
    
    if (!existingTask) {
      throw new Error('Task not found or access denied');
    }

    // Handle both assignedTo and assignedToId from frontend
    const finalAssignedToId = updateData.assignedTo !== undefined 
      ? updateData.assignedTo 
      : updateData.assignedToId;

    // If changing assignment, verify new assignee is project member
    if (finalAssignedToId !== undefined && finalAssignedToId !== null) {
      const isMember = await this.verifyProjectMember(
        existingTask.project.id, 
        finalAssignedToId
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
    
    // Handle assignment field mapping
    if (updateData.assignedTo !== undefined || updateData.assignedToId !== undefined) {
      updateFields.assignedToId = finalAssignedToId ? parseInt(finalAssignedToId) : null; // ✅ Correct field name
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
        assignedTo: { // ✅ Correct relation name
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        createdBy: { // ✅ Correct relation name
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

  // Find all tasks with filtering and pagination - CORRECTED
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
              { createdById: userId }, // ✅ Correct field name
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
            { createdById: userId }, // ✅ Correct field name
            { members: { some: { userId } } }
          ]
        };
      }
    } else if (projectId) {
      whereClause.projectId = parseInt(projectId);
    }

    // Apply filters
    if (assignedToId) {
      whereClause.assignedToId = parseInt(assignedToId); // ✅ Correct field name
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
          assignedTo: { // ✅ Correct relation name
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          createdBy: { // ✅ Correct relation name
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

  // Find task by ID - CORRECTED
  static async findById(id, userId = null, isAdmin = false) {
    let whereClause = {
      id: parseInt(id)
    };

    // Access control for non-admin users
    if (!isAdmin && userId) {
      whereClause.project = {
        isActive: true,
        OR: [
          { createdById: userId }, // ✅ Correct field name
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
            createdById: true // ✅ Correct field name
          }
        },
        assignedTo: { // ✅ Correct relation name
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        createdBy: { // ✅ Correct relation name
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

  // Delete task - CORRECTED
  static async delete(id, userId, isAdmin = false) {
    // Check if user has permission to delete
    const existingTask = await this.findById(id, userId, isAdmin);
    
    if (!existingTask) {
      throw new Error('Task not found or access denied');
    }

    // Only project creators or admins can delete tasks
    if (!isAdmin && existingTask.project.createdById !== userId) { // ✅ Correct field name
      throw new Error('Only project creators can delete tasks');
    }

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    return { message: 'Task deleted successfully' };
  }

  // Get task statistics - CORRECTED
  static async getStatistics(projectId = null, userId = null, isAdmin = false) {
    let whereClause = {};

    if (!isAdmin && userId) {
      whereClause.project = {
        isActive: true,
        OR: [
          { createdById: userId }, // ✅ Correct field name
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
          assignedToId: userId // ✅ Correct field name
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

  // Verify if user is project member - CORRECTED
  static async verifyProjectMember(projectId, userId) {
    console.log('🔍 Verifying project membership:', { projectId, userId });
    
    const projectIdInt = parseInt(projectId);
    const userIdInt = parseInt(userId);

    // Check if user is project creator
    const project = await prisma.project.findFirst({
      where: {
        id: projectIdInt,
        createdById: userIdInt, // ✅ Correct field name
        isActive: true
      }
    });

    if (project) {
      console.log('✅ User is project creator');
      return true;
    }

    // Check if user is project member
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: projectIdInt,
        userId: userIdInt
      },
      include: {
        user: {
          select: { isActive: true }
        }
      }
    });

    if (membership && membership.user.isActive) {
      console.log('✅ User is project member');
      return true;
    }

    console.log('❌ User is neither creator nor member of project');
    
    // Debug: Show who IS a member
    const projectMembers = await prisma.project.findUnique({
      where: { id: projectIdInt },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } }, // ✅ Correct relation
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } }
          }
        }
      }
    });

    console.log('📋 Project members:', {
      creator: projectMembers?.createdBy,
      members: projectMembers?.members?.map(m => m.user)
    });

    return false;
  }

  // Format task for response - CORRECTED
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
      assignedTo: task.assignedTo, // ✅ This relation name matches your schema
      createdBy: task.createdBy     // ✅ This relation name matches your schema
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