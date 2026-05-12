interface ReservationFormProps {
  onSubmit: (quantity: number) => void;
  isLoading: boolean;
  maxStock: number;
}

export default function ReservationForm({ onSubmit, isLoading, maxStock }: ReservationFormProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onSubmit(1)}
        disabled={isLoading || maxStock <= 0}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300"
      >
        {isLoading ? "Processing..." : "Reserve 1 Unit"}
      </button>
    </div>
  );
}