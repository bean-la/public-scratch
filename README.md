# public-scratch

Client-facing docs published at **https://bean-la.github.io/public-scratch/**

## Source

Markdown lives in [`content/`](content/). Add any `.md` file there; push to `main` and GitHub Actions builds static HTML (Mermaid → SVG) and deploys to Pages.

Primary doc: `content/dublab-approach-outline.md` → site root `index.html` when it is the only page.

## Local build

```bash
cd build && npm ci && npm run build
open ../site/index.html
```

## Monorepo

This directory is a submodule of [slyce-studio](https://github.com/bean-la/slyce-studio). After editing `content/`, commit and push from here:

```bash
cd _external/public-scratch
git add content/
git commit -m "Update docs"
git push origin main
```

Or from the monorepo root:

```bash
./scripts/publish-public-scratch.sh
```
