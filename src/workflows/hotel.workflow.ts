
import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities/hotel.activities";

const {
  getSupplierAHotels,
  getSupplierBHotels,
  saveHotelOffersToRedis,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "30 seconds",
});

export interface BestHotelOffer {
  name: string;
  price: number;
  supplier: string;
  commissionPct: number;
}

export async function hotelWorkflow(
  city: string
): Promise<BestHotelOffer[]> {

  const [hotelsA, hotelsB] = await Promise.all([
    getSupplierAHotels(city),
    getSupplierBHotels(city),
  ]);

  const bestOffers = new Map<string, BestHotelOffer>();

  const allHotels = [
    ...hotelsA.map((hotel) => ({
      hotel,
      supplier: "Supplier A",
    })),
    ...hotelsB.map((hotel) => ({
      hotel,
      supplier: "Supplier B",
    })),
  ];

  for (const { hotel, supplier } of allHotels) {
    const key = hotel.name.trim().toLowerCase();
    const existing = bestOffers.get(key);

    if (!existing || hotel.price < existing.price) {
      bestOffers.set(key, {
        name: hotel.name,
        price: hotel.price,
        supplier,
        commissionPct: hotel.commissionPct,
      });
    }
  }

  const finalOffers = Array.from(bestOffers.values());

  await saveHotelOffersToRedis(city, finalOffers);

  return finalOffers;
}
