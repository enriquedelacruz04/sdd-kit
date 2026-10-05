import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { INITIATIVE_FILES, RESERVED } from "../config.js";

const TEMPLATES = fileURLToPath(new URL("../../templates/initiative/", import.meta.url));
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function newInitiative(name, { cwd, log, error }) {
  if (!name) {
    error("uso: sddkit new <initiative>");
    return 1;
  }
  // El nombre de la carpeta es el identificador con el que otras iniciativas la citan.
  if (!KEBAB.test(name)) {
    error(`"${name}" no es un nombre válido: va en kebab minúscula, como billing-reports`);
    return 1;
  }
  if (RESERVED.includes(name)) {
    error(`"${name}" es una carpeta reservada de docs/`);
    return 1;
  }
  const readme = path.join(cwd, "docs/README.md");
  if (!fs.existsSync(readme)) {
    error("no hay docs/README.md aquí: corre `sddkit init` en la raíz del proyecto");
    return 1;
  }
  const dir = path.join(cwd, "docs", name);
  if (fs.existsSync(dir)) {
    error(`docs/${name} ya existe`);
    return 1;
  }

  const words = name.replace(/-/g, " ");
  const title = words[0].toUpperCase() + words.slice(1);
  fs.mkdirSync(dir);
  for (const file of INITIATIVE_FILES) {
    const text = fs.readFileSync(path.join(TEMPLATES, file), "utf8").replaceAll("{{title}}", title);
    fs.writeFileSync(path.join(dir, file), text);
    log(`  creado     docs/${name}/${file}`);
  }

  // La línea entra con el final de línea que ya tiene el índice: mezclarlos ensucia el diff en Windows.
  const text = fs.readFileSync(readme, "utf8");
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const entry = `- \`${name}/\` — descripción por escribir`;
  const superpowers = lines.findIndex((l) => l.startsWith("- `superpowers/"));
  const end = lines.at(-1) === "" ? lines.length - 1 : lines.length;
  lines.splice(superpowers < 0 ? end : superpowers, 0, entry);
  fs.writeFileSync(readme, lines.join(eol));
  log(`  anotado    docs/README.md`);
  return 0;
}
