import fs from "node:fs";
import path from "node:path";

// El vigilante no toca el disco: recibe uno de estos dos. Así sus arneses corren sobre un proyecto en memoria.
export function realIo(root) {
  const abs = (p) => path.join(root, p);
  return {
    read: (p) => fs.readFileSync(abs(p), "utf8"),
    exists: (p) => fs.existsSync(abs(p)),
    isDir: (p) => fs.existsSync(abs(p)) && fs.statSync(abs(p)).isDirectory(),
    list: (dir) => (fs.existsSync(abs(dir)) ? fs.readdirSync(abs(dir)).sort() : []),
    walk(dir, skip) {
      if (!fs.existsSync(abs(dir))) return [];
      return fs.readdirSync(abs(dir), { withFileTypes: true }).flatMap((e) => {
        const p = `${dir}/${e.name}`;
        if (e.isDirectory()) return skip.includes(e.name) ? [] : this.walk(p, skip);
        return e.name.endsWith(".md") ? [p] : [];
      });
    },
  };
}

export function virtualIo(files) {
  const under = (dir) => Object.keys(files).filter((k) => k.startsWith(`${dir}/`));
  return {
    read: (p) => files[p],
    exists: (p) => p in files,
    isDir: (p) => under(p).length > 0,
    // Como `readdirSync`: lo que cuelga de `dir`, y una carpeta aparece por su nombre, no por sus archivos.
    list: (dir) => [...new Set(under(dir).map((k) => k.slice(dir.length + 1).split("/")[0]))].sort(),
    walk: (dir, skip) =>
      under(dir).filter(
        (k) =>
          k.endsWith(".md") &&
          !k
            .slice(dir.length + 1)
            .split("/")
            .slice(0, -1)
            .some((part) => skip.includes(part)),
      ),
  };
}
