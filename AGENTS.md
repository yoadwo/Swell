# Swell Project

## Project purpose
Creating a Surf Forecast Analysis based on weather conditions, written for Amazfit Watches (using ZeppOs development framework).

## Skills Loading
- For better understanding of the requirements, please read now @PRD.md and @PLAN.md in this project's path.
- For better understanding of the framework, use the .claude/zepp-os-development skill
- Look for skills under .claude/** or .cursor/**. Read them now.

## Project Overview
 Zepp OS Mini Program for Amazfit watches (Surf Forecast App)
- Location: /amazfit/Swell/src
- Framework: Zepp OS API 4.2
- Structure: 3-part (Device App, Settings App, Side Service)

## Key Files & Architecture
- Page Build (rendering) and logic: src/page/<page-name>/*.js
- Layout files: src/page/<page-name>/<page-name>.<s/r>.layout.js
- Shared: src/utils/*.js
- Storage: src/utils/device-storage.js, src/utils/phone-storage.js
- Side Service: src/app-side/handlers.js
- Settings App: src/setting/index.js

## Important Modules
- @zos/ui - Widgets
- @zos/utils - Logger, px
- @zos/storage - Device storage
- @zos/page - Scroll modes
- @zos/router - Navigation (replace)
- @zos/interaction - Gesture handling

## Engineering Principles
- Device App uses @zos/utils Logger; Side Service/Settings use console.log
- Storage: localStorage on watch, settingsStorage on phone — two separate systems
- Methods that may fail throw errors; callers wrap in try-catch
- Keep logging simple: debug for flow, info for results, warn/error for issues
- Don't refactor without asking — make only requested changes
- If you feel i have given you contradicting instructions at the session, or if a instructions contradicts the AGENTS, PRD or PLAN files - 
  do not proceed! prompt me at once and ask for clarification.
- If you feel the instructions given are ambiguous, act as previous command: halt and prompt for clarification. 

## Pages Description

### Index Page (Main Page)
- Includes beach name and surfing index score.
- score is valid for one hour, after this will be re-fetched.
- Can be re-fetched manually any time, as long as phone is paired.
- There's a "last updated" prompt on the screen.

#### Render Flows
- renderForecast: Shows score, message, "Updated X ago" status
- renderLoading: Shows "Loading...", hides all other widgets
- renderNoBeachSelected: Shows "No Beach Selected", "Go to Settings" message
- renderError: Shows "Oh no...", "Try again later!" message
- All scenarios show refresh button except loading


### Conditions Page
- A more drilled down description of the surf index.
- Presents swell details, wind details, temperature, sunset-sunrise times and more.

### Forecast Page
- Shows a summarized list of the coming days forecast and score

### Help Page
- Explains how the index is calculated


## Testing
- Node --test runner with assert.rejects for error cases
- Tests: npm run test or node --test