# Instrucciones del repositorio

@METHODOLOGY.md

Lo de arriba es cómo se trabaja y cómo se documenta. Lo de abajo es este proyecto. **Antes de preguntar o de
suponer, revisa `docs/`**: empieza por `docs/README.md`.

## Branches

- **`main` es la rama de trabajo y la de integración**: el kit lo mantiene una sola persona, y de ella sale toda
  rama.
- Una versión es un tag `vX.Y.Z` sobre `main`.

## Environment

- Node 18 o superior. El paquete no tiene dependencias, y se queda sin ellas.
- Los proyectos que lo usan viven en Windows: lo que lea o escriba archivos tiene que funcionar con CRLF.
- El método nació en el admin de Cappi, en `proyectos-web/proyectos-react/cappi`, que es el primer proyecto que
  lo consume.

## Publication constraints

- Un cambio que hace fallar documentación antes válida es una versión mayor, y lleva su nota de migración en
  `CHANGELOG.md`.
- `METHODOLOGY.md`, las plantillas y el vigilante cambian en el mismo commit: los tres dicen lo mismo.

## Architecture

- `src/check-docs.js` es una función pura: recibe por dónde leer y devuelve la lista de errores. No toca el disco
  ni `process`.
- Cada comando de `src/commands/` recibe un objeto con `cwd` y los canales de salida que necesita, y devuelve su
  código de salida. Solo `bin/sdd.js` toca `process`.
- `templates/` es lo que se siembra. Una plantilla que no pasa el vigilante es un defecto de la plantilla.
- Los mensajes que ve quien usa el kit van en español; los títulos, marcadores y claves que el vigilante busca, en
  inglés.

## Verification

`npm run checks` corre todos los arneses de `checks/`. No hay test runner, ni lint, ni build. Lo que los arneses
no ven: que una sesión nueva de Claude Code cargue de verdad el método por el import, y que la instalación desde
GitHub funcione. Las dos cosas se prueban en un proyecto piloto.

### Cómo usa el kit su propio método

El kit se documenta con su molde, pero es una librería de línea de comandos: del método usa lo que le sirve.

- **El molde de `docs/`, los `ADR` y la deuda, siempre.** Una decisión con alternativas se registra como `ADR` en
  el `notes.md` de `kit-v1` en el commit en que se toma, aunque el cambio sea acotado.
- **Una versión menor o un parche es un cambio acotado**: sin spec, sin plan y sin fase nueva. Lleva su entrada en
  `CHANGELOG.md` y sus arneses. Una fase nueva es solo para algo que cambia el alcance del paquete, como soportar
  otro lenguaje.
- **Un solo checklist, el de instalación en un proyecto piloto.** No hay pantalla que abrir: lo que ningún arnés ve
  es instalar el paquete de verdad y que Claude Code cargue el import. Se vuelve a correr antes de etiquetar
  cualquier versión que toque lo que entra en el paquete, una plantilla, un comando o la línea de import.
- **El checklist pasa a `Stale` en el commit que toca lo que verifica**, con su **Retake:**, y la fase vuelve a
  `Built`. El vigilante no puede ver ese olvido, porque no sabe qué cambió en el código.
- **La sección de comandos la puede correr un agente.** El punto de la sesión nueva de Claude Code lo corre el
  administrador, o un agente con `claude -p` y las herramientas de lectura deshabilitadas.

## Known pitfalls

- Una regla que cambia solo en el método deja al vigilante exigiendo la vieja, y al revés.
- Un archivo nuevo de `templates/` o de `src/` que no cae bajo "files" de `package.json` existe en el repo y falta
  en el proyecto que instala el kit.
- El nombre de un paquete o de un comando se comprueba en el registro de npm antes de elegirlo: `npx` ejecuta el
  del registro cuando el local no está instalado (`kit-v1` `ADR5`).
- Un cambio en un comando o en una plantilla que no marca el checklist como `Stale` lo deja diciendo `Passed`
  sobre una corrida vieja (`kit-v1` `N2`).

## Removed

Nada todavía.
