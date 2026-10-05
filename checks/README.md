# Arneses

`npm run checks` ejecuta todos los `check-*.mjs` de esta carpeta con Node, sin bundlear. Cada uno usa
`node:assert/strict` y termina con `console.log("OK <tema>")`; cada caso lleva un comentario que dice por qué
existe.

| Arnés                   | Qué cubre                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `check-cli.mjs`         | El camino entero por la CLI, los códigos de salida, la configuración mal escrita y el binario |
| `check-config.mjs`      | Valores por defecto, mezcla con lo declarado y rechazo de claves y valores inválidos          |
| `check-docs.mjs`        | El vigilante: un proyecto mínimo válido y un caso por cada defecto que debe cazar             |
| `check-io.mjs`          | Que el acceso a disco y el acceso en memoria responden igual                                  |
| `check-methodology.mjs` | Que el método no arrastra restos de Cappi y enseña lo mismo que el vigilante exige            |
| `check-own-docs.mjs`    | Que la documentación del propio kit cumple el molde                                           |
| `check-pack.mjs`        | Que el paquete lleva lo que un proyecto necesita y nada del repo                              |
| `check-templates.mjs`   | Que lo que siembran `sddkit init` y `sddkit new` cumple el molde, y que no pisan ni mezclan         |
