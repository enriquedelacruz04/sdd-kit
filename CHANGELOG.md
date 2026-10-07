# Cambios

Una versión mayor es una en la que documentación antes válida deja de pasar `sddkit check`, o en la que cambia una
regla del método; lleva su nota de migración. Una menor añade comprobaciones que solo cazan lo que ya era un
error, comandos o plantillas. Un parche corrige.

## 5.0.1

El vigilante ve la cita que nombra el archivo aunque el ajuste de línea la parta: `` `notes.md` `` al final de una
línea y el ID al principio de la siguiente pasaban sin error. Apareció al migrar el admin de Cappi a la 5.0.0,
donde cuatro citas con esa forma quedaron sin señalar.

## 5.0.0

Una cita a un ID de la misma iniciativa ya no nombra el archivo: se escribe (`N3`), no (`notes.md` `N3`). El
prefijo del ID ya dice dónde vive, y el vigilante falla si la cita lleva `notes.md`, `roadmap.md` o
`checklists.md` delante. La carpeta sigue yendo delante de un ID de otra iniciativa.

Cambia además una regla del método: un checklist se corre sobre la rama de trabajo de quien lo corre, al día con
la de integración, no sobre la rama de integración. El agente comprueba esa rama antes de empezar. La fase sigue
pasando a `Built` al llegar a la rama de integración (paso 7).

Cambia también lo que hace un agente al correr un checklist (`kit-v1` `ADR10`). Prueba todo lo que está a su
alcance: un juicio visual sobre una captura de pantalla, un archivo descargado abriéndolo y la vista de teléfono
emulada en el navegador; antes le dejaba esos puntos al administrador. Pide siempre el permiso para escribir antes
de empezar si algún punto lo necesita. Y el administrador ya no revisa el diff del agente contra su reporte: solo
prueba los puntos que le quedan en `Not run`.

"Lo que cambia para un agente" y "Cuando un cambio toca un checklist" se reescriben sin cambiar más reglas, y el
método dice ahora cuándo se usa `## Findings without checklist`: para un fallo que aparece sin estar corriendo
ningún checklist.

"Estados" e "IDs" se reescriben: los puntos de "Estados" van agrupados por el documento del que hablan y cada uno
dice una sola cosa, y las formas de citar un ID van en una tabla.

**Migración:** en `docs/` y en el `CLAUDE.md`, toda cita con la forma `` `notes.md` `N3` `` pierde el nombre del
archivo y queda en `` `N3` ``; el vigilante nombra cada línea que la lleva. Quien corre un checklist, o lanza al
agente que lo corre, lo hace desde su rama de trabajo.

## 4.0.0

La sección del roadmap que remite a `notes.md` se titula `## Debt and ADRs`, no `## Debt and decisions`. Completa
el renombre de la 3.0.0: el molde ya no usa la palabra `Decision` en ningún título ni tipo.

**Migración:** en el `roadmap.md` de cada iniciativa, el título `## Debt and decisions` se renombra a
`## Debt and ADRs`.

## 3.0.0

El tipo de una decisión se llama `ADR`, como su prefijo de ID: en la columna `Type` de `## Summary` y en el
glosario, donde antes decía `Decision`. La sección de `notes.md` que las guarda se titula `## ADRs`, no
`## Decisions`. En el glosario, además, `Free test` pasa a llamarse `Exploratory test`, y la columna `Estándar`
deja su sitio a una de estados.

**Migración:** en el `## Summary` de cada `notes.md`, incluido `docs/architecture/notes.md`, la fila de cada
`ADR#` lleva `ADR` en la columna `Type`; con `Decision`, el vigilante falla y nombra la fila. En el
`notes.md` de cada iniciativa, el título `## Decisions` se renombra a `## ADRs`.

## 2.0.0

Cambia una regla del método: una rama de feature sale de la rama de trabajo de quien la construye, no de la rama
de integración (paso 4), y vuelve a ella antes de llegar a la de integración. La fase pasa a `Built` cuando llega
a la rama de integración (paso 7), no al cerrar la rama de feature.

**Migración:** declara en `## Branches` del `CLAUDE.md` la rama de trabajo de cada integrante del equipo. Una fase
marcada `Built` que todavía no está en la rama de integración vuelve a `Building`. El vigilante no cambia:
documentación que ya pasaba sigue pasando.

## 1.3.0

Una palabra de `notIds` solo se ignora en los documentos donde ese ID no existe, y nunca dentro de una cita con
prefijo. Antes se ignoraba en todo `docs/`, y declarar una tecla con el nombre de un hallazgo real dejaba sin
vigilar las citas a ese hallazgo. Un proyecto que dependía de eso verá ahora el error que ya tenía: una cita sin
su código o a un ID que no existe.

## 1.2.0

- Un checklist se marca como Gate con un párrafo `**Gate:**` en su introducción, y con la marca no puede pasar a
  `Stale`.
- Una lista numerada en la introducción de un checklist ya no se toma por un punto sin ID.
- Una entrada de `ignore` con barras es un error: antes se aceptaba y no ignoraba nada.
- Mensajes más claros: un `CLAUDE.md` o un `docs/architecture/notes.md` ausentes dan un solo error, y un archivo
  de más en una iniciativa se nombra.

Documentación que ya pasaba sigue pasando.

## 1.1.0

Clave nueva `notIds` en `sdd.config.mjs`: palabras con forma de ID que no lo son. El vigilante deja de leerlas
como citas. Documentación que ya pasaba sigue pasando.

## 1.0.2

Las etiquetas de la salida de `sddkit init` y `sddkit new` van en inglés: `created`, `exists` y `updated`.

## 1.0.1

Licencia MIT. Sin cambios en el método, las plantillas ni el vigilante.

## 1.0.0

Primera versión: `METHODOLOGY.md`, las plantillas, el vigilante y los comandos `sddkit init`, `sddkit new` y
`sddkit check`.
