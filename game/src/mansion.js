// The Velvet Gallery mansion: one building, many rooms, three ways in.
// Layout (1280x720, bright top-down floor plan):
//   West Wing | VAULT (masterpiece) | East Wing        y 70..180
//   Study     | GALLERY HALL        | Ballroom          y 180..440
//   Sunroom   | FOYER               | Library           y 440..560
//   GARDEN with hedges, fountain and the getaway gate  y 560..720
// Three routes to the masterpiece: the front door through the foyer, the west
// window (grapple in from the garden) into the study, or the east window into
// the ballroom. Every room has at least two doors so no route is a dead end.

export const MANSION = { x: 80, y: 70, width: 1120, height: 490 };
export const GARDEN_TOP = 560;

export const ROOMS = [
  { id: 'westwing', name: 'WEST WING', x: 80, y: 70, w: 440, h: 110, floor: 'floorMarble', spawn: { x: 300, y: 125 } },
  { id: 'vault', name: 'VAULT', x: 520, y: 70, w: 240, h: 110, floor: 'floorVault', spawn: { x: 640, y: 125 } },
  { id: 'eastwing', name: 'EAST WING', x: 760, y: 70, w: 440, h: 110, floor: 'floorMarble', spawn: { x: 980, y: 125 } },
  { id: 'study', name: 'STUDY', x: 80, y: 180, w: 300, h: 260, floor: 'floorStudy', spawn: { x: 230, y: 310 } },
  { id: 'gallery', name: 'GALLERY HALL', x: 380, y: 180, w: 520, h: 260, floor: 'floorParquet', spawn: { x: 640, y: 310 } },
  { id: 'ballroom', name: 'BALLROOM', x: 900, y: 180, w: 300, h: 260, floor: 'floorBallroom', spawn: { x: 1050, y: 310 } },
  { id: 'sunroom', name: 'SUNROOM', x: 80, y: 440, w: 440, h: 120, floor: 'floorMarble', spawn: { x: 300, y: 500 } },
  { id: 'foyer', name: 'FOYER', x: 520, y: 440, w: 240, h: 120, floor: 'floorMarble', spawn: { x: 640, y: 500 } },
  { id: 'library', name: 'LIBRARY', x: 760, y: 440, w: 440, h: 120, floor: 'floorMarble', spawn: { x: 980, y: 500 } },
  { id: 'garden', name: 'GARDEN', x: 0, y: 560, w: 1280, h: 160, floor: 'lawn', spawn: { x: 640, y: 660 } },
];

/** Solid walls, as {x, y, w, h}. Door gaps are simply missing segments. */
export const WALLS = [
  // Outer shell: top, left, right, bottom (bottom has the foyer door gap).
  { x: 80, y: 70, w: 1120, h: 12 },
  { x: 80, y: 70, w: 12, h: 490 },
  { x: 1188, y: 70, w: 12, h: 490 },
  { x: 80, y: 548, w: 530, h: 12 },
  { x: 670, y: 548, w: 530, h: 12 },
  // y=180 divider: west wing / study, vault / gallery, east wing / ballroom.
  { x: 80, y: 180, w: 180, h: 12 },
  { x: 320, y: 180, w: 200, h: 12 },
  { x: 520, y: 180, w: 90, h: 12 },
  { x: 670, y: 180, w: 90, h: 12 },
  { x: 760, y: 180, w: 200, h: 12 },
  { x: 1020, y: 180, w: 180, h: 12 },
  // Vault side walls.
  { x: 520, y: 70, w: 12, h: 110 },
  { x: 748, y: 70, w: 12, h: 110 },
  // Study / gallery divider (x=380) with a door gap.
  { x: 380, y: 180, w: 12, h: 110 },
  { x: 380, y: 350, w: 12, h: 90 },
  // Gallery / ballroom divider (x=900) with a door gap.
  { x: 900, y: 180, w: 12, h: 110 },
  { x: 900, y: 350, w: 12, h: 90 },
  // y=440 divider: sunroom / study, foyer / gallery, library / ballroom.
  { x: 80, y: 440, w: 120, h: 12 },
  { x: 260, y: 440, w: 260, h: 12 },
  { x: 520, y: 440, w: 80, h: 12 },
  { x: 680, y: 440, w: 80, h: 12 },
  { x: 760, y: 440, w: 200, h: 12 },
  { x: 1020, y: 440, w: 180, h: 12 },
  // Foyer side walls (x=520, x=760) with door gaps to sunroom / library.
  { x: 520, y: 440, w: 12, h: 40 },
  { x: 520, y: 520, w: 12, h: 40 },
  { x: 748, y: 440, w: 12, h: 40 },
  { x: 748, y: 520, w: 12, h: 40 },
];

/** Doorways, drawn as floor gaps in the walls (for the renderer only). */
export const DOORS = [
  { x: 610, y: 548, w: 60, h: 12, label: 'FRONT DOOR' },
  { x: 610, y: 180, w: 60, h: 12, label: 'VAULT DOOR' },
  { x: 260, y: 180, w: 60, h: 12 },
  { x: 960, y: 180, w: 60, h: 12 },
  { x: 380, y: 290, w: 12, h: 60 },
  { x: 900, y: 290, w: 12, h: 60 },
  { x: 200, y: 440, w: 60, h: 12 },
  { x: 600, y: 440, w: 80, h: 12 },
  { x: 960, y: 440, w: 60, h: 12 },
  { x: 520, y: 480, w: 12, h: 40 },
  { x: 748, y: 480, w: 12, h: 40 },
];

/** Windows the grappling hook can use: zip from the garden side to the inside. */
export const WINDOWS = [
  { id: 'west-window', x: 86, y: 320, outside: { x: 52, y: 320 }, inside: { x: 150, y: 320 }, label: 'WEST WINDOW' },
  { id: 'east-window', x: 1194, y: 320, outside: { x: 1228, y: 320 }, inside: { x: 1130, y: 320 }, label: 'EAST WINDOW' },
];

/** Loot: paintings and the masterpiece. `masterpiece` must be stolen to win. */
export const LOOT = [
  { id: 'muse', name: 'THE GOLDEN MUSE', x: 640, y: 108, value: 500, masterpiece: true },
  { id: 'sunset', name: 'Sunset over the Lake', x: 200, y: 240, value: 150 },
  { id: 'duchess', name: 'Portrait of the Duchess', x: 500, y: 210, value: 150 },
  { id: 'harbour', name: 'Harbour at Dawn', x: 820, y: 400, value: 150 },
  { id: 'dancers', name: 'The Two Dancers', x: 1050, y: 230, value: 150 },
  { id: 'vase', name: 'Golden Vase', x: 1000, y: 500, value: 120 },
  { id: 'orchid', name: 'Orchid Still Life', x: 200, y: 500, value: 120 },
  { id: 'captain', name: 'The Old Captain', x: 300, y: 100, value: 120 },
  { id: 'violin', name: 'Violin in Blue', x: 950, y: 100, value: 120 },
];

/**
 * Cover: statues, curtains, hedges, shelves and sofas. Standing inside cover hides
 * the thief from every guard and camera, and the alarm falls fastest there.
 * {x, y, w, h, kind} — kind picks the drawing (statue, hedge, curtain, shelf, sofa, plant).
 */
export const COVER = [
  { x: 460, y: 290, w: 44, h: 44, kind: 'statue' },
  { x: 800, y: 340, w: 44, h: 44, kind: 'statue' },
  { x: 640, y: 196, w: 120, h: 18, kind: 'curtain' },
  { x: 420, y: 420, w: 90, h: 16, kind: 'curtain' },
  { x: 180, y: 600, w: 150, h: 34, kind: 'hedge' },
  { x: 950, y: 600, w: 150, h: 34, kind: 'hedge' },
  { x: 430, y: 640, w: 130, h: 34, kind: 'hedge' },
  { x: 760, y: 660, w: 130, h: 34, kind: 'hedge' },
  { x: 950, y: 250, w: 70, h: 26, kind: 'sofa' },
  { x: 1100, y: 460, w: 90, h: 24, kind: 'shelf' },
  { x: 110, y: 460, w: 90, h: 24, kind: 'shelf' },
  { x: 150, y: 340, w: 30, h: 30, kind: 'plant' },
  { x: 1120, y: 340, w: 30, h: 30, kind: 'plant' },
  { x: 60, y: 600, w: 40, h: 40, kind: 'fountain' },
];

/** Guard patrol routes: named loops of waypoints through the rooms. */
export const GUARD_ROUTES = [
  { name: 'HALL', waypoints: [{ x: 460, y: 230 }, { x: 830, y: 230 }, { x: 830, y: 400 }, { x: 460, y: 400 }] },
  { name: 'GARDEN', waypoints: [{ x: 250, y: 650 }, { x: 1000, y: 650 }, { x: 1000, y: 690 }, { x: 250, y: 690 }] },
  { name: 'STUDY', waypoints: [{ x: 150, y: 230 }, { x: 330, y: 230 }, { x: 330, y: 400 }, { x: 150, y: 400 }] },
  { name: 'BALLROOM', waypoints: [{ x: 950, y: 230 }, { x: 1150, y: 230 }, { x: 1150, y: 400 }, { x: 950, y: 400 }] },
];

/** Wall cameras: fixed mounts that sweep an arc back and forth. */
export const CAMERAS = [
  { id: 'cam-hall', x: 880, y: 196, baseAngle: Math.PI / 2, sweep: 0.85, phase: 0 },
  { id: 'cam-foyer', x: 740, y: 452, baseAngle: Math.PI / 2, sweep: 0.8, phase: 1.6 },
];

/** The getaway: the garden gate at the bottom-left, where the van waits. */
export const EXTRACTION = { x: 40, y: 690, w: 120, h: 30, label: 'GETAWAY GATE' };

/** Where the thief starts: the garden path, south of the front door. */
export const THIEF_START = { x: 640, y: 665 };

/** Find the room containing a point (garden is the fallback). */
export function roomAt(x, y) {
  for (const room of ROOMS) {
    if (x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h) return room;
  }
  return ROOMS[ROOMS.length - 1];
}

/** True when a point is inside any cover rectangle. */
export function inCover(x, y) {
  for (const spot of COVER) {
    if (x >= spot.x && x <= spot.x + spot.w && y >= spot.y && y <= spot.y + spot.h) return true;
  }
  return false;
}

/** True when a circle of radius r at (x, y) overlaps any wall. */
export function hitsWall(x, y, r) {
  for (const wall of WALLS) {
    const nearestX = Math.max(wall.x, Math.min(x, wall.x + wall.w));
    const nearestY = Math.max(wall.y, Math.min(y, wall.y + wall.h));
    const dx = x - nearestX;
    const dy = y - nearestY;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
}

/**
 * True when the segment (x1,y1)-(x2,y2) is blocked by a wall. Sampled every 6 px:
 * cheap, and exact enough for a vision cone at this scale.
 */
export function sightBlocked(x1, y1, x2, y2) {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.ceil(distance / 6));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    for (const wall of WALLS) {
      if (x >= wall.x && x <= wall.x + wall.w && y >= wall.y && y <= wall.y + wall.h) return true;
    }
  }
  return false;
}
