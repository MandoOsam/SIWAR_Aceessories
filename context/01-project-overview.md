# 01 — Project Overview

## What is SIWAR?

SIWAR is a brand selling **stainless steel jewelry for women** (necklaces, rings, bracelets, earrings, sets) in Egypt. The brand already sells to real customers through its current store. This project is a **new, full-control platform** built from scratch:

| Part | Folder | What it is |
|---|---|---|
| Customer storefront | `frontend/` | Luxury, dark-feminine, highly animated, mobile-first shop (Arabic + English, dark + light) |
| Admin dashboard | `admin/` | Where the owner manages products, orders, reviews, coupons, and **all website content** without touching code |
| Backend API | `backend/` | Node + Express + PostgreSQL (Supabase). One API for both frontends |

## Why are we building it?

1. Full ownership of the brand experience (design, content, data), not limited by a store builder.
2. The owner must be able to change products, images, reviews, hero, banners, and brand story from the dashboard.
3. A real, commercial, portfolio-grade project that demonstrates full-stack ability (frontend, backend, security, deployment).

## Who uses it?

| User | Needs |
|---|---|
| Customer (guest or registered) | Browse, search, filter, buy (guest checkout allowed), track order, wishlist, reviews, account |
| Owner / Super admin | Everything |
| Staff (future) | Limited roles: manager, support, content |

## Scope

**v1 (MVP)**
- Storefront: home, shop, category, search, product, cart, checkout (guest allowed), order success, track order, auth, account (orders, wishlist, addresses), static pages, reviews
- Admin: dashboard, products (+ image upload), categories, orders (status timeline, invoice), customers, inventory, coupons, campaigns, reviews, website content (hero + animated background, banners, brand story, pages), settings (shipping, payments, trust badges), staff users and roles, notifications, activity log
- Backend: REST API, session cookie auth, roles, uploads signing, CSV export
- Languages: Arabic (RTL, default) and English. Themes: dark (default) and light
- Payments: **Cash on Delivery, InstaPay transfer, Vodafone Cash** (manual confirmation by admin)
- Currency: EGP

**Later (not in v1)**
Online card payments (e.g. a payment gateway), recommendations engine, AI assistant, loyalty, referrals, gift cards, abandoned-cart emails, product comparison, back-in-stock alerts, multi-currency, marketing automation.

**Non-goals**
Multi-vendor marketplace, mobile apps, B2B pricing, international shipping.

## Brand summary

- Name shown everywhere as **SIWAR** (Latin letters, both languages). Logo: handwritten script wordmark with a long line and "ACCESSORIES" underneath. Files in `frontend/public/assets/logo/`.
- Mood: dark feminine minimalism, quiet luxury, romantic, a little mysterious.
- Core product promise: **stainless steel** = rust-resistant, tarnish-resistant, water-friendly, suitable for sensitive skin. Keep claims factual, no medical claims.
- Full visual rules: `05-ui-context.md` and `05b-ui-context-admin.md`.

## Glossary (Arabic ↔ slug)

| Arabic | English | Slug |
|---|---|---|
| سلاسل | Necklaces | `necklaces` |
| خواتم | Rings | `rings` |
| انسيال | Bracelets | `bracelets` |
| حلقان | Earrings | `earrings` |
| سيتات | Sets | `sets` |

## Success criteria

- The owner can add a product with images, change the hero, and edit the brand story **without a developer**.
- A customer on a phone can find a product and place an order in under 2 minutes, as a guest.
- Lighthouse mobile performance ≥ 80 on the home page, with accessibility ≥ 90.
- No secrets in the repo; no customer data exposed to unauthenticated users.
