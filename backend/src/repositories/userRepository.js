const prisma = require('../config/prisma');

class UserRepository {
  async create(data) {
    return prisma.user.create({ data });
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
      data
    });
  }
  
  async findByResetToken(token) {
    return prisma.user.findFirst({
      where: { passwordResetToken: token }
    });
  }
}

module.exports = new UserRepository();
