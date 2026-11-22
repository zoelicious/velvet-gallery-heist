// The renderer: one bright top-down canvas. Floors are warm cream and parquet,
// the garden is green, walls are warm brown, vision cones are translucent red
// and amber, loot glows gold. The HUD is drawn on the same canvas, so every
// screenshot carries the alarm meter, the loot count, the tools and the room name.

import { ALARM, CAMERA, FIELD, FONT, GUARD, PALETTE, PLAYER, TOOLS } from './config.js';
import { COVER, DOORS, EXTRACTION, MANSION, ROOMS, WALLS, WINDOWS } from './mansion.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

/** Tool button rectangles on the canvas, in logical pixels (for mouse clicks). */
export const TOOL_BUTTONS = [
  { kind: 'grapple', x: 520, y: 648, w: 150, h: 56 },
  { kind: 'smoke', x: 680, y: 648, w: 150, h: 56 },
  { kind: 'emp', x: 840, y: 648, w: 150, h: 56 },
];

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const scale = { x: 1, y: 1 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    scale.x = canvas.width / FIELD.width;
    scale.y = canvas.height / FIELD.height;
  }

  function drawCone(x, y, angle, range, halfAngle, fill, edge) {
    context.beginPath();
    context.moveTo(x, y);
    context.arc(x, y, range, angle - halfAngle, angle + halfAngle);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    context.strokeStyle = edge;
    context.lineWidth = 2;
    context.stroke();
  }

  function drawRoomFloors() {
    for (const room of ROOMS) {
      context.fillStyle = PALETTE[room.floor] ?? PALETTE.floorMarble;
      context.fillRect(room.x, room.y, room.w, room.h);
    }
    // Garden path from the gate to the front door, and the fountain plaza.
    context.fillStyle = PALETTE.path;
    context.fillRect(600, 560, 80, 130);
    context.fillRect(40, 690, 120, 30);
    // Side paths around the mansion to the grapple windows.
    context.fillRect(30, 300, 50, 260);
    context.fillRect(1200, 300, 50, 260);
    // Parquet lines in the gallery hall.
    context.strokeStyle = 'rgba(122, 92, 62, 0.18)';
    context.lineWidth = 1;
    for (let x = 400; x <= 900; x += 40) {
      context.beginPath();
      context.moveTo(x, 180);
      context.lineTo(x, 440);
      context.stroke();
    }
    // Room labels, small and warm, never shouting over the play.
    context.font = `700 13px ${FONT}`;
    context.textAlign = 'center';
    context.fillStyle = 'rgba(107, 90, 68, 0.75)';
    for (const room of ROOMS) {
      if (room.id === 'garden') continue;
      context.fillText(room.name, room.x + room.w / 2, room.y + room.h - 10);
    }
  }

  function drawWallsAndDoors() {
    for (const wall of WALLS) {
      context.fillStyle = PALETTE.wallTop;
      context.fillRect(wall.x, wall.y, wall.w, wall.h);
      context.fillStyle = PALETTE.wall;
      context.fillRect(wall.x, wall.y + wall.h - 4, wall.w, 4);
    }
    for (const door of DOORS) {
      context.fillStyle = PALETTE.door;
      context.fillRect(door.x, door.y, door.w, door.h);
    }
    for (const window of WINDOWS) {
      context.fillStyle = PALETTE.window;
      context.fillRect(window.x - 4, window.y - 22, 8, 44);
      context.strokeStyle = '#2b6cb0';
      context.lineWidth = 2;
      context.strokeRect(window.x - 4, window.y - 22, 8, 44);
      context.fillStyle = '#2b6cb0';
      context.font = `700 11px ${FONT}`;
      context.textAlign = 'center';
      context.fillText('WINDOW', window.x + (window.x < 640 ? 44 : -44), window.y - 28);
    }
  }

  function drawCover() {
    for (const spot of COVER) {
      if (spot.kind === 'statue') {
        context.fillStyle = PALETTE.statue;
        context.beginPath();
        context.arc(spot.x + spot.w / 2, spot.y + spot.h / 2, 20, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#b9b09a';
        context.fillRect(spot.x + 6, spot.y + spot.h - 8, spot.w - 12, 8);
        context.fillStyle = '#5a4a33';
        context.font = `700 10px ${FONT}`;
        context.textAlign = 'center';
        context.fillText('STATUE', spot.x + spot.w / 2, spot.y + spot.h / 2 + 3);
      } else if (spot.kind === 'hedge') {
        context.fillStyle = PALETTE.hedge;
        context.beginPath();
        context.roundRect(spot.x, spot.y, spot.w, spot.h, 12);
        context.fill();
        context.fillStyle = '#3c8a3a';
        for (let x = spot.x + 12; x < spot.x + spot.w; x += 24) {
          context.beginPath();
          context.arc(x, spot.y + spot.h / 2, 8, 0, Math.PI * 2);
          context.fill();
        }
        context.fillStyle = '#ffffff';
        context.font = `700 11px ${FONT}`;
        context.textAlign = 'center';
        context.fillText('HEDGE · COVER', spot.x + spot.w / 2, spot.y + spot.h / 2 + 4);
      } else if (spot.kind === 'curtain') {
        context.fillStyle = '#b04a6e';
        context.fillRect(spot.x, spot.y, spot.w, spot.h);
        context.fillStyle = '#8e3656';
        for (let x = spot.x + 8; x < spot.x + spot.w; x += 16) context.fillRect(x, spot.y, 4, spot.h);
      } else if (spot.kind === 'sofa') {
        context.fillStyle = '#c65d7b';
        context.beginPath();
        context.roundRect(spot.x, spot.y, spot.w, spot.h, 8);
        context.fill();
      } else if (spot.kind === 'shelf') {
        context.fillStyle = '#8a6a42';
        context.fillRect(spot.x, spot.y, spot.w, spot.h);
        context.fillStyle = '#f2dfae';
        context.fillRect(spot.x + 4, spot.y + 4, spot.w - 8, 5);
        context.fillRect(spot.x + 4, spot.y + 14, spot.w - 8, 5);
      } else if (spot.kind === 'plant') {
        context.fillStyle = PALETTE.plant;
        context.beginPath();
        context.arc(spot.x + 15, spot.y + 12, 13, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#b06a3b';
        context.fillRect(spot.x + 7, spot.y + 20, 16, 10);
      } else if (spot.kind === 'fountain') {
        context.fillStyle = '#7cc4e8';
        context.beginPath();
        context.arc(spot.x + 20, spot.y + 20, 18, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = '#5a9ec4';
        context.lineWidth = 3;
        context.stroke();
      }
    }
  }

  function drawLoot(state) {
    for (const item of state.loot) {
      if (item.taken) continue;
      const pulse = 0.5 + 0.5 * Math.sin(state.time * 3 + item.x);
      context.fillStyle = `rgba(247, 181, 0, ${0.22 + 0.18 * pulse})`;
      context.beginPath();
      context.arc(item.x, item.y, 26 + 4 * pulse, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = item.masterpiece ? '#fff3b0' : '#ffe9a8';
      context.strokeStyle = PALETTE.loot;
      context.lineWidth = item.masterpiece ? 4 : 3;
      const w = item.masterpiece ? 44 : 32;
      const h = item.masterpiece ? 34 : 24;
      context.beginPath();
      context.roundRect(item.x - w / 2, item.y - h / 2, w, h, 3);
      context.fill();
      context.stroke();
      context.fillStyle = '#7a5c3e';
      context.font = `700 ${item.masterpiece ? 15 : 12}px ${FONT}`;
      context.textAlign = 'center';
      context.fillText(item.masterpiece ? '★' : '$', item.x, item.y + 4);
      if (item.masterpiece) {
        context.fillStyle = '#7a4d00';
        context.font = `700 12px ${FONT}`;
        context.fillText('THE GOLDEN MUSE', item.x, item.y + 34);
      }
    }
  }

  function drawExtraction(state) {
    const glow = 0.5 + 0.5 * Math.sin(state.time * 4);
    context.fillStyle = `rgba(31, 174, 122, ${0.35 + 0.25 * glow})`;
    context.fillRect(EXTRACTION.x, EXTRACTION.y, EXTRACTION.w, EXTRACTION.h);
    context.strokeStyle = PALETTE.safe;
    context.lineWidth = 3;
    context.strokeRect(EXTRACTION.x, EXTRACTION.y, EXTRACTION.w, EXTRACTION.h);
    context.fillStyle = '#0b6b4a';
    context.font = `700 13px ${FONT}`;
    context.textAlign = 'center';
    context.fillText('GETAWAY GATE', EXTRACTION.x + EXTRACTION.w / 2, EXTRACTION.y - 8);
    // The getaway van waiting by the gate.
    context.fillStyle = '#2f9e6e';
    context.beginPath();
    context.roundRect(170, 656, 64, 26, 6);
    context.fill();
    context.fillStyle = '#fffdf6';
    context.fillRect(218, 662, 12, 14);
    context.fillStyle = '#22303a';
    context.beginPath();
    context.arc(186, 684, 6, 0, Math.PI * 2);
    context.arc(218, 684, 6, 0, Math.PI * 2);
    context.fill();
  }

  function drawGuards(state) {
    for (const guard of state.guards) {
      drawCone(guard.x, guard.y, guard.angle, GUARD.coneRange, GUARD.coneHalfAngle, PALETTE.cone, PALETTE.coneEdge);
    }
    for (const camera of state.cameras) {
      if (!camera.online) continue;
      drawCone(camera.x, camera.y, camera.angle, CAMERA.coneRange, CAMERA.coneHalfAngle, PALETTE.camCone, PALETTE.camConeEdge);
    }
    for (const guard of state.guards) {
      context.fillStyle = PALETTE.guard;
      context.beginPath();
      context.arc(guard.x, guard.y, PLAYER.radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = PALETTE.guardDark;
      context.lineWidth = 3;
      context.stroke();
      // Cap and eyes facing the patrol direction.
      context.fillStyle = PALETTE.guardDark;
      context.beginPath();
      context.arc(guard.x, guard.y - 4, 8, Math.PI, 0);
      context.fill();
      context.fillStyle = '#fffdf6';
      context.beginPath();
      context.arc(guard.x + Math.cos(guard.angle) * 6 - 3, guard.y + Math.sin(guard.angle) * 6 - 2, 2.5, 0, Math.PI * 2);
      context.arc(guard.x + Math.cos(guard.angle) * 6 + 3, guard.y + Math.sin(guard.angle) * 6 + 2, 2.5, 0, Math.PI * 2);
      context.fill();
      if (guard.seesThief) {
        context.fillStyle = '#e5484d';
        context.font = `900 22px ${FONT}`;
        context.textAlign = 'center';
        context.fillText('!', guard.x, guard.y - 24);
      }
    }
    for (const camera of state.cameras) {
      context.fillStyle = camera.online ? PALETTE.cameraBody : '#9aa0aa';
      context.beginPath();
      context.arc(camera.x, camera.y, 10, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = camera.online ? '#f5a623' : '#777';
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = camera.online ? '#f5a623' : '#ddd';
      context.font = `700 10px ${FONT}`;
      context.textAlign = 'center';
      context.fillText(camera.online ? 'CAM' : 'OFF', camera.x, camera.y - 16);
    }
  }

  function drawThief(state) {
    const thief = state.thief;
    if (state.grappleLine) {
      context.strokeStyle = '#8a6a42';
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(state.grappleLine.from.x, state.grappleLine.from.y);
      context.lineTo(state.grappleLine.at.x, state.grappleLine.at.y);
      context.stroke();
    }
    // Smoke clouds hide the thief.
    for (const cloud of state.tools.smoke.clouds) {
      context.fillStyle = 'rgba(230, 230, 235, 0.75)';
      context.beginPath();
      context.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = 'rgba(180, 180, 190, 0.8)';
      context.beginPath();
      context.arc(cloud.x - 30, cloud.y - 12, 26, 0, Math.PI * 2);
      context.arc(cloud.x + 28, cloud.y + 10, 30, 0, Math.PI * 2);
      context.fill();
    }
    const blink = thief.graceLeft > 0 && Math.floor(state.time * 8) % 2 === 0;
    if (!blink) {
      context.fillStyle = thief.hidden ? 'rgba(18, 181, 165, 0.55)' : PALETTE.thief;
      context.beginPath();
      context.arc(thief.x, thief.y, PLAYER.radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = PALETTE.thiefDark;
      context.lineWidth = 3;
      context.stroke();
      // Masked eyes and the loot bag on the back.
      context.fillStyle = '#22303a';
      context.fillRect(thief.x - 8, thief.y - 4, 16, 5);
      context.fillStyle = '#f7b500';
      context.beginPath();
      context.arc(thief.x - Math.cos(thief.angle) * 12, thief.y - Math.sin(thief.angle) * 12, 6, 0, Math.PI * 2);
      context.fill();
      if (thief.hidden) {
        context.fillStyle = '#0a8a7d';
        context.font = `700 11px ${FONT}`;
        context.textAlign = 'center';
        context.fillText('HIDDEN', thief.x, thief.y - 22);
      }
    }
    if (state.caughtFlash > 0) {
      context.fillStyle = `rgba(229, 72, 77, ${0.25 * state.caughtFlash})`;
      context.fillRect(0, 0, FIELD.width, FIELD.height);
    }
  }

  function drawHud(state, screen) {
    // Top bar: title, alarm meter, loot, coins, nerves.
    context.fillStyle = PALETTE.panel;
    context.beginPath();
    context.roundRect(8, 8, 1264, 52, 10);
    context.fill();
    context.strokeStyle = PALETTE.panelBorder;
    context.lineWidth = 2;
    context.stroke();
    context.textAlign = 'left';
    context.fillStyle = PALETTE.text;
    context.font = `900 20px ${FONT}`;
    context.fillText('THE VELVET GALLERY', 24, 33);
    context.font = `700 12px ${FONT}`;
    context.fillStyle = PALETTE.muted;
    context.fillText('mansion art heist', 24, 50);

    // Alarm meter — the heart of the HUD.
    const alarmX = 330;
    const alarmW = 240;
    const alarmRatio = state.thief.alarm / ALARM.max;
    const alarmColour = alarmRatio < 0.45 ? PALETTE.safe : alarmRatio < 0.75 ? PALETTE.amber : PALETTE.danger;
    context.fillStyle = PALETTE.text;
    context.font = `900 14px ${FONT}`;
    context.fillText('ALARM', alarmX, 28);
    context.fillStyle = '#e5dcc8';
    context.beginPath();
    context.roundRect(alarmX + 70, 14, alarmW, 20, 10);
    context.fill();
    context.fillStyle = alarmColour;
    if (alarmRatio > 0.01) {
      context.beginPath();
      context.roundRect(alarmX + 70, 14, Math.max(20, alarmW * alarmRatio), 20, 10);
      context.fill();
    }
    context.strokeStyle = PALETTE.panelBorder;
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(alarmX + 70, 14, alarmW, 20, 10);
    context.stroke();
    context.fillStyle = alarmRatio > 0.75 ? PALETTE.danger : PALETTE.text;
    context.font = `900 13px ${FONT}`;
    context.fillText(`${Math.round(state.thief.alarm)}%`, alarmX + 322, 29);
    context.fillStyle = PALETTE.muted;
    context.font = `700 11px ${FONT}`;
    context.fillText(alarmRatio > 0.75 ? 'RUN! HIDE!' : alarmRatio > 0.45 ? 'they saw something…' : 'unseen', alarmX + 70, 48);

    // Loot, coins, nerves, timer.
    context.textAlign = 'left';
    context.fillStyle = PALETTE.text;
    context.font = `900 16px ${FONT}`;
    const taken = state.loot.filter((item) => item.taken).length;
    context.fillText(`LOOT $${state.score}`, 760, 30);
    context.font = `700 12px ${FONT}`;
    context.fillStyle = PALETTE.muted;
    context.fillText(`${taken}/${state.loot.length} pieces · ${state.coins} coins`, 760, 48);
    context.fillStyle = PALETTE.text;
    context.font = `900 16px ${FONT}`;
    context.fillText('♥'.repeat(state.nerves) + '♡'.repeat(3 - state.nerves), 960, 30);
    context.font = `700 12px ${FONT}`;
    context.fillStyle = PALETTE.muted;
    context.fillText('nerves', 960, 48);
    const minutes = Math.floor(state.time / 60);
    const seconds = Math.floor(state.time % 60);
    context.fillStyle = PALETTE.text;
    context.font = `900 16px ${FONT}`;
    context.textAlign = 'right';
    context.fillText(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, 1256, 30);
    context.font = `700 12px ${FONT}`;
    context.fillStyle = PALETTE.muted;
    context.fillText(state.room.name, 1256, 48);
    context.textAlign = 'left';

    // Objective line under the bar.
    const masterpiece = state.loot.find((item) => item.masterpiece);
    const objective = masterpiece.taken
      ? '★ Masterpiece stolen — reach the GETAWAY GATE!'
      : 'Objective: steal THE GOLDEN MUSE from the VAULT, then escape.';
    context.fillStyle = 'rgba(43, 33, 24, 0.85)';
    context.font = `700 13px ${FONT}`;
    context.fillText(objective, 24, 78);

    // Message toast: low over the garden, so it never covers the vault or the
    // masterpiece the cover frame must show.
    if (state.messageTime > 0) {
      context.fillStyle = 'rgba(255, 251, 240, 0.95)';
      const messageWidth = context.measureText(state.message).width + 28;
      context.beginPath();
      context.roundRect((FIELD.width - messageWidth) / 2, 600, messageWidth, 30, 15);
      context.fill();
      context.strokeStyle = PALETTE.panelBorder;
      context.lineWidth = 1.5;
      context.stroke();
      context.fillStyle = PALETTE.text;
      context.font = `700 14px ${FONT}`;
      context.textAlign = 'center';
      context.fillText(state.message, FIELD.width / 2, 620);
      context.textAlign = 'left';
    }

    // Tool buttons, bottom-left (clickable with the mouse, or keys 1/2/3).
    for (const button of TOOL_BUTTONS) {
      const tool = TOOLS[button.kind];
      const toolState = state.tools[button.kind];
      const cooling = toolState.cooldownLeft > 0;
      const afford = state.coins >= tool.cost;
      context.fillStyle = cooling ? 'rgba(200, 190, 170, 0.9)' : afford ? PALETTE.panel : 'rgba(255, 230, 220, 0.95)';
      context.beginPath();
      context.roundRect(button.x, button.y, button.w, button.h, 8);
      context.fill();
      context.strokeStyle = PALETTE.panelBorder;
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = PALETTE.text;
      context.font = `900 13px ${FONT}`;
      context.fillText(`[${tool.key}] ${tool.name}`, button.x + 10, button.y + 20);
      context.font = `700 11px ${FONT}`;
      context.fillStyle = cooling ? PALETTE.danger : PALETTE.muted;
      context.fillText(
        cooling ? `ready in ${Math.ceil(toolState.cooldownLeft)}s` : `${tool.cost} coins · ${tool.label}`,
        button.x + 10,
        button.y + 40,
      );
    }
    // EMP status chip.
    if (state.tools.emp.timeLeft > 0) {
      context.fillStyle = 'rgba(245, 166, 35, 0.95)';
      context.beginPath();
      context.roundRect(1020, 648, 190, 56, 8);
      context.fill();
      context.fillStyle = '#2b2118';
      context.font = `900 13px ${FONT}`;
      context.fillText('EMP ACTIVE', 1036, 670);
      context.font = `700 11px ${FONT}`;
      context.fillText(`cameras off ${Math.ceil(state.tools.emp.timeLeft)}s`, 1036, 690);
    }
    // Controls hint, in the clear strip below the tool buttons.
    context.fillStyle = 'rgba(43, 33, 24, 0.75)';
    context.font = `700 11px ${FONT}`;
    context.textAlign = 'right';
    context.fillText('WASD / arrows move · click to walk · 1/2/3 tools · P pause', 1264, 716);
    context.textAlign = 'left';

    if (screen === SCREEN_TITLE) drawTitle(state);
    if (screen === SCREEN_PAUSED) drawOverlay('PAUSED', 'Press P or Space to keep sneaking.');
    if (screen === SCREEN_WIN) {
      drawOverlay('CLEAN GETAWAY!', `Loot $${state.score} in ${Math.floor(state.time)}s — the Golden Muse is gone. Press Space to play again.`);
    }
    if (screen === SCREEN_OVER) {
      drawOverlay('CAUGHT FOR GOOD', `The gallery keeps its paintings. Loot $${state.score}. Press Space to try again.`);
    }
  }

  function drawOverlay(title, subtitle) {
    context.fillStyle = 'rgba(43, 33, 24, 0.55)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.panel;
    context.beginPath();
    context.roundRect(340, 250, 600, 180, 14);
    context.fill();
    context.strokeStyle = PALETTE.panelBorder;
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = PALETTE.text;
    context.font = `900 34px ${FONT}`;
    context.textAlign = 'center';
    context.fillText(title, 640, 320);
    context.font = `700 15px ${FONT}`;
    context.fillStyle = PALETTE.muted;
    context.fillText(subtitle, 640, 356);
    context.textAlign = 'left';
  }

  function drawTitle(state) {
    context.fillStyle = 'rgba(43, 33, 24, 0.45)';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    context.fillStyle = PALETTE.panel;
    context.beginPath();
    context.roundRect(290, 170, 700, 330, 16);
    context.fill();
    context.strokeStyle = PALETTE.panelBorder;
    context.lineWidth = 3;
    context.stroke();
    context.textAlign = 'center';
    context.fillStyle = PALETTE.text;
    context.font = `900 44px ${FONT}`;
    context.fillText('THE VELVET GALLERY', 640, 240);
    context.font = `700 17px ${FONT}`;
    context.fillStyle = PALETTE.muted;
    context.fillText('A mansion art heist — sneak past the guards,', 640, 278);
    context.fillText('steal THE GOLDEN MUSE, and reach the getaway gate.', 640, 302);
    context.fillStyle = PALETTE.text;
    context.font = `700 15px ${FONT}`;
    context.fillText('WASD / arrows or click to move  ·  1 grapple  ·  2 smoke  ·  3 EMP', 640, 348);
    context.fillText('Hide in hedges, statues and smoke. Mind the cones and cameras.', 640, 374);
    context.fillStyle = PALETTE.safe;
    context.font = `900 18px ${FONT}`;
    context.fillText('Press SPACE or CLICK to start the heist', 640, 424);
    context.textAlign = 'left';
  }

  function draw(state, screen, best) {
    resize();
    context.setTransform(scale.x, 0, 0, scale.y, 0, 0);
    // Bright base so no frame is ever dark.
    context.fillStyle = '#fdf6e3';
    context.fillRect(0, 0, FIELD.width, FIELD.height);
    drawRoomFloors();
    drawWallsAndDoors();
    drawCover();
    drawLoot(state);
    drawExtraction(state);
    drawGuards(state);
    drawThief(state);
    drawHud(state, screen);
    void best;
  }

  return { draw, resize };
}
