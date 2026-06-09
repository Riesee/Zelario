# Zelario

Zelario is a Web3 platform built with Next.js and React. It brings together decentralized trading (swap, liquidity, buy crypto), an NFT marketplace, social communities, quests, and profile rewards in one interface. Users can sign in with a Web3 wallet; separate admin and community-admin areas manage platform and community operations. Solidity contracts for the on-chain layer live in [`contracts/`](contracts/).

## How to run

Install dependencies once:

```bash
npm install
```

### Development — `npm run dev`

Starts the Next.js development server with hot reload. Use this while you are building or changing the app.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production — `npm start`

Serves an optimized production build. Build the app first, then start the server:

```bash
npm run build
npm start
```

The app is available at [http://localhost:3000](http://localhost:3000) (same port as development unless you set `PORT`).

## Implementation Notes

### Daily Login Rewards

The daily login reward flow is exposed through `GET /api/rewards/daily-login` and `POST /api/rewards/daily-login/claim`. The `/claim` route is an alias around the main daily-login `POST` handler, so both paths use the same claim logic.

Authentication is handled through a lightweight wallet identity resolver for the demo flow. The API first looks for an `Authorization: Bearer <jwt>` header and verifies the token with `JWT_SECRET`; when verification succeeds, the decoded payload must provide an `address` field. If no valid bearer token is present, the route falls back to the current demo inputs: `x-demo-address` first, then the `demo-address` cookie. This keeps the rewards endpoint compatible with the wallet-session UI while documenting the intended path for JWT-backed wallet identity.

Claim repetition is prevented per wallet address and per calendar day. The reward store persists records in `data/dailyLogin.sqlite` with the wallet address normalized to lowercase as the user key. Before a claim is accepted, the API compares the stored `lastClaimDate` with today's ISO date. If they match, the request is rejected with `Already claimed today`; otherwise the store updates `lastClaimDate` and returns the configured daily reward amount.

The rewards UI fetches the current reward status when a wallet address is available. After a successful claim, it immediately updates local state so the button switches to the claimed state without waiting for another page load. If the claim request fails or the server reports an out-of-date state, the UI refetches the status from the API to stay in sync with the persisted record.
