import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { checkDocs } from "../src/check-docs.js";
import { init } from "../src/commands/init.js";
import { newInitiative } from "../src/commands/new.js";
import { DEFAULTS } from "../src/config.js";
import { realIo } from "../src/io.js";

const dirs = [];
function project(pkg = { name: "pilot" }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-kit-templates-"));
  dirs.push(dir);
  if (pkg) fs.writeFileSync(path.join(dir, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
  return dir;
}
function ctx(cwd) {
  const out = { cwd, logs: [], errors: [] };
  out.log = (m) => out.logs.push(m);
  out.error = (m) => out.errors.push(m);
  return out;
}
const read = (dir, file) => fs.readFileSync(path.join(dir, file), "utf8");
const snapshot = (dir) =>
  Object.fromEntries(
    fs
      .readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => path.join(e.parentPath ?? e.path, e.name))
      .sort()
      .map((file) => [path.relative(dir, file), fs.readFileSync(file, "utf8")]),
  );
const check = (dir) => checkDocs(realIo(dir), DEFAULTS);

// La línea que carga el método en cada proyecto. Se escribe aquí y no se lee de la plantilla: es lo que la fija.
const IMPORT_LINE = "@node_modules/@enriquedelacruz04/sdd-kit/METHODOLOGY.md";
const SEEDED = ["CLAUDE.md", "AGENTS.md", "sdd.config.mjs", "docs/README.md", "docs/architecture/notes.md"];

// ---- lo que siembra `sddkit init` cumple el molde sin tocar nada: si no, el primer `sddkit check` de un proyecto
// nuevo falla y nadie sabe si el defecto es suyo o del kit
{
  const dir = project();
  assert.equal(init(ctx(dir)), 0);
  for (const file of SEEDED) assert.ok(fs.existsSync(path.join(dir, file)), `falta ${file}`);
  assert.deepEqual(check(dir), []);
  assert.ok(read(dir, "CLAUDE.md").split(/\r?\n/).includes(IMPORT_LINE), "el CLAUDE.md sembrado no importa el método");
  assert.equal(JSON.parse(read(dir, "package.json")).scripts["check:docs"], "sddkit check");

  // ---- correr init dos veces no cambia nada: quien lo repite por error no pierde lo que ya escribió
  const before = snapshot(dir);
  const second = ctx(dir);
  assert.equal(init(second), 0);
  assert.deepEqual(snapshot(dir), before);
  assert.ok(
    second.logs.some((l) => /^  exists /.test(l) && l.includes("CLAUDE.md")),
    "init no avisa de lo que saltó",
  );

  // ---- lo que crea `sddkit new` también cumple el molde, y una segunda iniciativa no rompe a la primera
  assert.equal(newInitiative("billing-reports", ctx(dir)), 0);
  for (const file of ["roadmap.md", "checklists.md", "notes.md"])
    assert.ok(fs.existsSync(path.join(dir, "docs/initiatives/billing-reports", file)), `falta ${file}`);
  assert.deepEqual(check(dir), []);
  assert.equal(newInitiative("onboarding", ctx(dir)), 0);
  assert.deepEqual(check(dir), []);

  // ---- la iniciativa entra al índice, antes de las carpetas de superpowers, que cierran la lista
  const lines = read(dir, "docs/README.md").split(/\r?\n/);
  const at = (needle) => lines.findIndex((l) => l.startsWith(needle));
  assert.ok(at("- `initiatives/billing-reports/`") >= 0, "la iniciativa no está en docs/README.md");
  assert.ok(at("- `initiatives/billing-reports/`") < at("- `superpowers/"), "la iniciativa quedó después de superpowers");

  // ---- el título sale del nombre, para que el archivo no nazca con un marcador sin sustituir
  assert.ok(read(dir, "docs/initiatives/billing-reports/roadmap.md").startsWith("# Billing reports — roadmap"));
  for (const file of ["roadmap.md", "checklists.md", "notes.md"])
    assert.ok(!read(dir, `docs/initiatives/billing-reports/${file}`).includes("{{"), `${file} conserva un marcador`);

  // ---- un nombre que no es kebab minúscula rompería las citas, uno reservado chocaría con el molde y uno
  // repetido pisaría una iniciativa viva: los tres se rechazan sin crear nada
  const before2 = snapshot(dir);
  for (const bad of ["Billing", "billing_reports", "-billing", "billing-", "architecture", "initiatives", "superpowers", "onboarding"]) {
    const c = ctx(dir);
    assert.equal(newInitiative(bad, c), 1, `aceptó "${bad}"`);
    assert.equal(c.errors.length, 1, `"${bad}" no dio un único mensaje`);
  }
  // Sin nombre, el mensaje dice cómo se usa el comando.
  const noName = ctx(dir);
  assert.equal(newInitiative(undefined, noName), 1);
  assert.match(noName.errors[0], /sddkit new <initiative>/);
  assert.deepEqual(snapshot(dir), before2);
}

// ---- un CLAUDE.md que ya existía es del proyecto: init no lo pisa, y lo demás sí se siembra
{
  const dir = project();
  fs.writeFileSync(path.join(dir, "CLAUDE.md"), "# Lo mío\n");
  assert.equal(init(ctx(dir)), 0);
  assert.equal(read(dir, "CLAUDE.md"), "# Lo mío\n");
  assert.ok(fs.existsSync(path.join(dir, "docs/README.md")));
}

// ---- un script check:docs que el proyecto ya definió a su manera se respeta, junto con sus otros scripts
{
  const dir = project({ name: "pilot", scripts: { test: "vitest", "check:docs": "node tools/docs.js" } });
  assert.equal(init(ctx(dir)), 0);
  assert.deepEqual(JSON.parse(read(dir, "package.json")).scripts, {
    test: "vitest",
    "check:docs": "node tools/docs.js",
  });
}

// ---- el package.json es del usuario: añadir un script es un cambio de una línea, y no debe volverse un diff de
// todo el archivo por cambiar su final de línea, su sangría o su salto final
function rawPackage(text) {
  const dir = project(null);
  fs.writeFileSync(path.join(dir, "package.json"), text);
  assert.equal(init(ctx(dir)), 0);
  const after = read(dir, "package.json");
  // Todo lo que había sigue igual: solo se añade el script.
  const before = JSON.parse(text);
  const kept = JSON.parse(after);
  assert.equal(kept.scripts["check:docs"], "sddkit check");
  delete kept.scripts["check:docs"];
  if (Object.keys(kept.scripts).length === 0 && !before.scripts) delete kept.scripts;
  assert.deepEqual(kept, before);
  return after;
}
{
  const text = rawPackage('{\r\n  "name": "pilot",\r\n  "version": "1.0.0"\r\n}\r\n');
  assert.ok(!/(?<!\r)\n/.test(text), "quedó un LF suelto en un package.json con CRLF");
  assert.ok(text.endsWith("\r\n"), "se perdió el salto final CRLF");
}
{
  const text = rawPackage('{\n\t"name": "pilot",\n\t"version": "1.0.0"\n}\n');
  const lines = text.split("\n");
  assert.ok(lines.includes('\t"scripts": {'), "se perdió la sangría con tabuladores");
  assert.ok(lines.includes('\t\t"check:docs": "sddkit check"'), "el script no quedó con dos tabuladores");
}
{
  const text = rawPackage('{\n    "name": "pilot",\n    "version": "1.0.0"\n}');
  assert.ok(text.split("\n").includes('    "scripts": {'), "se perdió la sangría de 4 espacios");
  assert.ok(!text.endsWith("\n"), "se añadió un salto final que no había");
}

// ---- un package.json con BOM (lo guardan así algunos editores de Windows) se lee igual, y el BOM se conserva
{
  const dir = project(null);
  fs.writeFileSync(path.join(dir, "package.json"), '\uFEFF{\n  "name": "pilot"\n}\n');
  assert.equal(init(ctx(dir)), 0);
  const after = read(dir, "package.json");
  assert.ok(after.startsWith("\uFEFF"), "se perdió el BOM");
  assert.equal(JSON.parse(after.slice(1)).scripts["check:docs"], "sddkit check");
}

// ---- un package.json que no es JSON válido no es nuestro para arreglarlo: se deja intacto, init no revienta
// después de sembrar y dice qué hacer a mano
{
  const dir = project(null);
  const broken = '{\n  "name": "pilot",\n}\n';
  fs.writeFileSync(path.join(dir, "package.json"), broken);
  const c = ctx(dir);
  assert.equal(init(c), 0);
  assert.equal(read(dir, "package.json"), broken);
  assert.ok(fs.existsSync(path.join(dir, "CLAUDE.md")), "los archivos se siembran antes de leer el package.json");
  assert.ok(c.logs.includes('  package.json no se pudo leer: añade a mano el script "check:docs": "sddkit check"'));
}

// ---- sin package.json, init siembra los archivos y dice qué script falta en vez de reventar
{
  const dir = project(null);
  const c = ctx(dir);
  assert.equal(init(c), 0);
  assert.ok(fs.existsSync(path.join(dir, "CLAUDE.md")));
  assert.ok(!fs.existsSync(path.join(dir, "package.json")), "init inventó un package.json");
  assert.ok(c.logs.some((l) => /package\.json/.test(l) && /check:docs/.test(l)));
}

// ---- `sddkit new` antes de `sddkit init` no tiene índice donde anotarse: dice qué correr y no crea la carpeta
{
  const dir = project();
  const c = ctx(dir);
  assert.equal(newInitiative("billing", c), 1);
  assert.match(c.errors[0], /sddkit init/);
  assert.ok(!fs.existsSync(path.join(dir, "docs/initiatives/billing")));
}

// ---- en Windows el índice suele tener CRLF: la línea nueva entra con el mismo final, sin mezclarlos
{
  const dir = project();
  init(ctx(dir));
  const readme = path.join(dir, "docs/README.md");
  fs.writeFileSync(readme, fs.readFileSync(readme, "utf8").replace(/\r?\n/g, "\r\n"));
  assert.equal(newInitiative("billing", ctx(dir)), 0);
  const text = fs.readFileSync(readme, "utf8");
  assert.ok(text.includes("- `initiatives/billing/`"));
  assert.ok(!/(?<!\r)\n/.test(text), "quedó un LF suelto en un archivo con CRLF");
  assert.deepEqual(check(dir), []);
}

// ---- un índice que el proyecto reescribió sin las líneas de superpowers sigue recibiendo la iniciativa
{
  const dir = project();
  init(ctx(dir));
  fs.writeFileSync(path.join(dir, "docs/README.md"), "# Documentación\n\n- `architecture/notes.md` — lo transversal\n");
  assert.equal(newInitiative("billing", ctx(dir)), 0);
  assert.equal(
    read(dir, "docs/README.md"),
    "# Documentación\n\n- `architecture/notes.md` — lo transversal\n- `initiatives/billing/` — descripción por escribir\n",
  );
}

for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true });
console.log("OK templates");
