"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ReservationPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;

  const [status, setStatus] = useState("PENDING");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = async () => {
    if (!reservationId) return;

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
      setError("Failed to connect to server.");
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [reservationId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || status !== "PENDING") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev && prev > 0) return prev - 1;
        clearInterval(timer);
        setStatus("EXPIRED");
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const handleAction = async (action: "confirm" | "release") => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/reservations/${reservationId}/${action}`, {
        method: "POST",
      });

      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(data.error || "Action failed.");
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
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <h1 className="text-2xl font-bold mb-6">Secure Your Order</h1>

          <div className="bg-slate-900 text-white rounded-xl py-8 mb-6">
            <p>TIME REMAINING</p>
            <p className="text-5xl font-mono">
              {timeLeft !== null
                ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
                    .toString()
                    .padStart(2, "0")}`
                : "--:--"}
            </p>
          </div>

          <button
            onClick={() => handleAction("confirm")}
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl mb-4"
          >
            Confirm & Pay Now
          </button>

          <button
            onClick={() => handleAction("release")}
            disabled={loading}
            className="w-full border py-4 rounded-xl"
          >
            Cancel Order
          </button>
        </div>
      </div>
    </main>
  );
}
