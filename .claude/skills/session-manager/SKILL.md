---
name: session-manager
description: Creates a session handoff summary when developer is ending work. Generates copy-paste text for the next session.
---

# Session Manager Skill

## Purpose

When the developer is about to start a new session with the AI agent, this skill creates a copy-paste text block that provides context for the AI about:
1. The project's purpose: Creating a Surf Forecast app; referencing the AGENTS.md for context.
2. The project's state

## Usage

When developer requests a new session summary or,
states they need to switch sessions due to context window full:
1. Create handoff text block
2. Highlight key changes this session
3. Pass to developer to save/copy
4. State in a way that is clear for an AI agent: This is the summary of the previous session, not a request for a summary of the current one.

## Session Handoff Template

```
# Swell Project - Session Handoff

## Project purpose
Creating a Surf Forecast Analysis based on weather conditions, written for Amazfit Watches (using ZeppOs development framework).
Read the AGENTS.md file for a brief explanation of the project. Confirm read, prompt is there were any problems (file not found, needs clarification).

## Project state and recent changes
<project state placeholder>

## To Start New Session
1. Confirm you have read the attached skills and .md files.
2. Confirm you have read this handoff.
3. Understand current state before making changes; ask for clarifying questions if you need.
```

## How to Generate Handoff

1. Copy the template above
2. Update "project state placeholder" section with any new changes since last session
3. Add any new UI preferences or engineering principles
4. Return to developer with the final text block