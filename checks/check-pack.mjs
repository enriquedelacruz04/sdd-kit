import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));

// ---- el kit no tiene dependencias: un proyecto que lo instala no hereda nada más
assert.deepEqual(pkg.dependencies ?? {}, {});
assert.deepEqual(pkg.devDependencies ?? {}, {});

// `npm pack --dry-run` dice qué entraría en el paquete sin crearlo. Los arneses corren contra el repo, donde
// todo existe: un archivo que falta en "files" solo se nota en el proyecto que instala el kit.
const [{ files }] = JSON.parse(execSync("npm pack --dry-run --json", { cwd: root, encoding: "utf8" }));
const packed = new Set(files.map((f) => f.path.replace(/\\/g, "/")));

// ---- lo que un proyecto necesita en node_modules: el método que importa su CLAUDE.md, el binario, el código
// y todas las plantillas
const REQUIRED_MISSING = [
  "METHODOLOGY.md",
  "CHANGELOG.md",
  "bin/sdd.js",
  "src/index.js",
  "src/cli.js",
  "src/check-docs.js",
  "src/commands/init.js",
  "src/commands/new.js",
  "src/commands/check.js",
  "templates/CLAUDE.md",
  "templates/AGENTS.md",
  "templates/sdd.config.mjs",
  "templates/docs/README.md",
  "templates/docs/architecture/notes.md",
  "templates/initiative/roadmap.md",
  "templates/initiative/checklists.md",
  "templates/initiative/notes.md",
].filter((file) => !packed.has(file));
// Se juntan todos antes de fallar: de uno en uno, un "files" mal escrito se arregla en tantas corridas como archivos.
assert.deepEqual(REQUIRED_MISSING, [], `el paquete no lleva ${REQUIRED_MISSING.join(", ")}`);

// ---- lo que es del repo del kit no viaja: sus arneses y su documentación no son del proyecto que lo instala
for (const file of packed)
  assert.ok(!/^(checks|docs)\//.test(file) && file !== "CLAUDE.md", `el paquete lleva ${file}, que es del repo`);

// ---- el binario y la entrada que declara el package.json existen
assert.ok(packed.has(pkg.bin.sddkit));
assert.ok(packed.has(pkg.exports["."].replace(/^\.\//, "")));

console.log("OK pack");
