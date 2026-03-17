<div align="center">

<h1>🌦️ WeatherEye</h1>
<h3>Your Intelligent Weather & Environmental Companion</h3>

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Genkit-FFCA28?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)


<br/>

> **WeatherEye** goes beyond a simple forecast — it's an AI-powered weather platform with real-time conditions, personalized agricultural guidance, global environmental alerts, and live AQI maps, all in one place.

<br/>

🌐 **Live Demo:** [weather-eye-mocha.vercel.app](https://weather-eye-mocha.vercel.app)

<br/>

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [🏗️ Project Structure](#️-project-structure) • [⚙️ Tech Stack](#️-tech-stack) • [🤖 AI Integration](#-ai-integration) • [🔧 Configuration](#-configuration)

</div>

---

## ✨ Features

### 🌡️ Real-Time Weather Dashboard
- Current conditions (temperature, humidity, wind speed & direction, UV index, visibility)
- **7-day forecast** with daily high/low and precipitation probability
- **Hour-by-hour breakdown** for granular planning
- Location search for any city worldwide

### 🤖 AI-Powered Insights (Genkit + Gemini)
- **Daily Brief** — AI-generated plain-language summary of the day's weather and air quality
- **Agricultural Guidance** — Crop recommendations and planting/harvesting warnings based on local conditions
- Powered by **Firebase Genkit** with the **Google Gemini** model

### 🌍 Global Environmental Awareness
- **Global Red Alerts** — Real-time AI-curated list of severe weather events worldwide
- **Air Quality Map** — Interactive, real-time world map visualizing AQI levels using **Leaflet + React-Leaflet**

### 🆘 Emergency & Safety
- Severe weather safety tips tailored to current conditions
- Global emergency contact numbers organized by country/region

### 📍 Location-Aware
- All data, AI advice, and maps are tailored to the **city you select**
- Persistent location state across pages

---

## 🖥️ Screenshots

| Dashboard | Air Quality Map | Alerts |
|-----------|----------------|--------|
| Current weather + forecast | Live AQI world map | Severe weather events |

> 🔗 See it live: [weather-eye-mocha.vercel.app](https://weather-eye-mocha.vercel.app)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**
- A **Weather API** key (e.g. [Open-Meteo](https://open-meteo.com/) — free, no key needed, or your preferred provider)
- A **Google AI / Gemini API** key for Genkit AI features
- A **Firebase** project (for Genkit + App Hosting)

### 1. Clone the Repository

```bash
git clone https://github.com/MilindLate/WeatherEye.git
cd WeatherEye
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Google AI / Gemini (required for AI features)
GOOGLE_GENAI_API_KEY=your_google_genai_api_key

# Weather API (configure for your chosen provider)
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
NEXT_PUBLIC_WEATHER_API_BASE_URL=https://api.open-meteo.com/v1

# Firebase (required for App Hosting deployment)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

> ⚠️ Never commit your `.env` file — it is already in `.gitignore`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. (Optional) Run Genkit AI Dev UI

To inspect and test AI flows locally:

```bash
npm run genkit:dev
```

Open the Genkit Dev UI at [http://localhost:4000](http://localhost:4000).

---

## 🏗️ Project Structure

```
WeatherEye/
├── 📂 src/
│   ├── 📂 app/                         ← Next.js App Router pages
│   │   ├── 📂 dashboard/               ← Main weather dashboard
│   │   ├── 📂 location/                ← City selection page
│   │   ├── 📂 agriculture/             ← AI crop & farming guidance
│   │   ├── 📂 alerts/                  ← Global red alerts
│   │   ├── 📂 map/                     ← Interactive AQI map
│   │   ├── 📂 emergency/               ← Emergency contacts & tips
│   │   └── actions.ts                  ← Server Actions (API + AI bridge)
│   │
│   ├── 📂 components/                  ← Reusable React components
│   │   ├── weather-app.tsx             ← Main dashboard orchestrator
│   │   ├── current-weather.tsx         ← Current conditions card
│   │   ├── daily-forecast.tsx          ← 7-day forecast component
│   │   ├── hourly-forecast.tsx         ← Hour-by-hour chart
│   │   ├── map.tsx                     ← Leaflet interactive map
│   │   └── 📂 ui/                      ← shadcn/ui component library
│   │
│   ├── 📂 ai/
│   │   ├── 📂 flows/                   ← Genkit AI flow definitions
│   │   │   ├── daily-brief.ts          ← Weather summary AI flow
│   │   │   ├── agriculture.ts          ← Crop guidance AI flow
│   │   │   ├── global-alerts.ts        ← Severe weather AI flow
│   │   │   └── emergency.ts            ← Safety tips AI flow
│   │   └── dev.ts                      ← Genkit dev server entry
│   │
│   └── 📂 lib/
│       ├── weather-data.ts             ← API response transformation
│       └── utils.ts                    ← Shared utilities
│
├── 📂 docs/                            ← Documentation assets
├── 📂 .idx/                            ← Firebase IDX config
├── .env                                ← Environment variables (git-ignored)
├── apphosting.yaml                     ← Firebase App Hosting config
├── components.json                     ← shadcn/ui component config
├── next.config.ts                      ← Next.js configuration
├── tailwind.config.ts                  ← Tailwind CSS configuration
├── tsconfig.json                       ← TypeScript configuration
└── package.json
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack React framework with Server Actions |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS + accessible component library |
| **AI / LLM** | Firebase Genkit + Google Gemini | AI flows for weather insights, agriculture, alerts |
| **Maps** | Leaflet + React-Leaflet | Interactive AQI world map |
| **Charts** | Recharts | Hourly forecast visualization |
| **Forms** | React Hook Form + Zod | Validated location input |
| **Date/Time** | date-fns + date-fns-tz | Timezone-aware weather data formatting |
| **Deployment** | Firebase App Hosting + Vercel | Production hosting |

### Key Dependencies

```json
{
  "next": "15.3.3",
  "genkit": "^1.20.0",
  "@genkit-ai/google-genai": "^1.20.0",
  "@genkit-ai/next": "^1.20.0",
  "firebase": "^11.9.1",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "recharts": "^2.15.1",
  "zod": "^3.24.2",
  "tailwindcss": "^3.4.1"
}
```

---

## 🤖 AI Integration

WeatherEye uses **Firebase Genkit** with the **Google Gemini** model to power four AI flows:

### Flow 1 — Daily Brief (`/src/ai/flows/daily-brief.ts`)
Takes current weather + AQI data and generates a concise, human-readable summary.

```
Input:  { location, temperature, conditions, aqi, humidity, ... }
Output: "Today in Mumbai expect warm and humid conditions with moderate air quality.
         Light rain is possible in the evening — carry an umbrella."
```

### Flow 2 — Agricultural Guidance (`/src/ai/flows/agriculture.ts`)
Analyzes weather conditions and returns crop-specific recommendations.

```
Input:  { location, rainfall, temperature, humidity, soil conditions }
Output: { recommendations: [...], warnings: [...], bestCrops: [...] }
```

### Flow 3 — Global Red Alerts (`/src/ai/flows/global-alerts.ts`)
Generates a curated list of current severe weather events globally.

```
Output: [{ region, event_type, severity, description, safety_tips }]
```

### Flow 4 — Emergency Assistance (`/src/ai/flows/emergency.ts`)
Returns immediate safety guidance based on the active weather threat.

```
Input:  { threat_type, location }
Output: { immediate_steps: [...], contacts: [...], resources: [...] }
```

### How Genkit Works in This App

```
Browser (React)
     │
     ▼
Next.js Server Action  (/src/app/actions.ts)
     │
     ▼
Genkit Flow  (/src/ai/flows/*.ts)
     │
     ▼
Google Gemini API  (via @genkit-ai/google-genai)
     │
     ▼
Structured JSON response → rendered in UI
```

> All AI calls run **server-side** via Next.js Server Actions — your API keys are never exposed to the browser.

---

## 🔧 Configuration

### Available Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking (no emit)
npm run genkit:dev   # Start Genkit AI dev server + UI
npm run genkit:watch # Genkit dev server with file watching
```

### Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENAI_API_KEY` | ✅ Yes | Google AI / Gemini API key for all AI flows |
| `NEXT_PUBLIC_WEATHER_API_KEY` | ✅ Yes | Weather data provider API key |
| `NEXT_PUBLIC_WEATHER_API_BASE_URL` | ✅ Yes | Base URL of weather data API |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | For deploy | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | For deploy | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | For deploy | Firebase auth domain |

### next.config.ts Notes

```ts
// WeatherEye uses Next.js App Router — ensure these are configured:
// - Server Actions: enabled by default in Next.js 14+
// - Image domains: add your weather icon CDN if needed
// - Turbopack: enabled via `next dev --turbopack`
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Project → Settings → Environment Variables
```

### Deploy to Firebase App Hosting

The repo includes `apphosting.yaml` for Firebase App Hosting:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login & init
firebase login
firebase init apphosting

# Deploy
firebase apphosting:backends:deploy
```

---

## 📡 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Redirect | Redirects to `/location` |
| `/location` | City Selection | Search and select your city |
| `/dashboard` | Weather Dashboard | Current weather, forecast, AI daily brief |
| `/agriculture` | Farming Insights | AI crop recommendations & warnings |
| `/alerts` | Global Alerts | Severe weather events worldwide |
| `/map` | AQI Map | Interactive real-time air quality world map |
| `/emergency` | Emergency | Safety tips & global emergency contacts |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/WeatherEye.git
cd WeatherEye

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Install dependencies and run
npm install
npm run dev

# 5. Make your changes, then check types and lint
npm run typecheck
npm run lint

# 6. Commit and push
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature-name

# 7. Open a Pull Request on GitHub
```

### Code Style

- TypeScript strict mode enabled — all types must be explicit
- Use **shadcn/ui** components for UI elements where possible
- AI flows go in `/src/ai/flows/` — each flow in its own file
- Server-side data fetching and AI calls must use **Server Actions** in `actions.ts`

---

## 🛠️ Troubleshooting

<details>
<summary>❌ AI features not working / Genkit errors</summary>

- Check that `GOOGLE_GENAI_API_KEY` is set correctly in `.env`
- Ensure the API key has access to the **Gemini** model in Google AI Studio
- Run `npm run genkit:dev` and open [http://localhost:4000](http://localhost:4000) to debug flows directly
- Check the browser Network tab or server logs for error messages from Server Actions

</details>

<details>
<summary>❌ Weather data not loading</summary>

- Verify `NEXT_PUBLIC_WEATHER_API_KEY` and `NEXT_PUBLIC_WEATHER_API_BASE_URL` in `.env`
- Check the weather API provider's status page and your quota/limits
- Open browser DevTools → Network → look for failed API calls with error details

</details>

<details>
<summary>❌ Map not rendering (blank / broken)</summary>

- Leaflet requires a CSS import — ensure `leaflet/dist/leaflet.css` is imported in the map component or `layout.tsx`
- Map components must be dynamically imported with `{ ssr: false }` in Next.js:

```ts
const Map = dynamic(() => import('@/components/map'), { ssr: false });
```

</details>

<details>
<summary>❌ Build errors — TypeScript / type issues</summary>

```bash
# Check all type errors
npm run typecheck

# Common fix: regenerate lock file
rm -rf node_modules package-lock.json
npm install
```

</details>

<details>
<summary>❌ Environment variables not picked up</summary>

- Restart the dev server after any `.env` change — Next.js only reads env at startup
- Variables exposed to the browser **must** be prefixed with `NEXT_PUBLIC_`
- Server-only variables (like `GOOGLE_GENAI_API_KEY`) must NOT have `NEXT_PUBLIC_` prefix

</details>

---



## 🙏 Acknowledgements

- [Open-Meteo](https://open-meteo.com/) — Free, open-source weather API
- [Firebase Genkit](https://firebase.google.com/docs/genkit) — AI orchestration framework
- [Google Gemini](https://ai.google.dev/) — LLM powering AI insights
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful, accessible component library
- [Leaflet](https://leafletjs.com/) — Open-source interactive maps
- [Vercel](https://vercel.com/) — Seamless Next.js deployment

---

<div align="center">

Built with ❤️ by <a href="https://github.com/MilindLate">MilindLate</a>

<br/><br/>

<b>WeatherEye</b> &nbsp;|&nbsp; Next.js 15 &nbsp;|&nbsp; Genkit AI &nbsp;|&nbsp; TypeScript

<br/><br/>

⭐ If you find this project useful, please give it a star!

</div>
