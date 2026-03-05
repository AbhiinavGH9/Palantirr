# Observatory Setup Details

This document outlines the required configuration fields and settings needed to deploy and run Observatory.

## 1. Environment Variables

Create a `.env` file in the root directory and ensure the following fields are replaced with your actual configuration:

```env
# Database Connection
# Replace with your actual PostgreSQL connection string.
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Port Configuration
# Set the port the backend server will run on (Default: 5000)
PORT=5000

# Timezone
# Ensure node process respects IST for the cron job schedules.
TZ=Asia/Kolkata
```

## 2. Free Data Sources Config
*(These will be integrated into the scraper logic in `backend/scraper/config.js` or `.env` when further developed)*

- **WIKIPEDIA_CONFLICT_LIST_URL**: https://en.wikipedia.org/wiki/List_of_ongoing_armed_conflicts
- **GLOBAL_FIREPOWER_RSS** (Optional): Add public RSS feeds for tracking military defense news if desired.
- **ACLED_OPEN_DATA** (Optional): Access free Armed Conflict Location & Event Data feeds if registered for their free public tier.

## 3. Map Data Source

- **Vector Map Path**: The frontend utilizes `react-simple-maps` with an open-source TopoJSON map. The map file is typically fetched from a CDN (e.g. `https://unpkg.com/world-atlas@2.0.2/countries-110m.json`) or bundled directly in the `client/public` folder. 

## 4. Operational Instructions

To start the application locally:
1. `npm install`
2. `npm run db:push` (Ensures your PostgreSQL database tables are created)
3. `npm run dev` (Starts the backend express server and the Vite frontend on the same port)
