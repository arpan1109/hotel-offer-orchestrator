# Hotel Offer Orchestrator

A Node.js + TypeScript backend that fetches hotel offers from two mock suppliers using a Temporal workflow, selects the cheapest offer for each hotel, stores the results in Redis, and supports price-range filtering directly in Redis.

## Tech stack

- Node.js and TypeScript
- Express.js
- Temporal workflow orchestration
- Redis Sorted Sets for price-based filtering
- Docker and Docker Compose
- Postman for API testing

## How it works

1. A client calls `GET /api/hotels` with a city.
2. The Express API starts the `hotelWorkflow` in Temporal.
3. The workflow calls Supplier A and Supplier B activities in parallel.
4. The workflow combines the supplier responses and deduplicates hotels by normalized hotel name.
5. If both suppliers offer the same hotel, the lower-priced offer is retained.
6. The final offers are stored in a Redis Sorted Set, using the hotel price as the score.
7. The API queries Redis using the requested minimum and maximum prices and returns the matching offers.

Price filtering is performed by Redis using `ZRANGEBYSCORE`, rather than filtering the results in application code.

## Project structure

```text
hotel-offer-orchestrator/
├── src/
│   ├── activities/
│   │   └── hotel.activities.ts
│   ├── data/
│   │   └── supplierData.ts
│   ├── redis/
│   │   └── redis.client.ts
│   ├── routes/
│   │   └── supplier.routes.ts
│   ├── temporal/
│   │   └── client.ts
│   ├── types/
│   │   └── hotel.ts
│   ├── workflows/
│   │   └── hotel.workflow.ts
│   ├── server.ts
│   └── worker.ts
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Run with Docker Compose (recommended)

### Prerequisites

- Docker Desktop (or Docker Engine with the Compose plugin)

### Start the application

From the project root, run:

```bash
docker compose up --build -d
```

Check that all four services are running:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f api
docker compose logs -f worker
```

The API is available at:

- `http://localhost:3000`

The Temporal Web UI is available at:

- `http://localhost:8233`

### Stop the application

```bash
docker compose down
```

## API endpoints

### Main hotel offers endpoint

`GET /api/hotels?city=<city>`

Returns the cheapest offer for each hotel in the requested city.

Example:

```http
GET http://localhost:3000/api/hotels?city=delhi
```

Optional price range:

`GET /api/hotels?city=<city>&minPrice=<minimum>&maxPrice=<maximum>`

Example:

```http
GET http://localhost:3000/api/hotels?city=delhi&minPrice=5000&maxPrice=7000
```

Both `minPrice` and `maxPrice` must be supplied together. The range is inclusive.

### Mock supplier endpoints

These endpoints simulate the external suppliers and are used by the Temporal activities:

- `GET /supplierA/hotels?city=delhi`
- `GET /supplierB/hotels?city=delhi`

## Example response

The main API returns an array of offers in this format:

```json
[
  {
    "name": "Holtin",
    "price": 5340,
    "supplier": "Supplier B",
    "commissionPct": 20
  }
]
```

The actual response contains all matching hotels for the requested city and price range.

## Postman tests

Import `postman/Hotel-Orchestrator.postman_collection.json` into Postman and run the collection.

The collection includes these cases:

| Test | Request | Expected result |
|---|---|---|
| Delhi offers | `/api/hotels?city=delhi` | HTTP 200; four deduplicated hotels |
| Delhi low budget | `/api/hotels?city=delhi&minPrice=5000&maxPrice=7000` | HTTP 200; two hotels |
| Delhi high budget | `/api/hotels?city=delhi&minPrice=10000&maxPrice=15000` | HTTP 200; two hotels |
| No hotels available | `/api/hotels?city=jaipur` | HTTP 200; empty array |
| Missing city | `/api/hotels` | HTTP 400 |

## Environment configuration

Docker Compose supplies the service addresses through environment variables:

- `TEMPORAL_ADDRESS` — Temporal server address
- `REDIS_URL` — Redis connection URL
- `SUPPLIER_API_URL` — base URL used by the worker to call the API's mock supplier endpoints

When running the services outside Docker, the code falls back to local addresses such as `localhost`.

## Notes

- Supplier data is mock/static data stored in `src/data/supplierData.ts`.
- Each city is stored under a Redis key in the form `hotels:<city>`.
- Hotel offers are stored in a Redis Sorted Set with price as the score, enabling Redis-side price filtering.
