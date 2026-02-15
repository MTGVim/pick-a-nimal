# Repository Guidelines

## Project Structure & Module Organization
This is an Astro + Vue 3 app deployed to Firebase Hosting.
Use Node.js `20.19.0+` (`.nvmrc`).

- `src/pages/`: Astro route entry points (`index.astro`, `leaderboard.astro`).
- `src/components/`: Vue SFC UI and game logic (PascalCase files like `PickAnimal.vue`).
- `src/layouts/`: shared Astro layout wrappers.
- `src/libs/`: external service clients (for example `supabase.ts`).
- `public/`: static assets served as-is.
- `.github/workflows/`: CI/CD for PR preview deploys and `main` production deploys.

## Build, Test, and Development Commands
- `yarn install`: install dependencies.
- `yarn dev`: start local dev server.
- `yarn build`: produce production build (also used in CI).
- `yarn preview`: serve the built app locally.
- `yarn astro check`: run Astro/TypeScript project checks.

Example local flow:
```sh
yarn install
yarn dev
yarn astro check
yarn build
```

## Coding Style & Naming Conventions
- Use Vue SFCs with `<script setup>`; prefer `lang="ts"` for new components.
- Follow existing file style in touched files (indentation and spacing are not fully standardized yet).
- Use semicolons and `const` by default.
- Naming:
  - Components/files: `PascalCase.vue`
  - Variables/functions: `camelCase`
  - Event handlers: `onXxx` or `handleXxx` (for example `onCardClick`, `handleSignin`).
- Keep route files in `src/pages` lowercase and URL-aligned.

## Testing Guidelines
There is currently no dedicated unit/integration test framework configured. Minimum validation for each change:

1. `yarn astro check`
2. `yarn build`
3. Manual smoke test in `yarn dev` (game start/restart, login flow, leaderboard rendering).

If you add automated tests, place them near the feature (`src/**`) and document the command in `package.json`.

## Commit & Pull Request Guidelines
- Follow Conventional Commit-style prefixes used in history: `feat:`, `fix:`, `docs:`, `style:`, `chore:` (emoji optional).
- Keep commits focused and scoped to one concern.
- PRs should include:
  - short problem/solution summary,
  - linked issue (if available),
  - screenshots or short clips for UI changes,
  - confirmation that `yarn build` passes.
