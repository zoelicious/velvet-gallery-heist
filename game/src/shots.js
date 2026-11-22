// The screenshot scenes behind ?shot=cover|route|tools|getaway. Each one stages a
// real game state by hand — the same state the live game can reach — and paints it,
// so the frame is what a short game really looks like and the same seed always
// gives the same frame. No autopilot, no fake pixels: every cone, camera, loot
// piece and HUD number comes from the world's own state.

import { SCREEN_PLAY } from './render.js';
import { roomAt } from './mansion.js';

/** Put one guard at a spot, facing an angle, optionally spotting the thief. */
function placeGuard(guard, x, y, angle, seesThief) {
  guard.x = x;
  guard.y = y;
  guard.angle = angle;
  guard.seesThief = seesThief;
  guard.seenTime = seesThief ? 0.6 : 0;
}

/** Put one camera at its mount, sweeping toward an angle. */
function placeCamera(camera, angle, online) {
  camera.angle = angle;
  camera.online = online;
  camera.seesThief = false;
}

function setLootTaken(state, ids) {
  for (const item of state.loot) item.taken = ids.includes(item.id);
  state.score = state.loot.filter((item) => item.taken).reduce((sum, item) => sum + item.value, 0);
}

function setThief(state, x, y, alarm, roomId) {
  state.thief.x = x;
  state.thief.y = y;
  state.thief.alarm = alarm;
  state.thief.hidden = false;
  state.thief.inSmoke = false;
  state.thief.graceLeft = 0;
  state.thief.angle = -Math.PI / 2;
  state.room = roomAt(x, y);
  state.checkpoint = { x, y };
  state.checkpointRoom = state.room;
  void roomId;
}

/**
 * Set `world` to the named scene and return the screen to draw over it and the
 * best loot total to show. Unknown names stage the cover.
 */
export function stageShot(name, world) {
  const state = world.state;
  world.reset();
  state.time = 95;
  state.nerves = 3;
  state.coins = 55;
  state.messageTime = 0;

  if (name === 'route') {
    // The west-window route: the thief ropes in from the garden side path while
    // the garden guard patrols the lawn below.
    state.time = 42;
    setThief(state, 52, 320, 18, 'garden');
    state.thief.angle = 0;
    state.tools.grapple.active = true;
    state.tools.grapple.from = { x: 52, y: 320 };
    state.tools.grapple.to = { x: 150, y: 320 };
    state.tools.grapple.progress = 0.5;
    state.grappleLine = { from: { x: 52, y: 320 }, to: { x: 150, y: 320 }, at: { x: 101, y: 320 } };
    setLootTaken(state, ['sunset']);
    placeGuard(state.guards[0], 560, 250, Math.PI * 0.75, false);
    placeGuard(state.guards[1], 1150, 680, Math.PI, false);
    placeGuard(state.guards[2], 200, 380, -Math.PI / 2, false);
    placeGuard(state.guards[3], 1050, 300, Math.PI / 2, false);
    placeCamera(state.cameras[0], Math.PI * 0.6, true);
    placeCamera(state.cameras[1], Math.PI * 0.4, true);
    state.message = 'GRAPPLE! Through the west window — past the front door guard.';
    state.messageTime = 99;
    return { screen: SCREEN_PLAY, best: 0 };
  }

  if (name === 'tools') {
    // Smoke + EMP in the gallery: the thief hides in a cloud while the cameras
    // are dark and the hall guard sweeps past, blind.
    state.time = 160;
    setThief(state, 640, 350, 68, 'gallery');
    state.thief.hidden = true;
    state.thief.inSmoke = true;
    state.tools.smoke.clouds = [{ x: 640, y: 350, radius: 95, timeLeft: 3.2 }];
    state.tools.emp.timeLeft = 4;
    state.tools.emp.cooldownLeft = 8;
    state.tools.smoke.cooldownLeft = 6;
    setLootTaken(state, ['duchess', 'harbour', 'sunset']);
    placeGuard(state.guards[0], 560, 260, Math.PI * 0.15, false);
    placeGuard(state.guards[1], 300, 680, 0, false);
    placeGuard(state.guards[2], 220, 300, 0, false);
    placeGuard(state.guards[3], 1000, 380, Math.PI, false);
    placeCamera(state.cameras[0], Math.PI * 0.5, false);
    placeCamera(state.cameras[1], Math.PI * 0.5, false);
    state.message = 'SMOKE out + EMP! Cameras offline — slip past while it lasts.';
    state.messageTime = 99;
    return { screen: SCREEN_PLAY, best: 0 };
  }

  if (name === 'getaway') {
    // The payoff: masterpiece stolen, the thief at the getaway gate, van waiting.
    state.time = 248;
    state.nerves = 2;
    state.coins = 70;
    setThief(state, 100, 705, 12, 'garden');
    state.thief.angle = Math.PI;
    setLootTaken(state, ['muse', 'duchess', 'harbour', 'dancers']);
    placeGuard(state.guards[0], 700, 250, -Math.PI / 2, false);
    placeGuard(state.guards[1], 1150, 680, Math.PI, false);
    placeGuard(state.guards[2], 200, 230, Math.PI / 2, false);
    placeGuard(state.guards[3], 1100, 230, Math.PI / 2, false);
    placeCamera(state.cameras[0], Math.PI * 0.75, true);
    placeCamera(state.cameras[1], Math.PI * 0.25, true);
    state.message = 'CLEAN GETAWAY! The Golden Muse is gone — run for the van!';
    state.messageTime = 99;
    return { screen: SCREEN_PLAY, best: 0 };
  }

  // Cover: the whole heist in one frame — gallery hall, the thief mid-room, three
  // guards with bright cones, both cameras sweeping, the golden masterpiece
  // glowing in the vault, and the alarm meter halfway up.
  state.time = 95;
  setThief(state, 640, 310, 55, 'gallery');
  state.thief.angle = -Math.PI / 4;
  setLootTaken(state, ['duchess', 'harbour']);
  placeGuard(state.guards[0], 500, 250, Math.atan2(310 - 250, 640 - 500), true);
  placeGuard(state.guards[1], 1150, 680, Math.PI, false);
  placeGuard(state.guards[2], 330, 300, Math.atan2(310 - 300, 640 - 330), false);
  placeGuard(state.guards[3], 1000, 300, Math.atan2(310 - 300, 640 - 1000), false);
  placeCamera(state.cameras[0], Math.atan2(310 - 196, 640 - 880), true);
  placeCamera(state.cameras[1], -Math.PI / 2, true);
  state.cameras[0].seesThief = false;
  state.message = 'The hall guard spotted you — break the line of sight!';
  state.messageTime = 99;
  return { screen: SCREEN_PLAY, best: 0 };
}
