# The Luck Surface

**Your potential. Dangerously over-modelled.**

A public, no-login meme playground across **Doing × Yapping × Brains**, inspired by [Lauris (@lzminsky)](https://x.com/lzminsky/status/2122721739289346380).

- Drag or use arrow keys to rotate the 3D surface; scroll or use +/- to zoom; 0 resets.
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

The 3D surface is the fictional equal-luck contour:

```
doing × yapping × (0.25 + 0.75 × brains) = 0.22
```

Inputs are scaled to 0–1 and the contour is clipped to the unit cube. Axes are actual doing, yapping, and brains coordinates. The user marker represents the slider settings and does not have to lie on the surface. The contour is illustrative, and the diagnosis and percentages are jokes, not predictions or financial advice. Two-axis maps preserve the source memes' categorical meaning; they are not mathematical projections of the fictional 3D model.

## Credits

Original memes and their labels: **Lauris (@lzminsky)**, [original post](https://x.com/lzminsky/status/2122721739289346380). This is an unofficial interactive remix, not an endorsement. The original reference image and source meme wording are not covered by the code license.

Application code: MIT; see [LICENSE](LICENSE).
