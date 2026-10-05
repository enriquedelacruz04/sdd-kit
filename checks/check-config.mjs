import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { CONFIG_FILE, DEFAULTS, loadConfig, resolveConfig } from "../src/config.js";

// ---- sin configuración, el vigilante trabaja con los valores por defecto: un proyecto nuevo no declara nada
assert.deepEqual(resolveConfig(), DEFAULTS);
assert.deepEqual(resolveConfig({}), DEFAULTS);

// ---- lo declarado reemplaza su clave y deja las demás: quien solo ignora una carpeta no pierde el resto
{
  const config = resolveConfig({ ignore: ["research"] });
  assert.deepEqual(config.ignore, ["research"]);
  assert.deepEqual(config.pathRoots, DEFAULTS.pathRoots);
}

// ---- una clave mal escrita se ignoraría en silencio y la carpeta seguiría fallando sin explicación
assert.throws(() => resolveConfig({ ignor: ["research"] }), /clave desconocida "ignor"/);

// ---- un texto donde va una lista se recorrería letra a letra
assert.throws(() => resolveConfig({ ignore: "research" }), /"ignore" debe ser una lista de textos/);
assert.throws(() => resolveConfig({ pathRoots: ["src", 3] }), /"pathRoots" debe ser una lista de textos/);

// ---- un export que no es un objeto (olvidar el `default`) no puede tratarse como configuración vacía
assert.throws(() => resolveConfig("research"), /debe exportar un objeto/);

// ---- sin archivo se usan los valores por defecto; con archivo, se lee su `export default`
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-kit-config-"));
  assert.deepEqual(await loadConfig(dir), DEFAULTS);
  fs.writeFileSync(path.join(dir, CONFIG_FILE), 'export default { ignore: ["research"] };\n');
  assert.deepEqual((await loadConfig(dir)).ignore, ["research"]);
  fs.rmSync(dir, { recursive: true, force: true });
}

// ---- un archivo que tiene un export nombrado en lugar del default seguiría fallando sin explicación
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-kit-config-"));
  fs.writeFileSync(path.join(dir, CONFIG_FILE), 'export const ignore = ["research"];\n');
  await assert.rejects(loadConfig(dir), /debe exportar un objeto/);
  fs.rmSync(dir, { recursive: true, force: true });
}

console.log("OK config");
