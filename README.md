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

This is a frontend portal: it does not provide authentication, team messaging, server storage, or synchronization between devices. Connecting those services requires a backend. Concept selection is a preference, not a contractual approval.

The walkthrough includes keyboard navigation (Space, arrows, V, M/W, F), drag exploration, and a WebGL panoramic suite. Panorama rendering requires browser WebGL support. The walkthrough optionally loads Inter from Google Fonts and falls back to system fonts.

## Validation

Browser checks exercised preference and note persistence, review export, mobile overflow, palette links, scene navigation, and panorama controls without JavaScript errors. Both JavaScript files also pass `node --check`.
