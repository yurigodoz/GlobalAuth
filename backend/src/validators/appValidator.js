const { z } = require('zod');

const ttl = z
  .string()
  .regex(/^\d+[smhd]$/, 'TTL inválido. Use o formato: 30s, 15m, 2h, 7d');

const appCreateSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  accessTokenTtl: ttl,
  refreshTokenTtl: ttl
});

module.exports = { appCreateSchema };
