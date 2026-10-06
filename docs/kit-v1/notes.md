# Kit v1 — notes

## Summary

| ID   | Type     | What                                                                       | Status      |
| ---- | -------- | -------------------------------------------------------------------------- | ----------- |
| ADR1 | ADR      | Paquete npm, no plugin ni submódulo                                        | 🟢 Accepted |
| ADR2 | ADR      | Nomenclatura en inglés, prosa en español                                   | 🟢 Accepted |
| ADR3 | ADR      | El método se importa desde `node_modules`                                  | 🟢 Accepted |
| ADR4 | ADR      | La configuración es `.mjs`, no `.js`                                       | 🟢 Accepted |
| ADR5 | ADR      | Paquete con scope y comando `sddkit`                                       | 🟢 Accepted |
| ADR6 | ADR      | Las palabras que no son IDs se declaran en la configuración                | 🟢 Accepted |
| ADR7 | ADR      | Un Gate se marca con `**Gate:**` y el vigilante lo comprueba               | 🟢 Accepted |
| ADR8 | ADR      | El tipo y la sección de una decisión se llaman `ADR`, como su prefijo      | 🟢 Accepted |
| TD1  | Debt     | Una palabra con forma de ID no tiene escapatoria                           | 🟢 Resolved |
| TD2  | Debt     | Una lista numerada en la introducción de un checklist se toma por un punto | 🟢 Resolved |
| TD3  | Debt     | `ignore` solo acepta nombres de carpeta                                    | 🟢 Resolved |
| TD4  | Debt     | Mensajes poco claros cuando falta un archivo entero                        | 🟢 Resolved |
| TD5  | Debt     | El método no dice cómo se marca un checklist como Gate                     | 🟢 Resolved |
| TD6  | Debt     | Menores de `src/config.js` y `src/io.js`                                   | 🟢 Resolved |
| N1   | Note     | El corredor de arneses del código no viaja                                 | —           |
| N2   | Note     | El checklist se quedó en Passed durante cuatro versiones                   | —           |

## ADRs

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

### ADR6 · Las palabras que no son IDs se declaran en la configuración · 🟢 Accepted (2026-10-05)

**Contexto:** el vigilante lee como cita cualquier palabra con forma de ID, y una tecla de función o un código de
producto la tienen. **Alternativas:** marcar solo los IDs que existen en la iniciativa, que no pide declarar nada
pero deja pasar en silencio una cita sin su código a un ID borrado; una marca en el propio texto, que ensucia la
prosa; o una lista en `sdd.config.mjs`. **Decisión:** la lista, `notIds`. Es explícita y el vigilante no pierde
nada de lo que detectaba. La versión 1.3.0 la acotó: la palabra solo se ignora en los documentos donde ese ID no
existe, y nunca dentro de una cita con prefijo, porque una lista global dejaba sin vigilar a un hallazgo real con
el mismo nombre. Queda un caso sin cubrir: en una iniciativa sin ese ID, la palabra entre acentos graves se toma
por la tecla aunque se quisiera citar un ID que no existe.

### ADR7 · Un Gate se marca con `**Gate:**` y el vigilante lo comprueba · 🟢 Accepted (2026-10-05)

**Contexto:** el método decía que un Gate nunca pasa a `Stale`, pero un checklist solo decía que lo era en prosa
libre, y nada lo comprobaba. **Alternativas:** dejarlo en prosa; una columna nueva en el resumen de los checklists,
que cambia una tabla que el vigilante lee por posición; o un párrafo con marcador en la introducción, como
`**Retake:**`. **Decisión:** el párrafo `**Gate:**`, que nombra qué desbloquea. No toca ninguna tabla, se lee
donde se describe el checklist, y con la marca el vigilante falla si el checklist pasa a `Stale`.

### ADR8 · El tipo y la sección de una decisión se llaman `ADR`, como su prefijo · 🟢 Accepted (2026-10-06)

**Contexto:** el glosario llamaba `Decision` al término y `ADR` a su prefijo, y la columna `Type` del resumen
pedía `Decision` junto a un ID que ya dice `ADR`. **Alternativas:** dejarlo, como `Tech debt` y su prefijo;
renombrar solo la fila del glosario, que deja al glosario diciendo una cosa y al resumen otra; o renombrar el tipo
en todo el molde. **Decisión:** el tipo es `ADR` en el glosario y en la columna `Type`, y la sección de
`notes.md` se titula `## ADRs`, para que la palabra sea una sola en los tres sitios. El precio es una versión
mayor, la 3.0.0: cada proyecto reescribe esa columna y ese título en sus `notes.md`.

## Tech debt

### TD1 · Una palabra con forma de ID no tiene escapatoria · 🟢 Resolved (2026-10-05)

Una tecla de función o un código con forma de ID, escritos en prosa, fallan como cita sin código, y entre acentos graves
fallan como cita a un ID que no existe. No había forma de nombrarlos sin que el vigilante los leyera como citas.

**Cómo se pagó:** la clave `notIds` de `sdd.config.mjs`, en la versión 1.1.0. El proyecto declara la palabra una
vez y el vigilante la borra del texto antes de buscar citas. Se descartó marcar solo los IDs que existen: una cita
sin su código a un ID borrado habría pasado en silencio.

La versión 1.3.0 la acotó: la palabra solo se borra en los documentos donde ese ID no existe. La primera
migración real declaró una tecla que en dos iniciativas era también un hallazgo, y la lista global dejaba sus
citas sin vigilar.

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

### N2 · El checklist se quedó en Passed durante cuatro versiones

Las versiones 1.0.2 a 1.3.0 cambiaron la salida de los comandos, la validación de `ignore` y los mensajes del
vigilante, que es lo que comprueba la sección de comandos del checklist, y ninguno de esos commits lo pasó a
`Stale`. Cada cambio se probó a mano en un proyecto temporal, pero el documento siguió diciendo `Passed` sobre
la corrida del 2026-10-05. El vigilante no lo ve: comprueba que los documentos sean coherentes entre sí, no que
sigan el paso del código. Lo que lo evita es la regla de `CLAUDE.md`: el checklist se marca en el commit que toca
lo que verifica.

Se puso en regla el 2026-10-06: el checklist pasó a `Stale` y la sección de comandos se volvió a correr entera
sobre la versión 1.3.0 instalada en un proyecto vacío.

## Runbooks

## References
