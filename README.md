<div align="center">

# AirSense

**From EarthData to Action: Cloud Computing with Earth Observation Data for Predicting Cleaner, Safer Skies**

Forecast North American air quality with high-frequency NASA TEMPO observations, ground monitoring networks, and weather intelligence—then turn insights into timely public health actions.

</div>

## Overview

AirSense is a cloud-ready Next.js application designed for the NASA Space Apps Challenge. It demonstrates how TEMPO’s geostationary observations can be blended with terrestrial monitoring and meteorological feeds to deliver real-time situational awareness, historical context, and proactive guidance when the air becomes unsafe. The platform aims to close the gap between science-grade earth observation data and the decisions people and policymakers need to make every day.

### Why it matters

- **High cadence AQI data**: TEMPO revisits every location across North America hourly, enabling near real-time air quality alerts.
- **Community protection**: Combining space-based data with ground sensors and forecasts helps schools, hospitals, and local authorities react before conditions deteriorate.
- **Cloud-native collaboration**: A modern web stack, serverless endpoints, and Prisma-backed persistence make the solution easy to scale and extend.

## Key Features

- **Interactive AQI dashboard** with dynamic pollutant gradients, pollutant breakdown cards, and context-aware health messaging.
- **Leaflet-powered map** that highlights current AQI with custom markers and tooltips for any monitored location.
- **Historical trend analytics** using Recharts to visualise 30-day evolutions of NO₂, O₃, SO₂, and composite AQI scores.
- **AI health assistant** backed by Google Gemini to answer natural-language questions and translate AQI conditions into personalised recommendations.
- **Notification opt-in workflow** persisting user alerts via Prisma/PostgreSQL so stakeholders can receive updates tied to their locations.
- **Responsive design & dark mode** for accessibility across desktops, tablets, and mobile devices.

## System Architecture

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, ShadCN-inspired UI components, Framer Motion animations.
- **Mapping**: React Leaflet with OpenStreetMap tiles and custom AQI markers.
- **Data & State**:
	- Server Actions (`app/actions.ts`) encapsulate historical AQI and pollutant queries (currently mocked, ready for TEMPO & EPA API integration).
	- Reusable hooks (e.g., `useAQIMetadata`) expose real-time metadata updates for UI components.
	- Prisma ORM targeting PostgreSQL for persisting subscriber preferences.
- **AI Services**: `lib/AIAnalysisFunction.ts` routes prompts to Google Gemini (`gemini-2.5-flash`) for both proactive tips and chat responses.
- **Notifications**: Resend (email) integration scaffolded to dispatch alerts to subscribers.
- **Deployment Targets**: Optimised for Vercel or any Node 18+/20+ platform; Prisma supports hosted Postgres (e.g., Neon, Supabase, AWS RDS).

## Data Strategy

| Layer | Source | Purpose |
| --- | --- | --- |
| Space-based observations | NASA TEMPO Level 2 products (future integration) | Hourly tropospheric pollutant columns (NO₂, O₃, SO₂) |
| Ground networks | EPA AirNow / OpenAQ APIs (planned) | Calibration and validation of AQI values per city |
| Weather context | NOAA NWS, OpenWeather (planned) | Temperature, humidity, wind vectors for exposure modelling |
| User feedback | Prisma `UserNotification` model | Store audiences and preferred alert locations |

The current code base relies on deterministic mock generators so the UX can be showcased without live credentials. Swapping in real APIs requires mapping responses into the `LocationDataType` and trend transformers provided in `app/actions.ts`.

## Getting Started

### Prerequisites

- Node.js 20.x (Next.js 15 requirement)
- npm 10.x (or pnpm/yarn/bun, if preferred)
- PostgreSQL database (can be local or hosted) for subscription storage

### Environment Variables

Create a `.env` file in the project root with the following keys:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key for AI guidance |
| `RESEND_API_KEY` | Resend API key for outbound notifications |

> **Tip:** Do not commit `.env` values. Use `.env.local` during development and platform secrets in production.

### Installation & Local Development

```powershell
# Install dependencies
npm install

# Generate the Prisma client (required before building or running)
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start the development server
npm run dev
```

Visit <http://localhost:3000> to explore the app. Hot reloading is enabled for rapid iteration.

### Quality Checks & Production Build

```powershell
# Static analysis
npm run lint

# Production bundle (runs prisma generate automatically via prebuild script)
npm run build

# Launch the production server locally
npm start
```

## Project Structure

```
app/
	(main)/
		page.tsx            # Landing dashboard with map, analytics, and chat assistant
		map/                # Route reserved for full-screen mapping experiences
	actions.ts            # Server actions for AQI history, trend analytics, notifications
components/
	AQIChat.tsx           # Gemini-powered conversational assistant
	AQIInfoSection.tsx    # Hero panel with AQI gradients, pollutant stats, AI tips
	components/           # Shared analytic widgets (charts, map, historical insights)
	ui/                   # Tailwind + Radix powered design system primitives
hooks/
	useAQIMetadata.ts     # Client hook for real-time AQI metadata updates
lib/
	AIAnalysisFunction.ts # Server-side Gemini integration
	prisma.ts             # Prisma client singleton
	types.ts              # Domain models, AQI thresholds, mock data factories
prisma/
	schema.prisma         # PostgreSQL schema for notification subscribers
```

## Deployment Notes

1. Provision a managed PostgreSQL instance and apply migrations using `prisma migrate deploy`.
2. Set environment variables in your hosting platform (Vercel, Render, AWS Amplify, etc.).
3. Configure Resend and Gemini API keys with the appropriate usage limits and domain verification.
4. Build and deploy via CI/CD—Vercel integration works out-of-the-box with Next.js App Router projects.

## Roadmap

- Integrate live TEMPO Level 2 data via the NASA Earthdata APIs and harmonise with EPA AirNow feeds.
- Expand the map route with layer toggles, heatmaps, and time scrubbing for hourly TEMPO snapshots.
- Implement Resend-powered email/SMS digests and optional Web Push alerts.
- Introduce role-based workspaces so public health agencies can manage regional watchlists collaboratively.
- Add automated testing (Playwright / Vitest) to safeguard critical AQI logic and LLM prompt flows.

## Acknowledgements

- **NASA TEMPO Mission** for enabling continuous monitoring of North American tropospheric pollution.
- **NASA Space Apps Challenge** for inspiring cross-disciplinary innovation around Earth observation data.
- **OpenStreetMap** contributors for the cartography powering the interactive map.
- **Google DeepMind** for Gemini, which turns raw AQI values into actionable guidance.

## Contributing

Contributions are welcome! Please open an issue with your proposal before submitting a pull request. When contributing, follow our existing TypeScript conventions, run `npm run lint`, and keep accessibility front of mind.

## License

This project is released under the MIT License. See `LICENSE` (to be added) for details.
