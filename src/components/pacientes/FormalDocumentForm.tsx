"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/ui/Field";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import { DOCUMENT_TYPE_LABELS } from "@/components/pacientes/document-meta";
import { FORMAL_DOCUMENT_TEMPLATES } from "@/components/pacientes/formal-document-templates";

const FORMAL_TYPES = ["laudo", "atestado", "declaracao", "relatorio", "parecer"] as const;

export default function FormalDocumentForm({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<(typeof FORMAL_TYPES)[number]>("atestado");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState(FORMAL_DOCUMENT_TEMPLATES.atestado.replace("[PACIENTE]", patientName));
  const [bodyTouched, setBodyTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleTypeChange(nextType: (typeof FORMAL_TYPES)[number]) {
    setType(nextType);
    // Only swap in the starter template if the psychologist hasn't started
    // editing yet — never overwrite text they've already written.
    if (!bodyTouched) {
      setBody(FORMAL_DOCUMENT_TEMPLATES[nextType].replace("[PACIENTE]", patientName));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/patients/${patientId}/formal-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel gerar o documento.");
        return;
      }

      router.push(`/pacientes/${patientId}/visualizar?tab=documentos`);
      router.refresh();
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Select
        label="Tipo de documento"
        id="type"
        value={type}
        onChange={(e) => handleTypeChange(e.target.value as (typeof FORMAL_TYPES)[number])}
      >
        {FORMAL_TYPES.map((value) => (
          <option key={value} value={value}>
            {DOCUMENT_TYPE_LABELS[value]}
          </option>
        ))}
      </Select>

      <Field
        label="Titulo / assunto (opcional)"
        id="title"
        placeholder="Ex.: Solicitacao da escola X"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <TextArea
        label="Conteudo do documento"
        id="body"
        rows={16}
        required
        value={body}
        onChange={(e) => {
          setBodyTouched(true);
          setBody(e.target.value);
        }}
      />
      <p className="-mt-2 text-xs text-slate-400 dark:text-slate-500">
        Preenchido com um modelo inicial para o tipo escolhido — edite livremente antes de gerar.
      </p>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
        <Button type="submit" isLoading={isLoading} className="px-6">
          Gerar documento
        </Button>
      </div>
    </form>
  );
}
