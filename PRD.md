# Swell - Surf Forecast Watch App: Product Requirements Document

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

### Storage Architecture

Two separate storage systems exist in Zepp OS:

| Storage | Global Name | Location | Shared Between | Purpose |
|---------|-------------|----------|---------------|---------|
| **settingsStorage** | N/A (passed as object) | **Phone** (Zepp App) | Settings App ↔ Side Service | Beach selection |
| **@zos/storage** | `storage` | **Watch** (Device App) | Device App only | Forecast cache |

**settingsStorage** (phone):
- Used by: Settings App (writes), Side Service (reads)
- Contains: `selectedBeach: {name, lat, lon}`
- NOT accessible from Device App (watch)

**@zos/storage** (watch):
- Used by: Device App (reads/writes)
- Contains: `forecast_cache` (full forecast payload)
- NOT accessible from phone components

**Data Flow:**
```
Settings App ──writes──▶ settingsStorage ◀──reads── Side Service
                                               │
                                          fetches API
                                               │
                                               ▼
                                          BLE (this.request)
                                               │
                                               ▼
                                    Device App (watch)
                                               │
                                          saves to storage
                                               │
                                               ▼
                              @zos/storage (forecast_cache)
```

---

## 2. Product Overview

**Swell** is a Zepp OS Mini Program for Amazfit smartwatches that displays surfing conditions at a glance. The app delivers wave forecasts (height, period, direction, and a composite "surfability" score) to the watch, rendered as both numeric data and a visual graph. Optionally, it can show real-time session metrics (heart rate, distance, GPS track) for surfers who want to log their sessions.

The app provides **two entry points on the watch**: (1) the **Device App** — when the user taps the app icon, the Device App opens (forecast and graph pages) to check the forecast before heading out (request/cache data, then view); (2) a **Workout Extension** so that when the user starts the built-in Surf workout, the extension can show the cached forecast (and later, session stats). Forecast data is fetched by the **Side Service** on the phone and sent to the Device App; when the phone is disconnected, the watch shows the last synced (cached) forecast.

### App Structure Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MINI PROGRAM                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │  Settings App   │  │   Side Service                  │   │
│  │  (Phone UI)     │  │   (Phone BG)                    │   │
│  │  - Beach list   │  │   - Fetch API                   │   │
│  │  - Save coords  │  │   - Calculate Score             │   │
│  └─────────────────┘  │   - Send to watch               │   │
│                       └─────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Device App (Watch)                         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│  │  │   Main   │ │Conditions│ │ Weather  │ │Forecast  │   │ │
│  │  │  Page    │ │  Page    │ │  Page    │ │  Page    │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│  │  ┌──────────┐ ┌──────────┐                              │ │
│  │  │  Help    │ │ Workout  │                              │ │
│  │  │  Page    │ │ Extension│                              │ │
│  │  └──────────┘ └──────────┘                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

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

## 4. App Pages (Detailed)

### 4.1 Settings App (Phone)

**Location:** Zepp App → Device → App Settings → Swell

**Purpose:** Allow user to select their home surf spot from a predefined list.

**UI Elements:**
- List of beaches in Israel (predefined, hardcoded)
- Each beach item shows: beach name
- On click: save beach coordinates to `settingsStorage`

**Data Structure:**
```javascript
{
  selectedBeach: {
    name: "Frishman",
    lat: 32.0949,
    lon: 34.7726
  }
}
```

**Behavior:**
- No API calls (Settings App cannot use `fetch()`)
- Side Service reads this storage to know which location to fetch

---

### 4.2 Device App Pages (Watch)

The Device App contains the following swipeable pages:

#### Page 1: Main Page ("Swell Index")

**Purpose:** At-a-glance "should I surf?" indicator using a traffic light system.

**UI Elements:**
| Element | Content |
|---------|---------|
| Title | "Swell Index" |
| Subtitle | Selected beach name (from storage) |
| Traffic Light Display | Conditional based on composite score: |

**Traffic Light Logic:**

| Score Range | Color | Icon | Text |
|-------------|-------|------|------|
| 7–10 (Excellent/Good) | 🟢 Green | 🏄 Surfboard | "Go Crazy" |
| 4–6 (Fair/Mediocre) | 🟡 Yellow | 🌊 Wave | "Have Fun" |
| 0–3 (Poor/Flat) | 🔴 Red | ☕ Coffee | "Better Get Coffee" |

**Behavior:**
- Read cached forecast on launch
- When phone is paired: request fresh data from Side Service
- Show staleness indicator if data is old

---

#### Page 2: Conditions Page

**Purpose:** Detailed surf conditions for the selected beach.

**UI Elements:**

| Parameter | Display Format |
|-----------|----------------|
| Wave Height | X.X m / X.X ft |
| Wave Period | XX seconds |
| Wave Direction | Arrow + degrees (e.g., ↗ 315°) |
| Wind Speed | XX km/h |
| Wind Direction | Arrow + cardinal (e.g., ← W) |
| Water Temperature | XX°C |
| Sunrise / Sunset | HH:MM |

**Behavior:**
- Shows data from most recent forecast fetch
- All values from cached payload

---

#### Page 3: Weather Page

**Purpose:** Current weather conditions at the beach.

**UI Elements:**

| Parameter | Display Format |
|-----------|----------------|
| Air Temperature | XX°C / XX°F |
| UV Index | Numeric (0–11+) + descriptor (Low/Moderate/High/Very High/Extreme) |

**Behavior:**
- Fetched alongside surf data
- UV index especially relevant for surfers planning session length

---

#### Page 4: Forecast Page

**Purpose:** Multi-day outlook for planning sessions.

**UI Elements:**
- 3–4 day forecast table/cards
- Per day shows:
  - Day name (e.g., "Mon", "Tue")
  - Wave height range (e.g., "1.2–1.8m")
  - Weather icon (sunny, cloudy, etc). This may be considered optional if no single field in the API returns it.
  - Composite score (color-coded)

**Behavior:**
- Horizontal scroll (if components exceed screen height)
- Data from single API call (multi-day forecast)

---

#### Page 5: Forecast Graph Page

**Purpose:** Plot a graph showing the wave height in the following days (according to weekly forecast)

**UI Elements:**
- Black background with a blue colored graph. The X axis is the day, Y axis is wave height in cm.

**Behavior:**

---

#### Page 6: Help Page

**Purpose:** Explain how the "Swell Index" (composite score) is calculated.

**UI Elements:**
- Title: "How It Works"
- Explanation text (scrollable) describing the Swell Index calculation
- Score formula and component factors
- Disclaimer: "Scores are suggestions. Always check conditions yourself and surf at your own risk."

**Note:** For detailed score calculation methodology, see **FR-2: Score Calculation (Source of Truth)**

---

### 4.3 Workout Extension (Watch)

**Location:** Workout app → Surf → Extension view

**Purpose:** Show cached forecast during an active surf workout.

**UI Elements:**
- Compact view of current conditions
- Wave height, period, score
- No interaction needed (read-only)

**Behavior:**
- Reads same cached forecast as Device App
- No independent data fetch

---

## 5. Scope

### In Scope (v1)

**Device App (watch) — 5 swipeable pages:**
- **Main Page:** "Swell Index" with "traffic light" scoring
- **Conditions Page:** Wave height, direction, period; wind speed, direction; sunrise/sunset
- **Weather Page:** Temperature, UV index
- **Forecast Page:** 3–4 day outlook with wave height, period, wind, score
- **Help Page:** Explanation of score calculation

**Settings App (phone):**
- List of predefined beaches in Israel
- Click to save selected beach coordinates to `settingsStorage`

**Side Service (phone):**
- Fetch forecast from surf API
- Send data to Device App via BLE

**Other:**
- **Workout Extension (watch):** Compact cached forecast view during surf workout
- **Offline cache:** Watch stores last received forecast for disconnected viewing
- **Traffic light logic:** Color-coded indicator based on composite score

### Out of Scope (v1)

- Exact forecast API provider selection (treated as a pluggable placeholder).
- Precise scoring algorithm weights (placeholder weighted sum; exact thresholds TBD).
- Session recording (BPM, GPS, distance) — deferred to v2.
- Multiple saved spots / spot switching from the watch.
- Notifications or alarms ("waves are good right now").
- Graph/Canvas visualization (deferred; may add in v1.1).

---

## 6. Functional Requirements

### FR-1: Settings App – Beach Selection

- Display a hardcoded list of beaches in Israel (name only).
- On beach click: save coordinates to `settingsStorage`.
- No API calls (Settings App cannot use `fetch()`).
- Side Service reads this storage to determine fetch location.

### FR-2: Device App – Main Page (Swell Index)

**Display and UI:**
- Display title: "Swell Index".
- Display subtitle: selected beach name (from storage).
- Implement traffic light system based on composite score (0–10):
  - **Green (7–10):** Surfboard icon + "Go Crazy"
  - **Yellow (4–6):** Wave icon + "Have Fun"
  - **Red (0–3):** Coffee icon + "Better Get Coffee"
- Read cached forecast on launch.
- When phone is paired: request fresh data from Side Service.
- Show staleness indicator if data is old.

**Score Calculation (Source of Truth):**

The Swell Index score (0–10) is calculated from three equally-weighted factors, using swell-based measurements. Wind speed is measured and stored in the payload but is **NOT** used in the scoring algorithm. Instead, wind wave height (chop) is used as the professional measure of wind impact.

**Scoring Data (Used in Algorithm):**

1. **Swell Height Score (0–3):** Based on rideable swell size
   - Ideal range 0.9–1.3m = score 3
   - Slightly Smaller or slightly higher 0.7m-0.9m or 1.3m-1.5m = score 2 
   or 1
   - Low waves or too high <0.7m or >1.5m = score 1

2. **Swell Period Score (0–3):** Based on swell organization
   - Longer period (10+ seconds) = score 3 (clean, organized waves)
   - Long period (8 to 10 seconds) = score 2
   - Short period (5 to 8 seconds) = score 1
   - Shorter period (<7 seconds) = score 0 (choppy, disorganized)

3. **Wind Impact Score (0–3):** Combines wind direction and wind wave height (chop)
   - Direction: Offshore (E/SE/NE) = high, Onshore (W/SW) = low, based on angular difference from optimal offshore vector
   - Wind chop: Lower wind waves (≤0.5m) = higher score, higher wind waves (>1m) = lower score
   - Combined using weighted average of direction and chop

**Final Score Formula:**
```
Score = Average(swellHeightScore, swellPeriodScore, windImpactScore) × (10/3)
```

**Reference Data (Stored for Display, NOT Scored):**
- Wind speed (km/h) — measured from Weather API for benchmarking and reference display
- Wave direction, water temperature, air temperature, UV index (see FR-3, FR-4)

### FR-3: Device App – Conditions Page

- Display the following parameters from the latest forecast:
  - Wave (Swell) Height (m/ft)
  - Wave (Swell) Period (seconds)
  - Wave (Swell) Direction (arrow + cardinal)
  - Wind Speed (km/h)
  - Wind Direction (arrow + cardinal)
  - Water Temperature (°C)
  - Air Temperature (°C)
  - UV Index (numeric + descriptor: Low/Moderate/High/Very High/Extreme)
  - Sunrise/Sunset Time (HH:MM)

note: Wave and Swell metrics are the same. Weather data (air temp, UV) merged into Conditions Page.

### FR-4: Device App – Weather Page

- Display:
  - Air Temperature (°C / °F)
  - UV Index (numeric + descriptor: Low/Moderate/High/Very High/Extreme)

### FR-5: Device App – Forecast Page

- Display 3–4 day forecast.
- Per day show:
  - Day name (e.g., "Mon", "Tue")
  - Wave height range (e.g., "1.2–1.8m")
  - Period (seconds)
  - Wind (speed + direction)
  - Composite score (color-coded)
- Enable horizontal scroll or swipe between days.

### FR-6: Device App – Help Page

- Display title: "How It Works".
- Explain the Swell Index score calculation (see FR-2 for detailed formula and methodology).
- Include disclaimer: "Scores are suggestions. Always check conditions yourself and surf at your own risk."

### FR-7: Side Service – Fetch Forecast

- Accept message from Device App ("get forecast").
- Read user's selected beach coordinates from `settingsStorage`.
- Call forecast API via `fetch()`.
- Parse response into compact payload.
- Send payload to Device App via MessageBuilder.

**API Provider:** Open-Meteo (free, no API key required)
- **Marine API:** `https://marine-api.open-meteo.com/v1/marine` — provides swell height, period, direction, wind wave height/direction
- **Weather API:** `https://api.open-meteo.com/v1/forecast` — provides temperature, UV index, wind speed, sunrise/sunset

Both APIs are called in parallel and responses are normalized into a single payload.

### FR-8: Offline Cache

- Device App stores last received forecast payload in persistent storage.
- Index page should display a "last updated" with the date; open clicking on yet the app will ask the user if they wish to force update the forecast, but also reminding them that requires the phone nearby. Consult with Zepp Design Specifications on how to design the dialog.
- Optional: On launch without phone connection: display cached data with "offline" indicator. Need to plan how the icon will look like. 
- Workout Extension reads same cached forecast (no independent fetch).

### FR-9: Workout Extension (Surf Mode)

- Register in `app.json` under `data-widget` for Surf sport type (API_LEVEL 3.6+).
- Display compact cached forecast view (wave height, period, score).
- Read-only; no user interaction required.

### FR-10: 

- Allow for more beaches to be selected in the settings app.
- Preferred is to be able to search beaches world-wide, but that requires a fetch ability.
- If not possible to search, prepare hard-coded list of beaches: the tel aviv beaches, sri lanka beaches (weligama and arugam bay), california beaches (malibu, santa barbara, santa cruz).

### FR-11:
- Plot graph for the weekly forecast

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Watch battery impact | Minimal — no continuous sensor polling in v1; forecast sync is on-demand. |
| Data freshness | Forecast updated on each app open (when paired); staleness clearly shown. |
| Zepp OS version | v3+ (API_LEVEL 3.0+) |
| Latency | Forecast should appear within ~3 seconds of opening the app (paired). |

---

## 8. Platform and Architecture Summary

- **Type:** Zepp OS Mini Program (`appType: "app"`).
- **Components:**
  - **Device App (watch):** 5 swipeable pages (Main, Conditions, Weather, Forecast, Help) + Workout Extension.
  - **Side Service (phone):** HTTP fetch, BLE communication to Device App, reads `settingsStorage`.
  - **Settings App (phone):** Beach selection UI in Zepp App; writes to `settingsStorage`; no fetch, no direct watch communication.
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
| Main page renders | Traffic light indicator + beach name visible within 3s of opening (paired). |
| Conditions page complete | All 7 parameters (wave height, direction, period, wind speed/direction, sunrise, sunset) display correctly. |
| Weather page complete | Temperature and UV index display correctly. |
| Forecast page complete | 3–4 day forecast displays with wave height, period, wind, and score per day. |
| Help page complete | Score formula and disclaimer are visible and readable. |
| Offline fallback | When phone is disconnected, cached data is shown with staleness label. |
| Settings work | User can select a beach from the list; coordinates are saved and used for next fetch. |

---

## 10. Open Questions

1. v2 sensor features: should session recording start automatically when the user starts a workout, or be manually toggled?
2. Should the app support multiple saved beaches, or just one?
