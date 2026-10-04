import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const template = await readFile(
  new URL("../src/site.html", import.meta.url),
  "utf8",
);
const exports = new Map();
for (const source of [
  "css/tokens.css",
  "css/style.css",
  "js/theme.js",
  "js/main.js",
]) {
  const content = await readFile(new URL("../" + source, import.meta.url));
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 12);
  const target = source.replace(/\.(css|js)$/, `.${hash}.$1`);
  exports.set(source, target);
  await writeFile(new URL("../" + target, import.meta.url), content);
}
let keys;
for (const lang of ["en", "hr"]) {
  const strings = JSON.parse(
    await readFile(new URL(`../locales/${lang}.json`, import.meta.url), "utf8"),
  );
  const currentKeys = Object.keys(strings).sort().join("\n");
  if (keys && currentKeys !== keys)
    throw new Error("English and Croatian translation keys differ");
  keys = currentKeys;
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const html = template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    if (key.startsWith("asset:")) {
      const path = exports.get(key.slice(6));
      if (!path) throw new Error(`Unknown asset: ${key}`);
      return path;
    }
    if (key.startsWith("current:"))
      return key === `current:${lang}` ? 'aria-current="page"' : "";
    if (!(key in strings))
      throw new Error(`Missing ${lang} translation: ${key}`);
    return escape(strings[key]);
  });
  const filename = lang === "en" ? "index.html" : "hr.html";
  await writeFile(new URL("../" + filename, import.meta.url), html);
  console.log(`Built ${filename}`);
}
