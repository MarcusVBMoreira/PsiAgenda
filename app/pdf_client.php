<?php
// Cliente HTTP pro microsservico Python de geracao de PDF (VPS separado,
// ver plano da migracao). Manda o HTML final, recebe os bytes do PDF.

declare(strict_types=1);

require_once __DIR__ . '/config.php';

class PdfGenerationException extends Exception {}

function renderPdfFromHtml(string $html): string
{
    $url = env('PDF_API_URL');
    $token = env('PDF_API_TOKEN');

    if (!$url || !$token) {
        throw new PdfGenerationException('PDF_API_URL/PDF_API_TOKEN nao configurados no .env.');
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token,
        ],
        CURLOPT_POSTFIELDS => json_encode(['html' => $html]),
        CURLOPT_TIMEOUT => 30,
    ]);

    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        throw new PdfGenerationException('Falha ao conectar com a API de PDF: ' . $curlError);
    }
    if ($status !== 200) {
        throw new PdfGenerationException("API de PDF retornou HTTP $status: " . substr($response, 0, 300));
    }

    return $response; // bytes do PDF
}
