"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SecuritySettingsForm({ initialValue }: { initialValue: boolean }) {
  const router = useRouter();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const next = !twoFactorEnabled;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/settings/security", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFactorEnabled: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nao foi possivel salvar.");

      setTwoFactorEnabled(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexao.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={twoFactorEnabled}
          disabled={isLoading}
          onChange={handleToggle}
          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
        />
        Verificacao em duas etapas (2FA) por e-mail no login
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
