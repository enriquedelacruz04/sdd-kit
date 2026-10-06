# Cambios

Una versión mayor es una en la que documentación antes válida deja de pasar `sddkit check`, o en la que cambia una
regla del método; lleva su nota de migración. Una menor añade comprobaciones que solo cazan lo que ya era un
error, comandos o plantillas. Un parche corrige.

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
