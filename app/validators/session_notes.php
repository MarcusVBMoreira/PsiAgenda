<?php
declare(strict_types=1);

function validateSessionNote(array $input): array
{
    $keywordSummary = trim((string) ($input['keywordSummary'] ?? ''));
    if ($keywordSummary === '') {
        return ['ok' => false, 'error' => 'Informe um resumo curto para lembrar da sessao.'];
    }
    if (mb_strlen($keywordSummary) > 280) {
        return ['ok' => false, 'error' => 'Maximo de 280 caracteres.'];
    }

    $fullReport = trim((string) ($input['fullReport'] ?? ''));
    if ($fullReport === '') {
        return ['ok' => false, 'error' => 'Escreva o relatorio completo da sessao.'];
    }

    $theoreticalReferences = trim((string) ($input['theoreticalReferences'] ?? ''));
    $theoreticalReferences = $theoreticalReferences === '' ? null : $theoreticalReferences;

    return ['ok' => true, 'data' => compact('keywordSummary', 'fullReport', 'theoreticalReferences')];
}
