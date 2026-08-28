// WhatsApp channel via the official Meta (WhatsApp Business Cloud API).
//
// IMPORTANT: outbound messages a business sends *proactively* (i.e. not as a
// reply within the 24h customer-service window opened by the patient) can
// only use pre-approved Message Templates — free-form text is rejected by
// Meta for this use case. So confirmations/reminders are always sent as
// `type: "template"`, referencing a template name that must already exist
// and be APPROVED in Meta Business Manager > WhatsApp Manager > Modelos de
// mensagem, with exactly 4 body variables in this order: nome do paciente,
// nome do profissional, data, horario. See README.md > "Configurar o
// WhatsApp (Meta Cloud API)" for the full setup checklist and suggested
// template text to submit for approval.
//
// Required env vars (all optional in dev — without them this just logs):
//   WHATSAPP_API_TOKEN            permanent token of a System User with
//                                  whatsapp_business_messaging permission
//   WHATSAPP_PHONE_NUMBER_ID      the Phone Number ID (not the phone number)
//   WHATSAPP_BUSINESS_TEMPLATE_CONFIRMATION   approved template name
//   WHATSAPP_BUSINESS_TEMPLATE_REMINDER       approved template name
//   WHATSAPP_TEMPLATE_LANG        template language code (default "pt_BR")
//   WHATSAPP_API_VERSION          Graph API version (default "v21.0")
import { toWhatsAppNumber } from "@/lib/format";

type TemplateParams = { patientName: string; professionalName: string; dateLabel: string; timeLabel: string };

async function sendWhatsAppTemplate(to: string, templateEnvVar: string, params: TemplateParams) {
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env[templateEnvVar];
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANG ?? "pt_BR";
  const apiVersion = process.env.WHATSAPP_API_VERSION ?? "v21.0";

  if (!apiToken || !phoneNumberId || !templateName) {
    console.warn(
      `[whatsapp] Integracao nao configurada (faltam variaveis de ambiente) — mensagem para ${to} nao enviada.`
    );
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[whatsapp] Parametros do template (somente dev): ${JSON.stringify(params)}`);
    }
    return;
  }

  const { patientName, professionalName, dateLabel, timeLabel } = params;
  const to64 = toWhatsAppNumber(to);

  const res = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to64,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: patientName },
              { type: "text", text: professionalName },
              { type: "text", text: dateLabel },
              { type: "text", text: timeLabel },
            ],
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar mensagem WhatsApp (HTTP ${res.status}): ${body}`);
  }
}

export async function sendSessionReminderWhatsApp(to: string, params: TemplateParams) {
  await sendWhatsAppTemplate(to, "WHATSAPP_BUSINESS_TEMPLATE_REMINDER", params);
}

export async function sendSessionConfirmationWhatsApp(to: string, params: TemplateParams) {
  await sendWhatsAppTemplate(to, "WHATSAPP_BUSINESS_TEMPLATE_CONFIRMATION", params);
}
