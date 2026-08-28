<?php
// Portado de src/server/services/pdf-generator/formal-document-pdf.ts.

declare(strict_types=1);

require_once __DIR__ . '/pdf_html_writer.php';
require_once __DIR__ . '/../../pdf_client.php';
require_once __DIR__ . '/../../date_helpers.php';

const FORMAL_DOCUMENT_TYPE_TITLES = [
    'laudo' => 'Laudo Psicologico', 'atestado' => 'Atestado Psicologico', 'declaracao' => 'Declaracao',
    'relatorio' => 'Relatorio Psicologico', 'parecer' => 'Parecer Psicologico',
];

function generateFormalDocumentPdf(array $professional, array $patient, string $type, ?string $title, string $body): string
{
    $w = new PdfHtmlWriter();

    $w->title(FORMAL_DOCUMENT_TYPE_TITLES[$type] ?? $type);
    if ($title) {
        $w->meta($title);
    }
    $w->spacer(6);

    $w->labelValue('Paciente', $patient['fullName']);
    $w->spacer(4);

    $w->paragraph($body);

    $w->spacer(28);
    $w->paragraph(formatDateLabel(new DateTime()) . '.');
    $w->spacer(24);
    $w->paragraph('_______________________________________________');
    $w->paragraph($professional['fullName']);
    $w->paragraph('CRP ' . $professional['crpNumber']);

    return renderPdfFromHtml($w->toHtml());
}
