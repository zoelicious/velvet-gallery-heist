# The Velvet Gallery — Mansion Art Heist

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/zoelicious/velvet-gallery-heist/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/zoelicious/velvet-gallery-heist/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

A top-down 2D heist game for the [make.fun best heist game competition](https://make.fun/c/best-heist-game-20261122-0559). Sneak through a bright mansion art gallery, dodge patrolling guards and sweeping cameras, steal **THE GOLDEN MUSE** from the vault, and escape through the garden gate to the getaway van.

## How to play

- **Move:** WASD / arrow keys, or click anywhere to walk there.
- **Tools (cost coins, then cool down):**
  - `1` **GRAPPLE** — rope through a marked blue window, straight from the garden into the study or ballroom, past the guarded front door.
  - `2` **SMOKE** — a cloud no vision cone can see through.
  - `3` **EMP** — switches the wall cameras off for a few seconds.
- **Hide:** hedges, statues, curtains and smoke break every line of sight; the alarm meter falls fastest in cover.
- **Alarm:** rises while a guard or camera sees you, falls while you hide. At 100% you are caught — you keep your loot and respawn at your room checkpoint with one nerve lost (3 nerves).
- **Win:** steal the Golden Muse from the vault, then reach the green **GETAWAY GATE** in the garden.

## Rooms and routes

West Wing · Vault · East Wing · Study · Gallery Hall · Ballroom · Sunroom · Foyer · Library · Garden. Three ways to the masterpiece: the front door through the foyer, the west window (grapple) into the study, or the east window (grapple) into the ballroom. Every room has at least two doors.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests: `game/index.html` plus its ES modules under `game/src/`.

## Files

- `game/index.html` — the page and canvas.
- `game/src/config.js` — tuning numbers and the bright palette.
- `game/src/mansion.js` — the floor plan: rooms, walls, doors, windows, loot, cover, patrols, cameras.
- `game/src/guards.js` — guard patrols, vision cones, and line-of-sight checks.
- `game/src/tools.js` — grapple, smoke and EMP: costs, cooldowns, effects.
- `game/src/world.js` — the game state: movement, alarm, loot, caught/checkpoint, win.
- `game/src/render.js` — the bright top-down canvas renderer and HUD.
- `game/src/shots.js` — the four staged screenshot scenes.
- `game/src/input.js` — keyboard + mouse.
- `game/src/random.js` — seeded random for reproducible runs.
- `game/src/main.js` — boot, fixed-step loop, screens.
- `main.ts` — hands the game in: copies `game/` + `screenshots/` and writes `dossier.json`.
- `serve.ts` — local static server for playtesting.

## Entry

- Competition: `best-heist-game-20261122-0559`
- Referral: `nmy46sr8`
- License: MIT
