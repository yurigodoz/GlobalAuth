const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminRepository = require('../repositories/adminRepository');
const jwtConfig = require('../config/jwt');

class AdminService {
    async create({ email, password }) {
        const existingUser = await adminRepository.findByEmail(email);

        if (existingUser) {
            throw new Error('Admin já existe');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await adminRepository.create({
            email,
            password: passwordHash
        });

        return user;
    }

  async login({ email, password }) {
    const admin = await adminRepository.findByEmail(email);

    if (!admin || !admin.active) {
      throw new Error('Credenciais inválidas');
    }

    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    const accessToken = jwt.sign(
      {
        adminId: admin.id,
        role: admin.role,
        type: 'admin'
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return { accessToken };
  }
}

module.exports = new AdminService();