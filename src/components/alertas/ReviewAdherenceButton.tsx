"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function ReviewAdherenceButton({ alertId }: { alertId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleReview() {
    setIsLoading(true);
    try {
      await fetch(`/api/adherence-alerts/${alertId}`, { method: "PUT" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleReview}
      isLoading={isLoading}
      className="shrink-0 px-3 py-1 text-xs"
    >
      Marcar como revisado
    </Button>
  );
}
