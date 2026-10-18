# Mashood — personal website

Extract the ZIP and open `Mashood-Personal/index.html`. No installation or build step is required. To host it, upload the contents of that folder to your static website host.

## Changes

- Plain bio, project descriptions and links based on your original page.
- Removed the slogans, giant headline, numbered sections, floating labels, star background, decorative project mockups and oversized spacing.
- Cherry-blossom banner, readable text and a compact two-column desktop layout.
- Small draggable 3D knot with a pause button and reduced-motion support.
- Responsive mobile layout and keyboard controls.
- Music playlist, previous/next, seek, volume and automatic advancement.

## Adding songs

Only the supplied Chandelier audio is bundled. Additional songs have not been downloaded or generated.

The player’s **Add songs** button accepts multiple audio files from your device. These play in the current browser tab and are not uploaded. They disappear when the tab is refreshed or closed. Remove an added song with its × button.

To make extra songs available to everyone visiting your website:

1. Place the audio files you want to use in `assets/`.
2. Add an entry for each file in `songs.js`, for example:

```js
window.SITE_SONGS = [
  { title: 'Chandelier', artist: 'Will Paquin', src: 'assets/music1.mp3' },
  { title: 'Your song', artist: 'Artist name', src: 'assets/your-song.mp3' }
];
```

3. Upload the updated `songs.js` and the audio files to your host.

Use audio you have permission to share. The player intentionally does not autoplay. It advances through the playlist and returns to the first track after the last. Missing or unsupported audio shows an error without endlessly retrying.

## Editing

- `index.html`: bio, projects, social links, credits.
- `style.css`: layout and colours.
- `songs.js`: permanent playlist for all visitors.
- `app.js`: player and motion controls.
- `scene.js`: 3D knot.

Your original third social link points to a GIF, so it is labelled “Random GIF.”

## Checks

JavaScript syntax, local asset references, internal links, unique IDs and external link protections passed. Simulated control tests passed for audio import, file filtering, track navigation, playback state, automatic advancement, removing tracks, object URL cleanup, seeking, volume and motion.

Browser visual testing and real audio playback were not available in this environment. WebGL initialization failures use a static CSS fallback.
