# sdd-kit — diseño

Un paquete npm que lleva a cualquier proyecto JS/TS la metodología que hoy vive dentro del admin de Cappi: las
reglas de Spec Driven Development, el molde de `docs/` y el vigilante que comprueba que el molde se cumple.

## Problema

La metodología funciona en Cappi, pero está repartida en cuatro sitios y mezclada con lo que es de ese
proyecto:

- Las reglas están en su `CLAUDE.md`, entre secciones de Firebase, Mantine y trampas del admin.
- El molde de `docs/` solo existe como iniciativas reales: no hay plantilla vacía.
- El procedimiento de correr un checklist es una entrada (`RB2`) de `docs/arquitectura/notas.md`.
- El vigilante, `scripts/checks/check-docs.mjs`, lleva la lista de iniciativas escrita a mano, títulos
  obligatorios del `CLAUDE.md` de Cappi, palabras de publicación de una app móvil y restos de una
  reestructura pasada.

Copiar esos archivos a un proyecto nuevo crea una segunda versión del método que deriva desde el primer día.

## Objetivo

Una sola fuente versionada del método. Un proyecto nuevo la instala, corre un comando y queda con las reglas
cargadas en el agente, el esqueleto de `docs/` y el vigilante en marcha. Cuando el método mejora, cada
proyecto sube de versión.

## Alcance

Dentro:

- El paquete `sdd-kit`: `METHODOLOGY.md`, plantillas, vigilante configurable y la CLI `sdd`.
- Los arneses del propio paquete.
- Un proyecto piloto que arranca con el kit.

Fuera:

- La migración de Cappi al kit. Es la fase siguiente y tendrá su propia spec.
- Un corredor de arneses para el código del proyecto (el `run-all.mjs` con esbuild de Cappi): cada proyecto
  decide cómo verifica su código.
- Proyectos que no sean JS/TS.
- Moldes en otro idioma.
- Publicar en el registro de npm: se instala desde GitHub por tag.

## Decisiones tomadas

- **Paquete npm, no plugin de Claude Code ni submódulo.** Las reglas y el vigilante viajan juntos y con la
  misma versión, y viven en `node_modules`, donde los ven Claude Code, Codex y CI.
- **Nomenclatura en inglés, prosa en español.** Todo lo que funciona como identificador va en inglés:
  nombres de archivo y carpeta, títulos de sección que el vigilante valida, marcadores, encabezados de tabla,
  comandos y claves de configuración. Los nombres de fase, las descripciones, los mensajes de error del
  vigilante y el texto de las reglas van en español.
- **Sin dependencias.** El paquete solo usa módulos de Node.
- **El kit usa su propio método**: esta spec y su plan viven en `docs/superpowers/` de este repo.

## Nomenclatura

Cambios respecto al molde de Cappi. Prefijos de ID (`PH`, `F`, `TD`, `ADR`, `N`, `RB`), estados y severidad
ya están en inglés y no cambian.

### Archivos y carpetas

| Cappi                | Kit                  |
| -------------------- | -------------------- |
| `notas.md`           | `notes.md`           |
| `docs/arquitectura/` | `docs/architecture/` |

`roadmap.md`, `checklists.md`, `docs/README.md` y `docs/superpowers/specs|plans` se quedan igual. Las carpetas
de iniciativa van en inglés y en kebab minúscula, porque se usan como identificador en las citas.

### Títulos de sección

| Archivo         | Cappi                           | Kit                           |
| --------------- | ------------------------------- | ----------------------------- |
| `roadmap.md`    | `## Resumen de las fases`       | `## Phases summary`           |
| `roadmap.md`    | `## Índice de fases`            | `## Phase index`              |
| `roadmap.md`    | `## Orden de ejecución`         | `## Execution order`          |
| `roadmap.md`    | `## Deuda y decisiones`         | `## Debt and decisions`       |
| `checklists.md` | `## Resumen de los checklists`  | `## Checklists summary`       |
| `checklists.md` | `## Hallazgos`                  | `## Findings`                 |
| `checklists.md` | `### Hallazgos del checklist N` | `### Findings of checklist N` |
| `checklists.md` | `## Hallazgos sin checklist`    | `## Findings without checklist` |
| `notes.md`      | `## Resumen`                    | `## Summary`                  |
| `notes.md`      | `## Decisiones`                 | `## Decisions`                |
| `notes.md`      | `## Deuda técnica`              | `## Tech debt`                |
| `notes.md`      | `## Cosas que conviene recordar` | `## Notes`                   |
| `notes.md`      | `## Procedimientos`             | `## Runbooks`                 |
| `notes.md`      | `## Referencias`                | `## References`               |

Los títulos de fase y de checklist conservan su forma: `## PH1 · <nombre en español> · 🟣 Designed` y
`## Checklist 1 · <nombre en español> · ⚪ Not run`.

### Marcadores

| Cappi               | Kit                     |
| ------------------- | ----------------------- |
| `**Esperado:**`     | `**Expected:**`         |
| `**Fallo a cazar:**` | `**Failure to catch:**` |
| `**Bloqueado:**`    | `**Blocked:**`          |
| `**Retomar:**`      | `**Retake:**`           |
| `todos` (en Retomar) | `all`                  |
| `**Origen:**`       | `**Origin:**`           |

### Encabezados de tabla

| Tabla                    | Columnas                                                               |
| ------------------------ | ---------------------------------------------------------------------- |
| Phases summary           | `Current phase`, `Next`, `What blocks what`                            |
| Phase index              | `ID`, `Phase`, `Old name`, `Status`, `Spec`, `Plan`                    |
| Checklists summary       | `#`, `Checklist`, `Phase`, `Status`, `Progress`, `Last run`, `Findings` |
| Findings (índice)        | `ID`, `Test case`, `Severity`, `Summary`, `Status`                     |
| Findings of checklist N  | `ID`, `Test case`, `Severity`, `What happened`, `How it was closed`, `Status` |
| Summary de `notes.md`    | `ID`, `Type`, `What`, `Status`                                         |

El vigilante lee las tablas por posición de columna, como hoy; los encabezados los fijan las plantillas.

## El paquete

```
sdd-kit/
  package.json            ← "type": "module", bin: { sdd }, sin dependencias
  METHODOLOGY.md          ← las reglas
  CHANGELOG.md            ← qué cambia en cada versión y cómo migrar
  templates/
    CLAUDE.md             ← esqueleto del CLAUDE.md de un proyecto
    AGENTS.md
    sdd.config.mjs
    docs/README.md
    docs/architecture/notes.md
    initiative/roadmap.md
    initiative/checklists.md
    initiative/notes.md
  src/
    check-docs.js         ← checkDocs(io, config): devuelve la lista de errores
    io.js                 ← realIo y virtualIo
    config.js             ← valores por defecto y carga de sdd.config.mjs
    cli.js                ← reparte a los comandos
    commands/init.js
    commands/new.js
    commands/check.js
  checks/
    run-all.mjs           ← descubre y ejecuta check-*.mjs con Node, sin bundlear
    check-docs.mjs
    check-templates.mjs
    README.md
  docs/                   ← el kit documentado con su propio molde
```

### `METHODOLOGY.md`

Lleva, en este orden: los nueve pasos, iniciativa o cambio acotado, dónde va cada cosa, "un dato, un
documento", cómo se mantiene al día, glosario, estados, IDs, cómo correr un checklist e idioma y formato.

Tres reglas de Cappi nombran cosas de ese proyecto y se generalizan:

- **Paso 4.** Desaparece "sin worktree si toca el espejo": es una restricción de Cappi y vive en su
  `CLAUDE.md`.
- **Paso 6.** "`checks`, `lint` en cero, `build`" pasa a "los comandos de verificación que declara el
  `CLAUDE.md` del proyecto, y abrir la pantalla".
- **Publicación.** Se conserva la regla de que solo aparece en `Execution order`; qué palabras la delatan lo
  dice la configuración.

Las ramas no son parte del método: el paso 4 dice "rama desde la rama de integración que declara el
`CLAUDE.md` del proyecto".

Del glosario salen `Espejo` y `v1 / v2`. El procedimiento de correr un checklist deja de ser una entrada con
ID y pasa a ser una sección del método: los IDs son de las iniciativas de cada proyecto, y el método no es
una de ellas.

### Plantilla del `CLAUDE.md` de un proyecto

Abre con la línea de import `@node_modules/sdd-kit/METHODOLOGY.md` y trae vacías, con una frase que dice qué
va en cada una, las secciones del proyecto: `## Branches`, `## Environment`, `## Publication constraints`,
`## Architecture`, `## Verification`, `## Known pitfalls` y `## Removed`. Van en inglés porque el vigilante las
valida por su texto.

`AGENTS.md` dice en una línea que las reglas están en `node_modules/sdd-kit/METHODOLOGY.md` y en `CLAUDE.md`,
y que se leen antes de trabajar, porque Codex no resuelve imports.

### CLI

- **`sdd init`**: copia `CLAUDE.md`, `AGENTS.md`, `sdd.config.mjs`, `docs/README.md` y
  `docs/architecture/notes.md`, y añade a `package.json` el script `"check:docs": "sdd check"`. Un archivo
  que ya existe no se pisa: se informa y se sigue. Termina listando lo que creó y lo que saltó.
- **`sdd new <initiative>`**: crea `docs/<initiative>/` con `roadmap.md`, `checklists.md` y `notes.md` ya
  válidos (`PH1` en `Designed`; el checklist 1 en `Not run`, con la sección `A`, un punto `1.A1` por
  reescribir y su tabla de hallazgos vacía) y añade una línea a `docs/README.md`. Rechaza un nombre que no
  sea kebab minúscula, uno reservado (`architecture`, `superpowers`) y una carpeta que ya existe.
- **`sdd check`**: corre el vigilante sobre el directorio actual, imprime un error por línea y sale con
  código 1 si hay alguno. Sin errores imprime `OK docs`.

### Vigilante

`checkDocs(io, config)` conserva todas las comprobaciones de `check-docs.mjs` de Cappi, con la nomenclatura
nueva, y cambia en esto:

- **Descubre las iniciativas.** Toda carpeta directamente bajo `docs/` es una iniciativa, salvo
  `architecture`, `superpowers` y las de `ignore`. Una carpeta que no cumple el molde y no está en `ignore`
  es un error: así nada queda fuera de la vigilancia por olvido.
- **Lee su configuración** de `sdd.config.mjs`, todo opcional:

  | Clave              | Qué controla                                      | Por defecto                                      |
  | ------------------ | ------------------------------------------------- | ------------------------------------------------ |
  | `ignore`           | Carpetas de `docs/` que no son iniciativas        | `[]`                                             |
  | `claudeHeadings`   | Títulos obligatorios del `CLAUDE.md` del proyecto | Los de la plantilla                              |
  | `publicationWords` | Qué cuenta como hablar de publicación             | `publicar`, `publicaci`, `publicad`, `release`, `deploy` |
  | `pathRoots`        | Raíces cuyas rutas citadas deben existir          | `docs`, `src`, `scripts`                         |

- **Comprueba el import.** El `CLAUDE.md` del proyecto debe contener la línea que importa
  `METHODOLOGY.md`: sin ella el agente trabaja sin las reglas y nada lo delata.
- **Pierde lo que era de Cappi:** la lista `DELETED`, la búsqueda de `proceso.md` y `trampas-`, la
  exclusión fija de la carpeta de un cliente y la excepción de "un F5".

`docs/architecture/notes.md` sigue siendo la excepción que se agrupa por temas y no por tipo.

## Versiones

Semver con tags de git; se instala con `npm i -D github:<usuario>/sdd-kit#v1.0.0`.

- **Mayor:** documentación antes válida deja de pasar el vigilante, o cambia una regla del método. Lleva su
  nota de migración en `CHANGELOG.md`.
- **Menor:** comprobaciones que solo cazan lo que ya era un error según el método, comandos o plantillas
  nuevas.
- **Parche:** correcciones.

## Verificación

- **`checks/check-docs.mjs`**: el fixture válido y los casos de Cappi, traducidos. Cada caso mete un solo
  defecto en el fixture y exige su error; el fixture limpio no da ninguno. Se añaden casos para lo nuevo:
  una carpeta ajena en `docs/` falla y deja de fallar al declararla en `ignore`; un `CLAUDE.md` sin el import
  falla; una palabra de `publicationWords` fuera de `Execution order` falla y una que no está en la lista no.
- **`checks/check-templates.mjs`**: en una carpeta temporal corre `sdd init` y `sdd new`, y exige que
  `sdd check` no dé errores. Comprueba también que `sdd init` no pisa un `CLAUDE.md` que ya existe y que
  `sdd new` rechaza los nombres inválidos.
- **La documentación del propio kit** pasa `sdd check`.
- **En el proyecto piloto**, a mano: lo que ningún arnés ve.

## Riesgo abierto

No está comprobado que Claude Code resuelva un import de `CLAUDE.md` hacia `node_modules`, que está en
`.gitignore`. Es la primera tarea del plan. Si no funciona, `sdd init` copia `METHODOLOGY.md` a
`docs/METHODOLOGY.md`, el `CLAUDE.md` importa esa copia, se añade `sdd sync` para refrescarla al subir de
versión y `sdd check` falla cuando la copia no coincide byte a byte con la del paquete instalado.

## Criterios de aceptación

1. En un proyecto JS/TS vacío, `npm i -D` del kit seguido de `npx sdd init` deja `CLAUDE.md`, `AGENTS.md`,
   `sdd.config.mjs`, `docs/README.md` y `docs/architecture/notes.md`, y `npm run check:docs` imprime
   `OK docs`.
2. `npx sdd new <initiative>` crea los tres archivos y la línea en `docs/README.md`, y `npm run check:docs`
   sigue en `OK docs` sin editar nada a mano.
3. Correr `sdd init` por segunda vez no modifica ningún archivo.
4. Cada defecto que el vigilante de Cappi detecta hoy lo detecta el kit con la nomenclatura nueva: todos los
   casos traducidos pasan.
5. Una carpeta en `docs/` que no es iniciativa hace fallar `sdd check` hasta que se declara en `ignore`.
6. Un `CLAUDE.md` sin el import del método hace fallar `sdd check`.
7. En el proyecto piloto, una sesión nueva de Claude Code responde, sin que se le pegue el texto, cuáles son
   los nueve pasos y en qué estado nace un checklist.
8. `METHODOLOGY.md` no nombra Cappi, Firebase, Mantine, el espejo ni ninguna ruta de ese repo.
9. El paquete no declara dependencias, y `npm run checks` del kit termina en cero.
