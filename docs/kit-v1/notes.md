# Kit v1 — notes

## Summary

| ID   | Type     | What                                                                       | Status      |
| ---- | -------- | -------------------------------------------------------------------------- | ----------- |
| ADR1 | Decision | Paquete npm, no plugin ni submódulo                                        | 🟢 Accepted |
| ADR2 | Decision | Nomenclatura en inglés, prosa en español                                   | 🟢 Accepted |
| ADR3 | Decision | El método se importa desde `node_modules`                                  | 🟢 Accepted |
| ADR4 | Decision | La configuración es `.mjs`, no `.js`                                       | 🟢 Accepted |
| ADR5 | Decision | Paquete con scope y comando `sddkit`                                       | 🟢 Accepted |
| TD1  | Debt     | Una palabra con forma de ID no tiene escapatoria                           | 🟢 Resolved |
| TD2  | Debt     | Una lista numerada en la introducción de un checklist se toma por un punto | 🟢 Resolved |
| TD3  | Debt     | `ignore` solo acepta nombres de carpeta                                    | 🟢 Resolved |
| TD4  | Debt     | Mensajes poco claros cuando falta un archivo entero                        | 🟢 Resolved |
| TD5  | Debt     | El método no dice cómo se marca un checklist como Gate                     | 🟢 Resolved |
| TD6  | Debt     | Menores de `src/config.js` y `src/io.js`                                   | 🟢 Resolved |
| N1   | Note     | El corredor de arneses del código no viaja                                 | —           |

## Decisions

### ADR1 · Paquete npm, no plugin ni submódulo · 🟢 Accepted (2026-10-05)

**Contexto:** el método tiene que llegar a proyectos nuevos y actualizarse en todos a la vez. **Alternativas:** un
plugin de Claude Code, que se actualiza solo pero deja al vigilante fuera de los comandos del repo y no lo ve
Codex; un repo plantilla con submódulo de git, incómodo en Windows y con agentes; o un paquete npm instalado desde
GitHub por tag. **Decisión:** el paquete. Las reglas y el vigilante viajan juntos y con la misma versión, y viven
donde los ven Claude Code, Codex y CI. El precio es que solo sirve a proyectos JS/TS.

### ADR2 · Nomenclatura en inglés, prosa en español · 🟢 Accepted (2026-10-05)

**Contexto:** el molde de Cappi mezclaba títulos en español con estados y prefijos en inglés. **Decisión:** todo
lo que el vigilante busca por su texto —nombres de archivo y carpeta, títulos de sección, marcadores, encabezados
de tabla— va en inglés, igual que los comandos y las claves de configuración. Los nombres de fase, las
descripciones y los mensajes de error van en español. El precio lo paga Cappi al migrar: renombra archivos,
títulos y marcadores.

### ADR3 · El método se importa desde `node_modules` · 🟢 Accepted (2026-10-05)

**Contexto:** el `CLAUDE.md` de cada proyecto tiene que cargar `METHODOLOGY.md` sin copiarlo, o habría dos
versiones. **Alternativas:** copiar el archivo a `docs/` y vigilar que coincida con la versión instalada; o
importarlo desde `node_modules`, que está fuera de git. **Decisión:** el import. Se comprobó con una palabra clave
en el archivo importado y una sesión sin herramientas de lectura: la sesión la responde con el import y no la
responde sin él. Si una versión de Claude Code deja de resolverlo, la alternativa es la copia vigilada.

### ADR4 · La configuración es `.mjs`, no `.js` · 🟢 Accepted (2026-10-05)

**Contexto:** la spec pedía `sdd.config.js`. **Decisión:** `sdd.config.mjs`. Un proyecto sin `"type": "module"`
en su `package.json` no puede importar un `.js` que usa `export default`, y el kit no puede exigirle ese cambio.

### ADR5 · Paquete con scope y comando `sddkit` · 🟢 Accepted (2026-10-05)

**Contexto:** el paquete se llamaba `sdd-kit` y su comando, `sdd`. Los dos nombres ya existen en el registro de
npm y son de otras personas. En un proyecto sin el kit instalado, `npx` bajó y ejecutó el paquete ajeno.
**Decisión:** el paquete es `@enriquedelacruz04/sdd-kit` y el comando, `sddkit`, que no existe en el registro.
El script `check:docs` que se siembra usa el binario local, así que no sale a buscarlo. El precio es una línea de
import más larga en el `CLAUDE.md` de cada proyecto. Un nombre libre hoy puede registrarlo otro mañana: el kit se
instala siempre antes de llamarlo.

## Tech debt

### TD1 · Una palabra con forma de ID no tiene escapatoria · 🟢 Resolved (2026-10-05)

Una tecla de función o un código con forma de ID, escritos en prosa, fallan como cita sin código, y entre acentos graves
fallan como cita a un ID que no existe. No había forma de nombrarlos sin que el vigilante los leyera como citas.

**Cómo se pagó:** la clave `notIds` de `sdd.config.mjs`, en la versión 1.1.0. El proyecto declara la palabra una
vez y el vigilante la borra del texto antes de buscar citas. Se descartó marcar solo los IDs que existen: una cita
sin su código a un ID borrado habría pasado en silencio.

**Origin:** revisión final de la rama, 2026-10-05.

### TD2 · Una lista numerada en la introducción de un checklist se toma por un punto · 🟢 Resolved (2026-10-05)

El vigilante trata una línea que empieza por un número y un punto como un punto sin ID válido, aunque sea una
enumeración de la introducción del checklist.

**Cómo se pagó:** el aviso de punto sin ID solo se da dentro de una sección, en la versión 1.2.0. El método lo dice en "El
molde de cada archivo".

**Origin:** revisión final de la rama, 2026-10-05.

### TD3 · `ignore` solo acepta nombres de carpeta · 🟢 Resolved (2026-10-05)

Un valor con barra se acepta sin error y no ignora nada, porque se compara con el nombre de cada carpeta de `docs/`.

**Cómo se pagó:** una entrada con barras es ahora un error que dice cómo se escribe, en la versión 1.2.0. Se descartó
normalizarla: aceptar dos formas de escribir lo mismo es otra cosa que recordar.

**Origin:** revisión final de la rama, 2026-10-05.

### TD4 · Mensajes poco claros cuando falta un archivo entero · 🟢 Resolved (2026-10-05)

Un `CLAUDE.md` ausente da ocho errores, uno por cada título que falta. Un archivo de más en una iniciativa lista los
cuatro archivos sin decir cuál sobra.

**Cómo se pagó:** en la versión 1.2.0, un `CLAUDE.md` o unas notas de arquitectura ausentes dan un solo error que dice
qué correr, y el error de una iniciativa nombra el archivo que sobra.

**Origin:** revisión final de la rama, 2026-10-05.

### TD5 · El método no dice cómo se marca un checklist como Gate · 🟢 Resolved (2026-10-05)

El glosario define el Gate, pero ni el método ni el vigilante dicen dónde se escribe que un checklist lo es.

**Cómo se pagó:** un párrafo `**Gate:**` en la introducción del checklist, en la versión 1.2.0. El método lo enseña y el
vigilante falla si un checklist con la marca pasa a `Stale`.

**Origin:** revisión final de la rama, 2026-10-05.

### TD6 · Menores de `src/config.js` y `src/io.js` · 🟢 Resolved (2026-10-05)

Las claves heredadas se aceptan por `in`; las listas de los valores por defecto se comparten por referencia; `exists` se
comporta distinto para carpetas entre los dos accesos; `walk` depende de `this`; y `IMPORT_LINE` no se usa fuera de un
arnés.

**Cómo se pagó:** en la versión 1.2.0. Las claves se comprueban con `Object.hasOwn`, cada lista se copia al resolver la
configuración, una carpeta existe en los dos accesos, `walk` recursa sin `this` y la constante sin uso se quitó.

**Origin:** revisión final de la rama, 2026-10-05.

## Notes

### N1 · El corredor de arneses del código no viaja

El kit vigila `docs/` y nada más. El corredor que bundlea y ejecuta los arneses del código de Cappi es una
decisión de verificación de ese proyecto: cada proyecto declara sus comandos en `## Verification` de su
`CLAUDE.md`. Parece un olvido y no lo es.

## Runbooks

## References
