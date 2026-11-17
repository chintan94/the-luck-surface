# The Luck Surface

**Your potential. Dangerously over-modelled.**

A public, no-login meme playground across **Doing × Yapping × Brains**, inspired by [Lauris (@lzminsky)](https://x.com/lzminsky/status/2122721739289346380).

- Drag or use arrow keys to rotate the 3D surface; scroll or use +/- to zoom; 0 resets.
- A full-width 3D stage with larger, spaced callouts, and controls below the chart.
- A live closest-archetype result uses equal-weight Euclidean distance across the selected traits, ignoring hidden dimensions; exact ties follow the fixed archetype order. The nearest label is highlighted on the chart.
- Ten clickable archetype labels follow their 3D coordinates as you rotate, with leader lines and automatic spacing.
- Select any two dimensions to collapse into an interactive 2D map.
- Doing + Yapping recreates the original doing-to-yapping meme.
- Doing + Brains recreates the original boldness-to-brains meme, explicitly interpreting Doing as Boldness.
- Yapping + Brains is an unofficial bonus remix.
- Sliders, clickable maps, archetype presets, random diagnoses, and shareable URL fragments.
- Original meme reference included with attribution. No accounts, analytics, database, or runtime dependencies.

## Run

Requires Node.js 20 or newer. No dependency installation needed.

```sh
npm run dev
# http://localhost:5173
npm run check
npm test
```

Deploy the `public/` directory as static assets. `vercel.json` configures this automatically.

## Extremely unserious math

The rising reference surface uses `brains = sqrt(doing × yapping)`, with all inputs scaled to 0–1. The actual axes and user point remain Doing, Yapping, and Brains; the point can lie off the illustrative surface.

Surface colours and the three-trait energy score share `cbrt(doing × yapping × (0.25 + 0.75 × brains))`. Red is low, amber is middle, green is high. Brains help, but cannot replace doing or distribution. This replaces the original equal-luck contour, whose arbitrary brain-only colouring did not reflect the score.

## Share cards

“Make my roast card” creates a 1200 × 1500 PNG locally in the browser, with a large archetype headline and roast, all three scores, selected matching dimensions, current chart rotation, and Lauris's credit plus original post URL. The card labels only YOU and your closest match to keep the surface uncluttered; the interactive chart keeps all ten archetypes. Preview, download, or use the device share sheet where supported. No upload, account, or external image service. The card resets zoom to keep the chart in frame; its renderer and colour scale are shared with the interactive surface.

## Credits

Original memes and their labels: **Lauris (@lzminsky)**, [original post](https://x.com/lzminsky/status/2122721739289346380). This is an unofficial interactive remix, not an endorsement. The original reference image and source meme wording are not covered by the code license.

Application code: MIT; see [LICENSE](LICENSE).
