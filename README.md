# TalkToMe — Calm Skyline Edition

A minimal self-reflection conversation website with a preserved volumetric purple Three.js orb, a violet city background, and on-device supportive responses. No API key or server database needed.

## Deploy to Vercel from GitHub (no local Node.js needed)

1. Extract this ZIP. Open the inner `talktome` folder.
2. Create or open a GitHub repository. Upload **the contents** of `talktome` so `package.json`, `src/`, `public/`, and `index.html` are at the repository root.
3. Import that repository at https://vercel.com/new. Use the **Vite** framework preset, `npm run build` build command, and `dist` output directory.
4. Click Deploy. Vercel installs and builds automatically.

If you already connected the repository to Vercel, committing the new files triggers a fresh deployment.

### Optional local development

```sh
npm ci
npm run dev
```

## Background

The default background is the user's original city animation, color-graded violet: `public/assets/city-purple.gif`.

An alternate cinematic animation is included at `public/assets/city-purple-alternate.gif`. To switch, edit the `background:` line in `src/style.css` under `#cityscape`. No changes are necessary to the orb shader.

The moving line and dot network was removed to avoid visual clutter; the orb's shader, color palette and pointer/speaking interactions remain untouched.

## Conversation and safety

- Responses are **rule-based**, not generative AI. They can misunderstand the context and are not reliable for detecting every crisis.
- Supportive follow-ups cover regret, shame, panic, sadness, relationships, anger, stress, loss, sleep, loneliness, and uncertainty.
- For self-harm language, responses start with acknowledgment and simple safety steps, ask about immediacy, and suggest urgent human help when someone may act soon or has already been harmed.
- TalkToMe is **not a therapist, emergency responder or crisis service**. Test extensively with qualified experts before using it as a real-world mental health tool.
- Conversations are stored only in localStorage in that browser. Browser clearing removes them; exports are available in Backups. History is not encrypted and not synced. No information is sent to a server by this app, though browser speech-to-text may use browser/provider services.
- Microphone input depends on browser speech recognition support and permissions. WebGL is required for the orb.

## Assets

- `src/scene.js`: the original shader and the background Three.js scene. Purple orb rendering code preserved.
- `src/support.js`: scripted response patterns and safety check handling.
- `src/main.js`: chat UI, local storage, voice input and backups.
- `src/style.css`: background treatment and minimal interface.
