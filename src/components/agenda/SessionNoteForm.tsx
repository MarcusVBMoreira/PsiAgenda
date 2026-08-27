"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import TextArea from "@/components/ui/TextArea";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function SessionNoteForm({
  sessionId,
  backHref,
  initialValues,
}: {
  sessionId: string;
  backHref: string;
  initialValues?: {
    keywordSummary: string;
    fullReport: string;
    theoreticalReferences: string;
  };
}) {
  const router = useRouter();
  const [keywordSummary, setKeywordSummary] = useState(initialValues?.keywordSummary ?? "");
  const [fullReport, setFullReport] = useState(initialValues?.fullReport ?? "");
  const [theoreticalReferences, setTheoreticalReferences] = useState(
    initialValues?.theoreticalReferences ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/note`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordSummary, fullReport, theoreticalReferences }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel salvar o registro.");
        return;
      }

      router.push(backHref);
      router.refresh();
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="Palavra-chave / resumo curto"
        id="keywordSummary"
        placeholder="Ex.: Ansiedade no trabalho, primeira crise relatada"
        maxLength={280}
        required
        value={keywordSummary}
        onChange={(e) => setKeywordSummary(e.target.value)}
      />
      <p className="-mt-2 text-xs text-slate-400 dark:text-slate-500">
        Um gatilho de memoria rapido — nao substitui o relatorio completo abaixo.
      </p>

      <TextArea
        label="Relatorio completo"
        id="fullReport"
        placeholder="Descreva o que foi trabalhado na sessao, observacoes clinicas, evolucao do paciente..."
        required
        rows={10}
        value={fullReport}
        onChange={(e) => setFullReport(e.target.value)}
      />

      <TextArea
        label="Referencias teoricas (opcional)"
        id="theoreticalReferences"
        placeholder="Ex.: Terapia Cognitivo-Comportamental, Beck (1979)..."
        rows={3}
        value={theoreticalReferences}
        onChange={(e) => setTheoreticalReferences(e.target.value)}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
        <Button type="submit" isLoading={isLoading} className="px-6">
          Salvar registro
        </Button>
      </div>
    </form>
  );
}
