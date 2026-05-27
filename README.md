# Cal AI

Cal AI is a calorie-tracking experience that turns a meal photo into a clean,
human-friendly nutrition summary. The flow focuses on three screens: a
Google-style login, a research-backed analysis output, and an interactive
planning assistant.

## Screens

- Login: onboarding, Google sign-in CTA, and product promise.
- Analysis: macro breakdown, meal snapshot, and research notes.
- Interactive: chat-based guidance, quick filters, and daily plan actions.

## Tech stack

- React + Vite
- React Router

## Firebase setup

1. Create a Firebase project and add a Web app.
2. Enable Google as a sign-in provider in Firebase Auth.
3. Copy the config values into a local `.env` file based on `.env.example`.
4. Make sure `localhost` is listed in authorized domains.

## Meal image analysis (free APIs)

This flow uses Clarifai's food model for recognition and USDA FoodData Central
for nutrition lookup. Both have free API keys.

1. Create a Clarifai Personal Access Token (PAT).
2. Create a USDA FoodData Central API key.
3. Add `VITE_CLARIFAI_PAT` and `VITE_USDA_API_KEY` to your local `.env`.
4. If you need a different model, set `VITE_CLARIFAI_MODEL=food-item-recognition`.
5. Restart the dev server.

Note: these keys are used in the client for the demo. For production, move the
requests to a backend to keep keys private.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```
