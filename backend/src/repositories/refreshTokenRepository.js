const prisma = require('../config/prisma');

class RefreshTokenRepository {
  async create(data) {
    return prisma.refreshToken.create({ data });
  }

  async findByToken(token) {
    return prisma.refreshToken.findUnique({
      where: { token }
    });
  }

  async delete(token) {
    return prisma.refreshToken.delete({
      where: { token }
    });
  }
}

module.exports = new RefreshTokenRepository();
