const { prisma } = require('../config/database');

class User {
  static async create(userData) {
    const { username, email, password_hash, first_name, last_name, role = 'user' } = userData;
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: password_hash,
        firstName: first_name,
        lastName: last_name,
        role: role === 'admin' ? 'admin' : 'user'
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      created_at: user.createdAt
    };
  }

  static async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: {
        email,
        isActive: true
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password_hash: user.passwordHash,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    };
  }

  static async findById(id) {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
        isActive: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      created_at: user.createdAt
    };
  }

  static async findByUsername(username) {
    const user = await prisma.user.findUnique({
      where: {
        username,
        isActive: true
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password_hash: user.passwordHash,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    };
  }
}

module.exports = User;