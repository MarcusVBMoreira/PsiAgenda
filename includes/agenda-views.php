<?php
// Renderizacao das visoes da agenda (dia/semana/mes) + trocador de visao,
// portados de src/components/agenda/{DayView,WeekView,MonthView,
// ViewSwitcher,SessionListItem}.tsx.

declare(strict_types=1);

require_once __DIR__ . '/../app/session_meta.php';

function renderStatusBadge(string $status, string $extraClasses = ''): void
{
    $cls = STATUS_BADGE_CLASSES[$status] ?? 'bg-slate-100 text-slate-600';
    echo '<span class="min-w-0 truncate rounded-full px-2 py-0.5 text-[11px] font-medium ' . h($cls) . ' ' . h($extraClasses) . '">'
        . h(STATUS_LABELS[$status] ?? $status) . '</span>';
}

/** @param array $session chaves: id, patient_id, patient_name, scheduled_at, duration_minutes, modality, status */
function renderSessionListItem(array $session, string $baseHref, bool $compact = false): void
{
    $sep = str_contains($baseHref, '?') ? '&' : '?';
    $href = $baseHref . $sep . 'session=' . h($session['id']);
    $modalityLabel = MODALITY_LABELS[$session['modality']] ?? $session['modality'];

    if ($compact) {
        echo '<div class="group relative flex min-w-0 flex-col gap-1 rounded-md border border-slate-200 bg-white p-2 text-xs transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60">';
        echo '<a href="' . h($href) . '" class="absolute inset-0" aria-label="Abrir sessao de ' . h($session['patient_name']) . '"></a>';
        echo '<div class="flex min-w-0 items-center justify-between gap-1"><span class="shrink-0 font-medium text-slate-700 dark:text-slate-200">' . h(extractTimePart($session['scheduled_at'])) . '</span>';
        renderStatusBadge($session['status']);
        echo '</div>';
        echo '<p class="truncate font-medium text-slate-900 dark:text-slate-100">' . h($session['patient_name']) . '</p>';
        echo '<div class="flex items-center justify-between gap-1"><p class="truncate text-slate-500 dark:text-slate-400">' . h($modalityLabel) . ' &middot; ' . (int) $session['duration_minutes'] . ' min</p>';
        echo '<a href="' . h(APP_URL) . '/pacientes/' . h($session['patient_id']) . '/visualizar" title="Ver perfil do paciente" aria-label="Ver perfil do paciente" class="relative z-10 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200">';
        icon('eye', 'h-3.5 w-3.5');
        echo '</a></div></div>';
        return;
    }

    echo '<div class="group relative flex min-w-0 items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60">';
    echo '<a href="' . h($href) . '" class="absolute inset-0" aria-label="Abrir sessao de ' . h($session['patient_name']) . '"></a>';
    echo '<div class="flex min-w-0 items-center gap-3"><span class="w-12 shrink-0 font-medium text-slate-700 dark:text-slate-200">' . h(extractTimePart($session['scheduled_at'])) . '</span>';
    echo '<div class="min-w-0"><p class="truncate font-medium text-slate-900 dark:text-slate-100">' . h($session['patient_name']) . '</p>';
    echo '<p class="truncate text-xs text-slate-500 dark:text-slate-400">' . h($modalityLabel) . ' &middot; ' . (int) $session['duration_minutes'] . ' min</p></div></div>';
    echo '<div class="relative z-10 flex shrink-0 items-center gap-2">';
    renderStatusBadge($session['status'], 'px-2.5 py-0.5 text-xs');
    echo '<a href="' . h(APP_URL) . '/pacientes/' . h($session['patient_id']) . '/visualizar" title="Ver perfil do paciente" aria-label="Ver perfil do paciente" class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">';
    icon('eye', 'h-4 w-4');
    echo '</a></div></div>';
}

function renderViewSwitcher(string $view, DateTime $date): void
{
    $today = formatISODate(new DateTime());
    $iso = formatISODate($date);

    $prev = clone $date;
    $next = clone $date;
    if ($view === 'dia') { $prev->modify('-1 day'); $next->modify('+1 day'); }
    elseif ($view === 'semana') { $prev->modify('-7 days'); $next->modify('+7 days'); }
    else { $prev->modify('first day of -1 month'); $next->modify('first day of +1 month'); }
    $prevIso = formatISODate($prev);
    $nextIso = formatISODate($next);

    $tabs = ['dia' => 'Dia', 'semana' => 'Semana', 'mes' => 'Mes'];
    ?>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <a href="<?= h(APP_URL) ?>/agenda?view=<?= h($view) ?>&date=<?= h($prevIso) ?>" aria-label="Anterior" class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">&lsaquo;</a>
        <a href="<?= h(APP_URL) ?>/agenda?view=<?= h($view) ?>&date=<?= h($today) ?>" class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">Hoje</a>
        <a href="<?= h(APP_URL) ?>/agenda?view=<?= h($view) ?>&date=<?= h($nextIso) ?>" aria-label="Proximo" class="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">&rsaquo;</a>
      </div>
      <div class="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
        <?php foreach ($tabs as $key => $label): $active = $view === $key; ?>
          <a href="<?= h(APP_URL) ?>/agenda?view=<?= h($key) ?>&date=<?= h($iso) ?>" class="rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 <?= $active ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100' ?>"><?= h($label) ?></a>
        <?php endforeach; ?>
      </div>
      <a href="<?= h(APP_URL) ?>/agenda/novo?date=<?= h($iso) ?>" class="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">+ Novo agendamento</a>
    </div>
    <?php
}

function renderDayView(DateTime $date, array $sessions): void
{
    $iso = formatISODate($date);
    $baseHref = APP_URL . '/agenda?view=dia&date=' . $iso;
    $daySessions = array_values(array_filter($sessions, fn($s) => extractDatePart($s['scheduled_at']) === $iso));
    ?>
    <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 class="text-base font-semibold capitalize text-slate-900 dark:text-slate-100"><?= h(formatDateLabel($date)) ?></h2>
      <?php if (count($daySessions) === 0): ?>
        <p class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Nenhum agendamento para este dia.</p>
      <?php else: ?>
        <div class="flex flex-col gap-2">
          <?php foreach ($daySessions as $s) renderSessionListItem($s, $baseHref); ?>
        </div>
      <?php endif; ?>
    </div>
    <?php
}

function renderWeekView(DateTime $weekStart, array $sessions): void
{
    $today = new DateTime();
    ?>
    <div class="grid grid-cols-1 gap-4 md:grid-cols-7">
      <?php for ($i = 0; $i < 7; $i++):
        $day = (clone $weekStart)->modify("+$i days");
        $iso = formatISODate($day);
        $isToday = $iso === formatISODate($today);
        $daySessions = array_values(array_filter($sessions, fn($s) => extractDatePart($s['scheduled_at']) === $iso));
        $baseHref = APP_URL . '/agenda?view=semana&date=' . $iso;
      ?>
        <div class="flex min-w-0 flex-col gap-2 rounded-xl border bg-white p-3 shadow-sm dark:bg-slate-900 <?= $isToday ? 'border-slate-400 dark:border-slate-500' : 'border-slate-200 dark:border-slate-800' ?>">
          <div class="flex items-baseline justify-between">
            <span class="text-xs font-medium uppercase text-slate-500 dark:text-slate-400"><?= WEEKDAY_LABELS[$i] ?></span>
            <span class="text-sm font-semibold <?= $isToday ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300' ?>"><?= (int) $day->format('j') ?></span>
          </div>
          <div class="flex min-w-0 flex-col gap-1.5">
            <?php if (count($daySessions) === 0): ?>
              <p class="py-2 text-center text-xs text-slate-400 dark:text-slate-600">&mdash;</p>
            <?php else: foreach ($daySessions as $s) renderSessionListItem($s, $baseHref, true); endif; ?>
          </div>
        </div>
      <?php endfor; ?>
    </div>
    <?php
}

function renderMonthView(DateTime $gridStart, DateTime $monthReference, array $sessions): void
{
    $today = new DateTime();
    $gridStartIso = formatISODate($gridStart);
    $refMonth = (int) $monthReference->format('n');
    $refYear = (int) $monthReference->format('Y');
    ?>
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <?php foreach (WEEKDAY_LABELS as $label): ?><div class="px-2 py-2 text-center"><?= h($label) ?></div><?php endforeach; ?>
      </div>
      <div class="grid grid-cols-7">
        <?php for ($i = 0; $i < 42; $i++):
          $day = (clone $gridStart)->modify("+$i days");
          $iso = formatISODate($day);
          $daySessions = array_values(array_filter($sessions, fn($s) => extractDatePart($s['scheduled_at']) === $iso));
          usort($daySessions, fn($a, $b) => strcmp($a['scheduled_at'], $b['scheduled_at']));
          $inMonth = (int) $day->format('n') === $refMonth && (int) $day->format('Y') === $refYear;
          $isToday = $iso === formatISODate($today);
          $visible = array_slice($daySessions, 0, 3);
          $overflow = count($daySessions) - count($visible);
        ?>
          <div class="flex min-h-[92px] min-w-0 flex-col gap-1 border-b border-r border-slate-100 p-1.5 last:border-r-0 dark:border-slate-800 <?= $inMonth ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950/40' ?>">
            <a href="<?= h(APP_URL) ?>/agenda?view=dia&date=<?= h($iso) ?>" class="self-end rounded-full px-1.5 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 <?= $isToday ? 'bg-slate-800 px-2 py-0.5 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white' : ($inMonth ? 'text-slate-700 dark:text-slate-300' : 'text-slate-300 dark:text-slate-700') ?>"><?= (int) $day->format('j') ?></a>
            <div class="flex flex-col gap-0.5">
              <?php foreach ($visible as $s): ?>
                <a href="<?= h(APP_URL) ?>/agenda?view=mes&date=<?= h($gridStartIso) ?>&session=<?= h($s['id']) ?>" class="flex min-w-0 items-center gap-1 rounded px-1 py-0.5 text-[11px] text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" title="<?= h($s['patient_name']) ?>">
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full <?= h(STATUS_DOT_CLASSES[$s['status']] ?? 'bg-slate-300') ?>"></span>
                  <span class="shrink-0 text-slate-400 dark:text-slate-500"><?= h(extractTimePart($s['scheduled_at'])) ?></span>
                  <span class="truncate"><?= h($s['patient_name']) ?></span>
                </a>
              <?php endforeach; ?>
              <?php if ($overflow > 0): ?>
                <a href="<?= h(APP_URL) ?>/agenda?view=dia&date=<?= h($iso) ?>" class="px-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">+<?= $overflow ?> mais</a>
              <?php endif; ?>
            </div>
          </div>
        <?php endfor; ?>
      </div>
    </div>
    <?php
}
