// Guards and wall cameras: patrols, vision cones, and the fair question every
// frame asks — "can anyone see the thief right now?"
// A guard sees the thief only when the thief is inside the cone (range + angle)
// AND the line of sight is not blocked by a wall, AND the thief is not hidden in
// cover or smoke. Cameras sweep the same way, in an amber arc.

import { CAMERA, GUARD } from './config.js';
import { CAMERAS, GUARD_ROUTES, inCover, sightBlocked } from './mansion.js';

/** Smallest absolute difference between two angles, in radians. */
export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return Math.abs(d);
}

/** Create the four guards at the start of their patrol loops. */
export function createGuards() {
  return GUARD_ROUTES.map((route, index) => {
    const start = route.waypoints[0];
    const next = route.waypoints[1];
    return {
      id: `guard-${index + 1}`,
      name: route.name,
      x: start.x,
      y: start.y,
      angle: Math.atan2(next.y - start.y, next.x - start.x),
      waypoint: 1,
      speed: GUARD.patrolSpeed,
      /** True while this guard can see the thief this frame. */
      seesThief: false,
      /** Seconds this guard has held the thief in its cone without a break. */
      seenTime: 0,
    };
  });
}

/** Create the two wall cameras at their mounts. */
export function createCameras() {
  return CAMERAS.map((mount) => ({
    id: mount.id,
    x: mount.x,
    y: mount.y,
    baseAngle: mount.baseAngle,
    sweep: mount.sweep,
    phase: mount.phase,
    angle: mount.baseAngle,
    /** False while an EMP has this camera switched off. */
    online: true,
    seesThief: false,
  }));
}

/** Move one guard one step along its patrol loop. */
function stepGuard(guard, route, dt, alarmHigh, thief) {
  const target = route.waypoints[guard.waypoint];
  const dx = target.x - guard.x;
  const dy = target.y - guard.y;
  const distance = Math.hypot(dx, dy);
  const speed = alarmHigh ? GUARD.chaseSpeed : GUARD.patrolSpeed;
  if (distance < 6) {
    guard.waypoint = (guard.waypoint + 1) % route.waypoints.length;
    return;
  }
  // When the alarm is high the guard hurries toward the thief instead of patrolling.
  if (alarmHigh && guard.seesThief) {
    const tx = thief.x - guard.x;
    const ty = thief.y - guard.y;
    const tl = Math.hypot(tx, ty) || 1;
    guard.x += (tx / tl) * speed * dt;
    guard.y += (ty / tl) * speed * dt;
    guard.angle = Math.atan2(ty, tx);
    return;
  }
  guard.x += (dx / distance) * speed * dt;
  guard.y += (dy / distance) * speed * dt;
  guard.angle = Math.atan2(dy, dx);
}

/**
 * Can a watcher at (wx, wy) facing `angle` see the thief? Range, cone angle,
 * walls, cover and smoke all count; a hidden thief is never seen.
 */
export function canSee(watcher, range, halfAngle, thief, smokeClouds) {
  if (thief.hidden) return false;
  const dx = thief.x - watcher.x;
  const dy = thief.y - watcher.y;
  const distance = Math.hypot(dx, dy);
  if (distance > range) return false;
  const angleToThief = Math.atan2(dy, dx);
  if (angleDifference(angleToThief, watcher.angle) > halfAngle) return false;
  if (sightBlocked(watcher.x, watcher.y, thief.x, thief.y)) return false;
  for (const cloud of smokeClouds) {
    if (Math.hypot(thief.x - cloud.x, thief.y - cloud.y) < cloud.radius) return false;
  }
  return true;
}

/**
 * Advance guards and cameras one step and report who sees the thief.
 * Returns { guardSeen, cameraSeen, anySeen }.
 */
export function stepWatchers(guards, cameras, thief, smokeClouds, dt, time) {
  const alarmHigh = thief.alarm >= 60;
  let guardSeen = false;
  let cameraSeen = false;
  guards.forEach((guard, index) => {
    stepGuard(guard, GUARD_ROUTES[index], dt, alarmHigh, thief);
    guard.seesThief = canSee(guard, GUARD.coneRange, GUARD.coneHalfAngle, thief, smokeClouds);
    guard.seenTime = guard.seesThief ? guard.seenTime + dt : 0;
    if (guard.seesThief) guardSeen = true;
  });
  cameras.forEach((camera) => {
    camera.angle = camera.baseAngle + Math.sin(time * (CAMERA.sweepSpeed * Math.PI / 180) + camera.phase) * camera.sweep;
    camera.seesThief = camera.online && canSee(camera, CAMERA.coneRange, CAMERA.coneHalfAngle, thief, smokeClouds);
    if (camera.seesThief) cameraSeen = true;
  });
  return { guardSeen, cameraSeen, anySeen: guardSeen || cameraSeen };
}
