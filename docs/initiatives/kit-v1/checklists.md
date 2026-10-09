# Kit v1 — checklists

Necesitan una carpeta vacía fuera de este repo, el `.tgz` que produce `npm pack` y Claude Code instalado.

## Checklists summary

| #   | Checklist                  | Phase | Status     | Progress | Last run | Findings |
| --- | -------------------------- | ----- | ---------- | -------- | -------- | -------- |
| 1   | Un proyecto nuevo arranca  | PH1   | 🟠 Stale   | 6/6      | 2026-10-07 | 0        |

## Findings

| ID  | Test case | Severity | Summary | Status |
| --- | --------- | -------- | ------- | ------ |

## Checklist 1 · Un proyecto nuevo arranca · 🟠 Stale

Verifica `PH1` con el paquete instalado de verdad, no con el código del repo: es lo que ningún arnés ve. Se
repite si cambia lo que entra en el paquete, una plantilla o la línea que importa el método.

**Retake:** `1.A1`, `1.A2`, `1.A3`, `1.A4`, `1.B1`. La versión 6.0.0 cambió el paso 7 del método y la sección
`## Branches` de la plantilla del `CLAUDE.md` (`ADR11`). La versión 7.0.0 movió las iniciativas a
`docs/initiatives/` y cambió lo que hace `ignore` (`ADR12`).

### A · Sembrar y vigilar

- **1.A1** · 🟢 Passed · En una carpeta vacía, correr `npm init -y`, instalar el `.tgz` con `npm i -D`, y luego
  `npx sddkit init` y `npm run check:docs`. **Expected:** existen `CLAUDE.md`, `AGENTS.md`, `sdd.config.mjs`,
  `docs/README.md` y `docs/architecture/notes.md`, y el último comando imprime `OK docs`. **Failure to catch:** que
  `npx sddkit` no encuentre el binario en Windows.
- **1.A2** · 🟢 Passed · Correr `npx sddkit new billing` y otra vez `npm run check:docs`. **Expected:** aparecen los
  tres archivos de `docs/initiatives/billing/` y su línea en `docs/README.md`, y sale `OK docs` sin editar nada a
  mano.
- **1.A3** · 🟢 Passed · Hacer commit de todo, correr `npx sddkit init` otra vez y mirar `git status`. **Expected:**
  ningún archivo cambió.
- **1.A4** · 🟢 Passed · Crear la carpeta `docs/research` con un archivo `.md` que nombre una ruta de `src` que no
  exista y correr `npm run check:docs`; luego declarar `research` en `ignore` de `sdd.config.mjs` y volver a
  correrlo. **Expected:** la primera vez falla y nombra la ruta que no existe; la segunda sale `OK docs`.
  **Failure to catch:** que falle por tomar `docs/research` por una iniciativa.
- **1.A5** · 🟢 Passed · Borrar del `CLAUDE.md` la línea que empieza por `@` y correr `npm run check:docs`.
  **Expected:** falla y dice que `CLAUDE.md` no importa el método. Restaurar la línea al terminar.

### B · El agente carga el método

- **1.B1** · 🟢 Passed · Abrir una sesión nueva de Claude Code en esa carpeta y preguntar, sin pegar ningún
  texto, cuáles son los nueve pasos y en qué estado nace un checklist. **Expected:** responde los nueve pasos del
  método y `Not run`. **Failure to catch:** que responda de memoria con un proceso genérico que no menciona los
  nombres de fase del método (`Designed`, `Planned`, `Building`, `Built`, `Verified`).

### Findings of checklist 1

| ID  | Test case | Severity | What happened | How it was closed | Status |
| --- | --------- | -------- | ------------- | ----------------- | ------ |
