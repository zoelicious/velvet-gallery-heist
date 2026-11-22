// Every tuning number and colour in one place. The playfield is a fixed 1280x720
// logical area; the renderer scales it to the window, so no rule below depends on
// the screen size. Bright, high-contrast palette: safe is teal/green, danger is
// red/amber, loot is gold — readable when the frame is shrunk to 768x480.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

export const PLAYER = {
  radius: 14,
  speed: 235,
  /** Seconds of grace after being caught before the thief can be spotted again. */
  grace: 2.0,
};

export const NERVES = 3;

export const GUARD = {
  radius: 14,
  patrolSpeed: 72,
  chaseSpeed: 118,
  /** Vision cone: how far a guard can see, in pixels. */
  coneRange: 235,
  /** Vision cone half-angle, in radians. */
  coneHalfAngle: 0.52,
  /** Alarm points per second while this guard has the thief in its cone. */
  alarmRate: 55,
};

export const CAMERA = {
  coneRange: 215,
  coneHalfAngle: 0.44,
  /** Degrees per second the camera sweeps back and forth. */
  sweepSpeed: 42,
  /** Alarm points per second while a camera has the thief in its arc. */
  alarmRate: 34,
};

export const ALARM = {
  max: 100,
  /** Alarm points per second lost while hidden and out of every cone. */
  decayHidden: 14,
  /** Alarm points per second lost while hidden inside cover. */
  decayCover: 30,
  /** Alarm above this makes guards hurry toward the thief. */
  alertAt: 60,
  /** Alarm the meter resets to after being caught. */
  afterCaught: 40,
};

export const TOOLS = {
  grapple: { key: '1', name: 'GRAPPLE', cost: 10, cooldown: 6, label: 'rope' },
  smoke: { key: '2', name: 'SMOKE', cost: 15, cooldown: 10, duration: 4, radius: 95, label: 'smoke cloud' },
  emp: { key: '3', name: 'EMP', cost: 15, cooldown: 12, duration: 6, label: 'cams off 6s' },
};

/** Coins the thief starts with; tools are bought with these, loot adds more. */
export const START_COINS = 40;

/** Loot value of the masterpiece; the getaway only counts once it is stolen. */
export const MASTERPIECE_VALUE = 500;

export const PALETTE = {
  // Bright mansion interior: warm cream floors, pale walls, never dark.
  lawn: '#8fce6e',
  lawnDark: '#79bd5c',
  path: '#e8d9a8',
  floorParquet: '#f2dfae',
  floorMarble: '#f7efdc',
  floorStudy: '#e9d3a7',
  floorBallroom: '#f6e3c2',
  floorVault: '#f9ecc8',
  wall: '#7a5c3e',
  wallTop: '#a97e52',
  door: '#c9a86a',
  window: '#bfe6ff',
  statue: '#e8e2d4',
  hedge: '#4da34a',
  plant: '#57b25a',
  // People and danger.
  thief: '#12b5a5',
  thiefDark: '#0a8a7d',
  guard: '#d94f3d',
  guardDark: '#a83424',
  cone: 'rgba(255, 84, 48, 0.30)',
  coneEdge: 'rgba(255, 84, 48, 0.85)',
  camCone: 'rgba(255, 170, 0, 0.30)',
  camConeEdge: 'rgba(255, 170, 0, 0.9)',
  cameraBody: '#3a3f4a',
  // Loot and UI.
  loot: '#f7b500',
  lootGlow: 'rgba(247, 181, 0, 0.35)',
  gold: '#ffd94a',
  safe: '#1fae7a',
  danger: '#e5484d',
  amber: '#f5a623',
  panel: 'rgba(255, 251, 240, 0.94)',
  panelBorder: '#7a5c3e',
  text: '#2b2118',
  muted: '#6b5a44',
  white: '#fffdf6',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best loot total is kept between visits (this browser only). */
export const BEST_KEY = 'velvet-gallery.best';
