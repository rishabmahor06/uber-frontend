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

## Deploy

This app is **one long-running Node process** (`server.js`: Next.js + Express `/api/*` + Socket.IO).
It **cannot run on Vercel** — Vercel only runs Next.js serverless functions, so the Express API returns 404 and WebSockets are not supported.
Deploy to an always-on Node host such as **Render**, Railway, Fly.io or a VPS.

**Render (Blueprint)**

1. Push this repo to GitHub, then Render → *New* → *Blueprint* → pick the repo (it reads `render.yaml`).
2. Set the environment variables: `MONGO_URI` (Atlas string) and `NEXTAUTH_URL` (`https://<service>.onrender.com`).
   `MONGO_DB`, `JWT_SECRET_KEY` and `NEXTAUTH_SECRET` are filled in by the blueprint.
3. In MongoDB Atlas → *Network Access*, allow the host (`0.0.0.0/0` for Render free tier).
4. Add an UptimeRobot monitor on `https://<service>.onrender.com/api/health` (every 5 min) — keeps Render and Atlas awake.

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
