"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupplierAHotels = getSupplierAHotels;
exports.getSupplierBHotels = getSupplierBHotels;
exports.saveHotelOffersToRedis = saveHotelOffersToRedis;
const redis_client_1 = require("../redis/redis.client");
// Fetch hotels from Supplier A
async function getSupplierAHotels(city) {
    const response = await fetch(`http://localhost:3000/supplierA/hotels?city=${encodeURIComponent(city)}`);
    if (!response.ok) {
        throw new Error("Supplier A request failed");
    }
    return response.json();
}
// Fetch hotels from Supplier B
async function getSupplierBHotels(city) {
    const response = await fetch(`http://localhost:3000/supplierB/hotels?city=${encodeURIComponent(city)}`);
    if (!response.ok) {
        throw new Error("Supplier B request failed");
    }
    return response.json();
}
// Save final deduplicated offers to Redis
async function saveHotelOffersToRedis(city, hotels) {
    await (0, redis_client_1.saveHotelsToRedis)(city, hotels);
}
