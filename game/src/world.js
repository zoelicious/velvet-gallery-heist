// The world: one game state, one fixed-step update. The thief sneaks through the
// mansion, steals the loot, and must reach the getaway gate with the masterpiece.
// Alarm rises while anyone can see the thief and falls while hidden; at 100 the
// thief is caught — a fair catch, with a grace window, a checkpoint respawn and
// nerves to spare — and the loot already stolen is kept.

import { ALARM, CAMERA, GUARD, MASTERPIECE_VALUE, NERVES, PLAYER, START_COINS, STEP } from './config.js';
import { createCameras, createGuards, stepWatchers } from './guards.js';
import { createTools, stepTools, useTool } from './tools.js';
import { EXTRACTION, LOOT, THIEF_START, hitsWall, inCover, roomAt } from './mansion.js';

export const EVENT_CAUGHT = 1;
export const EVENT_WIN = 2;
export const EVENT_OVER = 4;
export const EVENT_LOOT = 8;

export function createWorld(random) {
  const state = {
    random,
    time: 0,
    thief: {
      x: THIEF_START.x,
      y: THIEF_START.y,
      angle: -Math.PI / 2,
      moving: false,
      hidden: false,
      inSmoke: false,
      alarm: 0,
      graceLeft: 0,
    },
    guards: createGuards(),
    cameras: createCameras(),
    tools: createTools(),
    loot: LOOT.map((item) => ({ ...item, taken: false })),
    coins: START_COINS,
    score: 0,
    nerves: NERVES,
    room: roomAt(THIEF_START.x, THIEF_START.y),
    checkpoint: { ...THIEF_START },
    checkpointRoom: roomAt(THIEF_START.x, THIEF_START.y),
    message: 'Steal THE GOLDEN MUSE, then reach the GETAWAY GATE.',
    messageTime: 0,
    won: false,
    over: false,
    caughtFlash: 0,
    grappleLine: null,
  };
  const world = {
    state,
    reset() {
      const fresh = createWorld(random);
      for (const key of Object.keys(state)) delete state[key];
      Object.assign(state, fresh.state);
    },
    step(dt, move, toolAction) {
      return stepWorld(state, dt, move, toolAction);
    },
  };
  return world;
}

/** Move the thief, sliding along walls instead of sticking to them. */
function moveThief(state, dx, dy, dt) {
  const thief = state.thief;
  const speed = PLAYER.speed;
  const nextX = thief.x + dx * speed * dt;
  const nextY = thief.y + dy * speed * dt;
  if (!hitsWall(nextX, thief.y, PLAYER.radius)) thief.x = nextX;
  if (!hitsWall(thief.x, nextY, PLAYER.radius)) thief.y = nextY;
  thief.x = Math.max(PLAYER.radius, Math.min(1280 - PLAYER.radius, thief.x));
  thief.y = Math.max(PLAYER.radius, Math.min(720 - PLAYER.radius, thief.y));
  if (dx !== 0 || dy !== 0) {
    thief.angle = Math.atan2(dy, dx);
    thief.moving = true;
  } else {
    thief.moving = false;
  }
}

/** Pick up any loot the thief is standing on. */
function collectLoot(state) {
  let events = 0;
  for (const item of state.loot) {
    if (item.taken) continue;
    if (Math.hypot(state.thief.x - item.x, state.thief.y - item.y) < 34) {
      item.taken = true;
      state.score += item.value;
      state.coins += Math.floor(item.value / 10);
      state.message = item.masterpiece
        ? 'THE GOLDEN MUSE is yours! Get to the GETAWAY GATE!'
        : `${item.name} stolen (+${item.value})`;
      state.messageTime = 3;
      events |= EVENT_LOOT;
    }
  }
  return events;
}

function masterpieceTaken(state) {
  return state.loot.some((item) => item.masterpiece && item.taken);
}

function stepWorld(state, dt, move, toolAction) {
  if (state.won || state.over) return 0;
  state.time += dt;
  state.messageTime = Math.max(0, state.messageTime - dt);
  state.caughtFlash = Math.max(0, state.caughtFlash - dt);
  const thief = state.thief;
  thief.graceLeft = Math.max(0, thief.graceLeft - dt);

  // Tools: a key press (or a HUD click) fires one, and the grapple zips the thief.
  if (toolAction) {
    const message = useTool(toolAction, state);
    if (message) {
      state.message = message;
      state.messageTime = 2.5;
    }
  }
  const grapple = state.tools.grapple;
  if (grapple.active) {
    grapple.progress += dt / 0.55;
    if (grapple.progress >= 1) {
      thief.x = grapple.to.x;
      thief.y = grapple.to.y;
      grapple.active = false;
      state.grappleLine = null;
    } else {
      state.grappleLine = {
        from: grapple.from,
        to: grapple.to,
        at: {
          x: grapple.from.x + (grapple.to.x - grapple.from.x) * grapple.progress,
          y: grapple.from.y + (grapple.to.y - grapple.from.y) * grapple.progress,
        },
      };
      return 0;
    }
  }
  stepTools(state.tools, dt);

  // Movement, then the room the thief stands in becomes the new checkpoint.
  moveThief(state, move.x, move.y, dt);
  const room = roomAt(thief.x, thief.y);
  if (room.id !== state.room.id) {
    state.room = room;
    state.checkpoint = { x: room.spawn.x, y: room.spawn.y };
    state.checkpointRoom = room;
    state.message = `${room.name} — stay out of the cones`;
    state.messageTime = 2;
  }

  // Hidden means inside cover or inside a smoke cloud: nobody can see the thief.
  thief.inSmoke = state.tools.smoke.clouds.some(
    (cloud) => Math.hypot(thief.x - cloud.x, thief.y - cloud.y) < cloud.radius,
  );
  thief.hidden = inCover(thief.x, thief.y) || thief.inSmoke;

  // Cameras go dark while the EMP runs.
  const empOn = state.tools.emp.timeLeft > 0;
  for (const camera of state.cameras) camera.online = !empOn;

  // Who sees the thief, and what the alarm does about it.
  const seen = stepWatchers(state.guards, state.cameras, thief, state.tools.smoke.clouds, dt, state.time);
  if (thief.graceLeft <= 0) {
    if (seen.guardSeen) thief.alarm += GUARD.alarmRate * dt;
    if (seen.cameraSeen) thief.alarm += CAMERA.alarmRate * dt;
    if (!seen.anySeen) {
      thief.alarm -= (thief.hidden ? ALARM.decayCover : ALARM.decayHidden) * dt;
    }
  }
  thief.alarm = Math.max(0, Math.min(ALARM.max, thief.alarm));

  let events = collectLoot(state);

  // The getaway only counts with the masterpiece in hand.
  if (
    masterpieceTaken(state)
    && thief.x >= EXTRACTION.x && thief.x <= EXTRACTION.x + EXTRACTION.w
    && thief.y >= EXTRACTION.y && thief.y <= EXTRACTION.y + EXTRACTION.h
  ) {
    state.won = true;
    state.score += Math.max(0, 600 - Math.floor(state.time)) * 1;
    return events | EVENT_WIN;
  }

  // Caught: fair, because the alarm had to climb all the way, the thief keeps the
  // loot, and respawns at the checkpoint of the room they were in.
  if (thief.alarm >= ALARM.max && thief.graceLeft <= 0) {
    state.nerves -= 1;
    state.caughtFlash = 1.2;
    if (state.nerves <= 0) {
      state.over = true;
      return events | EVENT_OVER;
    }
    thief.x = state.checkpoint.x;
    thief.y = state.checkpoint.y;
    thief.alarm = ALARM.afterCaught;
    thief.graceLeft = PLAYER.grace;
    state.message = `CAUGHT! The guards drag you back to the ${state.checkpointRoom.name}. ${state.nerves} nerve${state.nerves === 1 ? '' : 's'} left.`;
    state.messageTime = 3.5;
    return events | EVENT_CAUGHT;
  }
  return events;
}
