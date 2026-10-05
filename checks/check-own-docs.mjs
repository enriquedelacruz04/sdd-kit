import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

import { checkDocs } from "../src/check-docs.js";
import { loadConfig } from "../src/config.js";
import { realIo } from "../src/io.js";

const root = fileURLToPath(new URL("..", import.meta.url));

// ---- la documentación del propio kit cumple el molde. Los demás arneses usan proyectos de mentira; este es el
// único que pasa documentos escritos por una persona por el vigilante.
const errors = checkDocs(realIo(root), await loadConfig(root));
assert.deepEqual(errors, [], `docs/ no cumple el molde:\n${errors.join("\n")}`);

console.log("OK own-docs");
