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
}

module.exports = new UserRepository();
