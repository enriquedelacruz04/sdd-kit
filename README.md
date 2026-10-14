# sdd-kit

Spec Driven Development para proyectos JS/TS: las reglas de trabajo, el molde de `docs/` y el vigilante que
comprueba que el molde se cumple.

## Instalar en un proyecto

```bash
npm i -D github:enriquedelacruz04/sdd-kit#v9.0.0 --allow-git=all
npx sddkit init
npm run check:docs
```

`sddkit init` siembra `CLAUDE.md`, `AGENTS.md`, `sdd.config.mjs`, `.npmrc`, `docs/README.md` y
`docs/architecture/notes.md`, y añade el script `check:docs`. No pisa nada que ya exista. Después hay que llenar
las secciones del `CLAUDE.md`, que son las de ese proyecto.

Desde npm 12, una dependencia que viene de un repositorio de git se rechaza por defecto, con el error
`EALLOWGIT`. Por eso la primera instalación lleva `--allow-git=all`, y por eso `init` deja un `.npmrc` con
`allow-git=all`, que se sube al repo: con él, `npm install` y `npm ci` funcionan en un clon nuevo sin la opción.
Con `allow-git=root` la instalación pasa, pero subir de versión falla. Un `.npmrc` que ya existía no se toca, y
`init` dice qué línea le falta.

## Migrar un proyecto que ya existe

Los tres comandos de arriba se corren igual. Lo que cambia es que el proyecto ya trae su `CLAUDE.md` y su
documentación, y `sddkit init` no los toca: llevarlos al molde es trabajo de un agente. El método no dice cómo se
migra, así que el prompt lleva el procedimiento:

```text
Este proyecto acaba de instalar sdd-kit y todavía no sigue su método. Migra su documentación al molde.

Lee entero node_modules/@enriquedelacruz04/sdd-kit/METHODOLOGY.md antes de empezar. Después:

1. Haz el inventario: el CLAUDE.md, el AGENTS.md, todo lo que hay en docs/ y cualquier otro documento del repo
   que hable de decisiones, pendientes, pruebas manuales o planes.
2. Antes de mover o escribir nada, mándame un solo mensaje con:
   - a dónde va cada documento según "Dónde va cada cosa", y cuáles se borran porque ya no son ciertos;
   - qué iniciativas propones, con sus fases y el estado de cada una;
   - qué no supiste clasificar.
   Espera mi respuesta.
3. CLAUDE.md: si ya existía, `sddkit init` no lo pisó. Ponle arriba la línea de import
   `@node_modules/@enriquedelacruz04/sdd-kit/METHODOLOGY.md` y reparte lo que decía entre las siete secciones de
   node_modules/@enriquedelacruz04/sdd-kit/templates/CLAUDE.md. Lo que repite al método se borra. Con el
   AGENTS.md, lo mismo: que remita al método y al CLAUDE.md.
4. Crea cada iniciativa con `npx sddkit new <initiative>` y llena sus tres archivos. Lo transversal va en
   docs/architecture/notes.md. Mueve con `git mv` lo que se conserva, para no perder su historial.
5. Corre `npm run check:docs` y corrige hasta que imprima `OK docs`.

Reglas de la migración:

- No inventes historia. Una decisión es un ADR solo si el repo dice qué se eligió y entre qué; su fecha sale de
  git. Lo que no conste me lo preguntas o se queda fuera.
- El estado de una fase es el de hoy. Un checklist que nadie corrió nace en `Not run`, aunque la pantalla lleve
  meses en producción, y su fase no pasa de `Built`.
- Solo es iniciativa el trabajo vivo o por verificar. Lo terminado hace tiempo deja, como mucho, sus decisiones
  y su deuda en docs/architecture/notes.md.
- Lo que no es una iniciativa —material de un cliente, una investigación— se queda en docs/, junto a
  initiatives/. Si el vigilante falla por sus rutas, su carpeta va en `ignore` de sdd.config.mjs.
- Una palabra con forma de ID que no lo es va en `notIds`; no la reescribas para esquivar al vigilante.
- No toques el código ni hagas commit. Al terminar dime qué moviste, qué borraste y qué quedó por decidir.
```

El paso 2 es el que importa: el agente propone y el administrador decide qué es una iniciativa y en qué estado
está cada fase, que es lo que el repo no siempre dice. Después de la migración quedan por llenar a mano las
secciones del `CLAUDE.md` que el agente no pudo sacar de ningún documento.

## Comandos

| Comando                   | Qué hace                                                                    |
| ------------------------- | --------------------------------------------------------------------------- |
| `sddkit init`             | Siembra el esqueleto                                                        |
| `sddkit new <initiative>` | Crea `docs/initiatives/<initiative>/` con sus tres archivos y la anota      |
| `sddkit check`            | Comprueba que `docs/` cumple el molde; sale con 1 si no                     |

## Configuración

`sdd.config.mjs`, todo opcional:

| Clave              | Qué controla                                      |
| ------------------ | ------------------------------------------------- |
| `ignore`           | Carpetas de `docs/` que el vigilante no lee       |
| `claudeHeadings`   | Títulos obligatorios del `CLAUDE.md` del proyecto |
| `publicationWords` | Qué cuenta como hablar de publicación             |
| `pathRoots`        | Raíces cuyas rutas citadas deben existir          |
| `notIds`           | Palabras con forma de ID que no lo son, como F12  |

Una palabra de `notIds` solo se ignora donde ese ID no existe: en una iniciativa que tiene un hallazgo con ese
nombre, sigue siendo su hallazgo.

## Correr un checklist con un agente

Las reglas de la corrida ya están en el método, en "Cómo se corre un checklist", y el agente las lee de ahí. El
prompt lleva solo los datos de esta corrida:

```text
Corre los checklists 2 y 3 de docs/initiatives/<initiative>/checklists.md, siguiendo entera la sección "Cómo se corre un
checklist" del método.

- Herramienta: la web, con el MCP chrome-devtools de Google; la app móvil, en el teléfono Android conectado por
  USB, con adb
- Aplicación: http://localhost:5173
- Datos de prueba: el cliente "Demo" y sus pedidos de septiembre
- Escrituras: autorizadas, con registros de prueba que empiecen por "TEST-" y que borras al terminar
```

Las cuatro líneas de datos son opcionales. Sin herramienta, el agente usa la que declara `## Verification` del
`CLAUDE.md`, y solo emula el teléfono en el navegador si no hay dispositivo; sin URL, usa la aplicación que ya
esté corriendo o la levanta con el comando del `CLAUDE.md`; sin datos, los busca en la aplicación; y sin
autorización para escribir, la pide antes de empezar si algún punto la necesita. Antes de probar manda un solo
mensaje con lo que le falta y espera la respuesta.

## Subir de versión

Cambia el tag en `package.json` y corre `npm install`; con npm 12 hace falta el `.npmrc` que deja `sddkit init`.
`CHANGELOG.md` dice qué cambia en cada versión y, en una mayor, cómo migrar la documentación.

## Desarrollo

`npm run checks` corre todos los arneses; `checks/README.md` dice qué cubre cada uno. Las reglas del repo están
en `CLAUDE.md`.
