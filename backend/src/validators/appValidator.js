const { z } = require('zod');

const ttl = z
  .string()
  .regex(/^\d+[smhd]$/, 'TTL inválido. Use o formato: 30s, 15m, 2h, 7d');

const appCreateSchema = z.object({
  name: z.string({ error: 'Nome é obrigatório' }).min(1, 'Nome é obrigatório'),
  slug: z
    .string({ error: 'Slug é obrigatório' })
    .min(1, 'Slug é obrigatório')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  accessTokenTtl: ttl,
  refreshTokenTtl: ttl,
  frontendUrl: z.string({ error: 'frontendUrl é obrigatório' }).url('frontendUrl deve ser uma URL válida'),
  emailFromAddress: z.string().email('emailFromAddress deve ser um e-mail válido').optional(),
  emailFromName: z.string().min(1).optional()
});

const appUpdateSchema = z.object({
  frontendUrl: z.string().url('frontendUrl deve ser uma URL válida').optional(),
  emailFromAddress: z.string().email('emailFromAddress deve ser um e-mail válido').optional(),
  emailFromName: z.string().min(1).optional()
});

module.exports = { appCreateSchema, appUpdateSchema };
