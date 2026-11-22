"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHotelOffers = fetchHotelOffers;
const client_1 = require("@temporalio/client");
const hotel_workflow_1 = require("../workflows/hotel.workflow");
async function fetchHotelOffers(city) {
    const connection = await client_1.Connection.connect({
        address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
    });
    try {
        const client = new client_1.Client({ connection });
        const result = await client.workflow.execute(hotel_workflow_1.hotelWorkflow, {
            taskQueue: "hotel-offer-task-queue",
            workflowId: `hotel-offer-${city}-${Date.now()}`,
            args: [city],
        });
        return result;
    }
    finally {
        await connection.close();
    }
}
