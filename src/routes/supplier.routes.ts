// making different routes for various things.

import { Router, Request, Response } from "express";

import {
    supplierAHotels,
    supplierBHotels
} from "../data/supplierData";

const router = Router();

// Reusable function to filter hotels by city
function getHotelsByCity(
    hotels: typeof supplierAHotels,
    req: Request,
    res: Response
) {
    const city = req.query.city; //suppose the return query: /supplierA/hotels?city=delhi , so we have to extract city from this query.

    // handelling the bad input error.
    if (typeof city !== "string" || !city.trim()) {
        return res.status(400).json({
            message: "Please provide a valid city"
        });
    }

    const filteredHotels = hotels.filter(
        hotel => hotel.city.toLowerCase() === city.trim().toLowerCase()
    );

    return res.status(200).json(filteredHotels);
}

// Supplier A API
router.get("/supplierA/hotels", (req, res) => {
    return getHotelsByCity(supplierAHotels, req, res);
});

// Supplier B API
router.get("/supplierB/hotels", (req, res) => {
    return getHotelsByCity(supplierBHotels, req, res);
});

export default router;
