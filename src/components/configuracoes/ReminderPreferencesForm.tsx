"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

type Preferences = {
  channelEmail: boolean;
  channelWhatsapp: boolean;
  interval7Dias: boolean;
  interval2Dias: boolean;
  interval24Horas: boolean;
};

export default function ReminderPreferencesForm({ initialValues }: { initialValues: Preferences }) {
  const router = useRouter();
  const [values, setValues] = useState<Preferences>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function toggle(key: keyof Preferences) {
    setSavedAt(null);
    setValues((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings/reminders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel salvar.");
        return;
      }
      setSavedAt(Date.now());
      router.refresh();
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Quando enviar</p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={values.interval7Dias}
              onChange={() => toggle("interval7Dias")}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            />
            7 dias antes da sessao
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={values.interval2Dias}
              onChange={() => toggle("interval2Dias")}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            />
            2 dias antes da sessao
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={values.interval24Horas}
              onChange={() => toggle("interval24Horas")}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            />
            24 horas antes da sessao
          </label>
        </div>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Cada intervalo marcado gera um lembrete — marque todos para receber ate 3 avisos por sessao.
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Canal de envio</p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={values.channelEmail}
              onChange={() => toggle("channelEmail")}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            />
            E-mail
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={values.channelWhatsapp}
              onChange={() => toggle("channelWhatsapp")}
              className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
            />
            WhatsApp
          </label>
        </div>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          O envio por WhatsApp ainda nao esta integrado a um provedor — enquanto isso, mensagens desse
          canal ficam registradas mas nao saem de verdade.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {savedAt && !error && (
        <p className="text-sm text-green-600 dark:text-green-400">Preferencias salvas.</p>
      )}

      <div>
        <Button type="submit" isLoading={isLoading} className="px-6">
          Salvar preferencias
        </Button>
      </div>
    </form>
  );
}
