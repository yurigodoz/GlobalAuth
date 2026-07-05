const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function getFrontendUrl(app) {
  return app.frontendUrl || process.env.DEFAULT_FRONTEND_URL;
}

function getFrom(app) {
  const address = app.emailFromAddress || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const name = app.emailFromName || app.name;

  return name ? `${name} <${address}>` : address;
}

async function send({ app, to, subject, html, context }) {
  const { data, error } = await resend.emails.send({
    from: getFrom(app),
    to,
    subject,
    html
  });

  if (error) {
    console.error(`Falha ao enviar e-mail (${context})`, { to, appSlug: app.slug, error });
    return { ok: false, error };
  }

  return { ok: true, data };
}

async function sendVerificationEmail(user, app, token) {
  const link = `${getFrontendUrl(app)}/verificar-email?token=${token}`;

  return send({
    app,
    to: user.email,
    subject: 'Confirme seu e-mail',
    context: 'verificação de e-mail',
    html: `
      <p>Olá,</p>
      <p>Obrigado por se cadastrar. Confirme seu e-mail clicando no link abaixo:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este link expira em 24 horas. Se você não fez esse cadastro, ignore este e-mail.</p>
    `
  });
}

async function sendPasswordResetEmail(user, app, token) {
  const link = `${getFrontendUrl(app)}/redefinir-senha?token=${token}`;

  return send({
    app,
    to: user.email,
    subject: 'Redefinição de senha',
    context: 'redefinição de senha',
    html: `
      <p>Olá,</p>
      <p>Recebemos uma solicitação para redefinir sua senha. Clique no link abaixo para escolher uma
      nova senha:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Este link expira em 1 hora. Se você não solicitou essa redefinição, ignore este e-mail.</p>
    `
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
