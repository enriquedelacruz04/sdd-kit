import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { main } from "../src/cli.js";

const BIN = fileURLToPath(new URL("../bin/sdd.js", import.meta.url));
const dirs = [];
function project() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-kit-cli-"));
  dirs.push(dir);
  fs.writeFileSync(path.join(dir, "package.json"), '{ "name": "pilot" }\n');
  return dir;
}
async function run(dir, ...argv) {
  const out = { cwd: dir, logs: [], errors: [] };
  const code = await main(argv, { cwd: dir, log: (m) => out.logs.push(m), error: (m) => out.errors.push(m) });
  return { code, ...out };
}

// ---- el camino entero por la CLI: sembrar, crear una iniciativa y verificar, sin editar nada a mano
const dir = project();
assert.equal((await run(dir, "init")).code, 0);
assert.equal((await run(dir, "new", "billing")).code, 0);
{
  const ok = await run(dir, "check");
  assert.equal(ok.code, 0);
  assert.deepEqual(ok.logs, ["OK docs"]);
  assert.deepEqual(ok.errors, []);
}

// ---- un defecto sale por el canal de errores, uno por línea, y el código de salida detiene a quien encadena
// comandos
{
  const roadmap = path.join(dir, "docs/billing/roadmap.md");
  const text = fs.readFileSync(roadmap, "utf8");
  fs.writeFileSync(roadmap, text.replace("| 🟣 Designed |", "| 🟠 Built |"));
  const bad = await run(dir, "check");
  assert.equal(bad.code, 1);
  assert.ok(bad.errors.some((e) => /dice Built en el índice/.test(e)));
  assert.ok(!bad.logs.includes("OK docs"));
  fs.writeFileSync(roadmap, text);
}

// ---- la configuración del proyecto llega al vigilante: una carpeta ajena falla hasta que se declara
{
  fs.mkdirSync(path.join(dir, "docs/research"));
  fs.writeFileSync(path.join(dir, "docs/research/apuntes.md"), "Texto suelto.\n");
  const bad = await run(dir, "check");
  assert.equal(bad.code, 1);
  assert.ok(bad.errors.some((e) => /docs\/research no es una iniciativa/.test(e)));
  fs.writeFileSync(path.join(dir, "sdd.config.mjs"), 'export default { ignore: ["research"] };\n');
  assert.equal((await run(dir, "check")).code, 0);
}

// ---- una configuración mal escrita da una línea que nombra el archivo y la clave, no un stack
for (const [source, pattern] of [
  ['export default { ignor: ["research"] };\n', /sdd\.config\.mjs: clave desconocida "ignor"/],
  ['export default { ignore: "research" };\n', /sdd\.config\.mjs: "ignore" debe ser una lista de textos/],
  ["export default {\n", /^sdd\.config\.mjs: /],
]) {
  const broken = project();
  await run(broken, "init");
  fs.writeFileSync(path.join(broken, "sdd.config.mjs"), source);
  const bad = await run(broken, "check");
  assert.equal(bad.code, 1);
  assert.equal(bad.errors.length, 1);
  assert.match(bad.errors[0], pattern);
  assert.ok(!bad.errors[0].includes("\n    at "), "el mensaje trae un stack");
}

// ---- fuera de un proyecto sembrado, check dice qué correr
{
  const empty = project();
  const bad = await run(empty, "check");
  assert.equal(bad.code, 1);
  assert.ok(bad.errors.some((e) => /sddkit init/.test(e)));
}

// ---- sin comando, o con uno que no existe, se imprime el uso y se sale con error: un typo en un script de
// package.json no puede pasar por verde
for (const argv of [[], ["chek"], ["--help"]]) {
  const out = await run(dir, ...argv);
  assert.equal(out.code, 1, `"${argv.join(" ")}" salió con 0`);
  assert.ok(
    out.errors.some((e) => /sddkit init/.test(e) && /sddkit new <initiative>/.test(e) && /sddkit check/.test(e)),
    `"${argv.join(" ")}" no imprime el uso`,
  );
}
// El comando desconocido se nombra, para que el typo se vea.
assert.ok((await run(dir, "chek")).errors.some((e) => e.includes('"chek"')));

// ---- el binario de verdad: el arnés de arriba llama a main() y no ve un bin que no arranca o que no
// traslada el código de salida
{
  const ok = spawnSync(process.execPath, [BIN, "check"], { cwd: dir, encoding: "utf8" });
  assert.equal(ok.status, 0);
  assert.equal(ok.stdout.trim(), "OK docs");
  const bad = spawnSync(process.execPath, [BIN, "chek"], { cwd: dir, encoding: "utf8" });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /sddkit new <initiative>/);
}

for (const d of dirs) fs.rmSync(d, { recursive: true, force: true });
console.log("OK cli");
