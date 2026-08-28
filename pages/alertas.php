<?php
declare(strict_types=1);
$pageTitle = 'Central de alertas';
require_once __DIR__ . '/../includes/header.php';

const INTERVAL_LABELS = ['7_dias' => '7 dias antes', '2_dias' => '2 dias antes', '24_horas' => '24 horas antes', 'manual' => 'Manual'];
const REMINDER_STATUS_BADGE = [
    'enviado' => 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    'falhou' => 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    'agendado' => 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
];

function dateLabelFromSql(string $value): string
{
    return formatDateLabel(parseISODate(extractDatePart($value)));
}

$reminders = dbAll(
    'SELECT r.id, r.interval_type, r.channel, r.status, r.sent_at,
            p.id AS patient_id, p.full_name AS patient_name, s.scheduled_at
     FROM reminders r
     JOIN patients p ON p.id = r.patient_id
     JOIN sessions s ON s.id = r.session_id
     WHERE p.user_id = ?
     ORDER BY r.sent_at DESC, r.id DESC
     LIMIT 20',
    [$__user['id']]
);

$adherenceAlerts = dbAll(
    "SELECT a.id, a.expected_interval_days, a.actual_interval_days, a.detected_at,
            p.id AS patient_id, p.full_name AS patient_name
     FROM adherence_alerts a
     JOIN patients p ON p.id = a.patient_id
     WHERE p.user_id = ? AND a.status = 'pendente'
     ORDER BY a.detected_at DESC",
    [$__user['id']]
);

$retentionAlerts = dbAll(
    'SELECT ra.id, ra.record_reference_date, ra.retention_deadline, ra.alert_sent,
            p.id AS patient_id, p.full_name AS patient_name
     FROM retention_alerts ra
     JOIN patients p ON p.id = ra.patient_id
     WHERE p.user_id = ?
     ORDER BY ra.retention_deadline ASC',
    [$__user['id']]
);
?>
<div class="flex flex-col gap-6">
  <div class="animate-fade-in-up">
    <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Central de alertas</h1>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Lembretes, aderencia ao tratamento e prazos de guarda documental.</p>
  </div>

  <div class="animate-fade-in-up flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Alertas de aderencia ao tratamento</h2>
      <p class="mt-0.5 text-sm text-slate-400 dark:text-slate-500"><?= count($adherenceAlerts) ?> <?= count($adherenceAlerts) === 1 ? 'pendente' : 'pendentes' ?></p>
    </div>
    <?php if (count($adherenceAlerts) === 0): ?>
      <p class="text-sm text-slate-500 dark:text-slate-400">Nenhum alerta de aderencia pendente.</p>
    <?php else: ?>
      <div class="flex flex-col gap-2">
        <?php foreach ($adherenceAlerts as $alert): ?>
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950/40">
            <div>
              <p class="font-medium text-slate-900 dark:text-slate-100"><?= h($alert['patient_name']) ?></p>
              <p class="text-xs text-slate-600 dark:text-slate-400">
                Intervalo esperado de <?= (int) $alert['expected_interval_days'] ?> dias, ultimo intervalo real de <?= (int) $alert['actual_interval_days'] ?> dias &middot; detectado em <?= h(dateLabelFromSql($alert['detected_at'])) ?>
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <a href="<?= h(APP_URL) ?>/pacientes/<?= h($alert['patient_id']) ?>/visualizar" title="Ver perfil do paciente" aria-label="Ver perfil do paciente"
                 class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                <?php icon('eye', 'h-4 w-4'); ?>
              </a>
              <button type="button" class="review-adherence-btn shrink-0 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      data-alert-id="<?= h($alert['id']) ?>">Marcar como revisado</button>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>

  <div class="animate-fade-in-up flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Alertas de guarda documental</h2>
      <p class="mt-0.5 text-sm text-slate-400 dark:text-slate-500"><?= count($retentionAlerts) ?> <?= count($retentionAlerts) === 1 ? 'registro' : 'registros' ?></p>
    </div>
    <?php if (count($retentionAlerts) === 0): ?>
      <p class="text-sm text-slate-500 dark:text-slate-400">Nenhum prazo de guarda documental proximo do vencimento.</p>
    <?php else: ?>
      <div class="flex flex-col gap-2">
        <?php foreach ($retentionAlerts as $alert): ?>
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
            <div>
              <p class="font-medium text-slate-900 dark:text-slate-100"><?= h($alert['patient_name']) ?></p>
              <p class="text-xs text-slate-600 dark:text-slate-400">
                Ultimo registro em <?= h(formatDateLabel(parseISODate($alert['record_reference_date']))) ?> &middot; guarda ate <?= h(formatDateLabel(parseISODate($alert['retention_deadline']))) ?>
              </p>
            </div>
            <a href="<?= h(APP_URL) ?>/pacientes/<?= h($alert['patient_id']) ?>/visualizar" title="Ver perfil do paciente" aria-label="Ver perfil do paciente"
               class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
              <?php icon('eye', 'h-4 w-4'); ?>
            </a>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>

  <div class="animate-fade-in-up flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <div>
      <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Lembretes enviados</h2>
      <p class="mt-0.5 text-sm text-slate-400 dark:text-slate-500">Ultimos 20 lembretes processados.</p>
    </div>
    <?php if (count($reminders) === 0): ?>
      <p class="text-sm text-slate-500 dark:text-slate-400">Nenhum lembrete processado ainda.</p>
    <?php else: ?>
      <div class="flex flex-col gap-2">
        <?php foreach ($reminders as $reminder): ?>
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
            <div>
              <p class="font-medium text-slate-900 dark:text-slate-100"><?= h($reminder['patient_name']) ?></p>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Sessao em <?= h(dateLabelFromSql($reminder['scheduled_at'])) ?> as <?= h(extractTimePart($reminder['scheduled_at'])) ?> &middot; <?= h(INTERVAL_LABELS[$reminder['interval_type']] ?? $reminder['interval_type']) ?> &middot; <?= h($reminder['channel']) ?>
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <span class="rounded-full px-2.5 py-0.5 text-xs font-medium <?= h(REMINDER_STATUS_BADGE[$reminder['status']] ?? 'bg-slate-100 text-slate-600') ?>"><?= h($reminder['status']) ?></span>
              <a href="<?= h(APP_URL) ?>/pacientes/<?= h($reminder['patient_id']) ?>/visualizar" title="Ver perfil do paciente" aria-label="Ver perfil do paciente"
                 class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                <?php icon('eye', 'h-4 w-4'); ?>
              </a>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

<script src="<?= h(APP_URL) ?>/assets/js/alertas.js"></script>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
