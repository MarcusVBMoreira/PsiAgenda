"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { formatBrazilianPhone } from "@/lib/format";

export default function ProfileSettingsForm({
  initialValues,
}: {
  initialValues: { fullName: string; email: string; crpNumber: string; phone: string };
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [crpNumber, setCrpNumber] = useState(initialValues.crpNumber);
  const [phone, setPhone] = useState(initialValues.phone);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, crpNumber, phone }),
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
      <Field
        label="Nome completo"
        id="settings-fullName"
        required
        value={fullName}
        onChange={(e) => {
          setSavedAt(null);
          setFullName(e.target.value);
        }}
      />
      <Field label="E-mail" id="settings-email" value={initialValues.email} disabled />
      <Field
        label="CRP"
        id="settings-crpNumber"
        required
        value={crpNumber}
        onChange={(e) => {
          setSavedAt(null);
          setCrpNumber(e.target.value);
        }}
      />
      <Field
        label="Telefone"
        id="settings-phone"
        value={phone}
        onChange={(e) => {
          setSavedAt(null);
          setPhone(formatBrazilianPhone(e.target.value));
        }}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {savedAt && !error && <p className="text-sm text-green-600 dark:text-green-400">Perfil salvo.</p>}

      <div>
        <Button type="submit" isLoading={isLoading} className="px-6">
          Salvar perfil
        </Button>
      </div>
    </form>
  );
}
