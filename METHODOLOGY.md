# Metodología

Cómo se trabaja y cómo se documenta en un proyecto que usa sdd-kit. Lo que es de cada proyecto —sus ramas, su
entorno, su arquitectura, sus comandos de verificación— está en su `CLAUDE.md`, debajo de la línea que importa
este archivo.

## Cómo se trabaja

Spec Driven Development con Superpowers: nada se construye sin un diseño aprobado, y el diseño dice cómo se va a
verificar.

### Los nueve pasos

| Paso            | Skill de Superpowers                                               | Qué deja escrito                                                                                                                        |
| --------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Diseño       | `brainstorming`                                                    | Spec en `docs/superpowers/specs/`, con **criterios de aceptación**                                                                      |
| 2. Alta docs    | —                                                                  | Se registra la fase: entra al roadmap en `Designed` y su checklist nace en `Not run`, con puntos sacados de los criterios de aceptación |
| 3. Plan         | `writing-plans`                                                    | Plan en `docs/superpowers/plans/`. Fase: `Planned`                                                                                      |
| 4. Construcción | `subagent-driven-development`                                      | Rama desde la rama de trabajo de quien la construye, que declara `## Branches` del `CLAUDE.md`. Fase: `Building`                        |
| 5. Revisión     | `requesting-code-review`                                           | Revisión de la rama entera. Lo diferido, como `TD#` en `notes.md`                                                                       |
| 6. Verificación | `verification-before-completion`                                   | Los comandos que declara `## Verification` del `CLAUDE.md`, y abrir la pantalla                                                         |
| 7. Integración  | `finishing-a-development-branch`                                   | Merge a la rama de trabajo y, de ella, a la de integración. Fase: `Built` al llegar a la de integración                                 |
| 8. Checklist    | — (el administrador o un agente; ver "Cómo se corre un checklist") | Cada punto con su estado, y lo que falla, como hallazgo `F#`. Fase: `Verified` cuando sus checklists pasan                              |
| 9. Publicación  | — (la decide el administrador)                                     | Solo en `## Execution order` del roadmap                                                                                                |

### Iniciativa o cambio acotado

Un trabajo con más de una fase o con checklist propio es una iniciativa: carpeta en `docs/` y los nueve pasos. La
carpeta se crea con `npx sddkit new <initiative>`, que deja sus tres archivos ya válidos.

Un cambio acotado —el camino _bounded_ del brainstorming— se salta los pasos 1 a 3, no crea carpeta y no toca
ningún roadmap.

## Documentación

### Dónde va cada cosa

```text
docs/
  README.md                 ← índice: una línea por archivo o carpeta
  architecture/notes.md     ← lo transversal, que no es de ninguna iniciativa
  <initiative>/
    roadmap.md              ← dónde estamos: fases, orden de ejecución, bloqueos
    checklists.md           ← qué probar en pantalla y qué salió
    notes.md                ← por qué las cosas son así: decisiones, deuda, notas, procedimientos
  superpowers/specs|plans   ← el diseño y el plan de cada fase
```

| Lo que tienes                                         | Dónde va                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| Un trabajo con más de una fase o con checklist propio | Carpeta nueva con sus tres archivos, y una línea en `README.md` |
| Una lección que vale para cualquier feature           | `docs/architecture/notes.md`                                    |
| Algo que sirve para más de una iniciativa             | `docs/architecture/notes.md`: nunca dentro de una iniciativa    |
| Por qué una línea de código es como es                | Un comentario en el código, no `docs/`                          |

Una carpeta de `docs/` que no es una iniciativa —material de un cliente, una investigación— se declara en
`ignore` de `sdd.config.mjs`. Dentro de una iniciativa solo caben sus tres archivos y una carpeta `assets` con
las imágenes que su spec cita.

### El molde de cada archivo

Los títulos, los marcadores y los encabezados de tabla van en inglés y se escriben exactamente así: el vigilante
busca los títulos y los marcadores por su texto, y lee las tablas por la posición de sus columnas.

- **`roadmap.md`**: `## Phases summary`, `## Phase index`, `## Execution order`, `## Debt and ADRs` y, debajo,
  un título por fase con la forma `## PH1 · Nombre · 🟣 Designed`.
- **`checklists.md`**: `## Checklists summary`, `## Findings` y, debajo, un título por checklist con la forma
  `## Checklist 1 · Nombre · ⚪ Not run`. Dentro de cada uno, sus secciones (`### A · Nombre`), sus puntos y, al
  final, su tabla `### Findings of checklist N`. Un fallo que aparece sin estar corriendo ningún checklist —al
  programar o al usar la aplicación— va en `## Findings without checklist`.
- **`notes.md`**: `## Summary`, `## ADRs`, `## Tech debt`, `## Notes`, `## Runbooks` y `## References`, en ese
  orden. Cada entrada es un título `### ADR1 · Qué · 🟢 Accepted (AAAA-MM-DD)`, `### TD1 · Qué · 🟠 Open`,
  `### N1 · Qué` o `### RB1 · Qué`.

En `## Summary`, la columna `Status` lleva solo el estado, sin fecha: `🟢 Accepted`, `🟢 Resolved`, y una raya (`—`)
en las notas y los procedimientos. La fecha va solo en el título de la entrada. `⚫ Superseded (ADR#)` se escribe
igual en los dos sitios.

Las columnas de cada tabla van en este orden:

| Tabla                           | Encabezados                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------- |
| `## Phases summary`             | `Current phase`, `Next`, `What blocks what`                                   |
| `## Phase index`                | `ID`, `Phase`, `Old name`, `Status`, `Spec`, `Plan`                           |
| `## Checklists summary`         | `#`, `Checklist`, `Phase`, `Status`, `Progress`, `Last run`, `Findings`       |
| `## Findings`                   | `ID`, `Test case`, `Severity`, `Summary`, `Status`                            |
| `### Findings of checklist N`   | `ID`, `Test case`, `Severity`, `What happened`, `How it was closed`, `Status` |
| `## Findings without checklist` | `ID`, `Test case`, `Severity`, `What happened`, `How it was closed`, `Status` |
| `## Summary`                    | `ID`, `Type`, `What`, `Status`                                                |

Un punto de checklist se escribe en una línea, con su ID, su estado y la acción, y a continuación sus marcadores:

```text
- **2.B3** · ⚪ Not run · La acción que se hace. **Expected:** lo que debe verse. **Failure to catch:** el fallo
  que se busca aunque lo esperado parezca cumplirse.
```

Los marcadores son `**Expected:**`, `**Failure to catch:**` y `**Blocked:**` en un punto, `**Retake:**` y `**Gate:**`
en la introducción de un checklist y `**Origin:**` en una deuda.

Un checklist que es un Gate lo dice en su introducción, con un párrafo aparte que empieza por `**Gate:**` y nombra
qué desbloquea. Con esa marca, el vigilante falla si el checklist pasa a `Stale`:

```text
**Gate:** desbloquea `PH3`. Lo cruza el administrador en producción.
```

La introducción de un checklist puede llevar una lista numerada de requisitos; dentro de una sección, toda línea
que empieza por un número es un punto y lleva su ID.

### Un dato, un documento

Un dato que cambia vive en un solo documento. Repetirlo dentro del mismo archivo —un resumen arriba y el detalle
abajo— está permitido, porque se corrige en una sola edición. Entre documentos solo se citan cosas que no
cambian: IDs, reglas, rutas.

- La liga entre fase y checklist vive solo en `checklists.md`, en su columna `Phase`. El roadmap no nombra
  checklists.
- El roadmap habla de bloqueos entre fases y decisiones, por ID: "`PH3` espera a `PH2` en `Verified`".
- La publicación aparece solo en `## Execution order` de cada roadmap.
- `notes.md` abre con un resumen de todo lo que guarda; la sección `## Debt and ADRs` del roadmap solo remite
  ahí. El resumen va agrupado por tipo (`ADR`, `Debt`, `Note`, `Runbook`), en el mismo orden que las
  secciones. `architecture/notes.md` es la excepción a medias: sus secciones son temas, no tipos, pero su
  `## Summary` va igual que en una iniciativa, agrupado por tipo.
- Todo checklist lleva su tabla `### Findings of checklist N`, aunque esté vacía.
- Specs y planes se ligan solo desde el índice de fases del roadmap.
- `docs/README.md` es solo un índice: no lleva estados.
- Una ruta citada que empieza por una raíz vigilada (`pathRoots` de `sdd.config.mjs`; por defecto `docs`, `src` y
  `scripts`) tiene que existir: el vigilante falla si apunta a nada. Un archivo que ya se borró se nombra solo por
  su nombre, sin la ruta, para que no se lea como una ruta viva.

### Cómo se mantiene al día

- **Se actualiza en el mismo commit que el código.**
- **Lo que dejó de ser cierto se borra**; está en el historial de git. Las excepciones son las decisiones y la
  deuda: no dejan de ser ciertas, cambian de estado (`Superseded`, `Resolved`).
- **Un checklist no se archiva al completarse**: cuando un cambio toca lo que verifica, pasa a `Stale` en el
  mismo commit, con una línea **Retake:** que dice qué puntos se vuelven a probar. Si el cambio modifica lo que
  la pantalla debe hacer, se reescribe además el **Expected:** de los puntos afectados, aunque el checklist no se
  haya corrido. Un Gate nunca pasa a `Stale`, y uno ya cruzado no se toca.
- **Una elección cara de revertir se registra como `ADR` en el paso en que se toma**, o en `Proposed` si se
  aplaza.
- **El molde lo vigila `npm run check:docs`**: un estado distinto entre título y tabla, un resumen incompleto o
  una cita con otro formato hacen fallar la verificación. Se corre antes de cada commit que toque `docs/`.

### Glosario

Las etiquetas —prefijos de ID, estados, severidad, títulos del molde— van en inglés, porque funcionan como
identificadores. La prosa, en español.

| Término           | ID                       | Qué es                                                                                     | Estados                                                                                          |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Initiative        | carpeta `kebab`          | Trabajo de más de una fase o con checklist propio. No es una feature del producto          | —                                                                                                |
| Phase             | `PH1`                    | Unidad que se entrega                                                                      | ⚪ `Pending` · 🟣 `Designed` · 🔵 `Planned` · 🟡 `Building` · 🟠 `Built` · 🟢 `Verified` · ⚫ `Dropped` |
| Spec              | `AAAA-MM-DD-*-design.md` | Diseño aprobado antes de construir, con criterios de aceptación                            | —                                                                                                |
| Plan, Task        | `Task n`                 | Pasos ordenados que ejecuta el subagente                                                   | —                                                                                                |
| Checklist         | `1`, `2`…                | Verificación de una fase en pantalla, a mano o con un agente                               | ⚪ `Not run` · 🟡 `Running` · 🟢 `Passed` · 🟠 `Stale`                                               |
| Section           | `A`, `B`…                | Grupo de puntos dentro de un checklist; todo checklist tiene al menos `A`                  | —                                                                                                |
| Test case (punto) | `2.B3`                   | Acción, **Expected:** y, si aplica, **Failure to catch:**                                  | ⚪ `Not run` · 🟢 `Passed` · 🔴 `Failed` (con su `F#`) · 🟡 `Blocked` (con su **Blocked:**)          |
| Finding           | `F1`                     | Algo que falló o sorprendió al probar                                                      | 🔴 `Open` · 🟢 `Fixed` · 🟠 `Deferred (TD#)` · ⚪ `Not a bug`                                        |
| Severity          | —                        | Qué tan grave es un hallazgo. No es un estado: se elige al abrirlo                         | 🔴 `Critical` · 🟠 `High` · 🟡 `Low`                                                                |
| Exploratory test  | punto `—`                | Hallazgo que aparece al probar otra cosa, fuera de cualquier punto                         | —                                                                                                |
| Gate              | un checklist             | Paso manual en producción que desbloquea la fase siguiente. Se cruza una vez               | Los de un checklist, menos `Stale`                                                               |
| Tech debt         | `TD1`                    | Algo mejorable diferido a sabiendas. La pagada no se borra: pasa a `Resolved (AAAA-MM-DD)` | 🟠 `Open` · 🟢 `Resolved`                                                                          |
| ADR               | `ADR1`                   | Elección entre alternativas. Se conserva siempre                                           | 🟡 `Proposed` · 🟢 `Accepted` · ⚫ `Superseded (ADR#)`                                              |
| Note              | `N1`                     | Algo que parece un descuido y no lo es, o una lección                                      | —                                                                                                |
| Runbook           | `RB1`                    | Pasos manuales repetibles                                                                  | —                                                                                                |

### Estados

Qué estados tiene cada término está en el glosario. Aquí va cómo se escriben y qué exige cada uno.

**En cualquier documento:**

- Un estado se escribe con su emoji delante y su etiqueta detrás: `🟢 Verified`, nunca el emoji solo. Así va en
  tablas, en títulos y detrás del ID de cada punto (`- **2.B3** · 🟡 Blocked · …`). La palabra se busca con
  Ctrl+F y no depende de distinguir colores.
- Los colores significan lo mismo en todos los términos: verde es terminado, amarillo en marcha o por decidir,
  naranja hecho a medias, rojo un problema, blanco sin empezar y negro que ya no aplica.

**En `checklists.md`, los de un checklist y sus puntos:**

- Un checklist en `Passed` tiene todos sus puntos en `Passed`, y uno en `Not run`, todos en `Not run`. En
  `Running` o en `Stale`, el estado de cada punto dice qué se probó.
- La columna `Progress` del resumen cuenta los puntos en `Passed` sobre el total.
- Un punto `Blocked` no se pudo probar y dice por qué con **Blocked:**; uno `Failed` tiene un hallazgo que lo
  cita.

**En `roadmap.md`, los de una fase:**

- Una fase está en `Verified` solo si todos sus checklists están en `Passed`. Si uno pasa a `Stale`, la fase
  regresa a `Built` en el mismo commit, y vuelve a `Verified` cuando el checklist vuelve a `Passed`.

### IDs

- Son secuenciales dentro de su iniciativa (`architecture/notes.md` cuenta como una) y **nunca se reutilizan**,
  aunque la entrada se borre.
- Se citan con cada pieza en su propio código. Dentro de su iniciativa el ID va solo, esté en el archivo que
  esté; el de otra iniciativa lleva delante su carpeta:

  | Dónde vive la entrada | Como aparte       | Dentro de la frase             |
  | --------------------- | ----------------- | ------------------------------ |
  | La misma iniciativa   | (`N11`)           | "Verifica `PH1`"               |
  | Otra iniciativa       | (`billing` `N34`) | "lo cubre `architecture` `N7`" |

- El archivo no se nombra en la cita, porque el prefijo ya dice cuál es: `PH` vive en `roadmap.md`; `F` y los
  puntos (`2.B3`), en `checklists.md`; `ADR`, `TD`, `N` y `RB`, en `notes.md`.

- Varios IDs del mismo sitio se separan por coma: (`architecture` `N20`, `N21`).
- Sin anclas de Markdown, que se rompen al cambiar un título.
- Una fase renombrada conserva su nombre viejo en la columna `Old name` del índice de fases.
- Las specs y los planes no llevan IDs: se citan por su nombre de archivo, y un apartado suyo, por su título
  (`2026-09-04-pivot-tables-design.md`, apartado "Alcance"). Es la única cita entre documentos que no va por ID.
- Una palabra con forma de ID que no lo es —una tecla de función, un código de producto— se declara en `notIds` de
  `sdd.config.mjs`. Declarada, el vigilante deja de leerla como cita, suelta o entre acentos graves, en los
  documentos donde ese ID no existe. En una iniciativa que sí tiene un ID con ese nombre sigue siendo su ID, y una
  cita con prefijo se comprueba siempre.

## Cómo se corre un checklist

Un checklist se corre cuando su fase está en `Built`. Se corre sobre la rama de trabajo de quien lo corre, la
que declara `## Branches` del `CLAUDE.md`, después de traerle todo lo que tenga la rama de integración: así se
prueba el código que de verdad se integró. Lo corre el administrador o un agente que maneja el navegador con un
MCP; un Gate, solo el administrador.

El agente lee esta sección entera antes de empezar. Su prompt trae solo los datos de la corrida, no reglas: qué
checklists y, si ya se saben, la URL de la aplicación, con qué datos probar y si autoriza escrituras.

Cada cambio de estado se escribe en todos los sitios donde aparece: el de un checklist, en su título y en el
resumen de los checklists; el de una fase, en el roadmap: en su título, en el índice de fases y, si lo que dice
deja de ser cierto, en el resumen de las fases.

### Antes de empezar

1. Leer el checklist entero, la spec de su fase y las notas que cita.
2. Comprobar los requisitos que pide la introducción del checklist. Si falta alguno, la corrida sigue, y los
   puntos que dependen de él quedan en `Blocked` en el paso 4.
3. Poner el checklist en `🟡 Running` y la fecha de hoy en `Last run`. Qué puntos se prueban depende del estado
   en que estaba:

   | Estaba en | Qué se prueba                                                                          |
   | --------- | -------------------------------------------------------------------------------------- |
   | `Not run` | Todos                                                                                  |
   | `Stale`   | Los del **Retake:** (o todos, si dice `all`) y, del resto, los `Not run` y los `Blocked` |
   | `Running` | Los `Not run` y los `Blocked`                                                          |
   | `Passed`  | Ninguno: no se corre hasta que pase a `Stale`                                          |

   Al empezar un `Stale`, los puntos de su **Retake:** vuelven a `⚪ Not run` y pierden su **Blocked:** si lo
   tenían. La línea **Retake:** no se borra hasta el paso 6.

   Un `Failed` vuelve a probarse solo cuando su arreglo lo pone en el **Retake:** (ver "Cuando un hallazgo se
   cierra").

### La corrida

4. Probar cada punto: hacer la acción y comparar el resultado con el **Expected:**; que la acción se pueda hacer
   no basta. Si el punto tiene **Failure to catch:**, se busca ese fallo aunque lo esperado parezca cumplirse.
   - **Se cumple** → `🟢 Passed`.
   - **No se cumple** → `🔴 Failed`, y se abre un hallazgo (ver "Cómo se abre un hallazgo").
   - **No se puede probar**, porque falta algo que hoy nadie tiene (datos, una cuenta, una build) →
     `🟡 Blocked`, con una nota **Blocked:** que dice qué falta.
   - **Algo falla, o parece fallar, sin que ningún punto lo cubra** → se abre un hallazgo en la tabla del
     checklist que se estaba corriendo, con una raya (`—`) en `Test case`.
5. Actualizar `Progress` y `Findings` en el resumen de los checklists.

### Al terminar la corrida

6. Si todos los puntos quedaron en `Passed`, el checklist pasa a `🟢 Passed` y se borra su **Retake:**, si tenía.
   Si con eso todos los checklists de su fase están en `Passed`, la fase pasa a `🟢 Verified`. Si queda algún
   punto sin `Passed`, el checklist se queda en `Running`; un `Failed` espera a que se cierre su hallazgo.
7. Correr `npm run check:docs` y, si falla por lo que se editó en la corrida, corregirlo. Luego, hacer el commit.

### Cómo se abre un hallazgo

Lleva el siguiente `F#` de la iniciativa y va en dos tablas, las dos en `🔴 Open`:

- **En `### Findings of checklist N`**: el punto, la severidad y qué pasó, con una raya (`—`) en
  `How it was closed`.
- **En el índice `## Findings`**: el mismo punto y la misma severidad, y un resumen de una línea.

Un fallo que aparece sin estar corriendo ningún checklist se abre igual, con `## Findings without checklist` en
el lugar de la tabla del checklist y una raya (`—`) en `Test case`.

Si el punto ya tenía un hallazgo por ese fallo, no se abre otro mientras siga en `Open`. Si estaba en `Fixed`, el
arreglo no bastó: el hallazgo nuevo lo dice y cita al anterior.

La severidad es una de tres:

- `🔴 Critical`: la pantalla revienta, un dato se pierde o se corrompe, o el flujo no se puede terminar.
- `🟠 High`: lo esperado no se cumple, y quien usa la pantalla lo notaría o decidiría algo equivocado por ello.
- `🟡 Low`: cosmético o de redacción, sin efecto en lo que se decide.

### Lo que cambia para un agente

- **El navegador y la aplicación.** Antes que nada, confirma tres cosas: que el MCP del navegador responde, que
  el repo está en la rama de trabajo de quien lo lanzó, y que el `checklists.md` y el roadmap de la iniciativa no
  tienen cambios sin commit. Usa la aplicación de la URL del prompt; si no hay, la que ya esté corriendo, o la
  levanta en segundo plano con el comando que declara el `CLAUDE.md`. Si algo de esto falla, se detiene y avisa:
  no prueba con otro navegador, no cambia de rama ni toca esos cambios.
- **La sesión.** Usa la sesión que guarda el perfil del navegador del MCP; nunca pide ni escribe una contraseña.
  Si cae en la pantalla de acceso o un punto pide otro rol, le pide al administrador que entre en esa ventana.
  Los puntos de otro rol van al final.
- **Prueba como una persona.** Hace clic, escribe en los campos y mira el resultado. No cambia la acción por un
  script en la página ni por una lectura de la base de datos, salvo que el **Expected:** lo pida.
- **Prueba todo lo que está a su alcance.** Un juicio visual lo hace sobre una captura de pantalla, un archivo
  descargado lo abre, y la vista de teléfono la emula en el navegador. Lo que aun así no puede comprobar entero
  lo deja en `⚪ Not run`, nunca en `Blocked`, y dice qué intentó.
- **Escribe solo con permiso, y lo pide siempre.** Para crear, guardar o borrar necesita que el administrador lo
  autorice. Si un punto lo necesita y el prompt no lo autoriza, pide el permiso antes de empezar. Con él, usa
  registros de prueba que se reconozcan por su nombre y los borra al terminar; sin él, el punto se queda en
  `Not run`.
- **Pregunta antes de empezar.** Entre los pasos 2 y 3, busca en la aplicación lo que piden los puntos que va a
  probar y le manda al administrador un solo mensaje, aunque no le falte nada, con:
  - qué le falta y qué puntos lo necesitan: requisitos, datos, una cuenta con otro rol, permiso para escribir;
  - qué puntos le deja y por qué;
  - qué checklists no correrá, por estar en `Passed` o ser un Gate.

  Espera la respuesta. Lo que el administrador dice que no existe deja sus puntos en `Blocked`, con eso en su
  **Blocked:**; lo que prefiere probar él, en `Not run`.

- **Decide solo.** Marca `Passed`, abre hallazgos y pasa la fase a `Verified` cuando toca (paso 6), sin pedir
  confirmación. Si duda de un punto, lo deja en `Not run` y explica por qué.
- **Solo edita el `checklists.md` y el roadmap de la iniciativa, y no hace commit.** Un fallo se registra como
  hallazgo; el código no se toca.
- **Al terminar**, apaga la aplicación si la levantó él y reporta:
  - qué puntos probó y cómo salieron;
  - qué hallazgos abrió y qué fases pasó a `Verified`;
  - qué dejó en `Blocked` o en `Not run`, y por qué;
  - qué registros de prueba creó y si los borró;
  - si `npm run check:docs` pasó.

### Cuando el agente termina

El administrador prueba los puntos que el agente le dejó en `Not run`, si los hay (pasos 4 a 6), y termina con
el paso 7.

### Cuando un hallazgo se cierra

Nunca se cierra durante una corrida ni lo cierra un agente. En un mismo commit, su estado cambia en las dos
tablas, `How it was closed` dice qué se hizo y el punto cambia según el cierre:

- `🟢 Fixed`: lo cierra quien arregla el fallo, en el commit del arreglo. El punto sigue en `Failed` y entra en
  el **Retake:**, con los demás que el arreglo pueda afectar.
- `⚪ Not a bug`: la pantalla hacía lo correcto; lo equivocado era el punto. Lo decide el administrador. El punto
  pasa a `Passed` sin volver a probarlo y, si su **Expected:** pedía algo que ya no aplica, se corrige y dice de
  dónde sale lo correcto: un `ADR#` o la spec.
- `🟠 Deferred (TD#)`: sí es un fallo, pero la fase se entrega sin arreglarlo. Lo decide el administrador y se
  anota como `TD#` en el `notes.md` de la iniciativa. El **Expected:** se reescribe para decir lo que la pantalla
  hace hoy, citando la `TD#`, y el punto pasa a `Passed`. Cuando la deuda se pague, la fase que la pague lo
  prueba con un punto propio. **Un `Critical` no se difiere.**

Si al cerrar un hallazgo como `Not a bug` o `Deferred` todos los puntos del checklist quedan en `Passed`, el
checklist se cierra como en el paso 6.

### Cuando un cambio toca un checklist

Un checklist se marca como viejo al programar, no al probar: lo hace quien cambia el código, en el mismo commit,
porque es quien sabe qué pantallas y qué comportamientos tocó.

Un Gate nunca pasa a `Stale`, y uno ya cruzado no se toca: si el cambio toca lo que verificó, lo verifica un
checklist o un punto de la fase que hace el cambio.

**Si el cambio modifica lo que la pantalla debe hacer**, y no solo cómo lo hace, se reescribe el **Expected:** de
los puntos afectados, esté el checklist en el estado que esté.

**Si el checklist ya tiene resultados** y el cambio afecta algo de lo que verifica:

- **Pasa a `🟠 Stale`**, y su fase, si estaba en `🟢 Verified`, regresa a `🟠 Built`.
- **Lleva una línea Retake**: un párrafo aparte en su introducción que dice qué puntos hay que volver a probar y
  por qué. Son los puntos cuyo **Expected:** depende de lo que cambió; si el cambio toca algo que todos comparten
  (los datos que lee la pantalla, un componente común, el cálculo), o si hay duda, se escribe `all`. El motivo
  nombra la fase o el cambio que los tocó:

```text
**Retake:** `2.A3`, `2.B1`. `PH7` cambió la ventana emergente.
```

Si ya tiene su **Retake:**, no se agrega otra línea: en la que existe se suman los puntos de este cambio y su
motivo, o solo el motivo si ya dice `all`.

## Idioma y formato

- **Identificadores en inglés; comentarios, textos de interfaz, mensajes de commit y documentación en español**,
  con sus acentos. Nunca se sustituye un acento por su equivalente ASCII.
- **La nomenclatura del molde es un identificador y va en inglés**: nombres de archivo y carpeta de `docs/`
  —en kebab minúscula—, títulos de sección, marcadores, encabezados de tabla, prefijos de ID y estados. Los
  nombres de fase, de checklist y de sección, y todo lo que se lee como frase, van en español.
- Un comentario explica **por qué** algo es como es, no qué hace la línea de abajo.

Un proyecto nuevo se siembra con `npx sddkit init`.
