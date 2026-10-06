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
- `experience.html`: the original cinematic and panoramic walkthrough.
- `styles/`: responsive portal and walkthrough styles.
- `scripts/`: portal review state and walkthrough controls.
- `assets/`: images and videos from the supplied project archive.

## Client workflow

Compare two material palettes, save a preference, explore the villa, and record review notes. Preferences and notes persist in browser local storage. Download the review as a text file for sharing with the project team. Palette links open the walkthrough with the requested material selection.

All interactions run in the browser, with local preferences and downloadable briefs. No backend or account is required. Concept selection is a design preference.

The walkthrough includes keyboard navigation (Space, arrows, V, M/W, F), drag exploration, and a WebGL panoramic suite. Panorama rendering requires browser WebGL support. The walkthrough optionally loads Inter from Google Fonts and falls back to system fonts.

## Validation

Browser checks exercised preference and note persistence, review export, mobile overflow, palette links, scene navigation, and panorama controls without JavaScript errors. Both JavaScript files also pass `node --check`.

## Development showcase

The portal is entirely frontend. Material detail modals show conceptual color references; the design library offers category filters and paired material views. The ambiance studio previews daylight, golden hour, and evening through image treatments. The massing explorer draws 6–120 pods as coastal, garden, or courtyard collections, with compact or generous spacing and SVG export. These are illustrative layouts, not dimensioned site designs. No backend, account, or API is required.

## Exterior finish studio and first-person walkthrough

Inter is self-hosted as a variable font. The exterior studio and fullscreen modal use a locally vendored Three.js 0.160.1 module. Drag to orbit the exterior; select chalk, sand, clay, or graphite to change the shell's surface. The modal uses WASD/arrows to move, drag to look, and on-screen movement buttons for touch. Collision boundaries keep the camera inside the terrace/suite and outside furniture. Reset restores the veranda viewpoint; Save view exports a PNG. Escape closes the modal. The selected exterior finish is included in the design brief.

This is a simplified procedural architectural model, not an Unreal Engine renderer or a reconstruction of a supplied production 3D model. The original cinematic experience remains available. WebGL is required for the 3D studio; unsupported browsers receive a link to the cinematic experience. No runtime CDN or backend is needed. Licenses are retained beside the font and vendored renderer.
