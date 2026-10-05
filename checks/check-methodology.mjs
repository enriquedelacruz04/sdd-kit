import assert from "node:assert/strict";
import fs from "node:fs";

import { CHECKLIST_HEADINGS, NOTE_SECTIONS, ROADMAP_HEADINGS, STATES } from "../src/check-docs.js";
import { DEFAULTS } from "../src/config.js";

const text = fs.readFileSync(new URL("../METHODOLOGY.md", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const template = (file) =>
  fs.readFileSync(new URL(`../templates/${file}`, import.meta.url), "utf8").replace(/\r\n/g, "\n");

// ---- el método viaja a proyectos que no son Cappi: un resto del proyecto donde nació se leería como regla
for (const [pattern, what] of [
  [/cappi/i, "Cappi"],
  [/firebase|firestore/i, "Firebase"],
  [/mantine/i, "Mantine"],
  [/espejo/i, "el espejo"],
  [/chrome-devtools|5173/, "el entorno de Cappi"],
  [/notas\.md|`arquitectura`/, "un nombre de archivo o carpeta del molde viejo"],
  [/Esperado:|Fallo a cazar|Bloqueado:|Retomar/, "un marcador del molde viejo"],
  [/Resumen de las fases|Índice de fases|Orden de ejecución|Hallazgos del checklist/, "un título del molde viejo"],
])
  assert.ok(!pattern.test(text), `METHODOLOGY.md nombra ${what}: ${text.match(pattern)?.[0]}`);

// ---- las secciones que el agente busca, en el orden en que se leen
{
  const lines = text.split("\n");
  let last = -1;
  for (const heading of [
    "## Cómo se trabaja",
    "### Los nueve pasos",
    "### Iniciativa o cambio acotado",
    "## Documentación",
    "### Dónde va cada cosa",
    "### El molde de cada archivo",
    "### Un dato, un documento",
    "### Cómo se mantiene al día",
    "### Glosario",
    "### Estados",
    "### IDs",
    "## Cómo se corre un checklist",
    "## Idioma y formato",
  ]) {
    const i = lines.indexOf(heading);
    assert.ok(i >= 0, `METHODOLOGY.md no tiene "${heading}"`);
    assert.ok(i > last, `"${heading}" está fuera de orden`);
    last = i;
  }
}

// ---- el método y el vigilante dicen lo mismo. Si el vigilante exige un estado, un emoji o un título que el
// método no enseña, el agente escribe otra cosa y `sddkit check` falla sin que nada explique por qué.
for (const [group, map] of Object.entries(STATES))
  for (const [state, emoji] of Object.entries(map))
    assert.ok(text.includes(`${emoji} \`${state}`), `el método no enseña ${emoji} ${state} (${group})`);
for (const heading of [...ROADMAP_HEADINGS, ...CHECKLIST_HEADINGS, ...NOTE_SECTIONS])
  assert.ok(text.includes(`\`${heading}\``), `el método no nombra el título "${heading}"`);
for (const literal of ["`### Findings of checklist N`", "`## Findings without checklist`"])
  assert.ok(text.includes(literal), `el método no nombra ${literal}`);
for (const marker of [
  "**Expected:**",
  "**Failure to catch:**",
  "**Blocked:**",
  "**Retake:**",
  "**Gate:**",
  "**Origin:**",
])
  assert.ok(text.includes(marker), `el método no nombra el marcador ${marker}`);
for (const prefix of ["PH1", "F1", "TD1", "ADR1", "N1", "RB1", "2.B3"])
  assert.ok(text.includes(`\`${prefix}\``), `el método no enseña el ID ${prefix}`);

// ---- el método manda a las secciones del CLAUDE.md del proyecto por su título: tienen que ser las que la
// plantilla siembra y el vigilante exige
for (const heading of DEFAULTS.claudeHeadings)
  assert.ok(template("CLAUDE.md").includes(`\n${heading}\n`), `la plantilla de CLAUDE.md no tiene "${heading}"`);
for (const heading of ["## Branches", "## Verification"])
  assert.ok(text.includes(`\`${heading}\``), `el método no remite a "${heading}" del proyecto`);

// ---- los comandos que el método manda correr son los que el kit tiene
for (const command of ["sddkit init", "sddkit new <initiative>", "npm run check:docs"])
  assert.ok(text.includes(command), `el método no nombra \`${command}\``);

// ---- el vigilante lee las celdas por posición: quien añade una tabla a mano necesita el orden de las columnas
// en el método. Sacarlo de las plantillas mantiene los tres en sintonía.
for (const file of [
  "initiative/roadmap.md",
  "initiative/checklists.md",
  "initiative/notes.md",
  "docs/architecture/notes.md",
]) {
  const lines = template(file).split("\n");
  lines.forEach((line, i) => {
    if (!line.startsWith("|") || !/^\|\s*:?-/.test(lines[i + 1] ?? "")) return;
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
    const header = cells.map((cell) => `\`${cell}\``).join(", ");
    assert.ok(text.includes(header), `el método no da el orden de columnas de ${file}: ${header}`);
  });
}

// ---- el vigilante rechaza un resumen cuyo Status repite la fecha del título de la entrada; sin la regla, lo
// natural es copiar el mismo texto a los dos sitios
assert.ok(text.includes("lleva solo el estado, sin fecha"), "el método no dice que el Status del resumen va sin fecha");

// ---- el vigilante rechaza una ruta citada que no existe; sin la regla en el método, lo natural al registrar un
// borrado (nombrar la ruta del archivo que ya no está) rompe `sddkit check`
assert.ok(text.includes("`pathRoots`"), "el método no enseña la regla de las rutas citadas (`pathRoots`)");

// ---- `## Findings without checklist` no aparece en ninguna plantilla, así que la comprobación de columnas
// sacada de ellas no lo ve; el vigilante lo lee con las seis columnas del detalle y el método tiene que decirlas
assert.ok(
  text.includes(
    "| `## Findings without checklist` | `ID`, `Test case`, `Severity`, `What happened`, `How it was closed`, `Status` |",
  ),
  "el método no da las seis columnas de `## Findings without checklist`",
);

// ---- el vigilante lee como cita cualquier palabra con forma de ID: sin la salida escrita en el método, quien topa
// con el error no sabe que existe
assert.ok(text.includes("`notIds`"), "el método no nombra `notIds`");

console.log("OK methodology");
