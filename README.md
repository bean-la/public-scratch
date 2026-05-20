# public-scratch

Client-facing docs at **https://bean-la.github.io/public-scratch/**

## Documents

| File | Role |
|------|------|
| `content/index.md` | Site hub — reading guide (built as `/index.html`) |
| `content/dublab-current-vs-slyce.md` | **Start here** — today vs proposed, plain language + publish options |
| `content/dublab-approach-outline.md` | Technical Slyce reference |

Legacy links such as `/gcal-to-wordpress-workflow.html` are generated as redirects so old emails keep working.

Push to `main` → GitHub Actions builds HTML (Mermaid → SVG) → Pages.

## Local build

```bash
cd build && npm ci && npm run build
open ../site/index.html
```

## Monorepo

Submodule of [slyce-studio](https://github.com/bean-la/slyce-studio). Publish:

```bash
cd _external/public-scratch && git add content/ && git commit -m "Update docs" && git push
# or: ./scripts/publish-public-scratch.sh
```
