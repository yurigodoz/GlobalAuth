
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Godoz Auth API',
    version: '1.0.0',
    description: 'Documentação da API de autenticação multi-app com suporte a JWT, refresh tokens, isolamento por aplicação, painel administrativo e arquitetura escalável.'
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      RegisterBody: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', description: 'Email do usuário' },
          password: { type: 'string', description: 'Senha do usuário (mínimo sugerido: 6 caracteres)' },
          app: { type: 'string', description: 'Slug da aplicação que o usuário está se registrando' }
        },
        required: ['email','password','app']
      },
      LoginBody: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', description: 'Email cadastrado' },
          password: { type: 'string', description: 'Senha do usuário' },
          app: { type: 'string', description: 'Slug da aplicação (quando aplicável)' }
        },
        required: ['email','password']
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', description: 'JWT de acesso' },
          refreshToken: { type: 'string', description: 'Token para obter novo accessToken' }
        }
      },
      AppCreate: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          slug: { type: 'string' },
          accessTokenTtl: { type: 'string', description: 'Tempo de vida do access token (ex: 15m)' },
          refreshTokenTtl: { type: 'string', description: 'Tempo de vida do refresh token (ex: 1h)' },
          frontendUrl: { type: 'string', description: 'URL base do frontend do app (usada para montar links de verificação de e-mail/reset de senha)' },
          emailFromAddress: { type: 'string', description: 'Endereço remetente dos e-mails deste app (fallback: RESEND_FROM_EMAIL)' },
          emailFromName: { type: 'string', description: 'Nome do remetente dos e-mails deste app (fallback: name)' }
        },
        required: ['name','slug','frontendUrl']
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuário',
        description: 'Cria um novo usuário associado a uma aplicação (slug `app`).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterBody' },
              example: {
                email: 'meu@email.com',
                password: '123456',
                app: 'meuapp'
              }
            }
          }
        },
        responses: { '201': { description: 'Usuário criado' }, '400': { description: 'Erro de validação' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login de usuário',
        description: 'Autentica usuário e retorna `accessToken` e `refreshToken`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginBody' },
              example: {
                email: 'meu@email.com',
                password: '123456',
                app: 'meuapp'
              }
            }
          }
        },
        responses: {
          '200': { description: 'Tokens', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' }, example: { accessToken: '<jwt>', refreshToken: '<refresh-token>' } } } },
          '401': { description: 'Credenciais inválidas' }
        }
      }
    },
    '/auth/validate-token': {
      get: {
        tags: ['Auth'],
        summary: 'Validar token (protegido)',
        description: 'Verifica se o JWT é válido e retorna informações do usuário autenticado.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'appSlug', in: 'header', required: false, schema: { type: 'string' }, description: 'Slug da aplicação (ex: meuapp)' }
        ],
        responses: { '200': { description: 'Token válido' }, '401': { description: 'Não autorizado' } }
      }
    },
    '/auth/verify-email': {
      post: {
        tags: ['Auth'],
        summary: 'Verificar e-mail',
        description: 'Confirma o e-mail do usuário usando o token enviado por e-mail no cadastro.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { token: { type: 'string' } }, required: ['token'] },
              example: { token: '<token recebido por e-mail>' }
            }
          }
        },
        responses: { '200': { description: 'E-mail verificado' }, '400': { description: 'Token inválido ou expirado' } }
      }
    },
    '/auth/resend-verification': {
      post: {
        tags: ['Auth'],
        summary: 'Reenviar e-mail de verificação',
        description: 'Gera um novo token de verificação (invalidando o anterior) e reenvia o e-mail, se o usuário existir e ainda não estiver verificado. A resposta é sempre uma mensagem genérica, independentemente de o e-mail existir ou já estar verificado, para evitar enumeração de usuários.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' }, app: { type: 'string' } }, required: ['email', 'app'] },
              example: { email: 'meu@email.com', app: 'meuapp' }
            }
          }
        },
        responses: { '200': { description: 'Mensagem genérica de confirmação' }, '400': { description: 'Erro' } }
      }
    },
    '/auth/request-password-reset': {
      post: {
        tags: ['Auth'],
        summary: 'Solicitar reset de senha',
        description: 'Envia o link de reset por e-mail (se o usuário existir e estiver ativo). A resposta é sempre uma mensagem genérica, independentemente de o e-mail existir, para evitar enumeração de usuários — nunca contém o token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' }, app: { type: 'string' } }, required: ['email'] },
              example: { email: 'meu@email.com', app: 'meuapp' }
            }
          }
        },
        responses: { '200': { description: 'Mensagem genérica de confirmação' }, '400': { description: 'Erro' } }
      }
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Resetar senha com token',
        description: 'Reseta a senha usando o token enviado por email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { token: { type: 'string' }, newPassword: { type: 'string' } }, required: ['token','newPassword'] },
              example: { token: 'bc4ba89f32fb519761eaa5e8e4191dc69dfc2ab985b67051e3e7ef063199c126', newPassword: '123456' }
            }
          }
        },
        responses: { '200': { description: 'Senha resetada' }, '400': { description: 'Erro' } }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh token',
        description: 'Gera um novo access token a partir do refresh token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] },
              example: { refreshToken: '1ee816d312468890858a4c9a524c070997b4ced30eaa30f3fa0cccb1d1475ed81fe06f824308ef82' }
            }
          }
        },
        responses: { '200': { description: 'Novo token' }, '401': { description: 'Refresh inválido' } }
      }
    },
    '/admin/login': {
      post: {
        tags: ['Admin'],
        summary: 'Login admin',
        description: 'Autentica administrador e retorna tokens.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email','password'] },
              example: { email: 'meu@email.com', password: '123456' }
            }
          }
        },
        responses: { '200': { description: 'Tokens' }, '401': { description: 'Não autorizado' } }
      }
    },
    '/admin': {
      post: {
        tags: ['Admin'],
        summary: 'Criar admin (superadmin)',
        description: 'Cria um novo admin (apenas `superadmin`).',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string' } }, required: ['email','password','role'] },
              example: { email: 'meu@email.com', password: '123456', role: 'admin' }
            }
          }
        },
        responses: { '201': { description: 'Admin criado' }, '400': { description: 'Erro' } }
      }
    },
    '/admin/apps': {
      post: {
        tags: ['Apps'],
        summary: 'Criar app',
        description: 'Cria uma nova aplicação. Retorna `jwtsecret` e tempos de TTL.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppCreate' },
              example: { name: 'Meu App', slug: 'meuapp', accessTokenTtl: '15m', refreshTokenTtl: '1h', frontendUrl: 'https://meuapp.com', emailFromAddress: 'naoresponda@meuapp.com', emailFromName: 'Meu App' }
            }
          }
        },
        responses: { '201': { description: 'App criado' }, '400': { description: 'Erro' } }
      },
      get: {
        tags: ['Apps'],
        summary: 'Listar apps',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Lista de apps' } }
      }
    },
    '/admin/apps/{id}': {
      patch: {
        tags: ['Apps'],
        summary: 'Atualizar configuração de e-mail/frontend do app',
        description: 'Atualiza `frontendUrl`, `emailFromAddress` e/ou `emailFromName` de um app já existente. Todos os campos são opcionais (atualização parcial).',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  frontendUrl: { type: 'string' },
                  emailFromAddress: { type: 'string' },
                  emailFromName: { type: 'string' }
                }
              },
              example: { frontendUrl: 'https://meuapp.com', emailFromAddress: 'naoresponda@meuapp.com', emailFromName: 'Meu App' }
            }
          }
        },
        responses: { '200': { description: 'App atualizado' }, '400': { description: 'Erro' } }
      }
    },
    '/admin/apps/{id}/toggle-active': {
      patch: {
        tags: ['Apps'],
        summary: 'Ativar/desativar app',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'App atualizado' }, '400': { description: 'Erro' } }
      }
    },
    '/admin/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuários',
        description: 'Lista usuários filtrando por `app` via query string.',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'app', in: 'query', schema: { type: 'string' }, description: 'slug da aplicação (ex: meuapp)' }],
        responses: { '200': { description: 'Lista de usuários' } }
      }
    },
    '/admin/users/{id}/block': {
      patch: {
        tags: ['Users'],
        summary: 'Bloquear usuário',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Usuário bloqueado' }, '400': { description: 'Erro' } }
      }
    },
    '/admin/users/{id}/unblock': {
      patch: {
        tags: ['Users'],
        summary: 'Desbloquear usuário',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Usuário desbloqueado' }, '400': { description: 'Erro' } }
      }
    }
  }
};

module.exports = swaggerSpec;
