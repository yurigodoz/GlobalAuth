const prisma = require('../config/prisma');

class UserRepository {
  async create(data) {
    return prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        active: true,
        createdAt: true
      }
    });
  }

  async findByEmailAndApp(email, appId) {
    return prisma.user.findFirst({
      where: { email, appId }
    });
  }

  async findByApp(appId) {
    return prisma.user.findMany({
      where: { appId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id: Number(id) }
    });
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        email: true,
        active: true,
        createdAt: true,
        blockedAt: true
      }
    });
  }
  
  async findByResetToken(token) {
    return prisma.user.findFirst({
      where: { passwordResetToken: token }
    });
  }
}

module.exports = new UserRepository();
