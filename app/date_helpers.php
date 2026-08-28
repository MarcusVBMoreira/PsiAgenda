<?php
// Helpers de data/hora, portados de src/lib/date.ts. Datas de calendario
// (sem hora) circulam como string "YYYY-MM-DD"; datas com hora, vindas do
// MySQL, como "YYYY-MM-DD HH:MM:SS".

declare(strict_types=1);

function parseISODate(string $iso): DateTime
{
    return DateTime::createFromFormat('Y-m-d', substr($iso, 0, 10)) ?: new DateTime();
}

function formatISODate(DateTime $date): string
{
    return $date->format('Y-m-d');
}

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

const MONTH_LABELS = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDateLabel(DateTime $date): string
{
    $month = MONTH_LABELS[(int) $date->format('n') - 1];
    return $date->format('j') . ' de ' . $month . ' de ' . $date->format('Y');
}

function extractDatePart(string $datetime): string
{
    return explode(' ', $datetime)[0] ?? $datetime;
}

function extractTimePart(string $datetime): string
{
    $time = explode(' ', $datetime)[1] ?? '';
    return substr($time, 0, 5);
}

/** "2026-08-28T14:00" (input datetime-local) -> "2026-08-28 14:00:00" (MySQL). */
function toMySQLDatetime(string $localDatetime): string
{
    [$datePart, $timePart] = array_pad(explode('T', $localDatetime), 2, '00:00');
    return "$datePart $timePart:00";
}

/** "2026-08-28 14:00:00" (MySQL) -> "2026-08-28T14:00" (input datetime-local). */
function toDatetimeLocalInput(string $datetime): string
{
    [$datePart, $timePart] = array_pad(explode(' ', $datetime), 2, '');
    return $datePart . 'T' . substr($timePart, 0, 5);
}

function addDaysIso(string $iso, int $days): string
{
    $date = parseISODate($iso);
    $date->modify(($days >= 0 ? '+' : '') . $days . ' days');
    return formatISODate($date);
}
