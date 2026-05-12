"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ReservationPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params);
  const reservationId = resolvedParams.id;

  const [status, setStatus] = useState<string>("PENDING");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshStatus = async () => {
    try {
      const res = await fetch(`/api/reservations/${reservationId}`);
      if (!res.ok) {
        if (res.status === 404) setError("Reservation not found.");
        return;
      }
      
      const data = await res.json();
      setStatus(data.status);

      const expiry = new Date(data.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setTimeLeft(diff);
    } catch (err) {
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
  }, [timeLeft === null, status]);

  const handleAction = async (action: 'confirm' | 'release') => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${reservationId}/${action}`, { 
        method: 'POST' 
      });
      
      if (res.status === 410) {
        setError("Error 410: This reservation has already expired or been released. You cannot proceed.");
        setStatus("EXPIRED");
        setTimeLeft(0);
        return;
      }

      if (res.ok) {
        alert(action === 'confirm' ? "Success! Your order has been placed." : "Reservation cancelled.");
        router.push("/");
        router.refresh(); 
      } else {
        const data = await res.json();
        setError(data.error || "An unexpected error occurred.");
      }
    } catch (err) {
      setError("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-md mx-auto mt-12 px-4">
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="font-bold">Important</p>
            </div>
            <p className="text-sm mt-1 ml-7">{error}</p>
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Secure Your Order</h1>
          <p className="text-slate-500 mb-8 text-sm">
            We have temporarily reserved your item. Complete the checkout before the timer runs out.
          </p>
          
          <div className="bg-slate-900 text-white rounded-2xl py-10 mb-8 shadow-inner relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs uppercase text-slate-400 font-bold tracking-widest mb-2">
                Time Remaining
              </p>
              <p className={`text-6xl font-mono font-bold tracking-tighter ${timeLeft !== null && timeLeft < 60 ? 'text-orange-400 animate-pulse' : 'text-white'}`}>
                {timeLeft !== null 
                  ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`
                  : "--:--"
                }
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => handleAction('confirm')}
              disabled={timeLeft === 0 || loading || status !== "PENDING"}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? "Processing..." : "Confirm & Pay Now"}
            </button>
            
            <button 
              onClick={() => handleAction('release')}
              disabled={loading}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-4 rounded-xl transition-all"
            >
              Cancel Order
            </button>
          </div>

          {status === "EXPIRED" || (timeLeft !== null && timeLeft === 0 && status !== "CONFIRMED") ? (
            <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-orange-700 text-sm font-medium italic">
                Your reservation window has closed. The stock has been released for other customers.
              </p>
            </div>
          ) : null}

          {status === "CONFIRMED" && (
            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-green-700 text-sm font-bold">
                ✓ Order Confirmed! Redirecting...
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-xs mt-8">
          Reservation ID: <span className="font-mono">{reservationId}</span>
        </p>
      </div>
    </main>
  );
}