const prisma = require('../config/prisma');

class AdminRepository {
  async create(data) {
    return prisma.admin.create({
      data,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
  }

  async findByEmail(email) {
    return prisma.admin.findUnique({
      where: { email }
    });
  }

  async findById(id) {
    return prisma.admin.findUnique({
      where: { id }
    });
  }
}

module.exports = new AdminRepository();