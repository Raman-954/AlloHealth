export type ReservationStatus = "PENDING" | "CONFIRMED" | "RELEASED";

export interface ProductItem {
  inventoryId: string;
  productName: string;
  warehouseName: string;
  availableStock: number;
}

export interface Reservation {
  id: string;
  inventoryId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
}