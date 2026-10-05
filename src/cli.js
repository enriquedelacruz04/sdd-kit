import { check } from "./commands/check.js";
import { init } from "./commands/init.js";
import { newInitiative } from "./commands/new.js";

const USAGE = `uso:
  sddkit init               siembra CLAUDE.md, AGENTS.md, la configuración y el esqueleto de docs/
  sddkit new <initiative>   crea docs/<initiative>/ con roadmap.md, checklists.md y notes.md
  sddkit check              comprueba que docs/ cumple el molde`;

// Cada comando recibe por dónde escribir y devuelve su código de salida: así los arneses lo llaman sin lanzar
// un proceso, y solo bin/sdd.js toca `process`.
export async function main(argv, ctx) {
  const [command, ...args] = argv;
  if (command === "init") return init(ctx);
  if (command === "new") return newInitiative(args[0], ctx);
  if (command === "check") return check(ctx);
  ctx.error(command ? `comando desconocido "${command}"\n\n${USAGE}` : USAGE);
  return 1;
}
