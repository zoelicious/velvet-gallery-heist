// The Velvet Gallery — a mansion art heist for best-heist-game-20261122-0559.
// Entry name: "The Velvet Gallery". The entry's program: it copies game/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the judge reads, with the
// vendored make.fun library. The game itself is plain static files a desktop
// browser loads offline (game/index.html and its ES modules, no library and no
// network request), so there is no build step to run.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root, from this file's own URL: never the process working
// directory and never a relative path, so the program writes the same bytes
// wherever it is run from.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  }

  // The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
  // bytes; the others refuse an entry the scorer would refuse (more than 4
  // screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
  // game files, in all, or a path under game/ over 1000 bytes: game/ counts
  // beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
  // The dossier is written from the copied game/, never from the working tree,
  // so the checked output is exactly what the grader will see.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
