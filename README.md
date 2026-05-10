> This project is made with the help of Claude (1M context).

# Playflix

Pay-per-minute (PPM) social cinema platform — host movie rooms, watch together, and earn as a creator.

## Overview

Playflix lets users host private movie rooms by sharing a Google Drive link, then watch in **Sync Mode** (real-time together with live chat) or **Solo Mode** (individual pace, recorded playback). PPM tiers monetize content from ₹0.25–₹1.25/min with creator earnings dashboards. Built for India's social cinema audience seeking ad-free, monetized group viewing.

## Features

- **Room creation** — Share a Google Drive link, get a room URL
- **Room vibes** — Chill, Serious, Party, Commentary
- **Sync Mode** — Watch together in real-time
- **Solo Mode** — Watch at your own pace
- **Live chat** — Text + emoji reactions via Ably
- **PPM tiers** — Classic ₹0.30, New Release ₹0.50, Premium ₹0.75, Ultra Premium ₹1.25, plus Regional/Kids/International
- **Creator earnings** — Per-minute revenue dashboard
- **Wallet system** — Prepaid balance for viewers
- **User profiles** — Watch history, followers
- **Vidstack player** — Modern adaptive playback

## Tech Stack

- **Framework:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Player:** Vidstack React
- **Realtime:** Ably (chat + sync)
- **State:** Zustand
- **Validation:** Zod
- **SDK:** @buildwithdarsh/sdk

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Production: [playflix.work.withdarsh.com](https://playflix.work.withdarsh.com)

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
