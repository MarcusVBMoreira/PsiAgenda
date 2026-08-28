<?php
// WhatsApp via Meta Cloud API, portado de src/lib/whatsapp.ts. Mensagens
// proativas (confirmacao/lembrete) exigem um Message Template ja aprovado
// no WhatsApp Manager, com 4 variaveis no corpo (nome do paciente, nome do
// profissional, data, horario) — texto livre e rejeitado pra esse caso.
// Sem WHATSAPP_API_TOKEN/PHONE_NUMBER_ID configurados, so loga.

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/format_helpers.php';

function sendWhatsAppTemplate(string $to, string $templateEnvVar, array $params): void
{
    $apiToken = env('WHATSAPP_API_TOKEN');
    $phoneNumberId = env('WHATSAPP_PHONE_NUMBER_ID');
    $templateName = env($templateEnvVar);
    $languageCode = env('WHATSAPP_TEMPLATE_LANG', 'pt_BR');
    $apiVersion = env('WHATSAPP_API_VERSION', 'v21.0');

    if (!$apiToken || !$phoneNumberId || !$templateName) {
        error_log("[whatsapp] Integracao nao configurada — mensagem para $to nao enviada.");
        return;
    }

    $to64 = toWhatsAppNumber($to);
    $body = [
        'messaging_product' => 'whatsapp',
        'to' => $to64,
        'type' => 'template',
        'template' => [
            'name' => $templateName,
            'language' => ['code' => $languageCode],
            'components' => [[
                'type' => 'body',
                'parameters' => [
                    ['type' => 'text', 'text' => $params['patientName']],
                    ['type' => 'text', 'text' => $params['professionalName']],
                    ['type' => 'text', 'text' => $params['dateLabel']],
                    ['type' => 'text', 'text' => $params['timeLabel']],
                ],
            ]],
        ],
    ];

    $ch = curl_init("https://graph.facebook.com/$apiVersion/$phoneNumberId/messages");
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', "Authorization: Bearer $apiToken"],
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_TIMEOUT => 15,
    ]);
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status < 200 || $status >= 300) {
        throw new Exception("Falha ao enviar mensagem WhatsApp (HTTP $status): " . substr((string) $response, 0, 300));
    }
}

function sendSessionReminderWhatsApp(string $to, array $params): void
{
    sendWhatsAppTemplate($to, 'WHATSAPP_BUSINESS_TEMPLATE_REMINDER', $params);
}

function sendSessionConfirmationWhatsApp(string $to, array $params): void
{
    sendWhatsAppTemplate($to, 'WHATSAPP_BUSINESS_TEMPLATE_CONFIRMATION', $params);
}
