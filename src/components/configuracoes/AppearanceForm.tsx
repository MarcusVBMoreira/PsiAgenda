"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const OPTIONS: { value: "light" | "dark" | "system"; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export default function AppearanceForm({
  initialValue,
}: {
  initialValue: "light" | "dark" | "system";
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Standard next-themes "mounted" guard: theme is only known client-side
    // after hydration, so this flips once, deliberately, to unblock reading
    // it safely (see comment on `current` below).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  async function handleSelect(value: "light" | "dark" | "system") {
    setTheme(value);
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/settings/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themePreference: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nao foi possivel salvar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexao.");
    } finally {
      setIsSaving(false);
    }
  }

  // Avoid rendering theme-dependent active state before hydration to
  // prevent a mismatch with the server-rendered (DB-default) markup.
  const current = mounted ? theme : initialValue;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const active = current === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={isSaving}
              className={`flex flex-col items-center gap-1.5 rounded-md border px-3 py-3 text-sm font-medium transition-all duration-150 ease-out hover:-translate-y-0.5 disabled:opacity-60 ${
                active
                  ? "border-slate-800 bg-slate-800 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {option.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
