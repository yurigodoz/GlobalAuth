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

  // deleteMany: idempotente — não lança exceção se o registro já foi
  // removido por uma requisição concorrente (diferente de delete, que
  // estoura P2025 "No record was found for a delete").
  async delete(token) {
    return prisma.refreshToken.deleteMany({
      where: { token }
    });
  }

  // Marca o token como rotacionado, apontando para o sucessor.
  // updateMany pelo mesmo motivo de idempotência do delete acima.
  async markRotated(token, replacedByToken) {
    return prisma.refreshToken.updateMany({
      where: { token },
      data: { replacedByToken, rotatedAt: new Date() }
    });
  }

  // Limpeza dos tokens rotacionados cuja janela de tolerância já passou.
  async deleteRotatedBefore(date) {
    return prisma.refreshToken.deleteMany({
      where: { rotatedAt: { lt: date } }
    });
  }
}

module.exports = new RefreshTokenRepository();
