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

## Exterior finish studio and rendered walkthrough

Inter is self-hosted as a variable font. The exterior finish studio uses locally vendored Three.js 0.160.1 for its simplified shell simulation. Drag to orbit and try chalk, sand, clay, or graphite. The selected exterior finish is included in the design brief.

The fullscreen walkthrough is separate from that studio and uses ordinary HTML images and videos, with no WebGL or renderer dependency. It presents eight spaces, including two camera-path films from the supplied archive. Still scenes support both material palettes and drag inspection. Film scenes show the supplied shared material treatment and disable palette switching. Arrow keys and scene buttons navigate; Escape closes the modal. Download scene saves the current source image or film. This is a scene-based tour rather than continuous free movement.

These are supplied pre-rendered assets, not verified SketchUp exports. A specific SketchUp project requires exported renders or walkthrough movies to replace the assets. No backend or runtime CDN is needed. The original standalone cinematic/panorama page is retained; its panoramic viewer still uses WebGL. Font and renderer licenses are retained alongside their files.
