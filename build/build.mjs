import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentDir = path.join(root, "content");
const siteDir = path.join(root, "site");
const tmpDir = path.join(siteDir, ".tmp");

const STYLES = `
:root {
  --bg: #0f1117;
  --surface: #181b24;
  --text: #e8eaef;
  --muted: #9aa3b5;
  --accent: #5b8def;
  --border: #2a3040;
  --code-bg: #1e2330;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "DM Sans", system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.65;
  font-size: 17px;
}
header {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
  padding: 1.25rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}
header h1 { margin: 0; font-size: 1.15rem; font-weight: 600; letter-spacing: -0.02em; }
header p { margin: 0.35rem 0 0; color: var(--muted); font-size: 0.9rem; }
main { max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
.doc h1 { font-size: 2rem; margin-top: 0; letter-spacing: -0.03em; }
.doc h2 {
  font-size: 1.45rem;
  margin-top: 2.5rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border);
  letter-spacing: -0.02em;
}
.doc h3 { font-size: 1.15rem; margin-top: 1.75rem; }
.doc p, .doc li { color: #c8ced9; }
.doc strong { color: var(--text); font-weight: 600; }
.doc a { color: var(--accent); }
.doc hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
.doc table { width: 100%; border-collapse: collapse; font-size: 0.92rem; margin: 1.25rem 0; }
.doc th, .doc td { border: 1px solid var(--border); padding: 0.55rem 0.75rem; text-align: left; }
.doc th { background: var(--surface); font-weight: 600; }
.doc tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
.doc code {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 0.88em;
  background: var(--code-bg);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}
.doc pre {
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
}
.doc pre code { background: none; padding: 0; }
.diagram {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1rem;
  margin: 1.5rem 0;
  overflow-x: auto;
}
.diagram svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
.index-list { list-style: none; padding: 0; }
.index-list li { margin: 0.75rem 0; }
.index-list a { font-size: 1.1rem; text-decoration: none; }
.index-list a:hover { text-decoration: underline; }
`;

const mmdcBin = path.join(__dirname, "node_modules", ".bin", "mmdc");

async function renderMermaid(code, id) {
  const inFile = path.join(tmpDir, `${id}.mmd`);
  const outFile = path.join(tmpDir, `${id}.svg`);
  await fs.writeFile(inFile, code, "utf8");
  const puppeteerConfig = path.join(__dirname, "puppeteer-config.json");
  execFileSync(
    mmdcBin,
    [
      "-i",
      inFile,
      "-o",
      outFile,
      "-b",
      "transparent",
      "-t",
      "dark",
      "-p",
      puppeteerConfig,
    ],
    { stdio: "inherit" },
  );
  return fs.readFile(outFile, "utf8");
}

async function markdownToHtml(md, slug) {
  await fs.mkdir(tmpDir, { recursive: true });
  const blocks = [];
  let idx = 0;
  const withPlaceholders = md.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
    const n = idx++;
    blocks.push(code.trim());
    return `\n\n<p data-mermaid="${n}"></p>\n\n`;
  });

  let body = marked.parse(withPlaceholders);
  for (let i = 0; i < blocks.length; i++) {
    const svg = await renderMermaid(blocks[i], `${slug}-${i}`);
    body = body.replace(
      `<p data-mermaid="${i}"></p>`,
      `<div class="diagram">${svg}</div>`,
    );
  }
  return body;
}

function pageShell({ title, subtitle, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>${STYLES}</style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    ${subtitle ? `<p>${subtitle}</p>` : ""}
  </header>
  <main>${body}</main>
</body>
</html>`;
}

async function buildPage(file) {
  const slug = file.replace(/\.md$/, "");
  const md = await fs.readFile(path.join(contentDir, file), "utf8");
  const title = md.match(/^#\s+(.+)/m)?.[1] ?? slug;
  const bodyHtml = await markdownToHtml(md, slug);
  const subtitle =
    slug === "dublab-approach-outline"
      ? "Platform approach & architecture overview · May 2026"
      : "";
  return {
    slug,
    title,
    html: pageShell({
      title,
      subtitle,
      body: `<article class="doc">${bodyHtml}</article>`,
    }),
  };
}

async function main() {
  await fs.rm(siteDir, { recursive: true, force: true });
  await fs.mkdir(siteDir, { recursive: true });

  const entries = (await fs.readdir(contentDir))
    .filter((f) => f.endsWith(".md"))
    .sort((a, b) => {
      const order = [
        "dublab-approach-outline.md",
        "dublab-current-vs-slyce.md",
        "gcal-to-wordpress-workflow.md",
      ];
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });

  if (entries.length === 0) {
    throw new Error(`No markdown files in ${contentDir}`);
  }

  const pages = [];
  for (const file of entries) {
    const page = await buildPage(file);
    pages.push(page);
    await fs.writeFile(path.join(siteDir, `${page.slug}.html`), page.html);
  }

  const primary =
    pages.find((p) => p.slug === "dublab-approach-outline") ?? pages[0];
  await fs.writeFile(path.join(siteDir, "index.html"), primary.html);

  if (pages.length > 1) {
    const list = pages
      .map((p) => `<li><a href="${p.slug}.html">${p.title}</a></li>`)
      .join("\n");
    await fs.writeFile(
      path.join(siteDir, "index.html"),
      pageShell({
        title: "Documents",
        subtitle: "Client documentation",
        body: `<ul class="index-list">${list}</ul>`,
      }),
    );
    await fs.writeFile(
      path.join(siteDir, `${primary.slug}.html`),
      primary.html,
    );
  }

  await fs.writeFile(path.join(siteDir, ".nojekyll"), "");
  await fs.rm(tmpDir, { recursive: true, force: true });
  console.log(`Built ${pages.length} page(s) → ${siteDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
