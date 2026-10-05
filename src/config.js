import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Carpetas de docs/ que nunca son iniciativas.
export const RESERVED = ["architecture", "superpowers"];
export const INITIATIVE_FILES = ["roadmap.md", "checklists.md", "notes.md"];
// .mjs y no .js: un proyecto sin "type": "module" no puede importar un .js con `export default`.
export const CONFIG_FILE = "sdd.config.mjs";

export const DEFAULTS = {
  ignore: [],
  claudeHeadings: [
    "## Branches",
    "## Environment",
    "## Publication constraints",
    "## Architecture",
    "## Verification",
    "## Known pitfalls",
    "## Removed",
  ],
  publicationWords: ["publicar", "publicaci", "publicad", "release", "deploy"],
  pathRoots: ["docs", "src", "scripts"],
  notIds: [],
};

export function resolveConfig(user = {}) {
  if (user === null || typeof user !== "object" || Array.isArray(user))
    throw new Error(`${CONFIG_FILE} debe exportar un objeto con \`export default\``);
  for (const [key, value] of Object.entries(user)) {
    if (!Object.hasOwn(DEFAULTS, key))
      throw new Error(`clave desconocida "${key}"; las válidas son ${Object.keys(DEFAULTS).join(", ")}`);
    if (!Array.isArray(value) || value.some((v) => typeof v !== "string"))
      throw new Error(`"${key}" debe ser una lista de textos`);
  }
  // Cada lista se copia: quien recibe la configuración puede tocarla sin cambiar los valores por defecto.
  return Object.fromEntries(Object.entries({ ...DEFAULTS, ...user }).map(([key, list]) => [key, [...list]]));
}

export async function loadConfig(root) {
  const file = path.join(root, CONFIG_FILE);
  if (!fs.existsSync(file)) return resolveConfig();
  // La fecha de modificación va en la URL porque Node cachea los imports: sin ella, un proceso que edita el
  // archivo y lo vuelve a cargar leería la versión vieja.
  const url = `${pathToFileURL(file).href}?${fs.statSync(file).mtimeMs}`;
  const imported = await import(url);
  if (imported.default === undefined)
    throw new Error(`${CONFIG_FILE} debe exportar un objeto con \`export default\``);
  return resolveConfig(imported.default);
}
