"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { ProductItem } from "@/types";

export default function HomePage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();
  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : []))
      .then(setItems)
      .catch((err) => console.error("Failed to fetch products:", err));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleReserve(inventoryId: string) {
    setLoadingId(inventoryId);
    
    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({ 
          inventoryId: inventoryId, 
          quantity: 1 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/reservations/${data.id}`);
      } else {
        alert(`Error ${res.status}: ${data.error || "Reservation failed"}`);
        fetchProducts();
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Available Inventory
          </h1>
          <button 
            onClick={fetchProducts}
            className="text-sm bg-white border px-3 py-1 rounded-md hover:bg-slate-50 transition-colors"
          >
            Refresh Stock
          </button>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
            <p className="text-slate-400">No products found. Did you run the seed script?</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ProductCard 
                key={item.inventoryId} 
                item={item} 
                onReserve={handleReserve}
                isLoading={loadingId === item.inventoryId}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}