# WeatherEye: Your Intelligent Weather & Environmental Companion

Welcome to WeatherEye, a smart, real-time weather and environmental monitoring application built with Next.js and powered by generative AI. WeatherEye goes beyond a simple forecast, offering personalized insights, agricultural advice, and global environmental awareness to help you make informed decisions.

## Core Features

WeatherEye is designed to be your all-in-one guide to the weather and environment around you.

1.  **Real-time Weather Dashboard**: Get current weather conditions, a 7-day forecast, and an hour-by-hour breakdown for any location worldwide. The intuitive interface visualizes temperature, precipitation, wind, and more.

2.  **AI-Powered Insights**:
    *   **Daily Brief**: An AI-generated summary gives you a quick, easy-to-understand overview of the day's weather and air quality.
    *   **Agricultural Guidance**: Receive AI-driven crop recommendations and warnings based on local weather conditions, helping you decide what to plant and when.

3.  **Global Environmental Awareness**:
    *   **Global Red Alerts**: Stay informed about major weather events happening across the globe with a curated list of AI-generated severe weather alerts.
    *   **Air Quality Map**: A dynamic, real-time map visualizes the Air Quality Index (AQI) across the world, helping you understand pollution levels in different regions.

4.  **Personalized & Actionable Guidance**:
    *   **Emergency Assistance**: In case of severe weather, access immediate safety tips and a list of global emergency contact numbers.
    *   **Location-Based**: All data and advice are tailored to the location you choose, providing relevant and actionable information.

## Application Architecture

WeatherEye is built on a modern, robust, and scalable tech stack, leveraging the best of Next.js and Google's generative AI.

-   **Frontend**:
    *   **Framework**: **Next.js (App Router)** using **React** and **TypeScript**.
    *   **UI Components**: A beautiful and consistent user interface built with **ShadCN UI**.
    *   **Styling**: **Tailwind CSS** for utility-first styling, with a customizable theme.
    *   **Mapping**: **Leaflet** and **React-Leaflet** for interactive maps.

-   **Backend & Data Fetching**:
    *   **Server Actions**: Secure and efficient communication with external APIs is handled via **Next.js Server Actions**. This keeps API keys and sensitive logic on the server, away from the client.
    *   **Data Sources**:
        *   **OpenWeatherMap**: Provides core weather and forecast data.
        *   **API-Ninjas**: Supplies detailed air quality and pollutant data.
        *   **AQICN**: Powers the real-time global air quality map overlay.

-   **Generative AI**:
    *   **Engine**: **Genkit** (an open-source AI framework) integrated with **Google's Gemini models**.
    *   **Flows**: AI logic is organized into "flows" that handle specific tasks like generating summaries, agricultural advice, and global alerts. These flows are defined on the server and called from Server Actions.

## How It Benefits You

-   **Stay Informed**: Get a complete picture of the weather and environment, not just a temperature reading.
-   **Plan Ahead**: Use the detailed hourly and 7-day forecasts to plan your activities, travel, and agricultural efforts.
-   **Make Smarter Decisions**: Leverage AI-powered advice to make better decisions, whether you're a farmer, a traveler, or just planning your day.
-   **Stay Safe**: Access critical information during emergencies and stay aware of significant global weather events.

## Key Components & Pages

-   `/src/app` - Contains all the application's pages and routing logic.
    -   `/dashboard`: The main weather dashboard.
    -   `/location`: The initial page to select a city.
    -   `/agriculture`, `/alerts`, `/map`, `/emergency`: Feature pages for specialized insights.
-   `/src/components` - Reusable React components used throughout the app.
    -   `/weather-app.tsx`: The main component that orchestrates the dashboard view.
    -   `/current-weather.tsx`, `/daily-forecast.tsx`, `/hourly-forecast.tsx`: Components for displaying specific weather data.
    -   `/map.tsx`: The interactive map component.
-   `/src/ai/flows` - The heart of the AI logic, where Genkit flows are defined.
-   `/src/app/actions.ts` - Server Actions that bridge the frontend with the AI flows and external APIs.
-   `/src/lib/weather-data.ts` - Contains the data transformation logic to process API responses into a clean, usable format for the app.
