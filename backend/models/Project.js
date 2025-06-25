const prisma = require('../config/database');

class Project {
  // Create a new project
  static async create(projectData, createdById) {
    const { name, description } = projectData;
    
    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById
      },
      include: {
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
            members: true,
            tasks: true
          }
        }
      }
    });

    return this.formatProject(project);
  }

  // Find all projects (with filtering options)
  static async findAll(options = {}) {
    const { userId, isAdmin = false, page = 1, limit = 10 } = options;
    
    const skip = (page - 1) * limit;
    
    let whereClause = {
      isActive: true
    };

    // If not admin, only show projects where user is creator or member
    if (!isAdmin && userId) {
      whereClause = {
        ...whereClause,
        OR: [
          { createdById: userId },
          { members: { some: { userId } } }
        ]
      };
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          members: {
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
          _count: {
            select: {
              tasks: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.project.count({ where: whereClause })
    ]);

    return {
      projects: projects.map(project => this.formatProject(project)),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  // Find project by ID
  static async findById(id, userId = null, isAdmin = false) {
    let whereClause = {
      id: parseInt(id),
      isActive: true
    };

    // If not admin, check if user has access to this project
    if (!isAdmin && userId) {
      whereClause = {
        ...whereClause,
        OR: [
          { createdById: userId },
          { members: { some: { userId } } }
        ]
      };
    }

    const project = await prisma.project.findFirst({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            },
            addedBy: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: {
            addedAt: 'asc'
          }
        },
        tasks: {
          include: {
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
                username: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    return project ? this.formatProject(project) : null;
  }

  // Update project
  static async update(id, updateData, userId, isAdmin = false) {
    // Check if user has permission to update
    const existingProject = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        isActive: true,
        ...(isAdmin ? {} : { createdById: userId })
      }
    });

    if (!existingProject) {
      throw new Error('Project not found or access denied');
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
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
            members: true,
            tasks: true
          }
        }
      }
    });

    return this.formatProject(project);
  }

  // Soft delete project
  static async delete(id, userId, isAdmin = false) {
    // Check if user has permission to delete
    const existingProject = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        isActive: true,
        ...(isAdmin ? {} : { createdById: userId })
      }
    });

    if (!existingProject) {
      throw new Error('Project not found or access denied');
    }

    await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return { message: 'Project deleted successfully' };
  }

  // Add member to project
  static async addMember(projectId, userId, addedById, isAdmin = false) {
    // Check if user has permission to add members
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        isActive: true,
        ...(isAdmin ? {} : { createdById: addedById })
      }
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId), isActive: true }
    });

    if (!userExists) {
      throw new Error('User not found');
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: parseInt(projectId),
          userId: parseInt(userId)
        }
      }
    });

    if (existingMember) {
      throw new Error('User is already a member of this project');
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: parseInt(projectId),
        userId: parseInt(userId),
        addedById: parseInt(addedById)
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
        addedBy: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    return {
      id: member.id,
      user: member.user,
      addedBy: member.addedBy,
      addedAt: member.addedAt
    };
  }

  // Remove member from project
  static async removeMember(projectId, userId, removedById, isAdmin = false) {
    // Check if user has permission to remove members
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        isActive: true,
        ...(isAdmin ? {} : { createdById: removedById })
      }
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    // Check if member exists
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: parseInt(projectId),
          userId: parseInt(userId)
        }
      }
    });

    if (!member) {
      throw new Error('User is not a member of this project');
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: parseInt(projectId),
          userId: parseInt(userId)
        }
      }
    });

    return { message: 'Member removed successfully' };
  }

  // Get project members
  static async getMembers(projectId, userId, isAdmin = false) {
    // Check if user has access to this project
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        isActive: true,
        ...(isAdmin ? {} : {
          OR: [
            { createdById: userId },
            { members: { some: { userId } } }
          ]
        })
      }
    });

    if (!project) {
      throw new Error('Project not found or access denied');
    }

    const members = await prisma.projectMember.findMany({
      where: {
        projectId: parseInt(projectId)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        addedBy: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        addedAt: 'asc'
      }
    });

    return members.map(member => ({
      id: member.id,
      user: member.user,
      addedBy: member.addedBy,
      addedAt: member.addedAt
    }));
  }

  // Format project for response
  static formatProject(project) {
    const formatted = {
      id: project.id,
      name: project.name,
      description: project.description,
      isActive: project.isActive,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      createdBy: project.createdBy
    };

    // Add members if included
    if (project.members) {
      formatted.members = project.members.map(member => ({
        id: member.id,
        user: member.user,
        addedBy: member.addedBy,
        addedAt: member.addedAt
      }));
      formatted.memberCount = project.members.length;
    }

    // Add tasks if included
    if (project.tasks) {
      formatted.tasks = project.tasks;
      formatted.taskCount = project.tasks.length;
    }

    // Add counts if included
    if (project._count) {
      formatted.memberCount = formatted.memberCount || project._count.members;
      formatted.taskCount = formatted.taskCount || project._count.tasks;
    }

    return formatted;
  }
}

module.exports = Project;