<?php
// Builder de HTML para os documentos em PDF, com a mesma API do PdfWriter
// (pdf-lib) da versao Next.js — title/meta/sectionHeading/labelValue/
// paragraph/spacer — mas gerando HTML (renderizado em PDF pelo
// microsservico Python/WeasyPrint) em vez de desenhar cada linha
// manualmente. Visual equivalente: mesma tipografia, cores e hierarquia.

declare(strict_types=1);

require_once __DIR__ . '/../../format_helpers.php';

class PdfHtmlWriter
{
    private string $body = '';

    public function title(string $text): void
    {
        $this->body .= '<h1>' . h($text) . '</h1>';
    }

    public function meta(string $text): void
    {
        $this->body .= '<p class="meta">' . h($text) . '</p>';
    }

    public function sectionHeading(string $text): void
    {
        $this->body .= '<h2>' . h(mb_strtoupper($text)) . '</h2>';
    }

    public function labelValue(string $label, ?string $value): void
    {
        $safeValue = $value !== null && $value !== '' ? nl2br(h($value)) : '-';
        $this->body .= '<div class="field"><p class="label">' . h(mb_strtoupper($label)) . '</p>'
            . '<p class="value">' . $safeValue . '</p></div>';
    }

    public function paragraph(string $text): void
    {
        $this->body .= '<p class="paragraph">' . nl2br(h($text)) . '</p>';
    }

    public function spacer(int $height = 10): void
    {
        $this->body .= '<div class="spacer" style="height:' . $height . 'px"></div>';
    }

    public function raw(string $html): void
    {
        $this->body .= $html;
    }

    /** HTML completo (com <style>), pronto pra mandar pra API de PDF. */
    public function toHtml(): string
    {
        $css = <<<CSS
            @page { size: A4; margin: 20mm 14mm; }
            body { font-family: "DejaVu Sans", Arial, Helvetica, sans-serif; color: #17181c; font-size: 11pt; line-height: 1.5; }
            h1 { font-size: 17pt; font-weight: 700; color: #333d4f; margin: 0 0 4px; }
            h2 { font-size: 9.5pt; font-weight: 700; color: #333d4f; text-transform: uppercase; letter-spacing: 0.03em;
                 margin: 14px 0 6px; padding-top: 10px; border-top: 0.75pt solid #d9d9dd; }
            p.meta { font-size: 8.5pt; color: #737378; margin: 0 0 10px; }
            .field { margin-bottom: 8px; }
            .field .label { font-size: 7.5pt; font-weight: 700; color: #737378; text-transform: uppercase; letter-spacing: 0.03em; margin: 0; }
            .field .value { font-size: 11pt; margin: 2px 0 0; white-space: pre-wrap; }
            p.paragraph { font-size: 11pt; margin: 0 0 6px; white-space: pre-wrap; }
            CSS;

        return '<!doctype html><html><head><meta charset="utf-8"><style>' . $css . '</style></head><body>' . $this->body . '</body></html>';
    }
}
