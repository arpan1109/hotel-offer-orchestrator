"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supplier_routes_1 = __importDefault(require("./routes/supplier.routes"));
const client_1 = require("./temporal/client");
const redis_client_1 = require("./redis/redis.client");
const app = (0, express_1.default)();
const PORT = 3000;
app.use(express_1.default.json());
// Root route
app.get("/", (req, res) => {
    res.send("Hotel Offer Orchestrator is running!");
});
// Final hotel search API
app.get("/api/hotels", async (req, res) => {
    try {
        const city = req.query.city;
        if (typeof city !== "string" || !city.trim()) {
            return res.status(400).json({
                error: "Please provide a valid city",
            });
        }
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;
        // Both price parameters must be supplied together.
        if ((minPrice === undefined) !== (maxPrice === undefined)) {
            return res.status(400).json({
                error: "Provide both minPrice and maxPrice",
            });
        }
        let min = 0;
        let max = Number.MAX_SAFE_INTEGER;
        if (minPrice !== undefined && maxPrice !== undefined) {
            min = Number(minPrice);
            max = Number(maxPrice);
            if (!Number.isFinite(min) ||
                !Number.isFinite(max) ||
                min < 0 ||
                max < min) {
                return res.status(400).json({
                    error: "Invalid price range",
                });
            }
        }
        // Execute Temporal workflow and wait for Redis storage.
        await (0, client_1.fetchHotelOffers)(city.trim());
        // Redis performs the actual price filtering.
        const hotels = await (0, redis_client_1.getHotelsByPrice)(city.trim(), min, max);
        return res.status(200).json(hotels);
    }
    catch (error) {
        console.error("Hotel API error:", error);
        return res.status(500).json({
            error: "Failed to fetch hotel offers",
        });
    }
});
// Mock supplier APIs
app.use("/", supplier_routes_1.default);
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
