"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function VerifyTwoFactorPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Codigo invalido.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Enviamos um codigo de 6 digitos para o seu e-mail. Ele expira em 10 minutos.
      </p>
      <Field
        label="Codigo de verificacao"
        id="code"
        inputMode="numeric"
        maxLength={6}
        autoComplete="one-time-code"
        required
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Confirmar
      </Button>
    </form>
  );
}
