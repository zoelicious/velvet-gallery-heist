// A tiny seeded random generator (mulberry32) so a ?seed=N run of the game always
// plays the same way: screenshots staged from a seed are reproducible frame for frame.

export function createRandom(seed) {
  let value = seed >>> 0;
  return function next() {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random number in [min, max) from a seeded generator. */
export function range(random, min, max) {
  return min + random() * (max - min);
}

/** Pick one entry of an array with a seeded generator. */
export function pick(random, list) {
  return list[Math.floor(random() * list.length)];
}
