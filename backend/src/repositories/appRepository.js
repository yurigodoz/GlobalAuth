const prisma = require('../config/prisma');

class AppRepository {
  async findBySlug(slug) {
    return prisma.app.findUnique({
      where: { slug }
    });
  }

  async create(data) {
    return prisma.app.create({
      data
    });
  }

  async findAll() {
    return prisma.app.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        active: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id) {
    return prisma.app.findUnique({
      where: { id }
    });
  }

  async update(id, data) {
    return prisma.app.update({
      where: { id },
      data
    });
  }
}

module.exports = new AppRepository();