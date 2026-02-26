# Copilot Instructions for SmileAfterBurn/Social

## Project Overview

**SmileAfterBurn Social Projects** is a Ukrainian social-impact web application — an **Inclusive Map of Social Services in Ukraine**. It helps vulnerable groups find humanitarian and social services via an interactive map and an AI assistant called **пані Думка (Ms. Thought)**.

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite 5
- **Styling:** Tailwind CSS
- **Maps:** Google Maps via `@react-google-maps/api`
- **AI:** Google Gemini API (`@google/genai`)
- **Backend/Auth:** Firebase
- **Icons:** Lucide React
- **Deployment:** Vercel

## Project Structure

```
/
├── .github/              # GitHub configuration and workflows
├── components/           # React components
├── App.tsx               # Root application component
├── index.tsx             # Application entry point
├── constants.ts          # App-wide constants (URLs, region config, etc.)
├── organizations.ts      # Database of social service organizations
├── types.ts              # TypeScript type definitions
├── vite.config.ts        # Vite build configuration
├── tsconfig.json         # TypeScript configuration
└── vercel.json           # Vercel deployment configuration
```

## Development Guidelines

### Running the Application

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

All environment variables are prefixed with `VITE_` and accessed via `import.meta.env`:

- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps JavaScript API key
- `VITE_GEMINI_API_KEY` — Google Gemini AI API key
- `VITE_FIREBASE_API_KEY` — Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` — Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` — Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` — Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` — Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` — Firebase app ID

Use `.env.example` as a reference. Never commit `.env` files with real secrets.

### Code Style

- Use **TypeScript** for all new files; avoid `any` types where possible.
- Follow the existing **React functional component** pattern with hooks.
- Use **Tailwind CSS** utility classes for styling — do not introduce new CSS files.
- Keep components in the `components/` directory.
- Export types from `types.ts`; keep constants in `constants.ts`.

### Bilingual Content

The project serves **Ukrainian-speaking users** primarily. When adding user-facing text:
- Default language is **Ukrainian (uk-UA)**.
- English translations are welcome but not required.
- Respect the humanitarian and inclusive tone of the project.

### Core Principles to Follow

- 🤖 **Safe AI** — AI features should support users, not replace human judgment.
- 🛡️ **Data Privacy** — Do not log, expose, or store sensitive user data.
- ⚖️ **Do No Harm** — Apply a humanitarian lens to every feature decision.
- ♿ **Accessibility** — Ensure UI changes remain accessible (semantic HTML, ARIA labels).

### Testing

There is currently no automated test suite. When making changes:
1. Run `npm run build` to verify the TypeScript compiles without errors.
2. Run `npm run dev` and manually verify the affected functionality in the browser.
3. Check that no console errors appear in the browser developer tools.

### Deployment

The project deploys automatically to **Vercel** on push to the main branch. The `vercel.json` configuration handles SPA routing. Do not change the build output directory (`dist`) or the build command (`tsc && vite build`) without updating `vercel.json` accordingly.
