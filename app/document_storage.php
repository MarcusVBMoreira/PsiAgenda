<?php
// Portado de src/lib/document-storage.ts. Fica fora do document root
// alcancavel diretamente (storage/ tem .htaccess "Require all denied") —
// so acessivel via api/documents-download.php, que confere ownership.

declare(strict_types=1);

const STORAGE_DIR = __DIR__ . '/../storage/documents';

function savePdfFile(string $filename, string $bytes): void
{
    if (!is_dir(STORAGE_DIR)) {
        mkdir(STORAGE_DIR, 0755, true);
    }
    file_put_contents(STORAGE_DIR . '/' . $filename, $bytes);
}

function readPdfFile(string $filename): string
{
    return file_get_contents(STORAGE_DIR . '/' . $filename);
}

function deletePdfFile(string $filename): void
{
    $path = STORAGE_DIR . '/' . $filename;
    if (is_file($path)) {
        unlink($path);
    }
}
