# Hebrew Flashcards PWA

Installable flashcard trainer built with **Vite + React + TypeScript**. It works on desktop and phone, supports **Add to Home Screen**, and keeps session progress in localStorage.

## Features
- PWA-ready: manifest, service worker, app icons, offline caching for app shell + `words.json`.
- Baseline sweep across a random active set of 50 words (or all if less).
- Training algorithm with expanding batches of +3 words and 2 perfect-run streak requirement.
- Persistent session state so refresh does not lose progress.
- Reset session button.
- Unit tests for training logic (Vitest).

## Getting started
```bash
npm install
npm run dev
```

Build production assets:
```bash
npm run build
```

Run tests:
```bash
npm run test
```

## How to add more words
1. Open `public/data/words.json`.
2. Add entries using this schema:
   ```json
   {
     "id": "unique-string",
     "front": "Hebrew word",
     "back": "Simple explanation / translation",
     "example": "Short example sentence (optional)"
   }
   ```
3. Keep every `id` unique.

## Deploy to Vercel
1. Push this repo to GitHub.
2. In Vercel, import the repository.
3. Framework preset: **Vite** (auto-detected).
4. Deploy. The app will be available at a URL such as `myhebrewcards.vercel.app`.

## Notes
- Session persistence key: `flashcards-session-v1`.
- Reset Session clears storage and restarts from home screen.
