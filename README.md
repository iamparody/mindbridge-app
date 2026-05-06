# MindBridge

A mobile-first mental health support platform built with React (Vite PWA) and Node.js/Express.

---

## Setup

### Backend
```bash
cd src/backend
cp .env.example .env
# Fill in all values in .env
npm install
node migrations/run.js
node scripts/seed_admin.js admin@yourdomain.com StrongPassword123!
node scripts/seed_groups.js admin@yourdomain.com
node scripts/seed_articles.js admin@yourdomain.com
npm start
```

### Frontend
```bash
cd src/frontend
npm install
npm run dev
```

---

## Audio Files (Calming Sounds)

Source 8 CC0-licensed audio files from [Freesound.org](https://freesound.org) and place them in `src/frontend/public/sounds/`:

| Filename | Description |
|---|---|
| `rain.mp3` | Rain ambience |
| `forest.mp3` | Forest sounds |
| `ocean.mp3` | Ocean waves |
| `white-noise.mp3` | White noise |
| `tibetan-bowls.mp3` | Tibetan singing bowls |
| `fireplace.mp3` | Crackling fire |
| `stream.mp3` | Flowing stream |
| `wind.mp3` | Wind ambience |

---

## Legal

This platform collects and processes sensitive personal data (mental health data) and operates under the Kenya Data Protection Act 2019.

Legal pages are accessible in-app at `/privacy-policy`, `/terms-of-service`, and `/data-compliance`.

---

## Copyright

© 2025 Antony Kiriinya. All rights reserved.

Unauthorized copying, modification, distribution, or use of this software, in whole or in part, without the express written permission of the copyright holder is strictly prohibited.

MindBridge is not a medical service.
