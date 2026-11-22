"use strict";
// making different routes for various things.
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supplierData_1 = require("../data/supplierData");
const router = (0, express_1.Router)();
// Reusable function to filter hotels by city
function getHotelsByCity(hotels, req, res) {
    const city = req.query.city; //suppose the return query: /supplierA/hotels?city=delhi , so we have to extract city from this query.
    // handelling the bad input error.
    if (typeof city !== "string" || !city.trim()) {
        return res.status(400).json({
            message: "Please provide a valid city"
        });
    }
    const filteredHotels = hotels.filter(hotel => hotel.city.toLowerCase() === city.trim().toLowerCase());
    return res.status(200).json(filteredHotels);
}
// Supplier A API
router.get("/supplierA/hotels", (req, res) => {
    return getHotelsByCity(supplierData_1.supplierAHotels, req, res);
});
// Supplier B API
router.get("/supplierB/hotels", (req, res) => {
    return getHotelsByCity(supplierData_1.supplierBHotels, req, res);
});
exports.default = router;
