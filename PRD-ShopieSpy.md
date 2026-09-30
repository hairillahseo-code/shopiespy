# Product Requirements Document (PRD): ShopieSpy

## 1. Product Overview
**Name:** ShopieSpy
**Pitch:** "The All-in-One Shopify Intelligence & Competitor Espionage Tool."
**Target Audience:** Dropshippers, E-commerce brand owners, and marketers looking to spy on competitors' winning products, themes, apps, and ads.
**Goal:** Build a highly polished MVP with a premium UI to be sold on Flippa for $300 - $500 as a pre-revenue SaaS with massive potential.

## 2. Core Features & Technical Approach

### Feature 1: Store X-Ray (Theme & App Detector)
- **Function:** Users input a Shopify store URL. The system reveals the store's Theme name and hidden installed apps (e.g., Klaviyo, Loox, Oberlo).
- **Tech Stack:** Next.js Route Handler + `cheerio`.
- **How it Works:** Scrapes the target URL's HTML, searches for specific Shopify theme signatures (`window.Shopify.theme`) and known app script tags in the `<head>`.

### Feature 2: Best-Seller Extractor & CSV Exporter
- **Function:** Instantly discover a store's best-selling products and export them.
- **Tech Stack:** Shopify's Native JSON Endpoint + `papaparse`.
- **How it Works:** Cleverly appends `/collections/all?sort_by=best-selling` and fetches data via the public `products.json` endpoint to bypass the need for complex scrapers. Results are rendered in a sleek data table and can be exported as a Shopify-ready CSV.

### Feature 3: Facebook Ads Spy (MVP Approach)
- **Function:** Discover if a competitor is currently running ads on Facebook/Instagram.
- **Tech Stack:** Deep Linking Engine + Apify (Optional for V2).
- **How it Works:** 
  - **Tier 1 (Zero API Cost MVP):** Extracts the store's Facebook Page ID/URL and generates a precision deep-link directly to the Facebook Ads Library, pre-filtered for that specific competitor.
  - **Tier 2 (Future/Premium):** Integration with an external API like Apify to pull ad creatives directly into the dashboard.

### Feature 4: AI Competitor Takedown (Copywriting Optimizer)
- **Function:** Steal and improve competitor product descriptions.
- **Tech Stack:** Gemini API.
- **How it Works:** Extracts the description of a winning product, feeds it to Gemini AI with a strict prompt to generate a SWOT analysis and rewrite the description with better SEO and sales psychology.

## 3. Monetization & Credit System (Flippa Selling Point)
- **Architecture:** Pay-as-you-go credit system backed by **Supabase (PostgreSQL & Auth)**.
- **Mechanics:** 
  - Users must create an account to get 3 free "Spy Credits".
  - Credits are securely tracked in the Supabase Database.
  - 1 X-Ray Search = 1 Credit.
  - Out of credits triggers a sleek "Upgrade to Pro" Paywall UI.
- **Payment Gateway:** Pre-integrated UI for Lemon Squeezy or Stripe (Ready for the Flippa buyer to just plug in their API keys).

## 4. Design & UI Requirements
- **Theme:** "Hacker/Espionage Premium" - Dark mode dominant (Dark Slate `#0F172A`) with neon Emerald Green (`#10B981`) accents.
- **Components:** Glassmorphism panels, smooth micro-animations, skeleton loaders during data scraping to make the app feel advanced and expensive.
