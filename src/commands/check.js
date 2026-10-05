import { checkDocs } from "../check-docs.js";
import { CONFIG_FILE, loadConfig } from "../config.js";
import { realIo } from "../io.js";

export async function check({ cwd, log, error }) {
  let config;
  try {
    config = await loadConfig(cwd);
  } catch (e) {
    // Solo la primera línea: un error de sintaxis trae el fragmento de código y el stack detrás.
    error(`${CONFIG_FILE}: ${String(e.message).split("\n")[0]}`);
    return 1;
  }
  const errors = checkDocs(realIo(cwd), config);
  if (errors.length) {
    for (const e of errors) error(e);
    error(`\ndocs/ no cumple el molde: ${errors.length} ${errors.length === 1 ? "error" : "errores"}`);
    return 1;
  }
  log("OK docs");
  return 0;
}
