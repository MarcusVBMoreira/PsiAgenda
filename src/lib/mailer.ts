import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });

  return transporter;
}

async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn(
      `[mailer] SMTP nao configurado — e-mail para ${to} nao enviado. Assunto: "${subject}".`
    );
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[mailer] Conteudo (somente dev):\n${html}`);
    }
    return;
  }

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

export async function sendTwoFactorCodeEmail(to: string, code: string) {
  await sendMail(
    to,
    "Seu codigo de verificacao — PsiAgenda",
    `<p>Seu codigo de verificacao em duas etapas e:</p>
     <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
     <p>Este codigo expira em 10 minutos. Se voce nao tentou fazer login, ignore este e-mail.</p>`
  );
}

export async function sendPasswordResetCodeEmail(to: string, code: string) {
  await sendMail(
    to,
    "Recuperacao de senha — PsiAgenda",
    `<p>Recebemos uma solicitacao para redefinir sua senha. Use o codigo abaixo:</p>
     <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
     <p>Este codigo expira em 10 minutos. Se voce nao solicitou, ignore este e-mail.</p>`
  );
}

export async function sendSessionReminderEmail(
  to: string,
  params: { patientName: string; professionalName: string; dateLabel: string; timeLabel: string }
) {
  const { patientName, professionalName, dateLabel, timeLabel } = params;
  await sendMail(
    to,
    "Lembrete de sessao — PsiAgenda",
    `<p>Ola, ${patientName}.</p>
     <p>Este e um lembrete da sua sessao com ${professionalName}:</p>
     <p style="font-size: 18px; font-weight: bold;">${dateLabel} as ${timeLabel}</p>
     <p>Se precisar reagendar, entre em contato com seu psicologo(a).</p>`
  );
}

export async function sendSessionConfirmationEmail(
  to: string,
  params: { patientName: string; professionalName: string; dateLabel: string; timeLabel: string }
) {
  const { patientName, professionalName, dateLabel, timeLabel } = params;
  await sendMail(
    to,
    "Consulta confirmada — PsiAgenda",
    `<p>Ola, ${patientName}.</p>
     <p>Sua sessao com ${professionalName} foi confirmada:</p>
     <p style="font-size: 18px; font-weight: bold;">${dateLabel} as ${timeLabel}</p>
     <p>Se precisar reagendar, entre em contato com seu psicologo(a).</p>`
  );
}
