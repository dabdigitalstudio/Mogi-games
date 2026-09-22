# Portfolio Studio

Portfolio Studio is a bilingual Hebrew/English platform for creating an interactive third-person 3D résumé portfolio.

Users can:

- choose one of nine original KayKit CC0 characters, including four playful skeletons;
- toggle matching hats, helmets, hoods and cloaks on the skeleton characters;
- fill in introduction, skills, experience, education, projects and contact details;
- choose between five 3D worlds;
- explore the portfolio with keyboard controls and press Enter at résumé stations;
- export a self-contained playable HTML file or a website ZIP.

## Run locally

The site is a static frontend. From the project root, run one of these commands:

```bash
python3 -m http.server 4173 --directory dist
```

Then open <http://127.0.0.1:4173>.

If Node.js is installed, this also works:

```bash
npx serve dist
```

Opening `dist/index.html` directly with `file://` is not recommended because browser module and WebGL security rules vary. Use a local static server instead.

## Controls in the exported portfolio

- `WASD` or arrow keys: move and turn
- `Shift`: sprint
- `Space`: jump
- mouse drag: look around
- `Enter`: open a nearby résumé station
- `Esc`: close a résumé dialog

## Technology

- Frontend: HTML, CSS and native JavaScript ES modules
- 3D rendering: Three.js and WebGL
- Character assets: nine rigged KayKit GLB models with embedded textures and authored idle, walk, run and jump animations. All current character assets are CC0.
- Storage: browser `localStorage` for the local draft, plus downloadable JSON project files
- Export: standalone HTML and ZIP generation in the browser; each export embeds only the selected character GLB plus the applicable license texts
- Backend: none. The project does not require a server, database, authentication or API. A static host such as GitHub Pages, Netlify or Cloudflare Pages can serve it.

The editable studio lives in `dist/index.html`. The exported playable runtime is bundled in `dist/player.bundle.js` and uses the same 3D engine and résumé data format.

## Deploying the static site

For GitHub Pages, configure the repository's Pages settings to publish from the `main` branch and the `/dist` folder, if that option is available. Alternatively, copy the contents of `dist` to any static hosting provider.

Legacy human-character drafts migrate to the Barbarian while retaining résumé content. Skeleton equipment is supplied within each original GLB and shares its CC0 license. Source links and license files are in dist/assets/KAYKIT-SOURCES.md and dist/vendor.
