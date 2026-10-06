// El molde de docs/ no revienta cuando se rompe: un estado distinto entre el título y la tabla, un resumen
// incompleto o una cita con otro formato se leen como ciertos, y el desfase crece sin que nadie lo vea. Cada
// caso de abajo mete un solo defecto en un proyecto mínimo que cumple el molde entero.
import assert from "node:assert/strict";

import { checkDocs } from "../src/check-docs.js";
import { DEFAULTS } from "../src/config.js";
import { virtualIo } from "../src/io.js";

// ---- Una iniciativa mínima que cumple el molde entero. Cada caso de abajo le mete un solo defecto.
const VALID = {
  "CLAUDE.md": `# Instrucciones

@node_modules/@enriquedelacruz04/sdd-kit/METHODOLOGY.md

Empieza por \`docs/README.md\`.

## Branches

## Environment

## Publication constraints

## Architecture

## Verification

## Known pitfalls

## Removed
`,
  "docs/README.md": `# Documentación

- \`architecture/notes.md\` — lo transversal
- \`fake/\` — una iniciativa de prueba
`,
  "docs/architecture/notes.md": `# Architecture — notes

## Summary

| ID | Type | What | Status |
| --- | --- | --- | --- |
`,
  "docs/fake/roadmap.md": `# Fake — roadmap

Una iniciativa de prueba.

## Phases summary

| Current phase | Next | What blocks what |
| --- | --- | --- |
| PH1 | — | Nada |

## Phase index

| ID | Phase | Old name | Status | Spec | Plan |
| --- | --- | --- | --- | --- | --- |
| PH1 | Algo | — | 🟢 Verified | — | — |

## Execution order

\`PH1\` en \`Verified\` → publicar la aplicación.

## Debt and decisions

El resumen y el detalle están en \`notes.md\`.

## PH1 · Algo · 🟢 Verified

Construye algo; lo explica (\`notes.md\` \`N1\`).
`,
  "docs/fake/checklists.md": `# Fake — checklists

## Checklists summary

| # | Checklist | Phase | Status | Progress | Last run | Findings |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Uno | PH1 | 🟢 Passed | 2/2 | 2026-09-14 | 1 |

## Findings

| ID | Test case | Severity | Summary | Status |
| --- | --- | --- | --- | --- |
| F1 | 1.A1 | 🟠 High | Algo falló | 🟢 Fixed |

## Checklist 1 · Uno · 🟢 Passed

Verifica \`PH1\`; \`1.A2\` es el que importa.

### A · Sección

- **1.A1** · 🟢 Passed · Hacer algo. **Expected:** pasa.
- **1.A2** · 🟢 Passed · Hacer otra cosa.
  En dos líneas.

### Findings of checklist 1

| ID | Test case | Severity | What happened | How it was closed | Status |
| --- | --- | --- | --- | --- | --- |
| F1 | 1.A1 | 🟠 High | Algo falló | Se arregló | 🟢 Fixed |
`,
  "docs/fake/notes.md": `# Fake — notas

## Summary

| ID | Type | What | Status |
| --- | --- | --- | --- |
| ADR1 | ADR | Una decisión | 🟢 Accepted |
| TD1 | Debt | Una deuda | 🟠 Open |
| N1 | Note | Una nota | — |

## ADRs

### ADR1 · Una decisión · 🟢 Accepted (2026-09-14)

Texto.

## Tech debt

### TD1 · Una deuda · 🟠 Open

**Origin:** \`F1\`.

## Notes

### N1 · Una nota

Sale de (\`ADR1\`).
`,
};

const runFixture = (files, config = DEFAULTS) => checkDocs(virtualIo(files), config);

// Cambia un fragmento de un archivo del fixture; falla si el fragmento no está, para que ningún caso pase por
// no haber metido el defecto.
function withDefect(file, from, to) {
  assert.ok(VALID[file].includes(from), `el fixture no contiene: ${from}`);
  return { ...VALID, [file]: VALID[file].replace(from, to) };
}

function expectError(files, pattern, config = DEFAULTS) {
  const errors = runFixture(files, config);
  assert.ok(
    errors.some((e) => pattern.test(e)),
    `se esperaba un error ${pattern}; salió:\n${errors.join("\n") || "(nada)"}`,
  );
}

// ---- el fixture válido no da errores: si diera alguno, los casos de abajo podrían pasar por ruido ajeno
assert.deepEqual(runFixture(VALID), []);

// ---- el estado de una fase se escribe en el índice y en su título: si divergen, uno de los dos miente
expectError(
  withDefect("docs/fake/roadmap.md", "| 🟢 Verified | — | — |", "| 🟠 Built | — | — |"),
  /dice Built en el índice/,
);

// ---- la liga entre fase y checklist vive solo en checklists.md; nombrarla en el roadmap la duplica
expectError(
  withDefect("docs/fake/roadmap.md", "Construye algo;", "Construye algo y su checklist;"),
  /nombra un checklist/,
);

// ---- la publicación la decide el administrador y solo aparece en "Execution order"
expectError(
  withDefect("docs/fake/roadmap.md", "Construye algo;", "Construye algo, antes de publicar;"),
  /habla de publicación/,
);

// ---- un estado sin su emoji, o con el color de otro, rompe la lectura de un vistazo
expectError(withDefect("docs/fake/checklists.md", "| 🟢 Passed | 2/2", "| Passed | 2/2"), /no lleva su emoji/);
expectError(withDefect("docs/fake/notes.md", "| 🟠 Open |", "| 🟢 Open |"), /debería llevar 🟠/);

// ---- un punto fuera de su sección deja de ser rastreable por su ID
expectError(withDefect("docs/fake/checklists.md", "- **1.A2** ·", "- **1.B2** ·"), /1\.B2 está dentro de la sección A/);

// ---- sin su estado, un punto no dice si ya se tomó, que es para lo que existe el estado por punto
expectError(
  withDefect("docs/fake/checklists.md", "- **1.A2** · 🟢 Passed · ", "- **1.A2** · "),
  /1\.A2 no tiene un estado válido/,
);
expectError(
  withDefect("docs/fake/checklists.md", "- **1.A2** · 🟢 Passed", "- **1.A2** · 🟡 Passed"),
  /"🟡 Passed" debería llevar 🟢/,
);

// ---- un checklist en Passed con un punto sin tomar se lee como terminado y no lo está
expectError(
  withDefect("docs/fake/checklists.md", "- **1.A2** · 🟢 Passed", "- **1.A2** · ⚪ Not run"),
  /el checklist 1 está en Passed y 1\.A2 está en Not run/,
);

// ---- el avance del resumen se escribe a mano y se queda viejo, igual que el contador de hallazgos
expectError(withDefect("docs/fake/checklists.md", "| 2/2 |", "| 1/2 |"), /dice 1\/2 de avance y tiene 2\/2/);

// ---- un bloqueo sin motivo no dice qué hace falta para desbloquearlo
expectError(
  withDefect("docs/fake/checklists.md", "- **1.A2** · 🟢 Passed", "- **1.A2** · 🟡 Blocked"),
  /1\.A2 está en Blocked sin decir por qué/,
);
// El motivo suele caer en otra línea del mismo punto; leer solo la primera daría un falso error.
assert.ok(
  !runFixture(
    withDefect(
      "docs/fake/checklists.md",
      "- **1.A2** · 🟢 Passed · Hacer otra cosa.\n  En dos líneas.",
      "- **1.A2** · 🟡 Blocked · Hacer otra cosa.\n  **Blocked:** falta algo.",
    ),
  ).some((e) => /sin decir por qué/.test(e)),
  "el motivo en la línea de continuación debería contar",
);

// ---- un motivo de bloqueo que sobrevive al desbloqueo se sigue leyendo como vigente
expectError(
  withDefect("docs/fake/checklists.md", "En dos líneas.", "En dos líneas. **Blocked:** falta algo."),
  /1\.A2 está en Passed y conserva su \*\*Blocked:\*\*/,
);

// ---- un punto que falló sin hallazgo pierde qué pasó y quién lo cierra
expectError(
  withDefect("docs/fake/checklists.md", "- **1.A2** · 🟢 Passed", "- **1.A2** · 🔴 Failed"),
  /1\.A2 está en Failed y ningún hallazgo lo cita/,
);

// ---- un hallazgo cerrado como Not a bug o Deferred sin tocar su punto deja el checklist sin poder cerrarse,
// y nadie sabe qué falta. El checklist se pone en Running para que el Failed sea el único defecto.
for (const [closed, rule] of [
  ["⚪ Not a bug", "Not a bug"],
  ["🟠 Deferred (TD1)", "Deferred"],
]) {
  const file = "docs/fake/checklists.md";
  const half = withDefect(file, "- **1.A1** · 🟢 Passed", "- **1.A1** · 🔴 Failed");
  half[file] = half[file]
    .replace("| 🟢 Passed | 2/2", "| 🟡 Running | 1/2")
    .replace("## Checklist 1 · Uno · 🟢 Passed", "## Checklist 1 · Uno · 🟡 Running")
    .replaceAll("| 🟢 Fixed |", `| ${closed} |`);
  half["docs/fake/roadmap.md"] = half["docs/fake/roadmap.md"].replaceAll("🟢 Verified", "🟠 Built");
  expectError(half, /1\.A1 está en Failed y solo lo citan hallazgos en Not a bug o Deferred/);
  // Con el hallazgo en Fixed, el mismo Failed es válido: espera a que se vuelva a tomar el punto.
  const fixed = {
    ...half,
    [file]: half[file].replaceAll(`| ${closed} |`, "| 🟢 Fixed |"),
  };
  assert.ok(!runFixture(fixed).some((e) => /solo lo citan/.test(e)), `falso positivo con ${rule}`);
}

// ---- un Critical diferido deja verificada una fase cuya pantalla revienta o pierde datos
expectError(
  {
    ...VALID,
    "docs/fake/checklists.md": VALID["docs/fake/checklists.md"]
      .replaceAll("| 🟠 High |", "| 🔴 Critical |")
      .replaceAll("| 🟢 Fixed |", "| 🟠 Deferred (TD1) |"),
  },
  /F1 es Critical y está en Deferred/,
);

// ---- un hallazgo que cita un punto inexistente pierde de dónde salió
expectError(
  withDefect(
    "docs/fake/checklists.md",
    "| F1 | 1.A1 | 🟠 High | Algo falló | Se arregló",
    "| F1 | 1.A9 | 🟠 High | Algo falló | Se arregló",
  ),
  /cita el punto 1\.A9/,
);

// ---- el contador de hallazgos del resumen se escribe a mano y se queda viejo
expectError(
  withDefect("docs/fake/checklists.md", "| 2026-09-14 | 1 |", "| 2026-09-14 | 0 |"),
  /dice 0 hallazgos y tiene 1/,
);

// ---- un checklist en Stale deja de respaldar a su fase: si la fase sigue en Verified, afirma algo que ya nadie
// comprobó. El estado del checklist va en dos sitios, así que el defecto se mete en los dos.
{
  const stale = withDefect("docs/fake/checklists.md", "| 🟢 Passed | 2/2", "| 🟠 Stale | 2/2");
  const file = "docs/fake/checklists.md";
  assert.ok(stale[file].includes("## Checklist 1 · Uno · 🟢 Passed"));
  stale[file] = stale[file].replace("## Checklist 1 · Uno · 🟢 Passed", "## Checklist 1 · Uno · 🟠 Stale");
  expectError(stale, /PH1 está en Verified y su checklist 1 está en Stale/);
}

// ---- **Retake:** dice qué puntos repone la siguiente corrida. Cada caso parte de un checklist en Stale con su
// fase ya en Built, para que el defecto de la línea sea el único.
{
  const file = "docs/fake/checklists.md";
  const intro = "Verifica `PH1`; `1.A2` es el que importa.";
  const staleWith = (retake) => {
    const files = withDefect(file, "| 🟢 Passed | 2/2", "| 🟠 Stale | 2/2");
    files[file] = files[file]
      .replace("## Checklist 1 · Uno · 🟢 Passed", "## Checklist 1 · Uno · 🟠 Stale")
      .replace(intro, retake === null ? intro : `${intro}\n\n${retake}`);
    files["docs/fake/roadmap.md"] = files["docs/fake/roadmap.md"].replaceAll("🟢 Verified", "🟠 Built");
    return files;
  };
  const retakeErrors = (files) => runFixture(files).filter((e) => /Retake|retoma /.test(e));

  // Una línea bien escrita no da error, aunque el motivo siga en la línea de abajo: si lo diera, los casos de
  // abajo podrían pasar por ruido.
  assert.deepEqual(retakeErrors(staleWith("**Retake:** `1.A2`. `PH2` cambió el cálculo.")), []);
  assert.deepEqual(retakeErrors(staleWith("**Retake:** `1.A1`, `1.A2`.\nEl cálculo cambió.")), []);
  assert.deepEqual(retakeErrors(staleWith("**Retake:** all. Cambió la consulta.")), []);

  // Sin la línea, quien corre el checklist no sabe qué quedó viejo.
  expectError(staleWith(null), /checklist 1 está en Stale sin su \*\*Retake:\*\*/);
  // Sin motivo, nadie puede juzgar después si se retomó lo que hacía falta.
  expectError(staleWith("**Retake:** `1.A2`."), /no dice qué puntos y por qué/);
  // Un ID sin su código escapa a la comprobación de que el punto existe.
  expectError(staleWith("**Retake:** 1.A2. Cambió."), /no dice qué puntos y por qué/);
  // Un punto que no existe, o que es de otro checklist, deja sin retomar el que de verdad cambió.
  expectError(staleWith("**Retake:** `1.A9`. Cambió."), /retoma 1\.A9, que no es suyo/);
  expectError(staleWith("**Retake:** `1.A2`.\n\n**Retake:** all. Otra vez."), /más de un \*\*Retake:\*\*/);
}

// ---- un **Retake:** que sobrevive al cierre anuncia una corrida parcial que ya terminó
expectError(
  withDefect(
    "docs/fake/checklists.md",
    "Verifica `PH1`; `1.A2` es el que importa.",
    "Verifica `PH1`; `1.A2` es el que importa.\n\n**Retake:** all. Cambió.",
  ),
  /checklist 1 está en Passed y conserva su \*\*Retake:\*\*/,
);

// ---- el resumen de notas lista todo lo que guarda el archivo, notas incluidas
expectError(withDefect("docs/fake/notes.md", "| N1 | Note | Una nota | — |\n", ""), /N1 no está en el resumen/);

// ---- el tipo del resumen se escribe a mano; uno inventado ("Tech debt") ya se coló una vez
expectError(
  withDefect("docs/fake/notes.md", "| TD1 | Debt |", "| TD1 | Tech debt |"),
  /TD1 es Debt y el resumen dice "Tech debt"/,
);

// ---- el resumen agrupado por tipo se lee en el mismo orden que el archivo; mezclado, se pierde lo que falta
expectError(
  withDefect(
    "docs/fake/notes.md",
    "| ADR1 | ADR | Una decisión | 🟢 Accepted |\n| TD1 | Debt | Una deuda | 🟠 Open |",
    "| TD1 | Debt | Una deuda | 🟠 Open |\n| ADR1 | ADR | Una decisión | 🟢 Accepted |",
  ),
  /ADR1 rompe el orden por tipo del resumen/,
);

// ---- el tipo de un ADR es ADR, como su prefijo: Decision, su nombre hasta la 2.x, ya no pasa (kit-v1 ADR8)
expectError(
  withDefect("docs/fake/notes.md", "| ADR1 | ADR |", "| ADR1 | Decision |"),
  /ADR1 es ADR y el resumen dice "Decision"/,
);

// ---- con las secciones en el mismo orden en todas las iniciativas, cada entrada se busca en el mismo sitio
expectError(
  withDefect("docs/fake/notes.md", "## ADRs", "## References\n\nUn enlace.\n\n## ADRs"),
  /"## ADRs" está fuera de orden/,
);
expectError(
  withDefect("docs/fake/notes.md", "## Notes", "## Loose notes"),
  /"## Loose notes" no es una sección de notes\.md/,
);

// ---- un checklist sin su tabla de hallazgos obliga a quien anota el primero a inventarle un formato
expectError(
  withDefect("docs/fake/checklists.md", "### Findings of checklist 1", "### Findings of the first one"),
  /el checklist 1 no tiene su tabla "Findings of checklist 1"/,
);

// ---- la deuda pagada no se borra: cambia a Resolved con fecha; cualquier otro estado es un error
expectError(
  withDefect("docs/fake/notes.md", "Una deuda · 🟠 Open", "Una deuda · 🟢 Closed"),
  /TD1 debe estar Open o Resolved/,
);

// ---- un ID nunca se reutiliza: dos entradas con el mismo son dos cosas con una sola dirección
expectError(
  withDefect("docs/fake/notes.md", "### N1 · Una nota", "### ADR1 · Una nota · 🟢 Accepted (2026-09-14)"),
  /ADR1 está repetido/,
);

// ---- las citas llevan cada pieza en su propio código; el formato viejo vuelve a mezclar estilos
expectError(withDefect("docs/fake/roadmap.md", "(`notes.md` `N1`)", "(N1 en `notes.md`)"), /N1 citado sin su código/);
expectError(
  withDefect("docs/fake/notes.md", "Sale de (`ADR1`).", "Sale de `architecture N7`."),
  /iniciativa e ID en un solo código/,
);
expectError(withDefect("docs/fake/checklists.md", "Verifica `PH1`;", "Verifica PH1;"), /PH1 citado sin su código/);

// ---- una cita a un ID que no existe —borrado, o mal escrito— remite a nada y se sigue leyendo como cierta
expectError(
  withDefect("docs/fake/roadmap.md", "(`notes.md` `N1`)", "(`notes.md` `N9`)"),
  /cita `notes\.md` `N9`, que no existe/,
);
expectError(withDefect("docs/fake/checklists.md", "Verifica `PH1`;", "Verifica `PH7`;"), /cita PH7, que no existe/);
// El archivo cuenta: N1 existe en la iniciativa, pero no en checklists.md.
expectError(
  withDefect("docs/fake/roadmap.md", "(`notes.md` `N1`)", "(`checklists.md` `N1`)"),
  /cita `checklists\.md` `N1`, que no existe/,
);

// ---- una iniciativa puede traer una carpeta `assets` con las imágenes que su spec cita: no es un archivo ajeno
{
  const files = { ...VALID, "docs/fake/assets/formato.png": "" };
  assert.deepEqual(runFixture(files), []);
}

// ---- cualquier otra entrada de más sigue rompiendo el molde: `assets` no abre la puerta a borradores ni a carpetas
// El mensaje nombra lo que sobra: listar los cuatro archivos deja a quien lo lee buscando cuál es el intruso.
expectError({ ...VALID, "docs/fake/borrador.md": "" }, /fake: sobra borrador\.md:/);
expectError({ ...VALID, "docs/fake/otra/nota.md": "" }, /fake: sobra otra:/);

// ---- una carpeta de docs/ que no es iniciativa queda fuera de la vigilancia sin que nadie lo decida: falla
// hasta que se declara en `ignore`
{
  const files = { ...VALID, "docs/research/apuntes.md": "Texto suelto." };
  expectError(files, /docs\/research no es una iniciativa/);
  assert.deepEqual(runFixture(files, { ...DEFAULTS, ignore: ["research"] }), []);
}

// ---- un archivo suelto en docs/ (un PDF, el propio README) no es una carpeta y no se toma por iniciativa
assert.deepEqual(runFixture({ ...VALID, "docs/formato.pdf": "" }), []);

// ---- un proyecto recién sembrado no tiene iniciativas, y eso cumple el molde
{
  const fresh = Object.fromEntries(Object.entries(VALID).filter(([k]) => !k.startsWith("docs/fake/")));
  fresh["docs/README.md"] = "# Documentación\n\n- `architecture/notes.md` — lo transversal\n";
  assert.deepEqual(runFixture(fresh), []);
}

// ---- sin la línea que importa el método, el agente trabaja sin las reglas y nada lo delata
expectError(
  withDefect("CLAUDE.md", "@node_modules/@enriquedelacruz04/sdd-kit/METHODOLOGY.md\n", ""),
  /CLAUDE\.md no importa METHODOLOGY\.md/,
);
// Nombrar el archivo en una frase no lo importa: tiene que ser una línea que empiece por @.
expectError(
  withDefect("CLAUDE.md", "@node_modules/@enriquedelacruz04/sdd-kit/METHODOLOGY.md", "Las reglas están en METHODOLOGY.md"),
  /CLAUDE\.md no importa METHODOLOGY\.md/,
);

// ---- las secciones del proyecto son las que el agente busca: si falta una, falta sin avisar
expectError(withDefect("CLAUDE.md", "## Verification", "## Checks"), /CLAUDE\.md: falta el título "## Verification"/);
// Los títulos obligatorios son de cada proyecto: uno declarado en la configuración se exige igual.
expectError(VALID, /CLAUDE\.md: falta el título "## UI"/, {
  ...DEFAULTS,
  claudeHeadings: [...DEFAULTS.claudeHeadings, "## UI"],
});

// ---- qué palabras delatan una publicación depende del proyecto: una que no está en la lista no falla, y la
// misma, declarada, sí
{
  const files = withDefect("docs/fake/roadmap.md", "Construye algo;", "Construye algo, espera al binario;");
  assert.deepEqual(runFixture(files), []);
  expectError(files, /habla de publicación/, {
    ...DEFAULTS,
    publicationWords: ["binario"],
  });
}

// ---- una ruta citada que ya no existe se sigue leyendo como si llevara a algo
expectError(
  withDefect("CLAUDE.md", "Empieza por `docs/README.md`.", "Empieza por `docs/indice.md`."),
  /CLAUDE\.md apunta a docs\/indice\.md, que no existe/,
);
// Las raíces vigiladas son de cada proyecto: `app/` no se mira hasta que se declara.
{
  const files = withDefect("CLAUDE.md", "Empieza por `docs/README.md`.", "Empieza por `app/main.ts`.");
  assert.deepEqual(runFixture(files), []);
  expectError(files, /CLAUDE\.md apunta a app\/main\.ts, que no existe/, {
    ...DEFAULTS,
    pathRoots: ["app"],
  });
}

// ---- una ruta anidada o una URL contiene la forma de una ruta raíz, pero no es una: sin frontera izquierda, el
// vigilante comprobaba su cola contra la raíz del proyecto y fallaba con un archivo que sí existe
{
  const nested = withDefect("CLAUDE.md", "Empieza por `docs/README.md`.", "Mira `packages/api/src/server.js`.");
  assert.deepEqual(runFixture(nested), []);
  const url = withDefect("CLAUDE.md", "Empieza por `docs/README.md`.", "Mira https://example.com/docs/guide.md.");
  assert.deepEqual(runFixture(url), []);
  const dots = withDefect("CLAUDE.md", "Empieza por `docs/README.md`.", "Mira .../foo.md.");
  assert.deepEqual(runFixture(dots), []);
}
// Con la frontera, una ruta relativa que sí empieza donde empiezan las rutas se sigue comprobando.
expectError(
  withDefect("CLAUDE.md", "Empieza por `docs/README.md`.", "Empieza por `./nada.md`."),
  /CLAUDE\.md apunta a \.\/nada\.md, que no existe/,
);

// ---- un archivo borrado se nombra por su nombre, sin ruta (así lo enseña el método): no se lee como ruta viva;
// la misma ruta completa sí falla, que es el motivo de la regla
{
  const bare = withDefect("CLAUDE.md", "## Removed", "## Removed\n\nYa no existe `old-report.js`.");
  assert.deepEqual(runFixture(bare), []);
  const rooted = withDefect("CLAUDE.md", "## Removed", "## Removed\n\nYa no existe `src/legacy/old-report.js`.");
  expectError(rooted, /CLAUDE\.md apunta a src\/legacy\/old-report\.js, que no existe/);
}

// ---- architecture/notes.md agrupa sus secciones por tema, pero su resumen va agrupado por tipo como el de una
// iniciativa: una Note antes de un ADR rompe el orden
{
  const arch = (rows) => `# Architecture — notes

## Summary

| ID | Type | What | Status |
| --- | --- | --- | --- |
${rows}

## Tablas

### N1 · Una nota

Texto.

### ADR1 · Una decisión · 🟢 Accepted (2026-09-14)

Texto.
`;
  const ordered = "| ADR1 | ADR | Una decisión | 🟢 Accepted |\n| N1 | Note | Una nota | — |";
  const swapped = "| N1 | Note | Una nota | — |\n| ADR1 | ADR | Una decisión | 🟢 Accepted |";
  assert.deepEqual(runFixture({ ...VALID, "docs/architecture/notes.md": arch(ordered) }), []);
  expectError({ ...VALID, "docs/architecture/notes.md": arch(swapped) }, /rompe el orden por tipo del resumen/);
}

// ---- una fila de hallazgos con menos columnas que las seis de la tabla se leía como "estado undefined": el
// error tiene que decir que faltan columnas
expectError(
  withDefect(
    "docs/fake/checklists.md",
    "| F1 | 1.A1 | 🟠 High | Algo falló | Se arregló | 🟢 Fixed |",
    "| F1 | 1.A1 | 🟠 High | Algo falló | 🟢 Fixed |",
  ),
  /fake: el hallazgo F1 tiene 5 columnas y la tabla lleva 6/,
);
assert.ok(
  !runFixture(
    withDefect(
      "docs/fake/checklists.md",
      "| F1 | 1.A1 | 🟠 High | Algo falló | Se arregló | 🟢 Fixed |",
      "| F1 | 1.A1 | 🟠 High | Algo falló | 🟢 Fixed |",
    ),
  ).some((e) => /undefined/.test(e)),
  "una fila corta no debe producir el mensaje engañoso de estado undefined",
);

// ---- el estado de una decisión es de un conjunto cerrado: texto detrás de `Accepted` no es otro estado
// Sin emoji, porque con él otra regla ya lo rechaza y el caso no probaría la del ancla final.
for (const tail of ["🟢 Accepted luego", "Accepted luego"])
  expectError(
    withDefect("docs/fake/notes.md", "· 🟢 Accepted (2026-09-14)", `· ${tail}`),
    /ADR1 no tiene un estado de decisión válido/,
  );
// Las formas válidas siguen pasando: con fecha, sin fecha y sustituida.
for (const title of ["🟢 Accepted", "🟡 Proposed (2026-09-14)", "⚫ Superseded (ADR2)"]) {
  const status = title.replace(/ \(\d{4}-\d{2}-\d{2}\)$/, "");
  const files = withDefect(
    "docs/fake/notes.md",
    "### ADR1 · Una decisión · 🟢 Accepted (2026-09-14)",
    `### ADR1 · Una decisión · ${title}`,
  );
  files["docs/fake/notes.md"] = files["docs/fake/notes.md"].replace(
    "| ADR1 | ADR | Una decisión | 🟢 Accepted |",
    `| ADR1 | ADR | Una decisión | ${status} |`,
  );
  assert.ok(!runFixture(files).some((e) => /estado de decisión válido/.test(e)), `se rechazó ${title}`);
}

// ---- checkDocs es la entrada pública: una configuración parcial toma los valores por defecto en vez de reventar
assert.deepEqual(checkDocs(virtualIo(VALID), { ignore: [] }), []);

// ---- el índice no lleva estados: el estado de una fase vive en su roadmap y aquí se quedaría viejo
expectError(
  withDefect("docs/README.md", "una iniciativa de prueba", "una iniciativa de prueba, ya en Verified"),
  /docs\/README\.md lleva estados/,
);

// ---- los proyectos viven en Windows: un archivo con CRLF se lee igual que uno con LF
assert.deepEqual(
  runFixture(Object.fromEntries(Object.entries(VALID).map(([k, v]) => [k, v.replace(/\n/g, "\r\n")]))),
  [],
);

// ---- sin docs/ no hay nada que vigilar: un solo error que dice qué correr, no una cascada
assert.deepEqual(runFixture({ "CLAUDE.md": VALID["CLAUDE.md"] }), [
  "no hay carpeta docs/ aquí: corre `sddkit init` en la raíz del proyecto",
]);

// ---- una tecla de función o un código de producto tienen forma de ID sin serlo. Sin declararlos, fallan como
// cita; declarados en `notIds`, dejan de leerse como IDs, sueltos o entre acentos graves
{
  const bare = withDefect("docs/fake/roadmap.md", "Construye algo;", "Construye algo, que se abre con F12;");
  expectError(bare, /F12 citado sin su código/);
  assert.deepEqual(runFixture(bare, { ...DEFAULTS, notIds: ["F12"] }), []);

  const coded = withDefect("docs/fake/notes.md", "Sale de (`ADR1`).", "Sale de (`ADR1`), con la tecla `F12`.");
  expectError(coded, /cita F12, que no existe/);
  assert.deepEqual(runFixture(coded, { ...DEFAULTS, notIds: ["F12"] }), []);

  // Declarar una palabra no apaga la vigilancia de las demás: una cita de verdad sin su código sigue fallando.
  expectError(withDefect("docs/fake/checklists.md", "Verifica `PH1`;", "Verifica PH1 con F12;"), /PH1 citado sin su código/, {
    ...DEFAULTS,
    notIds: ["F12"],
  });
  // Ni tapa a un ID que solo empieza igual.
  expectError(bare, /F12 citado sin su código/, { ...DEFAULTS, notIds: ["F1"] });
}

// ---- una palabra de `notIds` solo se ignora donde ese ID no existe. Ignorarla en todas partes apagaba la
// vigilancia de un hallazgo de verdad con el mismo nombre: "un F5" en una nota tapaba las citas al F5 de otra
// iniciativa
{
  const config = { ...DEFAULTS, notIds: ["F1"] };
  // En la iniciativa que tiene un hallazgo F1 sigue siendo un ID: suelto en la prosa, falla.
  expectError(
    withDefect("docs/fake/roadmap.md", "Construye algo;", "Construye algo con F1;"),
    /F1 citado sin su código/,
    config,
  );
  // Donde no existe —las notas de arquitectura— sí se ignora.
  const architecture = withDefect(
    "docs/architecture/notes.md",
    "# Architecture — notes\n",
    "# Architecture — notes\n\nLa lista no sobrevive a un F1.\n",
  );
  expectError(architecture, /F1 citado sin su código/);
  assert.deepEqual(runFixture(architecture, config), []);
  // Una cita con prefijo nombra la iniciativa, así que no puede ser una tecla: se comprueba siempre.
  expectError(
    withDefect("CLAUDE.md", "Empieza por `docs/README.md`.", "Empieza por `docs/README.md` (`fake` `F9`)."),
    /cita `fake` `F9`, que no existe/,
    { ...DEFAULTS, notIds: ["F9"] },
  );
}

// ---- una entrada de `notIds` que no tiene forma de ID no hace nada: es un error de tecleo, y se dice
expectError(VALID, /"Foo" en notIds no tiene forma de ID/, { ...DEFAULTS, notIds: ["Foo"] });

// ---- la introducción de un checklist enumera requisitos con una lista numerada, y eso no es un punto: el aviso de
// "punto sin ID" solo tiene sentido dentro de una sección, que es donde viven los puntos
{
  const file = "docs/fake/checklists.md";
  const intro = "Verifica `PH1`; `1.A2` es el que importa.";
  assert.deepEqual(runFixture(withDefect(file, intro, `${intro}\n\n1. Tener una cuenta.\n2. Tener datos de prueba.`)), []);
  expectError(
    withDefect(file, "  En dos líneas.", "  En dos líneas.\n2. Un punto que perdió su ID."),
    /punto sin ID válido en el checklist 1/,
  );
}

// ---- `ignore` se compara con el nombre de cada carpeta de docs/: una ruta o una barra final no ignoran nada, y
// aceptarlas en silencio deja la carpeta fallando sin explicación
for (const bad of ["docs/research", "research/", "research\\apuntes"])
  expectError(
    { ...VALID, "docs/research/apuntes.md": "Texto suelto." },
    /en ignore debe ser solo el nombre de una carpeta de docs\//,
    { ...DEFAULTS, ignore: [bad] },
  );

// ---- un archivo entero que falta se dice una vez y con qué correr, no con un error por cada cosa que llevaba dentro
{
  const without = (file) => Object.fromEntries(Object.entries(VALID).filter(([k]) => k !== file));
  assert.deepEqual(runFixture(without("CLAUDE.md")), ["no hay CLAUDE.md en la raíz del proyecto: corre `sddkit init`"]);
  assert.deepEqual(runFixture(without("docs/architecture/notes.md")), [
    "no hay docs/architecture/notes.md: corre `sddkit init`",
  ]);
}

// ---- un Gate se cruza una vez y nunca pasa a Stale. La marca **Gate:** en su introducción es lo que deja al
// vigilante comprobarlo; sin ella, la regla solo vivía en la cabeza de quien edita
{
  const file = "docs/fake/checklists.md";
  const intro = "Verifica `PH1`; `1.A2` es el que importa.";
  const gated = withDefect(file, intro, `${intro}\n\n**Gate:** desbloquea la fase siguiente.`);
  assert.deepEqual(runFixture(gated), []);

  const stale = { ...gated };
  stale[file] = stale[file]
    .replace("| 🟢 Passed | 2/2", "| 🟠 Stale | 2/2")
    .replace("## Checklist 1 · Uno · 🟢 Passed", "## Checklist 1 · Uno · 🟠 Stale")
    .replace("**Gate:** desbloquea la fase siguiente.", "**Gate:** desbloquea la fase siguiente.\n\n**Retake:** all. Cambió.");
  stale["docs/fake/roadmap.md"] = stale["docs/fake/roadmap.md"].replaceAll("🟢 Verified", "🟠 Built");
  expectError(stale, /el checklist 1 es un Gate y está en Stale/);
  // El mismo checklist en Stale, sin la marca, no da ese error: lo que falla es el Gate, no el Stale.
  const plain = { ...stale, [file]: stale[file].replace("**Gate:** desbloquea la fase siguiente.\n\n", "") };
  assert.ok(!runFixture(plain).some((e) => /es un Gate/.test(e)), "falso positivo sin la marca Gate");
}

console.log("OK docs");
