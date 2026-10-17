# Speed — Cab Booking App

Full-stack ride booking app: **Next.js 14** (App Router) UI, an **Express** API served from a Next.js route,
**MongoDB** (Mongoose) and **NextAuth** for sessions. Runs on **Vercel** (no websocket server needed).

## Features

- Landing page with *Request a ride* (OpenStreetMap map, live place suggestions, route preview)
- Prices page: fare per vehicle (Bike / Auto / Car) from real road distance, then log in to book
- Rider app: current location, route line, vehicle selection, live driver tracking (polling), OTP-protected rides
- Captain app: go online, receive ride requests, accept, OTP start, live location, finish
- Separate rider / captain authentication (NextAuth credentials), account re-verified against MongoDB on every request
- `GET /api/health` — pings MongoDB (use it with UptimeRobot to keep Atlas awake)

## Stack

| Layer | Tech |
| --- | --- |
| UI | Next.js 14, React 18, Tailwind CSS, Leaflet / OpenStreetMap |
| API | Express 5, express-validator, JWT, bcrypt |
| Realtime | Short polling (serverless friendly) |
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

## Deploy on Vercel

The app is serverless-friendly: the Express API is served from `pages/api/[...path].js` (one function) and
NextAuth from `app/api/auth`. There is **no custom server and no WebSocket** — live updates use short polling
(rider polls the ride every ~2.5 s, captain app syncs every ~3 s).

1. Import the GitHub repo in Vercel (framework: Next.js, defaults are fine).
2. *Settings → Environment Variables* (Production):

   | Name | Value |
   | --- | --- |
   | `MONGO_URI` | Atlas connection string (URL-encode special chars in the password) |
   | `MONGO_DB` | `uber` |
   | `JWT_SECRET_KEY` | long random string |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://<your-project>.vercel.app` |

3. MongoDB Atlas → *Network Access* → allow `0.0.0.0/0` (Vercel uses dynamic IPs).
4. Redeploy. Add an UptimeRobot monitor on `https://<your-project>.vercel.app/api/health` (every 5 min) to keep Atlas awake.

The same build also runs on any Node host (`npm run build && npm start`, e.g. Render using `render.yaml`).

## Project layout

```
app/        Next.js routes (App Router) and NextAuth handler
src/        Views, components, hooks, contexts, helpers
server/     Express app: models, controllers, routes, services
pages/api/  Catch-all that serves the Express app (/api/*)
```

## Notes

- The public OSM services are for development / light use; use your own geocoding & routing for production.
- All data is stored in the `uber` database (`MONGO_DB`).


## Razorpay payments

After a ride is completed the rider can pay online (Razorpay Checkout) or choose cash.
Set these in `.env.local` / Vercel env vars (use `rzp_test_` keys while testing):

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Flow: `POST /api/payment/create-order` creates an order for the ride fare, Checkout collects the payment,
`POST /api/payment/verify` checks Razorpay's HMAC signature on the server before marking the ride `paid`.
Without the keys, only the cash option is shown.
