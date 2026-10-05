import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CONFIG_FILE } from "../config.js";

const TEMPLATES = fileURLToPath(new URL("../../templates/", import.meta.url));
// Plantilla y destino coinciden: lo que se siembra es una copia literal.
const FILES = ["CLAUDE.md", "AGENTS.md", CONFIG_FILE, "docs/README.md", "docs/architecture/notes.md"];
const SCRIPT = "check:docs";

// El package.json es del usuario: se conserva su formato para que añadir un script sea un diff de una línea.
function serializeLike(raw, value) {
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const indent = raw.match(/^([ \t]+)\S/m)?.[1] ?? "  ";
  const body = JSON.stringify(value, null, indent).replace(/\n/g, eol);
  return /\n\s*$/.test(raw) ? body + eol : body;
}

export function init({ cwd, log }) {
  for (const file of FILES) {
    const target = path.join(cwd, file);
    // Lo que ya existe es del proyecto: se informa y se sigue, nunca se pisa.
    if (fs.existsSync(target)) {
      log(`  exists   ${file}`);
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(TEMPLATES, file), target);
    log(`  created  ${file}`);
  }

  const pkgFile = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgFile)) {
    log(`  sin package.json: añade a mano el script "${SCRIPT}": "sddkit check"`);
    return 0;
  }
  const file = fs.readFileSync(pkgFile, "utf8");
  // El BOM no es parte del JSON: JSON.parse lo rechaza, pero quien lo escribió lo quería ahí, así que se quita para
  // leer y se devuelve al escribir.
  const bom = file.startsWith("\uFEFF") ? "\uFEFF" : "";
  const raw = file.slice(bom.length);
  let pkg;
  try {
    pkg = JSON.parse(raw);
  } catch {
    // Los archivos ya están sembrados: reventar aquí dejaría una salida a medias, como si init hubiera fallado.
    log(`  package.json no se pudo leer: añade a mano el script "${SCRIPT}": "sddkit check"`);
    return 0;
  }
  if (pkg.scripts?.[SCRIPT]) {
    log(`  exists   script ${SCRIPT}`);
    return 0;
  }
  pkg.scripts = { ...pkg.scripts, [SCRIPT]: "sddkit check" };
  fs.writeFileSync(pkgFile, bom + serializeLike(raw, pkg));
  log(`  created  script ${SCRIPT}`);
  return 0;
}
