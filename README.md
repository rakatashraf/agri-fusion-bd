# AgriFusion BD

A farmer-first decision-support web app for the NASA Space Apps Challenge 2026 **Field Shift: Adapting Farms with NASA Data** challenge.

The product combines NASA Earth-observation context with local ground observations from a GPS rover, crop characteristics, farmer priorities and weather context to turn complex data into practical field decisions.

## Main experiences

### Farmer
- Bangla/English interface with persistent language preference.
- Account-based personal dashboard.
- Clear “what should I do today?” decision card.
- Live GPS map with field boundaries and health/risk colors.
- Soil moisture, NDVI, savings and water-use summaries.
- Crop-rotation planner focused on soil health, water demand and resilience.
- Early-warning cards for weather and field risk.

### Agriculture specialist
- Select a responsible administrative/agricultural area.
- Aggregate area summary across all registered farms.
- Field-health/risk map for the selected area.
- Registered-farmer directory.
- Individual farmer and field reports.
- Area-level savings, water and risk summaries.

## Data architecture

1. NASA Earth observations provide spatial context such as vegetation condition, rainfall and soil-moisture signals.
2. A GPS rover collects field-level observations such as soil moisture, pH, EC, temperature and crop images.
3. Ground and satellite observations are aligned by coordinates and timestamps.
4. A fusion/decision layer combines confidence, crop stage, weather and farmer priorities.
5. Outputs are simplified for farmers and expanded for specialists.

## Demo account system

This hackathon build includes a **client-side demo account system** with persistent browser sessions so the role-based UX can be tested without external credentials.

Demo accounts:
- Farmer: `01700000001` / `1234`
- Specialist: `specialist@demo.bd` / `1234`

For production, replace demo authentication/localStorage with a secure backend identity provider and database (for example Firebase Auth + Firestore, Supabase Auth + Postgres, or an equivalent managed service). Passwords must never be stored client-side in production.

## Maps

The live GPS map uses browser geolocation and OpenStreetMap tiles through Leaflet. Field polygons show risk levels. Users must grant location permission for live GPS tracking.

## Vercel

The project uses `@sveltejs/adapter-vercel` with Node.js 24.

```bash
npm install
npm run build
```
