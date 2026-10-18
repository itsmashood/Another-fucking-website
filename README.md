# radia — personal website

Extract the ZIP and open `radia-site/index.html`. No build, installation, API key or CDN is needed. To publish, upload the contents of `radia-site` to your static hosting root.

## This version

- Responsive layout with a larger interactive X, cherry-blossom strip, featured Xyneria project and smaller project cards.
- The header reads “radia” and the introduction reads “I'm radiawow.”
- Original bio, project destinations, social destinations and contributor credits retained.
- Purple-and-pink bevelled 3D X with page-wide mouse-follow, smoother movement, touch drag and keyboard rotation. Double-click or press Home while focused to reset.
- No visible rotation instructions, animation switch or visitor audio-file chooser.
- Compact music player with a decorative record animation, seek control, volume, loading/error status and automatic track advancement. The record and decorative equalizer animate during playback; they are not an audio-amplitude visualizer.
- Volume is remembered on the same browser when storage is available. Music never starts automatically.
- Keyboard focus styles, skip link, labelled controls and operating-system reduced-motion support.
- Active-section navigation and restrained hover lighting.
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
- `scene.js` — X geometry, materials and mouse/keyboard/touch interaction.
- `app.js` — audio player and saved volume.
- `interface.js` — panel hover lighting and navigation state.
- `songs.js` — owner-configured audio playlist.
- `assets/` — audio, cherry-blossom image, SVG logo fallback and favicon.

The existing GitHub and Discord destinations remain the supplied accounts. Changing the visible name does not imply that those accounts have been renamed.

## Verification

JavaScript syntax, all local asset references, unique IDs, fragment links, audio DOM references and link protections were checked. Simulated controls passed for no autoplay, volume persistence, seek progress, play/pause state, track looping, multiple-track navigation, empty playlists, playback failures and cancellation while loading. Simulated WebGL tests passed for mesh buffers, matrices, draw calls, mouse-follow rotation, keyboard and drag input, and unavailable-context fallback.

This environment does not provide a live browser preview. Actual browser layout, GPU rendering and audible playback have not been verified here. Devices without WebGL see the SVG X fallback. Rendering sleeps while the X is offscreen or the browser tab is hidden.
