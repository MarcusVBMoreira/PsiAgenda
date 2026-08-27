"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel entrar.");
        return;
      }

      if (data.requires2FA) {
        router.push("/login/verificar");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <Button type="submit" isLoading={isLoading} className="w-full">
        Entrar
      </Button>

      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
        <Link href="/recuperar-senha" className="transition-colors hover:text-slate-900 hover:underline dark:hover:text-slate-100">
          Esqueci minha senha
        </Link>
        <Link href="/cadastro" className="transition-colors hover:text-slate-900 hover:underline dark:hover:text-slate-100">
          Criar conta
        </Link>
      </div>
    </form>
  );
}
