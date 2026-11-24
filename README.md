# NyumbaHub Kenya - Real Estate PWA

A full-stack real estate marketplace for Kenya built with **React (Vite)**, **Tailwind CSS** and **Supabase** (PostgreSQL, Auth, Storage, Row Level Security). Prices are in **Kenya Shillings (KSh)**, locations use Kenya's **47 counties**, and phone numbers are validated as Kenyan mobile numbers (07xx / 01xx / +254).

## Features

**Public**
- Hero search (buy/rent, county, type, keyword), featured and latest listings, popular counties
- Listings page with filters (county, type, price range in KSh, bedrooms, bathrooms), sorting and pagination (filters live in the URL, so searches are shareable)
- Property detail: photo gallery, amenities, Google Maps embed, views counter, share (native share sheet / copy link), similar properties
- Contact by call, WhatsApp, message form or **book a viewing** (date and time)
- Mortgage calculator in KSh (deposit, rate, term, stamp duty and legal fee estimates)

**Members (buyers, tenants, agents, landlords)**
- Sign up / log in / password reset email, Kenyan phone validation
- Save favourites, dashboard with *My listings*, *Saved*, *Inquiries (received and sent)* and *Profile*
- List a property: photo upload (up to 10, 5MB each) to Supabase Storage, amenities, GPS capture, edit, delete, mark as sold/let
- New listings go to **pending** until an admin approves them

**Admin panel (`/admin`)**
- Statistics: totals, pending approvals, users, agents, inquiries, viewings, views, favourites, average sale price and rent
- Charts: 6-month growth, listings by county, by type, by status, most viewed properties
- Approve / reject / feature / edit / delete any listing
- Manage users: change roles (user, agent, admin), suspend or reactivate accounts
- View and manage all inquiries and viewing requests

**PWA**
- Installable (manifest, service worker, icons incl. maskable), offline app shell, cached images
- **Install pop-up**: Android/Chrome/Edge native prompt via a custom banner; iOS Safari gets "Share > Add to Home Screen" instructions. Dismissing hides it for 7 days.
- Mobile bottom navigation, offline banner, safe-area support for notched phones

**Security**: Row Level Security on every table, database triggers stop users approving their own listings or promoting themselves to admin, emails are never exposed publicly, admin statistics run through an admin-only SQL function.

## Setup

### 1. Prerequisites
- Node.js 18+ (https://nodejs.org)
- A free Supabase account (https://supabase.com)

### 2. Create the Supabase project
1. In Supabase, click **New project**, choose a name, password and a region near Kenya (e.g. Frankfurt or London).
2. Open **SQL Editor > New query**, paste all of `supabase/schema.sql` and click **Run**. This creates the tables, policies, triggers, the `property-images` storage bucket and the admin stats function.
3. *(Optional)* Paste `supabase/seed.sql` into a new query and run it to add 13 sample Kenyan listings (Nairobi, Mombasa, Kiambu, Nakuru, Kisumu, Kajiado, Laikipia and Kwale).
4. **Authentication > Providers > Email**: for easy testing turn **off** "Confirm email". (If you keep it on, users must click the email link before logging in.)
5. **Authentication > URL Configuration**: set Site URL to `http://localhost:5173` for local work, and add your production URL once deployed.

### 3. Configure the app
```bash
cd nyumbahub
cp .env.example .env
```
Open `.env` and fill in values from **Project Settings > API**:
```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # the "anon public" key (never use the service_role key)
VITE_SUPPORT_PHONE=+2547XXXXXXXX
VITE_SUPPORT_EMAIL=hello@yourdomain.co.ke
```

### 4. Run
```bash
npm install
npm run dev          # http://localhost:5173
```

### 5. Create your admin account
1. Open the app and **Sign up** with your email.
2. In Supabase **SQL Editor** run (use your email):
```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```
3. Refresh the app. An **Admin panel** link now appears in your account menu (`/admin`). From there you can promote other users from the Users page.

### 6. Build and deploy
```bash
npm run build        # outputs /dist
npm run preview      # test the production build and the PWA locally
```
Deploy `dist` to Netlify, Vercel or Cloudflare Pages (SPA redirects are included via `public/_redirects` and `vercel.json`). Add the same `VITE_*` environment variables in the host's settings, and add the production URL to Supabase **Authentication > URL Configuration**. PWAs require **HTTPS**, which these hosts provide.

### Testing the PWA install pop-up
- Service workers are only active in the production build: run `npm run build && npm run preview`.
- Open in Chrome/Edge (desktop or Android). After ~2.5 seconds the install banner slides up. Dismiss it and it stays hidden for 7 days (clear `nyumbahub-install-dismissed` in localStorage to see it again).
- On iPhone use Safari; the banner shows Add to Home Screen steps.

## Project structure
```
supabase/schema.sql      tables, RLS policies, triggers, storage, admin_stats()
supabase/seed.sql        optional sample Kenyan listings
src/lib/                 supabase client, KSh formatting, counties, phone helpers
src/context/             AuthContext, FavoritesContext
src/components/          Navbar, BottomNav, PropertyCard, InstallPrompt, MortgageCalculator...
src/pages/               Home, Listings, PropertyDetail, Auth, Dashboard, PropertyForm...
src/pages/admin/         AdminDashboard (stats), AdminProperties, AdminUsers, AdminInquiries
public/                  PWA icons and SPA redirects
vite.config.js           PWA manifest and service worker (vite-plugin-pwa)
```

## Customising
- Brand colours: `tailwind.config.js` (`brand` green, `laterite` accent)
- Counties, property types, amenities: `src/lib/utils.js`
- Mortgage defaults (13% rate, 20-year term, stamp duty 4%): `src/components/MortgageCalculator.jsx`

## Troubleshooting
- **"Connect Supabase" screen**: `.env` is missing or still has placeholder values. Restart `npm run dev` after editing it.
- **Admin stats show an error**: you haven't run `schema.sql`, or your profile role isn't `admin` yet.
- **Can't upload photos**: confirm the `property-images` bucket exists (Storage tab) and you are logged in.
- **New listing doesn't show publicly**: it is *pending*. Approve it from Admin > Properties.
- **Signup says check your email**: disable "Confirm email" in Supabase Auth, or confirm via the email link.
- **Seed images are blank offline**: sample photos load from Unsplash; real listings use your own Supabase Storage uploads.

## Ideas for extending
M-Pesa (Daraja) payments for featured listings, SMS notifications via Africa's Talking, agent profile pages, saved searches with alerts, and Kiswahili translations.
