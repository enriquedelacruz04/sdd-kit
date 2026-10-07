# sdd-kit

Spec Driven Development para proyectos JS/TS: las reglas de trabajo, el molde de `docs/` y el vigilante que
comprueba que el molde se cumple.

## Instalar en un proyecto

```bash
npm i -D github:enriquedelacruz04/sdd-kit#v5.0.1
npx sddkit init
npm run check:docs
```

`sddkit init` siembra `CLAUDE.md`, `AGENTS.md`, `sdd.config.mjs`, `docs/README.md` y `docs/architecture/notes.md`, y
añade el script `check:docs`. No pisa nada que ya exista. Después hay que llenar las secciones del `CLAUDE.md`,
que son las de ese proyecto.

## Comandos

| Comando                   | Qué hace                                                                    |
| ------------------------- | --------------------------------------------------------------------------- |
| `sddkit init`             | Siembra el esqueleto                                                        |
| `sddkit new <initiative>` | Crea `docs/<initiative>/` con sus tres archivos y la anota en el índice     |
| `sddkit check`            | Comprueba que `docs/` cumple el molde; sale con 1 si no                     |

## Configuración

`sdd.config.mjs`, todo opcional:

| Clave              | Qué controla                                      |
| ------------------ | ------------------------------------------------- |
| `ignore`           | Carpetas de `docs/` que no son iniciativas        |
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
Corre los checklists 2 y 3 de docs/<initiative>/checklists.md, siguiendo entera la sección "Cómo se corre un
checklist" del método.

- Aplicación: http://localhost:5173
- Datos de prueba: el cliente "Demo" y sus pedidos de septiembre
- Escrituras: autorizadas, con registros de prueba que empiecen por "TEST-" y que borras al terminar
```

Las tres líneas de datos son opcionales. Sin URL, el agente usa la aplicación que ya esté corriendo o la levanta
con el comando del `CLAUDE.md`; sin datos, los busca en la aplicación; y sin autorización para escribir, la pide
antes de empezar si algún punto la necesita. Antes de probar manda un solo mensaje con lo que le falta y espera
la respuesta.

## Subir de versión

Cambia el tag en `package.json` y corre `npm install`. `CHANGELOG.md` dice qué cambia en cada versión y, en una
mayor, cómo migrar la documentación.

## Desarrollo

`npm run checks` corre todos los arneses; `checks/README.md` dice qué cubre cada uno. Las reglas del repo están
en `CLAUDE.md`.
