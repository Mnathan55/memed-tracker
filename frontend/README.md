# Meme'd Campaign Payout Tracker

Brands create campaigns with a views milestone ladder. Creators submit post links and
earn money as their posts cross milestones.

**Live app:** https://YOUR-APP.vercel.app
**API:** https://YOUR-API.onrender.com

> The backend is on Render's free tier. The first request after inactivity can take
> about 50 seconds. Please wait for it.

**Demo logins**

| Role    | Email                    | Password      |
| ------- | ------------------------ | ------------- |
| Brand   | mangeshsirsat5@gmail.com | mangeshdatta  |
| Creator | john5@gmail.com          | mangeshsirsat |

## Tech stack

Backend: Node.js, TypeScript, Express, MongoDB (Mongoose), JWT, zod.
Frontend: Next.js, TypeScript. Tests: Jest. Hosting: Render, Vercel, MongoDB Atlas.

## Run it locally

Requirements: Node 18+ and a MongoDB Atlas cluster (transactions need a replica set).

**Backend**

```bash
cd backend
cp .env.example .env     # fill in the values
npm install
npm run dev              # http://localhost:5001
npm test
```

**Frontend**

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev              # http://localhost:3000
```

## Environment variables

| File                | Name                  | Purpose                                              |
| ------------------- | --------------------- | ---------------------------------------------------- |
| backend/.env        | `PORT`                | Port to listen on                                    |
| backend/.env        | `MONGO_URI`           | Atlas connection string, including the database name |
| backend/.env        | `JWT_SECRET`          | Secret used to sign login tokens                     |
| backend/.env        | `FRONTEND_URL`        | Frontend address allowed by CORS                     |
| frontend/.env.local | `NEXT_PUBLIC_API_URL` | Base URL of the backend                              |

## How payouts work

1. `earned` = payout of the highest milestone the post has reached.
2. `owed` = `earned` minus what was already paid, never below 0.
3. `payNow` = the smaller of `owed` and the campaign's remaining budget.

The maths is a pure function in `services/payout.ts` with Jest tests. The database update
runs in a MongoDB transaction, and the budget is checked at write time, so simultaneous
updates are designed not to overspend the budget, and a repeated update pays 0.

## Assumptions and decisions

- **Naming:** a "target" in the code and API is the brief's milestone (`targets` in the request body).
- **Two milestones in one update:** the highest is paid, minus what was already paid.
- **Budget runs out mid-payout:** the remaining amount is paid and the campaign becomes `exhausted`.
- **Views go down:** no clawback. Paid amounts never decrease.
- **PATCH views sends the total**, not an increment, and has no role check, as the brief says.
- **A milestone counts at exactly the threshold** (10,000 views reaches the 10K milestone).
- **Validation:** milestones must increase in views and payout, and no payout can exceed the budget.
- **Post links** must match the campaign's platform.
- **Token storage:** localStorage, for simplicity. httpOnly cookies would be safer in production.
- The "Update views" box on the creator page stands in for real platform data.

## Tests

```bash
cd backend && npm test
```
