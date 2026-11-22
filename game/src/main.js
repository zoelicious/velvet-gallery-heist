// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer
// paints what is there. The game moves between five screens: title, play, paused,
// win and game over. Clicking a HUD tool button fires that tool; clicking the
// canvas walks the thief there.
//
// ?seed=N fixes the patrol timing. ?shot=cover|route|tools|getaway (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_CAUGHT, EVENT_OVER, EVENT_WIN } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_TOOL_EMP, ACTION_TOOL_GRAPPLE, ACTION_TOOL_SMOKE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, TOOL_BUTTONS } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best loot then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  /** Click-to-move target in field pixels, or null. */
  let walkTarget = null;

  // Screen readers (and anyone watching the page's text) hear the screen changes and each catch.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    walkTarget = null;
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Steal the Golden Muse, then reach the getaway gate.');
  }

  function endGame(won) {
    screen = won ? SCREEN_WIN : SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(won
      ? `Clean getaway. Loot ${world.state.score}. Best ${best}.`
      : `Caught for good. Loot ${world.state.score}. Best ${best}.`);
  }

  /** Which tool, if any, a click point on a HUD button names. */
  function toolAt(point) {
    for (const button of TOOL_BUTTONS) {
      if (point.x >= button.x && point.x <= button.x + button.w && point.y >= button.y && point.y <= button.y + button.h) {
        return button.kind;
      }
    }
    return null;
  }

  function handleActions() {
    const actions = input.takeActions();
    const click = input.takeClickTarget();
    if (click && screen === SCREEN_PLAY) {
      const tool = toolAt(click);
      if (tool) {
        const kind = tool === 'grapple' ? ACTION_TOOL_GRAPPLE : tool === 'smoke' ? ACTION_TOOL_SMOKE : ACTION_TOOL_EMP;
        handleTool(kind);
      } else {
        walkTarget = click;
      }
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WIN)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
    if (actions & ACTION_TOOL_GRAPPLE) handleTool(ACTION_TOOL_GRAPPLE);
    if (actions & ACTION_TOOL_SMOKE) handleTool(ACTION_TOOL_SMOKE);
    if (actions & ACTION_TOOL_EMP) handleTool(ACTION_TOOL_EMP);
  }

  /** Fire one tool right now, outside the fixed-step world update. */
  function handleTool(action) {
    if (screen !== SCREEN_PLAY) return;
    const kind = action === ACTION_TOOL_GRAPPLE ? 'grapple' : action === ACTION_TOOL_SMOKE ? 'smoke' : 'emp';
    world.step(0, { x: 0, y: 0 }, kind);
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, { x: 0, y: 0 }, null);
      return;
    }
    const direction = input.keyDirection();
    let move = { x: 0, y: 0 };
    if (direction) {
      move = direction;
      walkTarget = null;
    } else if (walkTarget) {
      const dx = walkTarget.x - world.state.thief.x;
      const dy = walkTarget.y - world.state.thief.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 10) {
        walkTarget = null;
        input.clearClickTarget();
      } else {
        move = { x: dx / distance, y: dy / distance };
      }
    }
    const events = world.step(STEP, move, null);
    if (events & EVENT_WIN) endGame(true);
    else if (events & EVENT_OVER) endGame(false);
    else if (events & EVENT_CAUGHT) announce(`Caught. ${world.state.nerves} nerves left.`);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  // Leaving the tab pauses a running game rather than letting guards close in unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('The Velvet Gallery. Press Space or click to start the heist.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
