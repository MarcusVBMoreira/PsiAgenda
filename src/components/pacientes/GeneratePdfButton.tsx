"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function GeneratePdfButton({
  label,
  endpoint,
  redirectTo,
}: {
  label: string;
  endpoint: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [includeAccessible, setIncludeAccessible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeAccessible }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Nao foi possivel gerar o PDF.");

      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexao.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-slate-700">
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          checked={includeAccessible}
          onChange={(e) => setIncludeAccessible(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800"
        />
        Gerar tambem versao em linguagem acessivel para o paciente
      </label>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <Button type="button" onClick={handleGenerate} isLoading={isLoading} className="self-start px-4 py-1.5 text-xs">
        {label}
      </Button>
    </div>
  );
}
