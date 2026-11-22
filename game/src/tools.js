// The thief's three tools. Every tool costs coins and then needs its cooldown,
// so the player spends loot to stay unseen — tools are a budget, not a free win.
//   1 GRAPPLE — rope through a marked window: zip from the garden side to the
//     room inside, skipping the guarded front door.
//   2 SMOKE — a cloud that blocks every cone for a few seconds.
//   3 EMP — switches the wall cameras off for a few seconds.

import { TOOLS } from './config.js';
import { WINDOWS } from './mansion.js';

/** Fresh tool state: each tool ready, no cooldown left, no effect running. */
export function createTools() {
  return {
    grapple: { cooldownLeft: 0, active: false, from: null, to: null, progress: 0 },
    smoke: { cooldownLeft: 0, clouds: [] },
    emp: { cooldownLeft: 0, timeLeft: 0 },
  };
}

/** The nearest window marker to a point, when it is close enough to use. */
export function nearestWindow(x, y) {
  let best = null;
  let bestDistance = 85;
  for (const window of WINDOWS) {
    const outside = Math.hypot(x - window.outside.x, y - window.outside.y);
    if (outside < bestDistance) {
      bestDistance = outside;
      best = window;
    }
  }
  return best;
}

/**
 * Try to fire a tool. Returns a short message for the HUD ("GRAPPLE!", "Need 10
 * coins", "SMOKE cooling down 4s"...) or null when nothing happened.
 * `state` carries { coins, thief, tools }; the call mutates tools and coins.
 */
export function useTool(kind, state) {
  const tool = TOOLS[kind];
  const tools = state.tools;
  if (!tool) return null;
  if (kind === 'grapple') {
    if (tools.grapple.cooldownLeft > 0) return `GRAPPLE cooling down ${Math.ceil(tools.grapple.cooldownLeft)}s`;
    if (state.coins < tool.cost) return `GRAPPLE needs ${tool.cost} coins`;
    const window = nearestWindow(state.thief.x, state.thief.y);
    if (!window) return 'No window in reach — stand by a blue window';
    state.coins -= tool.cost;
    tools.grapple.cooldownLeft = tool.cooldown;
    tools.grapple.active = true;
    tools.grapple.from = { ...window.outside };
    tools.grapple.to = { ...window.inside };
    tools.grapple.progress = 0;
    return 'GRAPPLE! Through the window';
  }
  if (kind === 'smoke') {
    if (tools.smoke.cooldownLeft > 0) return `SMOKE cooling down ${Math.ceil(tools.smoke.cooldownLeft)}s`;
    if (state.coins < tool.cost) return `SMOKE needs ${tool.cost} coins`;
    state.coins -= tool.cost;
    tools.smoke.cooldownLeft = tool.cooldown;
    tools.smoke.clouds.push({ x: state.thief.x, y: state.thief.y, radius: TOOLS.smoke.radius, timeLeft: TOOLS.smoke.duration });
    return 'SMOKE out — cones cannot see through it';
  }
  if (kind === 'emp') {
    if (tools.emp.cooldownLeft > 0) return `EMP cooling down ${Math.ceil(tools.emp.cooldownLeft)}s`;
    if (state.coins < tool.cost) return `EMP needs ${tool.cost} coins`;
    state.coins -= tool.cost;
    tools.emp.cooldownLeft = tool.cooldown;
    tools.emp.timeLeft = TOOLS.emp.duration;
    return 'EMP! Cameras offline';
  }
  return null;
}

/** Tick cooldowns and effect timers down by dt. */
export function stepTools(tools, dt) {
  tools.grapple.cooldownLeft = Math.max(0, tools.grapple.cooldownLeft - dt);
  tools.smoke.cooldownLeft = Math.max(0, tools.smoke.cooldownLeft - dt);
  tools.emp.cooldownLeft = Math.max(0, tools.emp.cooldownLeft - dt);
  tools.emp.timeLeft = Math.max(0, tools.emp.timeLeft - dt);
  for (const cloud of tools.smoke.clouds) cloud.timeLeft -= dt;
  tools.smoke.clouds = tools.smoke.clouds.filter((cloud) => cloud.timeLeft > 0);
}
