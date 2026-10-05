# sdd-kit

Spec Driven Development para proyectos JS/TS: las reglas de trabajo, el molde de `docs/` y el vigilante que
comprueba que el molde se cumple.

## Instalar en un proyecto

```bash
npm i -D github:enriquedelacruz04/sdd-kit#v1.0.1
npx sddkit init
npm run check:docs
```

`sddkit init` siembra `CLAUDE.md`, `AGENTS.md`, `sdd.config.mjs`, `docs/README.md` y `docs/architecture/notes.md`, y
añade el script `check:docs`. No pisa nada que ya exista. Después hay que llenar las secciones del `CLAUDE.md`,
que son las de ese proyecto.

## Comandos

| Comando                | Qué hace                                                                    |
| ---------------------- | --------------------------------------------------------------------------- |
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

## Subir de versión

Cambia el tag en `package.json` y corre `npm install`. `CHANGELOG.md` dice qué cambia en cada versión y, en una
mayor, cómo migrar la documentación.

## Desarrollo

`npm run checks` corre todos los arneses; `checks/README.md` dice qué cubre cada uno. Las reglas del repo están
en `CLAUDE.md`.
