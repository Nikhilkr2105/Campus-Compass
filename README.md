# RIMT Smart Campus Navigator

An AI-assisted campus navigation prototype for RIMT University. The app combines an animated campus map, outdoor route planning, indoor Block A floor routing, emergency support, analytics, admin tools, and a floating AI assistant.

## Features

- Interactive outdoor campus map with zoom, pan, building selection, route drawing, and navigation steps.
- Route planner with fuzzy building search, quick destinations, wheelchair-accessible edge filtering, distance, ETA, and route progress controls.
- Indoor navigation mode for Block A with floor switching, room selection, stair/lift routing, and step-by-step indoor route details.
- Global navbar with route links, status ticker, and AI chat control.
- Floating RIMT AI chat assistant backed by the `/api/chat` endpoint.
- Emergency page with campus contacts, emergency locations, response guidance, and live status cards.
- Analytics dashboard with KPI cards, traffic chart, popular routes, and location insights.
- Admin console for demo building and room management workflows.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React icons
- Anthropic SDK for the AI chat API

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and feature overview |
| `/navigator` | Outdoor campus map and indoor Block A navigation |
| `/analytics` | Navigation analytics dashboard |
| `/emergency` | Emergency contacts, status, and support locations |
| `/admin` | Admin console for demo map data management |
| `/api/chat` | AI assistant API endpoint |

## Project Structure

```text
app/
  page.tsx                 Landing page
  layout.tsx               Global layout, navbar, AI chat mount
  navigator/page.tsx       Campus and indoor navigation screen
  analytics/page.tsx       Analytics dashboard
  emergency/page.tsx       Emergency support screen
  admin/page.tsx           Admin route wrapper
  api/chat/route.ts        Anthropic chat endpoint

components/
  map/                     Campus map, building markers, indoor floor map
  navigation/              Sidebar, route planner, analytics cards/charts
  admin/                   Admin console components
  chat/                    AI chat widget
  layout/                  Navbar
  ui/                      Shared visual components

data/
  buildings.ts             Outdoor building and path-edge data
  floors.ts                Indoor Block A floor/room data

lib/
  dijkstra.ts              Outdoor routing graph and Dijkstra resolver
  indoor-routing.ts        Multi-floor indoor route resolver
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` if you want the AI chat endpoint to respond:

```env
ANTHROPIC_API_KEY=your_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Useful Commands

```bash
npm run dev      # Start local development server
npm run build    # Create production build
npm run start    # Run production server after build
npm run lint     # Run Next.js linting
npx tsc --noEmit # Type-check the project
```

## Current Notes

- Indoor routing data currently covers Block A only.
- Admin forms are demo/local-state tools; they do not persist changes to the data files or a database.
- The AI chat requires `ANTHROPIC_API_KEY`; without it, the UI remains available but the API request will fail.
- Campus path distances are based on SVG coordinates and converted to approximate walking minutes.
- Accessibility mode filters path edges marked as accessible in `data/buildings.ts`.

## Good Next Improvements

- Add indoor floor data for more buildings.
- Persist admin building/room changes through an API or database.
- Let route links pre-fill navigator destinations from emergency and building detail cards.
- Add tests for outdoor and indoor route resolution.
- Replace demo analytics values with real event tracking.
