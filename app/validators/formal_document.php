<?php
declare(strict_types=1);

const FORMAL_DOCUMENT_TYPES = ['laudo', 'atestado', 'declaracao', 'relatorio', 'parecer'];

function validateFormalDocument(array $input): array
{
    $type = (string) ($input['type'] ?? '');
    if (!in_array($type, FORMAL_DOCUMENT_TYPES, true)) {
        return ['ok' => false, 'error' => 'Tipo de documento invalido.'];
    }

    $title = trim((string) ($input['title'] ?? ''));
    $title = $title === '' ? null : mb_substr($title, 0, 255);

    $body = trim((string) ($input['body'] ?? ''));
    if ($body === '') {
        return ['ok' => false, 'error' => 'Escreva o conteudo do documento.'];
    }

    return ['ok' => true, 'data' => compact('type', 'title', 'body')];
}
