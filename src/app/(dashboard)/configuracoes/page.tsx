import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import ProfileSettingsForm from "@/components/configuracoes/ProfileSettingsForm";
import BillingPolicyForm from "@/components/configuracoes/BillingPolicyForm";
import ReminderPreferencesForm from "@/components/configuracoes/ReminderPreferencesForm";
import SecuritySettingsForm from "@/components/configuracoes/SecuritySettingsForm";
import ChangePasswordForm from "@/components/configuracoes/ChangePasswordForm";
import AppearanceForm from "@/components/configuracoes/AppearanceForm";
import { formatDateLabel, extractTimePart, parseISODate } from "@/lib/date";

const ACTION_LABELS: Record<string, string> = {
  visualizou: "Visualizou",
  criou: "Criou",
  editou: "Editou",
  excluiu: "Excluiu",
};

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();

  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [
    user!.id,
  ]);
  const dbUser = rows[0];

  const [accessLogRows] = await pool.query<RowDataPacket[]>(
    `SELECT record_type, action, created_at FROM access_logs
     WHERE user_id = ? ORDER BY created_at DESC LIMIT 15`,
    [user!.id]
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Configuracoes</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Perfil, aparencia, cobranca por falta, lembretes e seguranca da sua conta.
        </p>
      </div>

      <section className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Aparencia
        </h2>
        <AppearanceForm initialValue={dbUser.theme_preference ?? "system"} />
      </section>

      <section className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Perfil do profissional
        </h2>
        <ProfileSettingsForm
          initialValues={{
            fullName: dbUser.full_name,
            email: dbUser.email,
            crpNumber: dbUser.crp_number,
            phone: dbUser.phone ?? "",
          }}
        />
      </section>

      <section className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Politica de cobranca por falta
        </h2>
        <BillingPolicyForm initialValue={dbUser.no_show_charge_policy ?? ""} />
      </section>

      <section className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Confirmacao e lembretes de sessao
        </h2>
        <div className="mb-4 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
          <p>
            <span className="font-medium text-slate-600 dark:text-slate-300">Confirmacao:</span> enviada
            automaticamente no instante em que voce marca uma sessao como &quot;confirmado&quot; (nao tem
            antecedencia — e disparada pela sua acao, nao pelo relogio). Pode ser desligada por paciente
            ou por sessao, e reenviada manualmente a qualquer momento pelo painel da sessao na agenda.
          </p>
          <p>
            <span className="font-medium text-slate-600 dark:text-slate-300">Lembrete:</span> enviado nas
            antecedencias marcadas abaixo (padrao para todos os seus pacientes). Voce pode personalizar a
            antecedencia para um paciente especifico na tela de edicao dele, e ajustar de novo so para uma
            sessao no painel da agenda.
          </p>
        </div>
        <ReminderPreferencesForm
          initialValues={{
            channelEmail: Boolean(dbUser.reminder_channel_email),
            channelWhatsapp: Boolean(dbUser.reminder_channel_whatsapp),
            interval7Dias: Boolean(dbUser.reminder_interval_7_dias),
            interval2Dias: Boolean(dbUser.reminder_interval_2_dias),
            interval24Horas: Boolean(dbUser.reminder_interval_24_horas),
          }}
        />
      </section>

      <section className="animate-fade-in-up flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Seguranca
          </h2>
          <SecuritySettingsForm initialValue={Boolean(dbUser.two_factor_enabled)} />
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <p className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-200">Alterar senha</p>
          <ChangePasswordForm />
        </div>

        <div className="border-t border-slate-100 pt-6 dark:border-slate-800">
          <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Log de acesso recente</p>
          {accessLogRows.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma atividade registrada ainda.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {accessLogRows.map((log, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
                >
                  <span>
                    {ACTION_LABELS[log.action] ?? log.action} · {log.record_type}
                  </span>
                  <span>
                    {formatDateLabel(parseISODate(log.created_at.split(" ")[0]))} as{" "}
                    {extractTimePart(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
