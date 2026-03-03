# Cartfolio

> Your personal purchase history & delivery tracker — all in one place.

---

## What is Cartfolio?

Have you ever found yourself digging through Gmail, WhatsApp, or six different apps just to answer "wait, did my order arrive?" or "what was that thing I bought last month?"

**Cartfolio fixes that.**

It is a single place where everything you've ever ordered — from Amazon, Flipkart, Zomato, Blinkit, and more — lives in a clean, searchable timeline. You see what's delivered, what's on the way, and what you've spent. No more hunting.

Think of it like **Google Photos, but for your purchases.**

---

## The Problem We're Solving

| Pain | Reality |
|---|---|
| "Did my order ship?" | Check Amazon app, then email, then notifications |
| "What did I order last month?" | Scroll through 3 apps and 2 email threads |
| "Has the food arrived?" | Keep refreshing Zomato |
| "How much did I spend this week?" | No idea |

Cartfolio gives you one timeline for all of it.

---

## How It Works (No Tech Jargon)

Cartfolio does **not** log into your Amazon or Zomato account. It does **not** scrape anything. Here's what it actually does:

### 3 Ways to Add Orders

**1. Manual Entry (always works)**
You type in what you bought, where, and when. Simple. This is the fallback that never breaks.

**2. Email Forwarding (main automation)**
Every time you place an order, you get a confirmation email. You either:
- Forward that email to `orders@cartfolio.app`, or
- Set a one-time auto-forward rule in Gmail

Cartfolio reads that email and pulls out the order details automatically. You never have to touch it again.

**3. Android Notifications (real-time)**
Give Cartfolio permission to read notifications. When Amazon sends "Your order has shipped", Cartfolio catches it, parses it, and updates your timeline — instantly.

Once a tracking number is found, Cartfolio polls a shipment tracking service to give you live courier status.

---

## Supported Services (Launch)

| Category | Service |
|---|---|
| Shopping | Amazon, Flipkart |
| Food & Quick Commerce | Zomato, Blinkit |

More services will be added based on user demand.

---

## Platforms

| Platform | Tech | Purpose |
|---|---|---|
| Android App | React Native | Primary experience — notifications, tracking, on-the-go |
| Website | React + Vite | Order history, data management, desktop convenience |
| Backend | Node.js + Supabase | Single source of truth for all data |

---

## Project Structure

```
cartfolio/
├── mobile/           # React Native Android app
│   ├── src/
│   │   ├── screens/      # UI screens (Home, Order Detail, Settings…)
│   │   ├── components/   # Reusable UI components
│   │   ├── services/     # API calls, notification listener
│   │   └── navigation/   # App routing
│   └── package.json
│
├── web/              # React (Vite) website
│   ├── src/
│   │   ├── pages/        # Route-level pages
│   │   ├── components/   # Shared UI components
│   │   └── services/     # API client
│   └── package.json
│
├── backend/          # API server + data parsers
│   ├── src/
│   │   ├── routes/       # REST API endpoints
│   │   ├── parsers/      # Email & notification parsers per vendor
│   │   ├── services/     # Business logic (dedup, tracking, normalize)
│   │   └── db/           # Supabase client + schema types
│   └── package.json
│
├── shared/           # Code shared across all packages
│   ├── types/            # TypeScript types (Order, User, Tracking…)
│   └── utils/            # Common helpers
│
└── README.md
```

---

## Tech Stack

| Layer | Tool | Why |
|---|---|---|
| Mobile | React Native | Cross-platform, Android-first |
| Web | React + Vite | Fast, modern, same language as mobile |
| Backend | Node.js (Express / Fastify) | JavaScript everywhere, easy to hire for |
| Database | Supabase (Postgres) | Auth + DB + Realtime, no infra overhead |
| Email Ingest | AWS SES / Postmark | Receive forwarded emails as JSON webhooks |
| Shipment Tracking | Shiprocket / AfterShip API | Track courier status from tracking numbers |
| Notifications | Android NotificationListenerService | Read app notifications with user permission |
| Monorepo | npm workspaces | Keep mobile, web, backend, shared in sync |

---

## Data Model (Simplified)

```
User
 └── Orders
      ├── vendor (Amazon / Flipkart / Zomato…)
      ├── source (manual / email / notification)
      ├── status (placed / shipped / delivered)
      ├── OrderItems []
      └── Tracking
           ├── carrier
           ├── tracking_number
           └── last_status
```

---

## MVP Scope

What ships first:

- [x] Manual order entry
- [x] Email forwarding ingestion + parsing
- [x] Order timeline (home screen)
- [x] Vendor filters (Amazon, Flipkart, Zomato, Blinkit)
- [x] Basic shipment tracking via tracking number

What comes after MVP:

- [ ] Gmail OAuth (connect inbox directly)
- [ ] Android notification listener (real-time updates)
- [ ] Spending analytics & charts
- [ ] OCR receipt scanning
- [ ] Smart search ("last phone I bought")

---

## Privacy Commitment

- Cartfolio does **not** connect to Amazon, Flipkart, or any retailer API
- Cartfolio does **not** scrape your accounts
- Cartfolio does **not** read your inbox — forwarded emails are parsed by code, not humans
- All data is yours — export or delete any time
- Notification access is **opt-in** and can be revoked any time

---

## Why This Is Hard (and Worth Building)

Most apps in this space either:
- Require dangerous account access ("log in with Amazon")
- Only work for one platform
- Die when an API changes

Cartfolio works around all of that by aggregating **user-authorized signals** — emails the user chooses to forward, notifications the user chooses to share — rather than hooking into retailer infrastructure.

This makes it resilient, private, and genuinely cross-platform.

---

## Status

> Early development. Monorepo structure in place. Backend and core parsers up next.

---

## License

MIT

