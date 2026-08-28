<?php
// Portado de src/server/services/pdf-generator/session-pdf.ts.

declare(strict_types=1);

require_once __DIR__ . '/pdf_html_writer.php';
require_once __DIR__ . '/../../pdf_client.php';
require_once __DIR__ . '/../../date_helpers.php';
require_once __DIR__ . '/../../session_meta.php';

/**
 * @param array $professional ['fullName','crpNumber']
 * @param array $patient ['fullName']
 * @param array $session ['sequentialNumber','scheduledAt','durationMinutes','modality']
 * @param array $note ['keywordSummary','fullReport','theoreticalReferences']
 */
function generateSessionPdf(array $professional, array $patient, array $session, array $note, bool $accessible): string
{
    $datePart = extractDatePart($session['scheduledAt']);
    $dateLabel = formatDateLabel(parseISODate($datePart));
    $timeLabel = extractTimePart($session['scheduledAt']);

    $w = new PdfHtmlWriter();

    $w->title($accessible ? "Resumo da sessao — {$patient['fullName']}" : "Registro de sessao — {$patient['fullName']}");
    $w->meta($professional['fullName'] . ($professional['crpNumber'] ? " · CRP {$professional['crpNumber']}" : '') . ' · Documento gerado em ' . formatDateLabel(new DateTime()));
    $w->spacer(6);

    $w->sectionHeading($accessible ? 'Sobre esta sessao' : 'Dados do atendimento');
    $w->labelValue('Paciente', $patient['fullName']);
    $w->labelValue('Atendimento numero', (string) $session['sequentialNumber']);
    $w->labelValue('Data e horario', "$dateLabel as $timeLabel");
    if (!$accessible) {
        $w->labelValue('Duracao', "{$session['durationMinutes']} minutos");
        $w->labelValue('Modalidade', MODALITY_LABELS[$session['modality']] ?? $session['modality']);
    }

    if ($accessible) {
        $w->sectionHeading('O que conversamos');
        $w->paragraph($note['fullReport']);
    } else {
        $w->sectionHeading('Resumo');
        $w->paragraph($note['keywordSummary']);

        $w->sectionHeading('Relatorio completo');
        $w->paragraph($note['fullReport']);

        if ($note['theoreticalReferences']) {
            $w->sectionHeading('Referencias teoricas');
            $w->paragraph($note['theoreticalReferences']);
        }
    }

    if ($accessible) {
        $w->spacer(16);
        $w->meta('Este e um resumo em linguagem acessivel, preparado para voce. O registro tecnico completo desta sessao fica arquivado com seu psicologo.');
    }

    return renderPdfFromHtml($w->toHtml());
}
