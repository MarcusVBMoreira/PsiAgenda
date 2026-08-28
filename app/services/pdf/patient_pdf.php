<?php
// Portado de src/server/services/pdf-generator/patient-pdf.ts.

declare(strict_types=1);

require_once __DIR__ . '/pdf_html_writer.php';
require_once __DIR__ . '/../../pdf_client.php';
require_once __DIR__ . '/../../date_helpers.php';
require_once __DIR__ . '/../../session_meta.php';

const PATIENT_PDF_FREQUENCY_LABELS = ['semanal' => 'Semanal', 'quinzenal' => 'Quinzenal', 'mensal' => 'Mensal', 'outro' => 'Outro'];

/**
 * @param array $professional ['fullName' => ..., 'crpNumber' => ...]
 * @param array $patient ['fullName','birthDate','phone','email','treatmentFrequency','medicalHistory','medications']
 * @param array $sessions lista de ['sequentialNumber','scheduledAt','status','keywordSummary']
 */
function generatePatientPdf(array $professional, array $patient, array $sessions, bool $accessible): string
{
    $w = new PdfHtmlWriter();

    $w->title($accessible ? "Resumo do acompanhamento — {$patient['fullName']}" : "Prontuario geral — {$patient['fullName']}");
    $w->meta($professional['fullName'] . ($professional['crpNumber'] ? " · CRP {$professional['crpNumber']}" : '') . ' · Documento gerado em ' . formatDateLabel(new DateTime()));
    $w->spacer(6);

    $w->sectionHeading('Dados gerais');
    $w->labelValue('Nome completo', $patient['fullName']);
    if (!$accessible) {
        $w->labelValue('Data de nascimento', $patient['birthDate'] ? formatDateLabel(parseISODate($patient['birthDate'])) : '-');
        $w->labelValue('Telefone', $patient['phone'] ?? '-');
        $w->labelValue('E-mail', $patient['email'] ?? '-');
    }
    $w->labelValue('Frequencia de tratamento', PATIENT_PDF_FREQUENCY_LABELS[$patient['treatmentFrequency']] ?? $patient['treatmentFrequency']);

    if (!$accessible && ($patient['medicalHistory'] || $patient['medications'])) {
        $w->sectionHeading('Informacoes clinicas');
        if ($patient['medicalHistory']) $w->labelValue('Historico medico', $patient['medicalHistory']);
        if ($patient['medications']) $w->labelValue('Medicacoes em uso', $patient['medications']);
    }

    $w->sectionHeading($accessible ? 'Suas sessoes' : 'Linha do tempo de sessoes');
    if (count($sessions) === 0) {
        $w->paragraph('Nenhuma sessao registrada.');
    } else {
        foreach ($sessions as $session) {
            $datePart = extractDatePart($session['scheduledAt']);
            $dateLabel = formatDateLabel(parseISODate($datePart)) . ' as ' . extractTimePart($session['scheduledAt']);
            $statusLabel = STATUS_LABELS[$session['status']] ?? $session['status'];

            $value = $accessible
                ? "$dateLabel · $statusLabel"
                : "$dateLabel · $statusLabel" . ($session['keywordSummary'] ? " · {$session['keywordSummary']}" : '');
            $w->labelValue("Atendimento {$session['sequentialNumber']}", $value);
        }
    }

    if ($accessible) {
        $w->spacer(16);
        $w->meta('Este e um resumo em linguagem acessivel do seu acompanhamento, preparado para voce. O prontuario tecnico completo fica arquivado com seu psicologo.');
    }

    return renderPdfFromHtml($w->toHtml());
}
