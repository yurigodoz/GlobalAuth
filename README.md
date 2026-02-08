🔐 Godoz Auth Service
=====================

Serviço central de autenticação multi-app com suporte a JWT, refresh tokens, isolamento por aplicação, painel administrativo e arquitetura escalável.

Este projeto foi criado com foco em estudo, boas práticas de segurança e reutilização entre múltiplos sistemas (web e mobile).

📦 Stack
========

*   Node.js
    
*   Express
    
*   Prisma ORM
    
*   PostgreSQL
    
*   JWT
    
*   Swagger (documentação)
    

Arquitetura:

`Controller → Service → Repository → Prisma → PostgreSQL`

🎯 Objetivo
===========

Centralizar autenticação para múltiplos apps independentes, mantendo:

*   isolamento por aplicação
    
*   segurança forte
    
*   escalabilidade
    
*   reutilização de código
    

Cada app possui:

*   usuários próprios
    
*   JWT secret própria
    
*   tempo de expiração próprio
    
*   refresh tokens independentes
    

🧠 Conceitos principais
=======================

Multi-App Authentication
------------------------

O sistema permite vários produtos independentes:

*   Luccare
    
*   Finance
    
*   Tasks
    
*   etc.
    

Cada app tem:

*   jwtSecret próprio
    
*   accessTokenTtl
    
*   refreshTokenTtl
    

Isso garante isolamento entre aplicações.

Tipos de usuários
-----------------

### Usuários finais

Logam em apps específicos:

`email + senha + app`

### Administradores

Gerenciam o sistema:

*   criar apps
    
*   listar usuários
    
*   bloquear contas
    
*   resetar senhas
    

🔐 Segurança implementada
=========================

*   JWT com secret por app
    
*   Access token curto
    
*   Refresh token longo
    
*   Rotação automática de refresh token
    
*   Reset de senha via token temporário
    
*   Bloqueio de usuário
    
*   TTL configurável por aplicação
    
*   Isolamento completo entre apps
    

Permite:

*   múltiplos dispositivos
    
*   logout futuro por sessão
    
*   rotação segura
    

🔑 Fluxos principais
====================

Registro
--------

`   POST /auth/register   `

Cria usuário dentro de um app específico.

Login
-----

`POST /auth/login`

Retorna:

`accessToken
refreshToken`

Refresh Token
-------------

`POST /auth/refresh`

Gera:

*   novo accessToken
    
*   novo refreshToken
    

O refresh antigo é invalidado automaticamente.

Validar Token
-------------

`GET /auth/validate-token`
`Authorization: Bearer TOKEN`
`x-app: slug-do-app`

Reset de senha (usuário)
------------------------

1.  Solicitar reset:
    

`POST /auth/request-password-reset`

1.  Criar nova senha:
    

`POST /auth/reset-password`

Token expira em 1 hora.

Reset de senha (admin)
----------------------

`POST /admin/users/:id/reset-password`

Gera token manual para suporte.

Bloquear usuário
----------------

`PATCH /admin/users/:id/block`

Desbloquear usuário
-------------------

`PATCH /admin/users/:id/unblock`

🧩 Administração
================

Login admin
-----------

`POST /admin/login`

Criar admin
-----------

`POST /admin/create`

Criar app
---------

`POST /admin/apps`

Gera automaticamente:

*   jwtSecret
    
*   TTL padrão
    

Listar apps
-----------

`GET /admin/apps`

Ativar/Desativar app
--------------------

`PATCH /admin/apps/:id/toggle-active`

Listar usuários por app
-----------------------

`GET /admin/users?app=slug`

📄 Documentação Swagger
=======================

Disponível em:

`http://localhost:3000/docs`

Permite:

*   testar endpoints
    
*   autenticar via JWT
    
*   explorar schemas
    

⚙️ Configuração
===============

.env
----

`PORT=3000` `BASE_URL="http://localhost:3000"` `DATABASE_URL=postgresql://USUARIO:SENHA@localhost:5432/BANCO` `JWT_SECRET=chave-secreta`

🚀 Como rodar o projeto
=======================

`npm install`  `npx prisma migrate dev`  `npm run dev`

📱 Suporte a Mobile
===================

Arquitetura pronta para:

*   múltiplos dispositivos
    
*   sessões independentes
    
*   refresh tokens rotativos
    
*   segurança com access token curto
    

📈 Possíveis evoluções
======================

*   Logout por dispositivo
    
*   Logout global
    
*   Painel admin (frontend)
    
*   Envio automático de email
    
*   Verificação de email
    
*   2FA
    
*   Auditoria de login
    
*   Rate limit
    
*   RSA keys
    

🎯 Status atual
===============

Este serviço já é utilizável em produção para:

*   autenticação multi-app
    
*   apps web
    
*   apps mobile
    
*   sistemas com isolamento por tenant
    

👨‍💻 Autor
===========

Projeto criado para estudo e evolução contínua de arquitetura de autenticação moderna.
