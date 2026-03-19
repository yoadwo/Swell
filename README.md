# Swell

A Zepp OS Mini Program for Amazfit Balance 2 that displays surf forecasts at a glance: wave height, period, direction, wind, water temp, and a Canvas-drawn graph. Powered by a Side Service on the phone (placeholder data initially), configurable via Settings App, with offline cache.

## Requirements

- **Node.js** (v14+)
- **Zepp Developer Account** — [Register](https://developer.zepp.com/) to build and install Mini Programs
- **Zepp App** — On your phone, with Developer Mode enabled
- **Zepp Simulator** — For testing without a physical watch
- **Zepp CLI (zeus)** — Install via npm: `npm i -g @zeppos/zeus-cli`

## Running Locally

From this directory:

```bash
zeus dev
```

This starts the dev server. Use the Zepp Simulator or scan the QR code with the Zepp App to preview on your watch.

## Docs

- [PRD.md](PRD.md) — Product requirements and terminology
- [RESEARCH_AND_DESIGN.md](RESEARCH_AND_DESIGN.md) — Architecture and APIs
- [PLAN.md](PLAN.md) — Implementation plan
