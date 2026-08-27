"use client";

import { useRouter } from "next/navigation";
import DeleteIconButton from "@/components/ui/DeleteIconButton";

export default function DeleteDocumentButton({ documentId }: { documentId: string }) {
  const router = useRouter();

  async function handleConfirm() {
    const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Nao foi possivel excluir.");
    router.refresh();
  }

  return (
    <DeleteIconButton
      label="Excluir documento"
      title="Excluir este documento?"
      description="O arquivo em PDF sera removido permanentemente. Esta acao nao pode ser desfeita."
      onConfirm={handleConfirm}
    />
  );
}
