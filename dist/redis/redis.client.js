"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = connectRedis;
exports.saveHotelsToRedis = saveHotelsToRedis;
exports.getHotelsByPrice = getHotelsByPrice;
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
});
async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Connected to Redis!");
    }
}
async function saveHotelsToRedis(city, hotels) {
    await connectRedis();
    const key = `hotels:${city.toLowerCase()}`;
    // Replace the previous offers for this city.
    await redisClient.del(key);
    if (hotels.length > 0) {
        await redisClient.zAdd(key, hotels.map((hotel) => ({
            score: hotel.price,
            value: JSON.stringify(hotel),
        })));
    }
    console.log(`Saved ${hotels.length} hotels to Redis for ${city}`);
}
async function getHotelsByPrice(city, minPrice, maxPrice) {
    await connectRedis();
    const key = `hotels:${city.toLowerCase()}`;
    const results = await redisClient.zRangeByScore(key, minPrice, maxPrice);
    return results.map((item) => JSON.parse(item));
}
