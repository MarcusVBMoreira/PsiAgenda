"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";

export default function BillingPolicyForm({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const [policy, setPolicy] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings/billing-policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noShowChargePolicy: policy }),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextArea
        label="Politica de cobranca por falta"
        id="noShowChargePolicy"
        placeholder="Ex.: Faltas sem aviso previo de 24h estao sujeitas a cobranca integral da sessao."
        rows={4}
        value={policy}
        onChange={(e) => {
          setSavedAt(null);
          setPolicy(e.target.value);
        }}
      />
      <p className="-mt-2 text-xs text-slate-400 dark:text-slate-500">
        Usada como referencia ao registrar cancelamentos com cobranca no reagendamento.
      </p>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {savedAt && !error && <p className="text-sm text-green-600 dark:text-green-400">Politica salva.</p>}

      <div>
        <Button type="submit" isLoading={isLoading} className="px-6">
          Salvar politica
        </Button>
      </div>
    </form>
  );
}
