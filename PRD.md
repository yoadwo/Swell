# Surf Forecast – Product Requirements Document

## 1. Terminology (Official Zepp OS Terms)

Per the [Zepp OS Overall Architecture](https://docs.zepp.com/docs/guides/architecture/arc/), a complete **Mini Program** includes **Device App**, **Settings App**, and **Side Service**. Definitions below match the official docs.

| Term | Meaning | Where it runs | What it does |
|------|---------|----------------|---------------|
| **Device App** | The part of the Mini Program that runs on the watch. It draws UI (widget API) and reads sensors. When the user taps the app icon, the Device App launches and shows its default page (first in `module.page.pages`). | Amazfit watch (Zepp OS) | Forecast and graph pages; reads GPS, BPM, distance; talks to the phone over BLE. No HTTP. Used **before** surfing: open app → request/cache forecast → view. |
| **Workout Extension** | Optional module configured via `data-widget` in app.json. Runs inside the system **Workout** app for a sport (e.g. Surfing). | Watch (inside Workout app) | Shown **during** a surf workout. Displays **cached** forecast (and optionally session data). Requires API_LEVEL 3.6+. |
| **Settings App** | Optional. Configuration UI for this Mini Program that runs **in the Zepp App** on the phone. Draws UI by calling a render function. | Phone (Zepp App) | User configures the app (e.g. surf spot name, lat/lon). Uses `settingsStorage` only — **no Fetch API**. Does not communicate with the watch directly. |
| **Side Service** | Optional. Runs in the Zepp App on the phone. No UI. | Phone (Zepp App) | **Only component that can do HTTP.** Fetches forecast; reads spot from `settingsStorage`; sends data to the Device App via BLE (MessageBuilder). |
| **Regular (non-Zepp) Android app** | A separate APK (e.g. from Play Store). | Phone | **Not used in this design.** The watch only talks to the Zepp App (Side Service). |

**Who does what on the phone?**

- **Fetching:** Side Service only. The Settings App has no `fetch()` in Zepp OS.
- **Phone ↔ watch communication:** Side Service only (MessageBuilder / BLE). The Settings App does not talk to the watch.
- **Showing forecast:** The **Device App** (on the watch) shows the forecast. On the phone, the Settings App only shows configuration; the Side Service has no UI.

So we **must** split: Settings App = config UI + location; Side Service = fetch + send to watch. Both are part of the same Mini Program and live inside the Zepp App.

---

## 2. Product Overview

**Surf Forecast** is a Zepp OS Mini Program for Amazfit smartwatches that displays surfing conditions at a glance. The app delivers wave forecasts (height, period, direction, and a composite "surfability" score) to the watch, rendered as both numeric data and a visual graph. Optionally, it can show real-time session metrics (heart rate, distance, GPS track) for surfers who want to log their sessions.

The app provides **two entry points on the watch**: (1) the **Device App** — when the user taps the app icon, the Device App opens (forecast and graph pages) to check the forecast before heading out (request/cache data, then view); (2) a **Workout Extension** so that when the user starts the built-in Surf workout, the extension can show the cached forecast (and later, session stats). Forecast data is fetched by the **Side Service** on the phone and sent to the Device App; when the phone is disconnected, the watch shows the last synced (cached) forecast.

### Target Device

Any Amazfit watch running **Zepp OS v3+** (e.g., Amazfit Balance, GTR 4, T-Rex Ultra). Workout Extension requires **API_LEVEL 3.6+**.

---

## 3. User Stories

### Core (v1)

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-1 | Surfer | See today's surf forecast on my watch | I can decide whether to go surfing without pulling out my phone |
| US-2 | Surfer | See a graph of wave height (or composite score) over the day | I can pick the best window to paddle out |
| US-3 | Surfer | Configure my home surf spot once on my phone | The watch always shows the right location's forecast |
| US-4 | Surfer | See the last synced forecast when my phone is not nearby | I still have useful info while on the beach or in the water |

### Optional / Deferred

| ID | As a... | I want to... | So that... |
|----|---------|-------------|------------|
| US-5 | Surfer | See my current heart rate during a session | I can monitor my exertion |
| US-6 | Surfer | See distance traveled during a session | I can estimate how much I paddled |
| US-7 | Surfer | Use my watch GPS to request "forecast at my current location" | I don't have to pre-configure a spot when traveling |
| US-8 | Surfer | View a session summary (BPM avg/max, distance, duration) | I can track my surf fitness over time |

---

## 4. Scope

### In Scope (v1)

- **Device App (watch):** forecast and graph pages; user taps the app icon to open the Device App, pull and view forecast before surfing.
- **Workout Extension (watch):** optional module (data-widget) in the system Workout app for Surf mode, showing cached forecast (and later session data) during the workout.
- **Forecast / graph screens:** key surf parameters (wave height, period, direction, wind, water temp) as text; Canvas-drawn graph over time.
- **Side Service (phone):** only component that can fetch; gets forecast from surf API and sends it to the watch over BLE.
- **Settings App (phone):** appears in Zepp App under device application settings; user picks/saves surf spot (lat/lon or name). No fetching.
- **Offline cache:** watch stores the most recent forecast so both the Device App and the Workout Extension can show it when disconnected.

### Out of Scope (v1)

- Exact forecast API provider selection (treated as a pluggable placeholder; candidates include Open-Meteo Marine, Storm Glass, Surfline unofficial endpoints).
- Precise scoring algorithm for "surfability" (placeholder weighted sum).
- Session recording (BPM, GPS, distance) — deferred to v2.
- Multiple saved spots / spot switching from the watch.
- Notifications or alarms ("waves are good right now").

---

## 5. Functional Requirements

### FR-1: Forecast Display (Device App)

- When the user opens the Device App (tap app icon), request the latest forecast from the Side Service (when phone is paired).
- Display: wave height (m/ft), wave period (s), wave direction, wind speed, wind direction, water temperature.
- Show a staleness indicator ("Updated 10 min ago" / "Offline – last sync 3h ago").
- Cache the last received payload so the Workout Extension and offline opens can use it.

### FR-2: Forecast Graph

- Render a line graph on a Canvas widget.
- X-axis: time (hours). Y-axis: wave height or composite score.
- The graph should be scrollable or show a fixed 24-hour window with a "now" marker.

### FR-3: Side Service – Fetch Forecast

- Accept a message from the Device App ("get forecast", optionally with lat/lon).
- Read the user's configured spot from `settingsStorage` (or use coordinates from the message).
- Call the forecast API via `fetch`.
- Parse the response into a compact payload and send it back to the watch via MessageBuilder.

### FR-4: Settings App (Device application settings in Zepp App)

- The Settings App is the UI that appears when the user opens this app’s settings from the Zepp App (e.g. under device application settings for the installed Mini Program).
- Provide a simple form where the user can:
  - Enter a spot name (informational).
  - Enter latitude and longitude (or pick from a short list of well-known spots).
- Persist the selection in `settingsStorage`. The Side Service (not the Settings App) reads this and performs the HTTP fetch.

### FR-5: Offline Cache

- The Device App stores the last received forecast payload (e.g., in `@zos/storage` or an in-memory global).
- Device App: on launch, if the phone is not connected, display the cached data with a clear "offline" indicator.
- Workout Extension: reads cached forecast only (no BLE request from the extension); show same offline/staleness indicator if applicable.

### FR-6: Workout Extension (Surf mode)

- Register a Workout Extension in `app.json` under `data-widget` for the Surf (or relevant) sport type (API_LEVEL 3.6+).
- The extension page reads the same cached forecast as the Device App and displays a compact forecast view (e.g. wave height, period, score) so the user can see conditions during the workout without opening the Device App.

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Watch battery impact | Minimal — no continuous sensor polling in v1; forecast sync is on-demand. |
| Data freshness | Forecast updated on each app open (when paired); staleness clearly shown. |
| Zepp OS version | v3+ (API_LEVEL 3.0+) |
| Latency | Forecast should appear within ~3 seconds of opening the app (paired). |

---

## 7. Platform and Architecture Summary

- **Type:** Zepp OS Mini Program (`appType: "app"`).
- **Components:**
  - Device App (watch) — Forecast and graph pages (opened from app icon), Workout Extension (data-widget, cached forecast), Canvas graph, optional sensor reads.
  - Side Service (phone) — Only part that does HTTP; Fetch API, MessageBuilder to Device App, reads `settingsStorage`.
  - Settings App (phone) — Configuration UI in Zepp App (surf spot, etc.); no fetch, no direct watch communication.
- **Communication:** Bluetooth via MessageBuilder (`/shared/message.js` on device, `/shared/message-side.js` on Side Service).
- **Project scaffold:** `zeus create surf-forecast` → APP with app-side + settings components.

---

## 8. Dependencies

| Dependency | Purpose |
|------------|---------|
| Zeus CLI (`@zeppos/zeus-cli`) | Project creation, dev preview, build |
| Zepp App (phone) with Developer Mode | Side Service host, Settings UI, QR install |
| Surf forecast API (TBD) | Wave/wind/tide data source |
| Node.js >= 14 | Zeus CLI runtime |
| Paired Amazfit watch (Zepp OS v3+) | Target device |

---

## 9. Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Forecast visible | User sees wave height, period, direction on watch within 3s of opening (paired). |
| Graph renders | Canvas-drawn graph displays 24h of wave height / score data. |
| Offline fallback | When phone is disconnected, last synced forecast is shown with staleness label. |
| Settings work | User can set a spot in the Zepp App Settings; Side Service uses it for the next fetch. |

---

## 10. Open Questions

1. Which surf forecast API to use? (Free tier, rate limits, geographic coverage.)
2. Should the composite "surfability" score be computed on the phone or the watch?
3. Do we want multiple pages (swipe between forecast and graph) or a single scrollable page?
4. v2 sensor features: should session recording start automatically when the user starts a workout, or be manually toggled?
