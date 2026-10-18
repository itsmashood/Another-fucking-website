# Mashood — 3D personal website

## Open it

1. Extract the entire ZIP.
2. Open `Mashood-3D/index.html` in a modern desktop or mobile browser.

No installation, build step, API key, CDN, internet connection or development server is needed to display the site. External project/social links naturally need an internet connection. Keep the files and assets folder together.

To host it, upload the contents of `Mashood-3D` to a static host. Put `index.html` at the site's root. This archive does not deploy or change your existing live site.

## What's new

- Real WebGL chrome knot sculpture, generated from 3D geometry, with orbit rings and satellites.
- Drag to rotate; focus the sculpture and use arrow keys. Double-click or press Home to reset.
- Rose, Ice and Lilac theme controls. The chosen theme is remembered when browser storage is available.
- Perspective hover interaction on the profile and project cards.
- Original cherry-blossom artwork used in the personal profile card.
- Purpose-built project illustrations, ambient stars, responsive desktop/mobile layouts.
- Local music with explicit play/pause and volume controls; no surprise autoplay.
- A floating Motion button, reduced-motion support, keyboard focus states and a skip link.
- The WebGL loop sleeps while offscreen or in a hidden tab. Devices without WebGL see a CSS sculpture fallback.
- No external JavaScript libraries, icon fonts or remotely loaded fonts.

## Files

- `index.html` — content, navigation, project links, social links and original credits.
- `style.css` — layout, responsive rules, visual effects and CSS fallback.
- `scene.js` — WebGL geometry, material shader, lighting and interaction.
- `app.js` — themes, tilt, music, motion and progress controls.
- `assets/` — supplied music and artwork, a still extracted from the supplied background, and a new favicon.

## Customize

Edit your bio, project descriptions and links in `index.html`. Adjust the default palette in `style.css` and the three selectable palettes in `app.js`. Replace `assets/music1.mp3` to change the audio; update its visible title, artist credit and accessible labels in `index.html` and `app.js` too.

Your original third social button pointed to a Tenor GIF, not a Roblox profile. That same destination is preserved under “Just for fun.” Change its link and label if you intended a Roblox profile instead.

The original `BYAKKUYAAAA.gif` and `RUKIA.gif` were two-byte placeholders and were omitted. The original references to a missing favicon and `music2.mp3` through `music10.mp3` were replaced with valid local assets. Existing attribution is retained in the expandable footer. Original `background.gif`, `roblox.png`, `github.png`, `discord.png` and `cursor.png` are included for future customization; not every retained asset is used by the redesign.

## Verification

JavaScript syntax, internal anchors, bundled asset paths, unique HTML IDs and external-link protections were checked. A simulated WebGL environment exercised finite geometry buffers and matrices, draw calls, drag/keyboard rotation, theme changes, pause and fallback behavior. Controls were checked in a simulated DOM.

A browser preview and real GPU shader compilation were not available in the build environment, so actual browser rendering and audio playback have not been visually or audibly verified here. The page includes a graceful CSS fallback if WebGL initialization fails.
