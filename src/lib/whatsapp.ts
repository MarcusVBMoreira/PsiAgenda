// WhatsApp channel, kept at the same readiness level as the e-mail one in
// mailer.ts: the sending path, message templates, and reminder-scheduler
// wiring are all in place, but with no WHATSAPP_API_URL/WHATSAPP_API_TOKEN
// configured it just logs instead of calling out. Point those env vars at a
// real WhatsApp Business Cloud API (or a provider like Twilio/Meta) later —
// no other code needs to change.

async function sendWhatsAppMessage(to: string, message: string) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  if (!apiUrl || !apiToken) {
    console.warn(`[whatsapp] Integracao nao configurada — mensagem para ${to} nao enviada.`);
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[whatsapp] Conteudo (somente dev):\n${message}`);
    }
    return;
  }

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ to, type: "text", text: { body: message } }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao enviar mensagem WhatsApp (HTTP ${res.status}).`);
  }
}

export async function sendSessionReminderWhatsApp(
  to: string,
  params: { patientName: string; professionalName: string; dateLabel: string; timeLabel: string }
) {
  const { patientName, professionalName, dateLabel, timeLabel } = params;
  await sendWhatsAppMessage(
    to,
    `Ola, ${patientName}! Este e um lembrete da sua sessao com ${professionalName} em ${dateLabel} as ${timeLabel}. Se precisar reagendar, entre em contato com seu psicologo(a).`
  );
}

export async function sendSessionConfirmationWhatsApp(
  to: string,
  params: { patientName: string; professionalName: string; dateLabel: string; timeLabel: string }
) {
  const { patientName, professionalName, dateLabel, timeLabel } = params;
  await sendWhatsAppMessage(
    to,
    `Ola, ${patientName}! Sua sessao com ${professionalName} foi confirmada para ${dateLabel} as ${timeLabel}. Se precisar reagendar, entre em contato com seu psicologo(a).`
  );
}
