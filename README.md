# Portfolio Studio

Portfolio Studio is a bilingual Hebrew/English platform for creating an interactive third-person 3D résumé portfolio.

Users can:

- choose a realistic male or female character base;
- customize clothing, colors, hairstyle, face options and accessories;
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
- Character assets: five additional rigged KayKit GLB models (Barbarian, Knight, Mage, Rogue and Hooded Rogue) with embedded textures and animation-ready skeletons
- Storage: browser `localStorage` for the local draft, plus downloadable JSON project files
- Export: standalone HTML and ZIP generation in the browser; each export embeds only the selected character GLB plus the applicable license texts
- Backend: none. The project does not require a server, database, authentication or API. A static host such as GitHub Pages, Netlify or Cloudflare Pages can serve it.

The editable studio lives in `dist/index.html`. The exported playable runtime is bundled in `dist/player.bundle.js` and uses the same 3D engine and résumé data format.

## Deploying the static site

For GitHub Pages, configure the repository's Pages settings to publish from the `main` branch and the `/dist` folder, if that option is available. Alternatively, copy the contents of `dist` to any static hosting provider.
