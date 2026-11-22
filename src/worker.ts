
import { Worker, NativeConnection } from "@temporalio/worker";
import * as activities from "./activities/hotel.activities";

async function run() {
  const address = process.env.TEMPORAL_ADDRESS || "localhost:7233";

  const connection = await NativeConnection.connect({ address });

  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve("./workflows/hotel.workflow"),
    activities,
    taskQueue: "hotel-offer-task-queue",
  });

  console.log(`Hotel Offer Worker connected to ${address}!`);
  await worker.run();
}

run().catch((err) => {
  console.error("Worker failed:", err);
  process.exit(1);
});
