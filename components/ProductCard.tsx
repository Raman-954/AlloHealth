import { ProductItem } from "@/types";

interface ProductCardProps {
  item: ProductItem;
  onReserve: (id: string) => void;
  isLoading: boolean;
}

export default function ProductCard({ item, onReserve, isLoading }: ProductCardProps) {
  const isOutOfStock = item.availableStock <= 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{item.productName}</h2>
        <p className="text-sm text-slate-500 mb-4">{item.warehouseName}</p>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</span>
          <p className={`text-xl font-mono font-bold ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
            {item.availableStock}
          </p>
        </div>
        
        <button
          onClick={() => onReserve(item.inventoryId)}
          disabled={isOutOfStock || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isLoading ? "Reserving..." : "Reserve Now"}
        </button>
      </div>
    </div>
  );
}