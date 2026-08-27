"use client";

import { useState, FormEvent } from "react";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nao foi possivel alterar a senha.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSavedAt(Date.now());
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        label="Senha atual"
        id="currentPassword"
        type="password"
        required
        value={currentPassword}
        onChange={(e) => {
          setSavedAt(null);
          setCurrentPassword(e.target.value);
        }}
      />
      <Field
        label="Nova senha"
        id="newPassword"
        type="password"
        required
        minLength={8}
        value={newPassword}
        onChange={(e) => {
          setSavedAt(null);
          setNewPassword(e.target.value);
        }}
      />
      <Field
        label="Confirmar nova senha"
        id="confirmPassword"
        type="password"
        required
        value={confirmPassword}
        onChange={(e) => {
          setSavedAt(null);
          setConfirmPassword(e.target.value);
        }}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {savedAt && !error && <p className="text-sm text-green-600 dark:text-green-400">Senha alterada.</p>}

      <div>
        <Button type="submit" isLoading={isLoading} className="px-6">
          Alterar senha
        </Button>
      </div>
    </form>
  );
}
