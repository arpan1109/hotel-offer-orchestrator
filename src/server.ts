
import express from "express";
import supplierRoutes from "./routes/supplier.routes";
import { fetchHotelOffers } from "./temporal/client";
import { getHotelsByPrice } from "./redis/redis.client";

const app = express();
const PORT = 3000;

app.use(express.json());

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

      if (
        !Number.isFinite(min) ||
        !Number.isFinite(max) ||
        min < 0 ||
        max < min
      ) {
        return res.status(400).json({
          error: "Invalid price range",
        });
      }
    }

    // Execute Temporal workflow and wait for Redis storage.
    await fetchHotelOffers(city.trim());

    // Redis performs the actual price filtering.
    const hotels = await getHotelsByPrice(
      city.trim(),
      min,
      max
    );

    return res.status(200).json(hotels);
  } catch (error) {
    console.error("Hotel API error:", error);

    return res.status(500).json({
      error: "Failed to fetch hotel offers",
    });
  }
});

// Mock supplier APIs
app.use("/", supplierRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
