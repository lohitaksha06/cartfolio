# Supabase Setup Guide — Cartfolio

Follow this step-by-step to set up your Supabase project and get the database ready.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) → **New project**
2. Pick an org, set a strong DB password (save it somewhere), choose a region close to you (e.g., Mumbai `ap-south-1`)
3. Once the project is up, go to **Settings → API** and copy:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon (public)` key
   - `service_role` key (for the backend only — **never** expose this in the frontend)

---

## 2. Run the SQL Schema

Go to **SQL Editor** in the Supabase dashboard, paste **all** of the SQL below, and click **Run**.

```sql
-- ──────────────────────────────────────────
-- EXTENSIONS
-- ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────
CREATE TYPE vendor_type AS ENUM (
  'AMAZON', 'FLIPKART', 'ZOMATO', 'BLINKIT', 'SWIGGY', 'OTHER'
);

CREATE TYPE order_status AS ENUM (
  'PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY',
  'DELIVERED', 'CANCELLED', 'RETURNED'
);

CREATE TYPE data_source AS ENUM (
  'MANUAL', 'EMAIL', 'NOTIFICATION', 'TRACKING_API'
);

CREATE TYPE order_category AS ENUM (
  'SHOPPING', 'FOOD', 'GROCERY', 'OTHER'
);

-- ──────────────────────────────────────────
-- TABLES
-- ──────────────────────────────────────────

-- 1. Users (extends Supabase Auth)
CREATE TABLE public.users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Orders
CREATE TABLE public.orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vendor       vendor_type NOT NULL,
  category     order_category NOT NULL DEFAULT 'OTHER',
  source       data_source NOT NULL DEFAULT 'MANUAL',
  order_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
  status       order_status NOT NULL DEFAULT 'PLACED',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency     TEXT NOT NULL DEFAULT 'INR',
  raw_email_id TEXT,               -- optional: message-ID of the source email
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 3. Order Items
CREATE TABLE public.order_items (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id  UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name      TEXT NOT NULL,
  quantity  INT NOT NULL DEFAULT 1,
  price     NUMERIC(12, 2) NOT NULL DEFAULT 0,
  image_url TEXT
);

-- 4. Tracking
CREATE TABLE public.tracking (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id           UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier            TEXT NOT NULL,
  tracking_number    TEXT NOT NULL,
  last_status        TEXT,
  estimated_delivery DATE,
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- 5. Gmail Tokens (server-side only, never exposed to client)
CREATE TABLE public.gmail_tokens (
  user_id        UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  access_token   TEXT NOT NULL,
  refresh_token  TEXT NOT NULL,
  token_expiry   TIMESTAMPTZ NOT NULL,
  email          TEXT NOT NULL,
  last_scan_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ──────────────────────────────────────────
-- INDEXES (for fast queries)
-- ──────────────────────────────────────────
CREATE INDEX idx_orders_user        ON public.orders(user_id);
CREATE INDEX idx_orders_vendor      ON public.orders(vendor);
CREATE INDEX idx_orders_status      ON public.orders(status);
CREATE INDEX idx_orders_order_date  ON public.orders(order_date DESC);
CREATE INDEX idx_order_items_order  ON public.order_items(order_id);
CREATE INDEX idx_tracking_order     ON public.tracking(order_id);

-- ──────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tracking_updated
  BEFORE UPDATE ON public.tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────
ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_tokens  ENABLE ROW LEVEL SECURITY;

-- Users: can read/update only their own row
CREATE POLICY users_own ON public.users
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Orders: users see only their own
CREATE POLICY orders_own ON public.orders
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Order Items: accessible if the parent order belongs to the user
CREATE POLICY items_own ON public.order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Tracking: same pattern as items
CREATE POLICY tracking_own ON public.tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = tracking.order_id
        AND orders.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = tracking.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Gmail Tokens: only the backend service_role key should access this.
-- No client policy — effectively blocks anon/authenticated access.
CREATE POLICY gmail_tokens_none ON public.gmail_tokens
  FOR ALL USING (false);
```

---

## 3. Enable Auth Providers

1. In the Supabase dashboard → **Authentication → Providers**
2. Enable **Email** (on by default)
3. Enable **Google** (for "Sign in with Google"):
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create an **OAuth 2.0 Client ID** (Web application)
   - Add `https://xxxxx.supabase.co/auth/v1/callback` as an authorized redirect URI
   - Copy the Client ID & Secret into Supabase's Google provider settings

---

## 4. Environment Variables

Create a `.env` file at the project root (and/or in `backend/`):

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhb...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhb...your-service-role-key

# Gmail OAuth (for backend scanning)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/gmail/callback
```

---

## 5. Install Supabase Client

```bash
# In the shared or backend package
pnpm add @supabase/supabase-js

# For the web app (client-side)
cd web && pnpm add @supabase/supabase-js

# For mobile (React Native)
cd mobile && pnpm add @supabase/supabase-js @react-native-async-storage/async-storage
```

---

## 6. Initialize Supabase Client

Create `shared/supabase.ts` (or in each package):

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://xxxxx.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

For the **backend** (server-side), use the service role key to bypass RLS:

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## 7. Replace the In-Memory Store

Once Supabase is set up, replace `backend/src/db/store.ts` with real queries:

```typescript
import { supabaseAdmin } from "./supabase";

export async function getOrders(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, order_items(*), tracking(*)")
    .eq("user_id", userId)
    .order("order_date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function upsertOrder(order: any) {
  const { items, tracking, ...orderData } = order;

  const { data, error } = await supabaseAdmin
    .from("orders")
    .upsert(orderData)
    .select()
    .single();

  if (error) throw error;

  if (items?.length) {
    await supabaseAdmin
      .from("order_items")
      .upsert(items.map((i: any) => ({ ...i, order_id: data.id })));
  }

  if (tracking) {
    await supabaseAdmin
      .from("tracking")
      .upsert({ ...tracking, order_id: data.id });
  }

  return data;
}
```

---

## Table Summary

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User profile (linked to Supabase Auth) | `id`, `email`, `name` |
| `orders` | Every purchase | `user_id`, `vendor`, `status`, `total_amount`, `order_date` |
| `order_items` | Line items within an order | `order_id`, `name`, `quantity`, `price` |
| `tracking` | Delivery tracking info | `order_id`, `carrier`, `tracking_number`, `estimated_delivery` |
| `gmail_tokens` | OAuth tokens for Gmail scanning (server-only) | `user_id`, `access_token`, `refresh_token` |

---

## What's Protected by RLS?

- **Users** can only see/edit **their own** data across all tables
- **Gmail tokens** are completely blocked from client access — only the backend `service_role` key can read/write them
- **Order items and tracking** are scoped through the parent order's `user_id`

That's it! Once you run the SQL, set up auth, and add the env vars, the app is ready to connect to real data.
