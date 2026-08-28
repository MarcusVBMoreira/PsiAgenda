<?php
declare(strict_types=1);
$pageTitle = 'Agenda';
require_once __DIR__ . '/../includes/header.php';
require_once __DIR__ . '/../includes/agenda-views.php';

$rawView = (string) ($_GET['view'] ?? '');
$view = in_array($rawView, ['dia', 'semana', 'mes'], true) ? $rawView : 'semana';
$referenceDate = isset($_GET['date']) && $_GET['date'] !== '' ? parseISODate((string) $_GET['date']) : new DateTime();

if ($view === 'dia') {
    $rangeStart = clone $referenceDate;
    $rangeEnd = clone $referenceDate;
} elseif ($view === 'semana') {
    $rangeStart = clone $referenceDate;
    $dow = (int) $rangeStart->format('N'); // 1 (Mon) .. 7 (Sun)
    $rangeStart->modify('-' . ($dow - 1) . ' days');
    $rangeEnd = (clone $rangeStart)->modify('+6 days');
} else {
    $monthStart = new DateTime($referenceDate->format('Y-m-01'));
    $rangeStart = clone $monthStart;
    $dow = (int) $rangeStart->format('N');
    $rangeStart->modify('-' . ($dow - 1) . ' days');
    $rangeEnd = (clone $rangeStart)->modify('+41 days');
}

$sessions = dbAll(
    'SELECT s.id, s.patient_id, p.full_name AS patient_name, s.scheduled_at, s.duration_minutes, s.modality, s.status
     FROM sessions s JOIN patients p ON p.id = s.patient_id
     WHERE s.user_id = ? AND s.scheduled_at BETWEEN ? AND ?
     ORDER BY s.scheduled_at ASC',
    [$__user['id'], formatISODate($rangeStart) . ' 00:00:00', formatISODate($rangeEnd) . ' 23:59:59']
);
?>
<div class="flex flex-col gap-6 animate-fade-in-up">
  <div>
    <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Agenda</h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Sessoes agendadas, confirmadas e canceladas.</p>
  </div>

  <?php renderViewSwitcher($view, $referenceDate); ?>

  <?php
  if ($view === 'dia') renderDayView($referenceDate, $sessions);
  elseif ($view === 'semana') renderWeekView($rangeStart, $sessions);
  else renderMonthView($rangeStart, $referenceDate, $sessions);
  ?>
</div>

<?php require_once __DIR__ . '/../includes/session-panel.php'; ?>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
