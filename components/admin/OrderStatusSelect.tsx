"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/admin/orderActions";

const STATUSES = ["pending", "paid", "fulfilled", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-forest/10 text-forest/60",
  paid: "bg-sage-deep/15 text-sage-deep",
  fulfilled: "bg-sage-deep/15 text-sage-deep",
  cancelled: "bg-clay/15 text-clay",
};

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    const previous = current;
    setCurrent(next);
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (result.error) {
        setError(result.error);
        setCurrent(previous);
      }
    });
  }

  return (
    <div>
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className={`rounded-full border-0 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${STATUS_COLORS[current] ?? "bg-forest/10 text-forest/60"}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 font-body text-xs text-clay" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
