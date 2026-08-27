"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function RecuperarSenhaPage() {
  const [step, setStep] = useState<"solicitar" | "confirmar" | "concluido">("solicitar");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRequest(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Nao foi possivel enviar o codigo.");
        return;
      }
      setStep("confirmar");
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirm(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/recuperar-senha/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel redefinir a senha.");
        return;
      }
      setStep("concluido");
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  if (step === "concluido") {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-slate-700 dark:text-slate-300">Senha redefinida com sucesso.</p>
        <Link
          href="/login"
          className="text-sm font-medium text-slate-900 transition-colors hover:underline dark:text-slate-100"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  if (step === "confirmar") {
    return (
      <form onSubmit={handleConfirm} className="flex flex-col gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enviamos um codigo de 6 digitos para {email}. Informe-o abaixo junto com a nova senha.
        </p>
        <Field
          label="Codigo de verificacao"
          id="code"
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        <Field
          label="Nova senha"
          id="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Redefinir senha
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequest} className="flex flex-col gap-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Informe seu e-mail cadastrado para receber um codigo de verificacao.
      </p>
      <Field
        label="E-mail"
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Enviar codigo
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        <Link href="/login" className="transition-colors hover:text-slate-900 hover:underline dark:hover:text-slate-100">
          Voltar para o login
        </Link>
      </p>
    </form>
  );
}
