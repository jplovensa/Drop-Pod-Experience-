# FJÄLL Drop Pod client portal

A responsive client workspace built around the supplied Drop Pod villa presentation.

## Run locally

From this checkout, run:

```sh
python3 -m http.server 3000
```

Open the served `index.html` in a browser. No build step or package installation is required.

## Structure

- `index.html`: project overview, material preferences, review notes, and resources.
- `experience-v4.html`: the current cinematic and panoramic walkthrough (`experience.html` remains compatible).
- `styles/`: responsive portal and walkthrough styles.
- `scripts/`: portal review state and walkthrough controls.
- `assets/`: images and videos from the supplied project archive.

## Client workflow

Compare three material palettes, save a preference, explore the villa, and record review notes. Preferences and notes persist in browser local storage. Download the review as a text file for sharing with the project team. Palette links open the walkthrough with the requested material selection.

All interactions run in the browser, with local preferences and downloadable briefs. No backend or account is required. Concept selection is a design preference.

The walkthrough includes keyboard navigation (Space, arrows, V, M/W, F), drag exploration, and a WebGL panoramic suite. Panorama rendering requires browser WebGL support. The walkthrough uses locally hosted Inter and falls back to system fonts.

## Validation

Browser checks exercised preference and note persistence, review export, mobile overflow, palette links, scene navigation, and panorama controls without JavaScript errors. Both JavaScript files also pass `node --check`.

## Development showcase

The portal is entirely frontend. Material detail modals show conceptual color references; the design library offers category filters and paired material views. The ambiance studio previews daylight, golden hour, and evening through image treatments. The massing explorer draws 6–120 pods as coastal, garden, or courtyard collections, with compact or generous spacing and SVG export. These are illustrative layouts, not dimensioned site designs. No backend, account, or API is required.

## Shared WebGL Drop Pod model

`pod-model.js` defines the reference-derived asymmetric teardrop shell used by both the exterior studio and the modal walkthrough. Its lofted outer skin, separate interior lining, thick rounded lip, recessed glazing, veranda, and entry steps follow the supplied renders. The model adds tiled flooring, timber cabinetry, pleated curtains, furniture, ambient contact shadows, PBR surface textures, environment reflections, and warm interior lighting. Geometry and dimensions remain indicative; exact reproduction requires the original model or dimensioned drawings.

Select an exterior swatch in either view to update both. Interior palettes change timber and lining tones. The fullscreen walkthrough supports WASD/arrows, drag-to-look, touch movement buttons, collision boundaries, viewpoint shortcuts, reset, and PNG export. Escape closes it. No backend or runtime CDN is required. WebGL is required; unsupported browsers receive a link to the original rendered experience. Inter and Three.js remain locally hosted with their licenses.

## Earthy Luxe collection

All ten supplied Earthy Luxe views are retained as optimized WebP assets under `assets/earthy-luxe/`. The originals remain in the uploaded archive; web assets retain the original files, while a display crop excludes the corrupted strip in the top quarter. `interior-palettes.js` shares titles and view mappings between the portal and cinematic experience. Earthy Luxe supports saved preferences, material and library modals, the ambiance studio, and a ten-view collection with downloads. All three palettes follow the same 17-chapter cinematic sequence from the beginning. Opening architectural films and the exterior hero are shared; Earthy Luxe uses its matching supplied views in the interior chapters. Its panorama chapter uses a clearly labeled perspective reference instead of inventing a 360° image. Switching palettes keeps the current chapter and playback progress. The WebGL model applies a reference-based Earthy Luxe color/material treatment; it is not a reconstruction of the new images' exact geometry.

The ten supplied Earthy Luxe exports contain a corrupted repeated gray strip in their top quarter. `earthy-crop.css` and the shared palette script exclude that area from portal and cinematic presentation without modifying source assets. Palette switching removes the crop wrapper when another collection is selected. Downloads retain the source file.

### Rendered Earthy Luxe film

Earthy Luxe Film mode plays `assets/earthy-luxe/film/earthy-luxe-cinematic-v4.mp4`: a silent 152-second H.264 film, 1280×720 at 24 fps. The 17 chapters follow the Mediterranean and Warm Organic order. Destination, beachfront and approach use shared architectural footage. Entrance and suite reveal are new three-shot sequences; the remaining Earthy Luxe chapters use fixed camera framing of the supplied perspective views. Entrance and suite shots blend with half-second dissolves. These sequences use supplied still renders, rather than a continuous 3D camera render from the original model. The corrupt top strip is excluded from the rendered footage.

Chapter captions, progress, pause/resume and seeking follow the actual video playback clock, including when buffering. `chapters.json` records exact start times and source views. Explore mode uses separate Earthy Luxe entrance/suite clips and cropped perspective references. The end card includes a film download.

Regenerate the film with `python3 tools/render-earthy-film.py` (requires FFmpeg with libx264 and Python 3). Sources are unchanged; outputs are under `assets/earthy-luxe/film/`.

Portal links use the fresh `experience-v4.html` entry and `scripts/experience-player-v4.js` filename to avoid earlier cached page/player URLs. `experience.html` also loads this player; `scripts/experience.js` is a compatibility loader for older bookmarks. The page exposes release `20261008-steady4` in its `walkthrough-version` meta tag. Keep the compatible HTML entries identical when publishing updates.

Browser regression: with Playwright installed and an HTTP server that supports byte ranges, run `BASE_URL=http://localhost:3001 node tests/earthy-film.cjs`. Set `PLAYWRIGHT_MODULE` if Playwright lives outside the project. The check decodes the film, navigates all 17 chapters, crosses their boundaries, and exercises transport, palette changes, Explore mode, replay and mobile width.

The stabilized v4 film removes zoom/crop animation from still-derived shots to prevent pixel-step jitter. Earthy Luxe Explore mode also keeps the camera still when idle; drag controls remain available. Media filenames and release queries keep older cached renders separate.

Camera regression: `python3 tests/earthy-camera.py` requires FFmpeg and NumPy. It decodes held-shot samples in every still-derived chapter and rejects unintended frame changes.
