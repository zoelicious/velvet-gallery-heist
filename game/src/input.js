// Keyboard and mouse input, read as named actions. Movement is WASD or the arrow
// keys; the mouse steers too (click a spot on the canvas to walk there), and the
// tool buttons on the HUD are clickable. 1 / 2 / 3 fire the three tools.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_TOOL_GRAPPLE = 4;
export const ACTION_TOOL_SMOKE = 8;
export const ACTION_TOOL_EMP = 16;

const KEY_ACTIONS = {
  Space: ACTION_CONFIRM,
  Enter: ACTION_CONFIRM,
  KeyP: ACTION_PAUSE,
  Escape: ACTION_PAUSE,
  Digit1: ACTION_TOOL_GRAPPLE,
  Digit2: ACTION_TOOL_SMOKE,
  Digit3: ACTION_TOOL_EMP,
  Numpad1: ACTION_TOOL_GRAPPLE,
  Numpad2: ACTION_TOOL_SMOKE,
  Numpad3: ACTION_TOOL_EMP,
};

export function createInput(canvas) {
  const keys = new Set();
  let actions = 0;
  /** Canvas point the player clicked to walk toward, in logical field pixels. */
  let clickTarget = null;
  let clickDirty = false;

  function onKeyDown(event) {
    if (event.repeat) return;
    keys.add(event.code);
    const action = KEY_ACTIONS[event.code];
    if (action !== undefined) {
      actions |= action;
      event.preventDefault();
    }
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown' || event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      event.preventDefault();
    }
  }

  function onKeyUp(event) {
    keys.delete(event.code);
  }

  function toField(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 1280,
      y: ((clientY - rect.top) / rect.height) * 720,
    };
  }

  function onPointerDown(event) {
    const point = toField(event.clientX, event.clientY);
    clickTarget = point;
    clickDirty = true;
    // A click on a HUD tool button is handled by the world through the same point.
    canvas.setPointerCapture?.(event.pointerId);
  }

  function onBlur() {
    keys.clear();
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', onPointerDown);

  function down(...codes) {
    return codes.some((code) => keys.has(code));
  }

  return {
    /** Normalised movement direction from the keys, or null when no key is held. */
    keyDirection() {
      let x = 0;
      let y = 0;
      if (down('KeyA', 'ArrowLeft')) x -= 1;
      if (down('KeyD', 'ArrowRight')) x += 1;
      if (down('KeyW', 'ArrowUp')) y -= 1;
      if (down('KeyS', 'ArrowDown')) y += 1;
      if (x === 0 && y === 0) return null;
      const length = Math.hypot(x, y);
      return { x: x / length, y: y / length };
    },
    /** The latest click-to-move target, or null. Consumed once read. */
    takeClickTarget() {
      if (!clickDirty) return null;
      clickDirty = false;
      return clickTarget;
    },
    /** Clear a click target (for example once the thief arrives). */
    clearClickTarget() {
      clickTarget = null;
      clickDirty = false;
    },
    /** Bitmask of actions pressed since the last read; reading clears it. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    peekActions() {
      return actions;
    },
  };
}
