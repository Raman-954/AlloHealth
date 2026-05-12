"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ReservationPage({
  params,
}: {
  params: { id: string };
}) {
  const reservationId = params.id;

  const [status, setStatus] = useState<string>("PENDING");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshStatus = async () => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`);

      if (!res.ok) {
        if (res.status === 404) {
          setError("Reservation not found.");
        }
        return;
      }

      const data = await res.json();
      setStatus(data.status);

      const expiry = new Date(data.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));

      setTimeLeft(diff);
    } catch {
      setError("Failed to connect to the server.");
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [reservationId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || status !== "PENDING") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev !== null && prev > 0) {
          return prev - 1;
        }

        clearInterval(timer);
        setStatus("EXPIRED");
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const handleAction = async (action: "confirm" | "release") => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/reservations/${reservationId}/${action}`, {
        method: "POST",
      });

      if (res.status === 410) {
        setError("Reservation expired.");
        setStatus("EXPIRED");
        setTimeLeft(0);
        return;
      }

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-md mx-auto mt-12 px-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-md">
            <p className="font-bold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center">
          <h1 className="text-2xl font-bold mb-2">Secure Your Order</h1>

          <div className="bg-slate-900 text-white rounded-2xl py-10 mb-8">
            <p className="text-xs uppercase text-slate-400 font-bold tracking-widest mb-2">
              Time Remaining
            </p>

            <p className="text-6xl font-mono font-bold">
              {timeLeft !== null
                ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
                    .toString()
                    .padStart(2, "0")}`
                : "--:--"}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleAction("confirm")}
              disabled={timeLeft === 0 || loading || status !== "PENDING"}
              className="w-full bg-green-600 text-white py-4 rounded-xl"
            >
              {loading ? "Processing..." : "Confirm & Pay Now"}
            </button>

            <button
              onClick={() => handleAction("release")}
              disabled={loading}
              className="w-full bg-white border border-slate-200 py-4 rounded-xl"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
