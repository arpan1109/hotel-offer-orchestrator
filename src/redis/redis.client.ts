
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Connected to Redis!");
  }
}

export async function saveHotelsToRedis(
  city: string,
  hotels: {
    name: string;
    price: number;
    supplier: string;
    commissionPct: number;
  }[]
) {
  await connectRedis();

  const key = `hotels:${city.toLowerCase()}`;

  // Replace the previous offers for this city.
  await redisClient.del(key);

  if (hotels.length > 0) {
    await redisClient.zAdd(
      key,
      hotels.map((hotel) => ({
        score: hotel.price,
        value: JSON.stringify(hotel),
      }))
    );
  }

  console.log(`Saved ${hotels.length} hotels to Redis for ${city}`);
}

export async function getHotelsByPrice(
  city: string,
  minPrice: number,
  maxPrice: number
) {
  await connectRedis();

  const key = `hotels:${city.toLowerCase()}`;

  const results = await redisClient.zRangeByScore(
    key,
    minPrice,
    maxPrice
  );

  return results.map((item) => JSON.parse(item));
}
