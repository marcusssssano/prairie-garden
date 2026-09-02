"use client";

import { useState, useTransition } from "react";
import { deletePlant } from "@/lib/admin/plantActions";
import ConfirmModal from "@/components/ConfirmModal";

export default function DeletePlantButton({
  plantId,
  plantName,
}: {
  plantId: string;
  plantName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (error) {
      setConfirming(false);
      return;
    }
    startTransition(async () => {
      const result = await deletePlant(plantId);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirming(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className="font-body text-sm text-clay hover:underline"
      >
        Delete
      </button>

      <ConfirmModal
        open={confirming}
        title="Delete plant?"
        message={
          error ?? `Delete ${plantName}? This can't be undone.`
        }
        confirmLabel={error ? "OK" : isPending ? "Deleting…" : "Delete"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
