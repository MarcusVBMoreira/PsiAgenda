"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function DeleteIconButton({
  label,
  title,
  description,
  onConfirm,
}: {
  /** Accessible label for the trash-icon trigger button. */
  label: string;
  /** Heading shown in the confirmation dialog. */
  title: string;
  description?: string;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexao.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        title={label}
        aria-label={label}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-600 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 active:translate-y-0 dark:border-red-900 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950"
      >
        <Trash2 className="h-4 w-4" strokeWidth={2} />
      </button>

      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmLabel="Excluir"
        isLoading={isLoading}
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => {
          setOpen(false);
          setError(null);
        }}
      />
    </>
  );
}
