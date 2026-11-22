
import { Connection, Client } from "@temporalio/client";
import { hotelWorkflow } from "../workflows/hotel.workflow";

export async function fetchHotelOffers(city: string) {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS || "localhost:7233",
  });

  try {
    const client = new Client({ connection });

    const result = await client.workflow.execute(hotelWorkflow, {
      taskQueue: "hotel-offer-task-queue",
      workflowId: `hotel-offer-${city}-${Date.now()}`,
      args: [city],
    });

    return result;
  } finally {
    await connection.close();
  }
}
