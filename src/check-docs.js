// La documentación sigue un molde que el agente lee en cada sesión (METHODOLOGY.md). Cuando el molde se rompe
// no revienta nada: un estado distinto entre el título y la tabla, un resumen incompleto o una cita con otro
// formato se leen como ciertos, y el desfase crece sin que nadie lo vea.
import path from "node:path";

import { CONFIG_FILE, INITIATIVE_FILES, RESERVED, resolveConfig } from "./config.js";

const PHASE = {
  Pending: "⚪",
  Designed: "🟣",
  Planned: "🔵",
  Building: "🟡",
  Built: "🟠",
  Verified: "🟢",
  Dropped: "⚫",
};
const CHECKLIST = { "Not run": "⚪", Running: "🟡", Passed: "🟢", Stale: "🟠" };
const POINT = { "Not run": "⚪", Passed: "🟢", Failed: "🔴", Blocked: "🟡" };
const FINDING = { Open: "🔴", Fixed: "🟢", Deferred: "🟠", "Not a bug": "⚪" };
const SEVERITY = { Critical: "🔴", High: "🟠", Low: "🟡" };
const ADR = { Proposed: "🟡", Accepted: "🟢", Superseded: "⚫" };
const TD = { Open: "🟠", Resolved: "🟢" };
export const STATES = { PHASE, CHECKLIST, POINT, FINDING, SEVERITY, ADR, TD };

export const ROADMAP_HEADINGS = ["## Phases summary", "## Phase index", "## Execution order", "## Debt and decisions"];
export const CHECKLIST_HEADINGS = ["## Checklists summary", "## Findings"];
export const NOTE_SECTIONS = ["## Summary", "## ADRs", "## Tech debt", "## Notes", "## Runbooks", "## References"];
const NOTE_TYPES = { ADR: "ADR", TD: "Debt", N: "Note", RB: "Runbook" };
const COLOR_MAPS = {
  "roadmap.md": [PHASE],
  "checklists.md": [CHECKLIST, POINT, FINDING, SEVERITY],
  "notes.md": [ADR, TD],
};

const ID = String.raw`(?:PH\d+|F\d+|TD\d+|ADR\d+|N\d+|RB\d+|\d+\.[A-Z]\d+)`;
const FINDING_STATES = /^(Open|Fixed|Deferred \(TD\d+\)|Not a bug)$/;
const ADR_STATES = /^(Proposed|Accepted|Superseded \(ADR\d+\))( \(\d{4}-\d{2}-\d{2}\))?$/;
const TD_STATES = /^(Open|Resolved \(\d{4}-\d{2}-\d{2}\))$/;
const DATA_CELL = new RegExp(String.raw`^\s*[\x60*]?(?:${ID}|—)[\x60*]?\s*$`);
const BARE_ID = new RegExp(String.raw`(?<![\w.#/\-])${ID}(?!\w)`);
// Dónde nace cada ID: una cita solo vale si apunta a uno de estos.
const DEFINED = {
  "roadmap.md": [/^## (PH\d+) · /gm],
  "checklists.md": [/^- \*\*(\d+\.[A-Z]\d+)\*\*/gm, /^\|\s*`?(F\d+)`?\s*\|/gm],
  "notes.md": [/^### ((?:ADR|TD|N|RB)\d+) · /gm],
};
const CODE_ID = new RegExp(String.raw`\x60(${ID})\x60`, "g");
const STATE_ID = /(?:Deferred|Superseded) \(((?:TD|ADR)\d+)\)/g;
const README_STATES = /\b(Pending|Designed|Planned|Building|Built|Verified|Dropped)\b/;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// El bloque que abre `heading` y termina antes del siguiente título del mismo nivel o superior.
function section(text, heading) {
  if (!heading) return "";
  const lines = text.split("\n");
  const start = lines.indexOf(heading);
  if (start < 0) return "";
  const level = heading.match(/^#+/)[0].length;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#+) /);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n");
}

// Filas de datos de todas las tablas del bloque, sin encabezados ni separadores.
function rows(block) {
  const lines = block.split("\n");
  const isSep = (l) => /^\|\s*:?-/.test(l ?? "");
  return lines
    .filter((l, i) => l.startsWith("|") && !isSep(l) && !isSep(lines[i + 1]))
    .map((l) =>
      l
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim().replace(/[`*]/g, "")),
    );
}

const statusBase = (s) => s.replace(/ \((?:TD|ADR)\d+\)/, "").replace(/ \(\d{4}-\d{2}-\d{2}\)$/, "");

export function checkDocs(io, userConfig = {}) {
  // Es la entrada pública del paquete: una configuración parcial toma los valores por defecto, y una inválida
  // falla con el mismo mensaje que al cargar el archivo.
  const config = resolveConfig(userConfig);
  const errors = [];
  const fail = (msg) => errors.push(msg);
  const read = (p) => (io.exists(p) ? io.read(p).replace(/\r\n/g, "\n") : "");

  if (!io.isDir("docs")) return ["no hay carpeta docs/ aquí: corre `sddkit init` en la raíz del proyecto"];

  // Toda carpeta de docs/ es una iniciativa salvo las reservadas y las que el proyecto declara: una lista
  // escrita a mano deja fuera de la vigilancia a la iniciativa que nadie se acordó de añadir.
  // `ignore` se compara con el nombre de cada carpeta: una ruta no coincide con ninguna y no ignoraría nada.
  for (const entry of config.ignore)
    if (/[\\/]/.test(entry))
      fail(`${CONFIG_FILE}: "${entry}" en ignore debe ser solo el nombre de una carpeta de docs/, sin barras`);
  const skipped = new Set([...RESERVED, ...config.ignore]);
  const initiatives = [];
  for (const name of io.list("docs")) {
    if (!io.isDir(`docs/${name}`) || skipped.has(name)) continue;
    const files = io.list(`docs/${name}`);
    if (INITIATIVE_FILES.every((f) => files.includes(f))) initiatives.push(name);
    else
      fail(
        `docs/${name} no es una iniciativa: le faltan sus tres archivos. Si no lo es, decláralo en \`ignore\` de ${CONFIG_FILE}`,
      );
  }

  const INI = `(?:${["architecture", ...initiatives].map(escapeRe).join("|")})`;
  const ONE_SPAN_CITE = new RegExp(String.raw`\x60${INI} ${ID}\x60`);
  // `iniciativa` o `archivo.md` seguido de uno o varios IDs separados por coma.
  const CITE_GROUP = new RegExp(
    String.raw`\x60(${INI}|notes\.md|roadmap\.md|checklists\.md)\x60((?:\s+\x60${ID}\x60)(?:\s*,\s*\x60${ID}\x60)*)`,
    "g",
  );
  // Una tecla de función o un código de producto tienen forma de ID sin serlo: el proyecto los declara y aquí se
  // borran del texto antes de buscar citas, sueltos o entre acentos graves. Solo donde ese ID no existe: en una
  // iniciativa que sí tiene un F5, "F5" es su hallazgo, y borrarlo dejaría sus citas sin vigilar.
  for (const word of config.notIds)
    if (!new RegExp(`^${ID}$`).test(word)) fail(`${CONFIG_FILE}: "${word}" en notIds no tiene forma de ID`);
  const withoutNotIds = (text, home) => {
    const words = config.notIds.filter((word) => !registry.get(home)?.all.has(word));
    if (!words.length) return text;
    return text.replace(
      new RegExp(String.raw`\x60?(?<![\w.#/\-])(?:${words.map(escapeRe).join("|")})(?!\w)\x60?`, "g"),
      "",
    );
  };
  const PUBLICATION = config.publicationWords.length
    ? new RegExp(config.publicationWords.map(escapeRe).join("|"), "i")
    : null;

  const checkHeadings = (file, text, required) => {
    const lines = text.split("\n");
    let last = -1;
    for (const h of required) {
      const i = lines.indexOf(h);
      if (i < 0) fail(`${file}: falta el título "${h}"`);
      else if (i < last) fail(`${file}: "${h}" está fuera de orden`);
      else last = i;
    }
  };

  // Valida la pareja emoji-estado en títulos y tablas, y devuelve el texto sin emojis.
  const stripEmojis = (file, text) => {
    const maps = COLOR_MAPS[path.posix.basename(file)];
    const check = (value, where) => {
      const m = value.match(/^(\p{Extended_Pictographic}) (.+)$/u);
      const bare = m ? m[2] : value;
      const want = maps.map((map) => map[statusBase(bare)]).find(Boolean);
      if (!want) {
        if (m) fail(`${file}: "${value}" lleva emoji pero no es un estado (${where})`);
        return value;
      }
      if (!m) fail(`${file}: "${value}" no lleva su emoji ${want} (${where})`);
      else if (m[1] !== want) fail(`${file}: "${value}" debería llevar ${want} (${where})`);
      return bare;
    };
    return text
      .split("\n")
      .map((line, i) => {
        if (/^#{2,3} /.test(line) && line.includes(" · ")) {
          const parts = line.split(" · ");
          parts[parts.length - 1] = check(parts[parts.length - 1], `línea ${i + 1}`);
          return parts.join(" · ");
        }
        const point = line.match(/^(- \*\*\d+\.[A-Z]\d+\*\* · )([^·]+?)( · .*)$/);
        if (point) return point[1] + check(point[2], `línea ${i + 1}`) + point[3];
        if (line.startsWith("|") && !/^\|\s*:?-/.test(line))
          return line
            .split("|")
            .map((cell) => {
              const v = cell.trim();
              return v ? cell.replace(v, check(v, `línea ${i + 1}`)) : cell;
            })
            .join("|");
        return line;
      })
      .join("\n");
  };

  // Una cita a un ID lleva cada pieza en su propio código: (`iniciativa` `N3`), (`notes.md` `N3`), (`N3`).
  const checkCitations = (file, rawText, home) => {
    const text = withoutNotIds(rawText, home);
    let fence = false;
    text.split("\n").forEach((line, i) => {
      if (line.startsWith("```")) {
        fence = !fence;
        return;
      }
      if (fence) return;
      if (ONE_SPAN_CITE.test(line))
        fail(`${file}:${i + 1}: iniciativa e ID en un solo código: ${line.trim().slice(0, 90)}`);
      let work = line
        .replace(/^#{2,4} (?:PH\d+|Checklist \d+|(?:ADR|TD|N|RB)\d+|[A-Z]) · /, "")
        .replace(/^- \*\*\d+\.[A-Z]\d+\*\* · /, "");
      if (work.startsWith("|"))
        work = work
          .split("|")
          .map((c) => (DATA_CELL.test(c) ? "" : c))
          .join("|");
      work = work.replace(/(?:Deferred|Superseded) \((?:TD|ADR)\d+\)/g, "").replace(/`[^`]*`/g, "");
      const m = work.match(BARE_ID);
      if (m) fail(`${file}:${i + 1}: ${m[0]} citado sin su código: ${line.trim().slice(0, 90)}`);
    });
  };

  // Un ID borrado deja sus citas apuntando a nada, y se siguen leyendo como si remitieran a algo. `home` es la
  // iniciativa del archivo: sin ella (CLAUDE.md) un ID sin prefijo es un ejemplo, no una cita.
  const registry = new Map();
  const register = (name, files) => {
    const entry = { all: new Set() };
    for (const f of files) {
      entry[f] = new Set();
      for (const re of DEFINED[f])
        for (const m of read(`docs/${name}/${f}`).matchAll(re)) {
          entry[f].add(m[1]);
          entry.all.add(m[1]);
        }
    }
    registry.set(name, entry);
  };
  const checkRefs = (file, rawText, home) => {
    const missing = (cite) => fail(`${file}: cita ${cite}, que no existe`);
    // Las citas con prefijo se comprueban sobre el texto entero: nombran la iniciativa o el archivo, así que una
    // palabra de `notIds` ahí dentro es un ID de verdad.
    const unprefixed = rawText.replace(/^```[\s\S]*?^```/gm, "").replace(CITE_GROUP, (_, prefix, list) => {
      const bag = prefix.endsWith(".md") ? home && registry.get(home)?.[prefix] : registry.get(prefix)?.all;
      if (bag) for (const [, id] of list.matchAll(CODE_ID)) if (!bag.has(id)) missing(`\`${prefix}\` \`${id}\``);
      return "";
    });
    if (!home) return;
    const rest = withoutNotIds(unprefixed, home);
    const bag = registry.get(home).all;
    for (const [, id] of [...rest.matchAll(CODE_ID), ...rest.matchAll(STATE_ID)]) if (!bag.has(id)) missing(id);
  };

  // `architecture/notes.md` se agrupa por temas, no por tipo de entrada: solo las
  // iniciativas siguen el orden fijo de secciones. Su resumen sí va agrupado por tipo, como el de cualquiera.
  const checkNotes = (file, text, { byTopic = false } = {}) => {
    checkHeadings(file, text, ["## Summary"]);
    if (!byTopic) {
      let last = -1;
      for (const h of text.split("\n").filter((l) => /^## /.test(l))) {
        const i = NOTE_SECTIONS.indexOf(h);
        if (i < 0) fail(`${file}: "${h}" no es una sección de notes.md`);
        else if (i < last) fail(`${file}: "${h}" está fuera de orden`);
        else last = i;
      }
    }
    const seen = new Set();
    const stateOf = new Map();
    for (const m of text.matchAll(/^### ((ADR|TD|N|RB)\d+) · (.+)$/gm)) {
      if (seen.has(m[1])) fail(`${file}: ${m[1]} está repetido`);
      seen.add(m[1]);
      const state = m[3].split(" · ")[1] ?? "";
      if (m[2] === "ADR") {
        if (!ADR_STATES.test(state)) fail(`${file}: ${m[1]} no tiene un estado de decisión válido`);
        stateOf.set(m[1], state.replace(/ \(\d{4}-\d{2}-\d{2}\)$/, ""));
      }
      if (m[2] === "TD") {
        if (!TD_STATES.test(state)) fail(`${file}: ${m[1]} debe estar Open o Resolved (AAAA-MM-DD)`);
        stateOf.set(m[1], state.replace(/ \(\d{4}-\d{2}-\d{2}\)$/, ""));
      }
    }
    for (const m of text.matchAll(/^### (?!(?:ADR|TD|N|RB)\d+ · )(.+)$/gm))
      fail(`${file}: título de entrada sin ID válido: "### ${m[1].slice(0, 60)}"`);
    const summary = rows(section(text, "## Summary"));
    let lastType = -1;
    for (const r of summary) {
      // El tipo se escribe a mano junto a un prefijo que ya lo dice; agrupado, el resumen se lee como el archivo.
      const type = NOTE_TYPES[r[0].match(/^[A-Z]+/)?.[0]];
      if (type && r[1] !== type) fail(`${file}: ${r[0]} es ${type} y el resumen dice "${r[1]}"`);
      const order = Object.values(NOTE_TYPES).indexOf(type);
      if (order < lastType) fail(`${file}: ${r[0]} rompe el orden por tipo del resumen`);
      lastType = Math.max(lastType, order);
      if (!seen.has(r[0])) fail(`${file}: ${r[0]} está en el resumen y no tiene detalle`);
      else if (stateOf.has(r[0]) && stateOf.get(r[0]) !== r[3])
        fail(`${file}: ${r[0]} dice ${r[3]} en el resumen y ${stateOf.get(r[0])} abajo`);
    }
    for (const id of seen) {
      const row = summary.find((r) => r[0] === id);
      if (!row) fail(`${file}: ${id} no está en el resumen`);
      else if (/^(N|RB)\d+$/.test(id) && row[3] !== "—") fail(`${file}: ${id} debería llevar "—" en el resumen`);
    }
  };
  for (const ini of initiatives) register(ini, INITIATIVE_FILES);
  register("architecture", ["notes.md"]);

  for (const ini of initiatives) {
    const dir = `docs/${ini}`;
    const files = io.list(dir);
    // `assets` guarda las imágenes que la spec cita como referencia (fotos de un formato de papel).
    const extra = files.filter((f) => f !== "assets" && !INITIATIVE_FILES.includes(f));
    if (extra.length)
      fail(`${ini}: sobra ${extra.join(", ")}: una iniciativa solo lleva sus tres archivos y una carpeta assets`);
    const raw = Object.fromEntries(INITIATIVE_FILES.map((f) => [f, read(`${dir}/${f}`)]));
    for (const [f, text] of Object.entries(raw)) {
      checkCitations(`${ini}/${f}`, text, ini);
      checkRefs(`${ini}/${f}`, text, ini);
    }
    const roadmap = stripEmojis(`${ini}/roadmap.md`, raw["roadmap.md"]);
    const checklists = stripEmojis(`${ini}/checklists.md`, raw["checklists.md"]);
    const notes = stripEmojis(`${ini}/notes.md`, raw["notes.md"]);

    // Roadmap.
    checkHeadings(`${ini}/roadmap.md`, roadmap, ROADMAP_HEADINGS);
    const phases = new Map([...roadmap.matchAll(/^## (PH\d+) · .+ · ([A-Za-z]+)$/gm)].map((m) => [m[1], m[2]]));
    if (!phases.size) fail(`${ini}/roadmap.md: no hay títulos "## PHn · Nombre · Estado"`);
    for (const [id, st] of phases) if (!PHASE[st]) fail(`${ini}: ${id} tiene el estado "${st}"`);
    const index = rows(section(roadmap, "## Phase index"));
    if (new Set(index.map((r) => r[0])).size !== index.length) fail(`${ini}: ID de fase repetido en el índice`);
    for (const r of index) {
      if (!phases.has(r[0])) fail(`${ini}: ${r[0]} está en el índice y no tiene título`);
      else if (phases.get(r[0]) !== r[3])
        fail(`${ini}: ${r[0]} dice ${r[3]} en el índice y ${phases.get(r[0])} en su título`);
    }
    for (const id of phases.keys()) if (!index.some((r) => r[0] === id)) fail(`${ini}: ${id} no está en el índice`);
    if (/checklist/i.test(roadmap)) fail(`${ini}/roadmap.md nombra un checklist`);
    if (/\b(ADR|TD)\d+\b/.test(section(roadmap, "## Debt and decisions")))
      fail(`${ini}/roadmap.md: "Debt and decisions" solo remite a notes.md`);
    const scanPublication = (file, text) =>
      text.split("\n").forEach((l, i) => {
        if (PUBLICATION?.test(l)) fail(`${file}:${i + 1} habla de publicación: ${l.trim().slice(0, 90)}`);
      });
    scanPublication(`${ini}/roadmap.md`, roadmap.replace(section(roadmap, "## Execution order"), ""));
    scanPublication(`${ini}/checklists.md`, checklists);

    // Checklists.
    checkHeadings(`${ini}/checklists.md`, checklists, CHECKLIST_HEADINGS);
    const heads = new Map(
      [...checklists.matchAll(/^## Checklist (\d+) · .+ · (Not run|Running|Passed|Stale)$/gm)].map((m) => [m[1], m[2]]),
    );
    if ([...checklists.matchAll(/^## Checklist (\d+) · /gm)].length !== heads.size)
      fail(`${ini}/checklists.md: hay un checklist sin estado válido en su título`);
    const summary = rows(section(checklists, "## Checklists summary"));
    for (const r of summary) {
      if (!heads.has(r[0])) fail(`${ini}: el checklist ${r[0]} está en el resumen y no tiene título`);
      else if (heads.get(r[0]) !== r[3])
        fail(`${ini}: checklist ${r[0]} dice ${r[3]} en el resumen y ${heads.get(r[0])} en su título`);
      if (!phases.has(r[2])) fail(`${ini}: el checklist ${r[0]} apunta a ${r[2]}, que no está en el roadmap`);
      // Un checklist que vuelve a Stale deja a su fase en Verified sin que nada la haya verificado de nuevo.
      else if (phases.get(r[2]) === "Verified" && heads.get(r[0]) !== "Passed")
        fail(`${ini}: ${r[2]} está en Verified y su checklist ${r[0]} está en ${heads.get(r[0])}`);
      const count = rows(section(checklists, `### Findings of checklist ${r[0]}`)).length;
      if (String(count) !== r[6]) fail(`${ini}: el checklist ${r[0]} dice ${r[6]} hallazgos y tiene ${count}`);
    }
    for (const n of heads.keys())
      if (!summary.some((r) => r[0] === n)) fail(`${ini}: el checklist ${n} no está en el resumen`);

    const cases = new Set();
    const pointState = new Map();
    for (const n of heads.keys()) {
      const title = checklists.split("\n").find((l) => l.startsWith(`## Checklist ${n} · `));
      let letter = null;
      let found = 0;
      let passed = 0;
      const lines = section(checklists, title).split("\n");
      for (const [i, l] of lines.entries()) {
        const s = l.match(/^### ([A-Z]) · /);
        if (s) {
          letter = s[1];
          continue;
        }
        const c = l.match(/^- \*\*(\d+)\.([A-Z])(\d+)\*\*/);
        if (!c) {
          // Solo dentro de una sección: la introducción puede enumerar requisitos con una lista numerada.
          if (letter && /^(- \*\*\d|\d+\. )/.test(l)) fail(`${ini}: punto sin ID válido en el checklist ${n}: ${l.slice(0, 50)}`);
          continue;
        }
        found++;
        const id = `${c[1]}.${c[2]}${c[3]}`;
        if (c[1] !== n) fail(`${ini}: ${id} está dentro del checklist ${n}`);
        if (c[2] !== letter) fail(`${ini}: ${id} está dentro de la sección ${letter}`);
        if (cases.has(id)) fail(`${ini}: el punto ${id} está repetido`);
        cases.add(id);
        const st = l.match(/^- \*\*[^*]+\*\* · (Not run|Passed|Failed|Blocked) · /)?.[1];
        if (!st) {
          fail(`${ini}: el punto ${id} no tiene un estado válido detrás de su ID`);
          continue;
        }
        pointState.set(id, st);
        if (st === "Passed") passed++;
        // A mitad de corrida (Running o Stale) los puntos se mezclan; un checklist cerrado o sin empezar, no.
        const head = heads.get(n);
        if ((head === "Passed" || head === "Not run") && st !== head)
          fail(`${ini}: el checklist ${n} está en ${head} y ${id} está en ${st}`);
        let body = l;
        for (let k = i + 1; k < lines.length && /^  \S/.test(lines[k]); k++) body += ` ${lines[k].trim()}`;
        const reason = body.includes("**Blocked:**");
        if (st === "Blocked" && !reason) fail(`${ini}: ${id} está en Blocked sin decir por qué con **Blocked:**`);
        if (st !== "Blocked" && reason) fail(`${ini}: ${id} está en ${st} y conserva su **Blocked:**`);
      }
      if (!found) fail(`${ini}: el checklist ${n} no tiene puntos con ID`);
      // Sin su tabla, el primer hallazgo del checklist no tiene dónde escribirse y acaba inventando su formato.
      if (!checklists.split("\n").includes(`### Findings of checklist ${n}`))
        fail(`${ini}: el checklist ${n} no tiene su tabla "Findings of checklist ${n}"`);
      const row = summary.find((r) => r[0] === n);
      if (row && row[4] !== `${passed}/${found}`)
        fail(`${ini}: el checklist ${n} dice ${row[4]} de avance y tiene ${passed}/${found}`);

      // Volver a correr solo repone los puntos que nombra **Retake:**: sin la línea, quien corre el checklist no
      // sabe qué quedó viejo, y conservada tras cerrar, anuncia una corrida parcial que ya terminó.
      const intro = lines
        .slice(
          0,
          lines.findIndex((l) => /^### /.test(l)),
        )
        .join("\n");
      const retake = intro.split(/\n\s*\n/).filter((p) => p.startsWith("**Retake:**"));
      const state = heads.get(n);
      // Un Gate se cruza una vez en producción: lo que cambie después lo verifica un punto de la fase que lo cambia.
      const gate = intro.split(/\n\s*\n/).some((paragraph) => paragraph.startsWith("**Gate:**"));
      if (gate && state === "Stale") fail(`${ini}: el checklist ${n} es un Gate y está en Stale: un Gate no pasa a Stale`);
      if (state === "Stale" && !retake.length) fail(`${ini}: el checklist ${n} está en Stale sin su **Retake:**`);
      if ((state === "Passed" || state === "Not run") && retake.length)
        fail(`${ini}: el checklist ${n} está en ${state} y conserva su **Retake:**`);
      if (retake.length > 1) fail(`${ini}: el checklist ${n} tiene más de un **Retake:**`);
      const p = retake[0]?.replace(/\s*\n\s*/g, " ");
      const m = p?.match(/^\*\*Retake:\*\* (all|`\d+\.[A-Z]\d+`(?:, `\d+\.[A-Z]\d+`)*)\. \S/);
      if (p && !m) fail(`${ini}: el **Retake:** del checklist ${n} no dice qué puntos y por qué`);
      for (const [, id] of m?.[1].matchAll(/`([^`]+)`/g) ?? [])
        if (!id.startsWith(`${n}.`) || !cases.has(id)) fail(`${ini}: el checklist ${n} retoma ${id}, que no es suyo`);
    }

    const detail = new Map();
    const cited = new Set();
    const alive = new Set();
    const detailHeads = checklists
      .split("\n")
      .filter((l) => /^### Findings of checklist \d+$/.test(l) || l === "## Findings without checklist");
    for (const h of detailHeads)
      for (const cells of rows(section(checklists, h))) {
        const [id, testCase, sev, , , status] = cells;
        if (!/^F\d+$/.test(id)) {
          fail(`${ini}: hallazgo con ID mal formado "${id}"`);
          continue;
        }
        // La tabla de detalle lleva seis columnas; con menos, el estado se lee de una celda que no es y el error
        // que sale ("estado undefined") no dice qué falta.
        if (cells.length < 6) {
          fail(`${ini}: el hallazgo ${id} tiene ${cells.length} columnas y la tabla lleva 6`);
          continue;
        }
        if (detail.has(id)) fail(`${ini}: el hallazgo ${id} está repetido`);
        detail.set(id, status);
        if (testCase !== "—" && !cases.has(testCase)) fail(`${ini}: ${id} cita el punto ${testCase}, que no existe`);
        cited.add(testCase);
        if (status === "Open" || status === "Fixed") alive.add(testCase);
        if (!SEVERITY[sev]) fail(`${ini}: ${id} tiene severidad "${sev}"`);
        if (!FINDING_STATES.test(status)) fail(`${ini}: ${id} tiene estado "${status}"`);
        // Una pantalla que revienta o pierde datos no deja la fase verificada, por mucho que se anote la deuda.
        if (sev === "Critical" && status.startsWith("Deferred")) fail(`${ini}: ${id} es Critical y está en Deferred`);
      }
    for (const [id, st] of pointState) {
      if (st !== "Failed") continue;
      if (!cited.has(id)) fail(`${ini}: ${id} está en Failed y ningún hallazgo lo cita`);
      // Cerrar el hallazgo como Not a bug o Deferred corrige el Expected y deja el punto en Passed en el mismo
      // cambio (METHODOLOGY.md, "Cuando un hallazgo se cierra"); un Failed que solo citan hallazgos cerrados así
      // quedó a medias.
      else if (!alive.has(id)) fail(`${ini}: ${id} está en Failed y solo lo citan hallazgos en Not a bug o Deferred`);
    }
    const findings = rows(section(checklists, "## Findings"));
    for (const r of findings) {
      if (!detail.has(r[0])) fail(`${ini}: ${r[0]} está en el índice de hallazgos y no bajo su checklist`);
      else if (detail.get(r[0]) !== r[4]) fail(`${ini}: ${r[0]} dice ${r[4]} en el índice y ${detail.get(r[0])} abajo`);
    }
    for (const id of detail.keys())
      if (!findings.some((r) => r[0] === id)) fail(`${ini}: ${id} no está en el índice de hallazgos`);

    checkNotes(`${ini}/notes.md`, notes);
  }

  // Un archivo entero que falta se dice una vez: comprobar su contenido daría un error por cada cosa que llevaba.
  if (!io.exists("docs/architecture/notes.md")) fail("no hay docs/architecture/notes.md: corre `sddkit init`");
  else {
    const architecture = read("docs/architecture/notes.md");
    checkCitations("architecture/notes.md", architecture, "architecture");
    checkRefs("architecture/notes.md", architecture, "architecture");
    checkNotes("architecture/notes.md", stripEmojis("architecture/notes.md", architecture), { byTopic: true });
  }

  if (!io.exists("CLAUDE.md")) fail("no hay CLAUDE.md en la raíz del proyecto: corre `sddkit init`");
  else {
    const claude = read("CLAUDE.md");
    checkHeadings("CLAUDE.md", claude, config.claudeHeadings);
    // Nombrar el archivo en una frase no lo carga: el import es una línea propia que empieza por @.
    if (!/^@\S*METHODOLOGY\.md\s*$/m.test(claude))
      fail("CLAUDE.md no importa METHODOLOGY.md: sin esa línea el agente trabaja sin las reglas");
    checkCitations("CLAUDE.md", claude, null);
    checkRefs("CLAUDE.md", claude, null);
  }
  if (README_STATES.test(read("docs/README.md"))) fail("docs/README.md lleva estados: debe ser solo un índice");

  // La ruta solo cuenta si empieza donde empiezan las rutas: sin el lookbehind, `packages/api/src/x.js` o una URL
  // se leían como `src/x.js` o `docs/x.md` y se comprobaban contra la raíz del proyecto.
  const roots = config.pathRoots.map(escapeRe).join("|");
  const CITED_PATH = new RegExp(
    String.raw`(?<![\w./:-])(?:(?:${roots || "(?!)"})\/|\.\.?\/)[\w./-]+\.(?:mjs|cjs|jsx?|tsx?|md|pdf)\b`,
    "g",
  );
  const ROOTED = new RegExp(`^(?:${roots || "(?!)"})/`);
  for (const f of [...io.walk("docs", ["superpowers", ...config.ignore]), "CLAUDE.md", "AGENTS.md"]) {
    for (const m of read(f).matchAll(CITED_PATH)) {
      const target = ROOTED.test(m[0]) ? m[0] : path.posix.join(path.posix.dirname(f), m[0]);
      if (!io.exists(target)) fail(`${f} apunta a ${m[0]}, que no existe`);
    }
  }

  return errors;
}
