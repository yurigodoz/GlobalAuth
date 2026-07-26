🔐 Godoz Auth Service
=====================

**Portfólio:** [godoz.net](https://godoz.net) · **Apps que usam este serviço:** [Luccare](https://luccare.godoz.dev.br) · [Bandapp](https://bandapp.godoz.dev.br) · [Agiotapp](https://agiotapp.godoz.dev.br)

Autenticação como serviço para múltiplas aplicações, com JWT, refresh tokens rotativos, isolamento por aplicação, painel administrativo e arquitetura escalável.

Este projeto foi criado com foco em estudo, boas práticas de segurança e reutilização entre múltiplos sistemas (web e mobile).

> ⚠️ **Isto não é SSO.** O que é compartilhado entre os apps é a **infraestrutura** de autenticação, não a conta do usuário. Cada aplicação é um tenant com a **sua própria base de usuários**: um cadastro criado no app A não existe no app B, e um login não dá acesso aos outros apps. O modelo é o mesmo dos *user pools* do AWS Cognito ou dos *tenants* do Auth0 — um serviço só, cadastros separados.

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

Concentrar a **implementação** de autenticação em um único serviço, reutilizável por vários apps independentes, sem misturar os usuários de um com os do outro. Objetivos:

*   isolamento total por aplicação (inclusive da base de usuários)
    
*   segurança forte
    
*   escalabilidade
    
*   reutilização de código — escrever autenticação uma vez, não uma por projeto
    

Cada app possui:

*   base de usuários própria (cadastro e login independentes)
    
*   JWT secret própria
    
*   tempo de expiração próprio
    
*   refresh tokens independentes
    

🧠 Conceitos principais
=======================

Multi-App Authentication (multi-tenant, não SSO)
------------------------------------------------

O sistema atende vários produtos independentes — hoje:

*   Luccare
    
*   Bandapp
    
*   Agiotapp
    

Cada app é um **tenant** e tem:

*   base de usuários própria
    
*   jwtSecret próprio
    
*   accessTokenTtl
    
*   refreshTokenTtl
    

Isso garante isolamento completo entre aplicações. O login sempre exige o par `email + senha` **dentro de um app específico** — o mesmo e-mail pode existir em dois apps como dois usuários distintos, com senhas distintas.

### Por que não é SSO

| | SSO | GlobalAuth |
| --- | --- | --- |
| Conta do usuário | uma, compartilhada | uma por aplicação |
| Sessão | vale em todos os apps | vale só no app onde foi criada |
| O que é compartilhado | a identidade | o serviço/infraestrutura |

Suportar SSO de verdade seria uma evolução possível (identidade única atravessando apps), mas não é o modelo atual.

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
    
*   Verificação obrigatória de e-mail antes do primeiro login
    
*   Rate limit (limite mais rígido nas rotas de login)
    
*   Validação de payload com Zod em todas as rotas
    

Permite:

*   múltiplos dispositivos
    
*   logout futuro por sessão
    
*   rotação segura
    

🔑 Fluxos principais
====================

Registro
--------

`   POST /auth/register   `

Cria usuário dentro de um app específico e dispara o e-mail de verificação.

Verificação de e-mail
---------------------

`POST /auth/verify-email`

Confirma a conta pelo token recebido por e-mail. Reenvio:

`POST /auth/resend-verification`

O login é bloqueado enquanto o e-mail não for verificado.

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

`http://localhost:3002/docs`

Permite:

*   testar endpoints
    
*   autenticar via JWT
    
*   explorar schemas
    

⚙️ Configuração
===============

.env
----

```env
PORT=3002
DATABASE_URL=postgresql://USUARIO:SENHA@localhost:5432/BANCO
JWT_SECRET=chave-secreta          # usado no token de admin; cada app tem o seu próprio secret no banco
TRUST_PROXY=1                     # atrás de proxy reverso (Nginx), para o rate limit ler o IP real
RESEND_API_KEY=re_xxxxxxxx        # envio de e-mails (verificação e reset de senha)
RESEND_FROM_EMAIL=nao-responda@seudominio.com
```

> O remetente e a URL de destino dos e-mails também podem ser definidos **por app** (`emailFromName`, `emailFromAddress` e `frontendUrl`). O `frontendUrl` é obrigatório para que o e-mail de verificação seja enviado — sem ele, o envio é ignorado com log de erro.

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
    
*   2FA
    
*   Auditoria de login
    
*   RSA keys (assinatura assimétrica)
    

🎯 Status atual
===============

Este serviço já é utilizável em produção para:

*   autenticação multi-app com bases de usuário isoladas
    
*   apps web
    
*   apps mobile
    
*   sistemas com isolamento por tenant
    

👨‍💻 Autor
===========

Projeto criado para estudo e evolução contínua de arquitetura de autenticação moderna.
