import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { realIo, virtualIo } from "../src/io.js";

const FILES = {
  "CLAUDE.md": "raíz",
  "docs/README.md": "índice",
  "docs/billing/roadmap.md": "roadmap",
  "docs/billing/assets/foto.png": "",
  "docs/superpowers/specs/a-design.md": "spec",
};

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-kit-io-"));
for (const [file, text] of Object.entries(FILES)) {
  fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
  fs.writeFileSync(path.join(dir, file), text);
}

// Los arneses del vigilante corren sobre virtualIo y el comando real sobre realIo: si los dos no responden
// igual, un caso puede pasar en el arnés y fallar en un proyecto. Cada pregunta se hace a los dos.
for (const io of [realIo(dir), virtualIo(FILES)]) {
  assert.equal(io.read("docs/README.md"), "índice");
  assert.equal(io.exists("docs/README.md"), true);
  assert.equal(io.exists("docs/nada.md"), false);

  // ---- el descubrimiento de iniciativas distingue carpetas de archivos sueltos
  assert.equal(io.isDir("docs/billing"), true);
  assert.equal(io.isDir("docs/README.md"), false);
  assert.equal(io.isDir("docs/nada"), false);

  // ---- una carpeta aparece por su nombre, no por sus archivos, y el orden es estable
  assert.deepEqual(io.list("docs"), ["README.md", "billing", "superpowers"]);
  assert.deepEqual(io.list("docs/billing"), ["assets", "roadmap.md"]);
  assert.deepEqual(io.list("docs/nada"), []);

  // ---- walk solo devuelve .md y salta las carpetas pedidas a cualquier profundidad
  assert.deepEqual(io.walk("docs", ["superpowers"]).sort(), ["docs/README.md", "docs/billing/roadmap.md"]);
  assert.deepEqual(io.walk("docs", []).sort(), [
    "docs/README.md",
    "docs/billing/roadmap.md",
    "docs/superpowers/specs/a-design.md",
  ]);

  // ---- una carpeta existe, igual que un archivo: si los dos accesos discrepan aquí, un caso del arnés y un
  // proyecto real dan respuestas distintas a la misma pregunta
  assert.equal(io.exists("docs/billing"), true);

  // ---- walk funciona también separado de su objeto: quien lo desestructura no tiene por qué saber cómo recursa
  const { walk } = io;
  assert.deepEqual(walk("docs", ["superpowers"]).sort(), ["docs/README.md", "docs/billing/roadmap.md"]);
}

fs.rmSync(dir, { recursive: true, force: true });
console.log("OK io");
