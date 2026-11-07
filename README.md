# TalkToMe • browser edition

A personal learning companion with a purple volumetric 3D orb, particles and connecting tracers. No AI API, account, database or environment variables are needed.

## Run locally

Install Node.js 22 or later. Open a terminal in this folder and run:

```
npm install
npm run dev
```

Open the address printed in the terminal. Do not double-click index.html. For a production build run `npm run build`, then `npm run preview`.

## Publish to Vercel

1. Create a GitHub repository and upload the contents of this folder. Keep package.json at the repository root. Exclude node_modules.
2. In Vercel, import the repository and choose Vite.
3. Use build command `npm run build` and output folder `dist`. No environment variables are needed.
4. Deploy. Choose project name `talktome` if available. The address talktome.vercel.app has not been reserved.

Alternatively, the included `dist` folder is a ready-built static website for a static host. Hosting free-tier limits and terms apply. No subscriptions or paid integrations are part of the code.

## Teach and remember

- Click Teach me. Enter a question such as “What is my favourite colour?” and answer “Purple”. Save and ask that question in chat.
- Or type “Remember my favourite colour is purple”. Ask “What is my favourite colour?” to retrieve the fact.
- Unknown or ambiguous questions ask you to teach an answer. Clicking Teach me automatically fills the unknown question.
- Memories supports editing, deleting, JSON export and import. Imports merge and skip exact duplicates. Old TalkToMe memory-array exports are supported.
- Matching uses normalized words, exact questions and conservative word overlap. It handles colour/color and favourite/favorite. It does not have general reasoning or arbitrary language understanding. Conflicting equally scored lessons ask for teaching.

## Storage and privacy

Lessons stay in localStorage on this browser and website address. There is no cloud sync. Clearing site data, losing the device or changing the website address can make lessons unavailable. Export backups regularly and import them on another device. Private browsing may discard data when closed. Storage is limited by the browser. A failed write displays an error rather than claiming the lesson was saved.

The microphone uses browser speech recognition where supported. Browsers may send audio to their vendor's speech service. Review the transcript and press send yourself. Read aloud uses browser speech synthesis. Google opens only after you click Allow and search, and receives the query you enter. Results are not automatically read or learned. Text matching and memory storage run locally.

The centerpiece is a purple volumetric 3D orb, ray-marched in a single GLSL fragment shader (see `src/scene.js`): folded translucent membranes with lighting and depth tinting that fade softly into the background with no hard outline. It tilts toward your cursor, is pulled and lit by it, swells on hover, ripples on click, and speeds up while you speak or listen. It lowers its resolution automatically on slow GPUs. Reduced-motion preferences freeze it and disable cursor reactions. Browser WebGL support is required.

## Verify

Teach a lesson, ask its question, reload and ask again. Export it, delete it and import your backup. Try an unknown question. Test voice permission and Google cancellation on your own browser. Build and memory logic checks are performed before packaging, while browser-specific microphone behavior depends on your device.
