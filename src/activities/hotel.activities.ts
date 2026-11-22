
import { Hotel } from "../types/hotel";
import { saveHotelsToRedis } from "../redis/redis.client";

const SUPPLIER_API_URL =
  process.env.SUPPLIER_API_URL || "http://localhost:3000";

export async function getSupplierAHotels(city: string): Promise<Hotel[]> {
  const response = await fetch(
    `${SUPPLIER_API_URL}/supplierA/hotels?city=${encodeURIComponent(city)}`
  );

  if (!response.ok) throw new Error("Supplier A request failed");
  return response.json() as Promise<Hotel[]>;
}

export async function getSupplierBHotels(city: string): Promise<Hotel[]> {
  const response = await fetch(
    `${SUPPLIER_API_URL}/supplierB/hotels?city=${encodeURIComponent(city)}`
  );

  if (!response.ok) throw new Error("Supplier B request failed");
  return response.json() as Promise<Hotel[]>;
}

export async function saveHotelOffersToRedis(
  city: string,
  hotels: {
    name: string;
    price: number;
    supplier: string;
    commissionPct: number;
  }[]
): Promise<void> {
  await saveHotelsToRedis(city, hotels);
}
