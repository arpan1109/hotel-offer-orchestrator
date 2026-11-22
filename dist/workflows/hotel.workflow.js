"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelWorkflow = hotelWorkflow;
const workflow_1 = require("@temporalio/workflow");
const { getSupplierAHotels, getSupplierBHotels, saveHotelOffersToRedis, } = (0, workflow_1.proxyActivities)({
    startToCloseTimeout: "30 seconds",
});
async function hotelWorkflow(city) {
    const [hotelsA, hotelsB] = await Promise.all([
        getSupplierAHotels(city),
        getSupplierBHotels(city),
    ]);
    const bestOffers = new Map();
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
