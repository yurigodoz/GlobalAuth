const { z } = require('zod');

const adminLoginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória')
});

const adminCreateSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  role: z.enum(['admin', 'superadmin'], { message: 'Role inválido.' })
});

module.exports = { adminLoginSchema, adminCreateSchema };
