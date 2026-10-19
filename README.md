# radia — personal website

Extract the ZIP and open `radia-site/index.html`. No build, installation, API key or CDN is needed. To publish, upload the contents of `radia-site` to your static hosting root.

## This version

- The X is now orbited by two glowing rings carrying seven separate Undertale-style soul hearts (red, orange, yellow, green, cyan, blue, purple). Each heart is a real 3D pixel heart built from cubes, stays upright, sways with the mouse and pulses gently. They are generated in `scene.js`, so no new asset files are needed.
- Wider layout: on large screens the page now uses up to 1500px instead of 1120px, with a bigger X panel and larger headline.
- Side gutters use smooth pink and purple hearts with the same drifting animation: 160 hearts on wide screens, reduced to 64 between 1180px and 1679px, hidden below 1180px. Central Undertale soul hearts and their seven colours are unchanged.
- GitHub, Discord and Roblox icons now appear in the top-right header and Links section. Mobile uses a two-row header to keep all icons visible. Icons are bundled locally.
- The Roblox icon retains the original Tenor GIF destination; replace that URL in index.html with your Roblox profile if desired.
- Without WebGL, the flat X shows with a few static pixel hearts around it.

- Responsive layout with a larger interactive X, cherry-blossom strip, featured Xyneria project and smaller project cards.
- The header reads “radia” and the introduction reads “I'm radiawow.”
- Original bio, project destinations, social destinations and contributor credits retained.
- Purple-and-pink bevelled 3D X with page-wide mouse-follow, smoother movement, touch drag and keyboard rotation. Double-click or press Home while focused to reset.
- No visible rotation instructions, animation switch or visitor audio-file chooser.
- Compact music player with a decorative record animation, seek control, volume, loading/error status and automatic track advancement. The record and decorative equalizer animate during playback; they are not an audio-amplitude visualizer.
- Volume is remembered on the same browser when storage is available. Music never starts automatically.
- Keyboard focus styles, skip link, labelled controls and operating-system reduced-motion support.
- Active-section navigation that follows scrolling and keeps your chosen tab when Music and Links share a row; restrained hover lighting.
- Larger touch targets for playback and volume, spoken time/volume values for screen readers, and touch rotation that distinguishes horizontal dragging from vertical page scrolling.
- No remote scripts, stylesheets, fonts or image dependencies. External links require internet access.

## Music

The supplied Chandelier track by Will Paquin is bundled. No additional recordings have been added.

To add permanent tracks for every visitor, put audio files you have permission to share in `assets/`, then add entries in `songs.js`:

```js
window.SITE_SONGS = [
  { title: 'Chandelier', artist: 'Will Paquin', src: 'assets/music1.mp3' },
  { title: 'Your song', artist: 'Artist', src: 'assets/your-song.mp3' }
];
```

Previous/next buttons appear when the configured playlist contains more than one song. The final track loops back to the first. There is no visitor upload or file chooser.

## Files

- `index.html` — content, sections, links and credits.
- `style.css` — appearance, depth effects and responsive layouts.
- `scene.js` — X geometry, orbit rings, pixel-heart geometry, materials and mouse/keyboard/touch interaction. Edit the `SOUL` array to change the heart's pixel shape, or `hearts` to change colours and orbits.
- `app.js` — audio player and saved volume.
- `interface.js` — panel hover lighting and navigation state.
- `songs.js` — owner-configured audio playlist.
- `assets/` — audio, cherry-blossom image, SVG logo fallback and favicon.

The existing GitHub and Discord destinations remain the supplied accounts. Changing the visible name does not imply that those accounts have been renamed.

## Verification

JavaScript syntax, all local asset references, unique IDs, fragment links, audio DOM references and link protections were checked. Simulated controls passed for no autoplay, volume persistence, seek progress, play/pause state, track looping, multiple-track navigation, empty playlists, playback failures and cancellation while loading. Navigation checks passed for scroll tracking, shared rows, chosen tabs, responsive section ordering and hash changes. Simulated WebGL tests passed for mesh buffers, matrices, draw calls, mouse-follow rotation, keyboard and drag input, and unavailable-context fallback.

This environment does not provide a live browser preview. Actual browser layout, GPU rendering and audible playback have not been verified here. Devices without WebGL see the SVG X fallback. A lost graphics context also switches to that fallback without restarting the failed renderer. Rendering sleeps while the X is offscreen or the browser tab is hidden.

## Sans companion

Sans stays fixed in the bottom-right corner on desktop and mobile. Click him or use talk, joke and nap. Downward scrolling triggers “what do you wanna find down there?” with a 20-second cooldown; button dialogue gets 10 seconds of priority. Closing the speech bubble keeps Sans visible.

Edit `sans-lines.js` to change the greeting, scroll line or button dialogue. `sans.css` controls placement and size; `assets/sans.svg` is a locally bundled custom vector depiction. The lines are original, character-inspired dialogue, not quoted game dialogue. No external image or audio requests are needed. Reduced-motion settings show dialogue instantly.
