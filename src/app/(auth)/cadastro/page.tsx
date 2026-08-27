"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function CadastroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [crpNumber, setCrpNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, crpNumber, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel criar a conta.");
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
      <Field
        label="Nome completo"
        id="fullName"
        autoComplete="name"
        required
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Field
        label="CRP"
        id="crpNumber"
        placeholder="Ex.: 06/221237"
        required
        value={crpNumber}
        onChange={(e) => setCrpNumber(e.target.value)}
      />
      <Field
        label="E-mail"
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Field
        label="Senha"
        id="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Criar conta
      </Button>

      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Ja tem conta?{" "}
        <Link href="/login" className="transition-colors hover:text-slate-900 hover:underline dark:hover:text-slate-100">
          Entrar
        </Link>
      </p>
    </form>
  );
}
