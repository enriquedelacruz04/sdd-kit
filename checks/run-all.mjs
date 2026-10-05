// Corre todos los arneses de checks/check-*.mjs. No bundlea: el kit no tiene dependencias y todos sus imports
// llevan extensión, así que Node los resuelve solo.
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const checksDir = path.dirname(fileURLToPath(import.meta.url));
const files = readdirSync(checksDir)
  .filter((file) => file.startsWith("check-") && file.endsWith(".mjs"))
  .sort();

let failed = false;

for (const file of files) {
  console.log(`\n== ${file} ==`);
  try {
    execFileSync(process.execPath, [path.join(checksDir, file)], {
      stdio: "inherit",
      cwd: path.resolve(checksDir, ".."),
    });
  } catch {
    failed = true;
  }
}

if (failed) {
  console.error("\nAlgún arnés falló.");
  process.exit(1);
}
