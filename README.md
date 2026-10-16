# Speed — Cab Booking App

Full-stack ride booking app: **Next.js 14** (App Router) UI, an **Express** API and **Socket.IO**
all running in a single Node process (`server.js`), with **MongoDB** (Mongoose) and **NextAuth** for sessions.

## Features

- Landing page with *Request a ride* (OpenStreetMap map, live place suggestions, route preview)
- Prices page: fare per vehicle (Bike / Auto / Car) from real road distance, then log in to book
- Rider app: current location, route line, vehicle selection, live driver tracking, OTP-protected rides
- Captain app: go online, receive ride requests over Socket.IO, accept, OTP start, live location, finish
- Separate rider / captain authentication (NextAuth credentials), account re-verified against MongoDB on every request
- `GET /api/health` — pings MongoDB (use it with UptimeRobot to keep Atlas awake)

## Stack

| Layer | Tech |
| --- | --- |
| UI | Next.js 14, React 18, Tailwind CSS, Leaflet / OpenStreetMap |
| API | Express 5, express-validator, JWT, bcrypt |
| Realtime | Socket.IO |
| Data | MongoDB + Mongoose |
| Maps | Photon + Nominatim (search), OSRM (routing) — no API key needed |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

> Socket.IO needs a long-running server, so deploy to a Node host (Render, Railway, EC2, VPS) — not serverless.

## Project layout

```
app/        Next.js routes (App Router) and NextAuth handler
src/        Views, components, hooks, contexts, helpers
server/     Express app: models, controllers, routes, services, Socket.IO
server.js   Custom server: Next + Express (/api/*) + Socket.IO (/socket.io)
```

## Notes

- The public OSM services are for development / light use; use your own geocoding & routing for production.
- All data is stored in the `uber` database (`MONGO_DB`).
