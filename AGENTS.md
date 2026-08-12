# Yojantra

AI-powered discovery of Indian government schemes — find the benefits meant for you.

## Stack

- **Frontend**: React 19, TanStack Router, TanStack Query, Tailwind CSS v4, shadcn/ui, Zustand
- **Backend**: TanStack Start (SSR) + Vite
- **Language**: TypeScript

## Folder layout

- `FRONTEND/` — all UI code (components, routes, data, store, assets, static files)
- `BACKEND/` — SSR server entry, middleware and server-side error handling
- Root config: `vite.config.ts`, `tsconfig.json`, `package.json`, `eslint.config.js`

## Commands

```sh
npm install
npm run dev      # dev server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # lint
npm run format   # format with Prettier
```

## Notes for AI agents

- TanStack Start uses file-based routing: routes live in `FRONTEND/src/routes/`.
  The root layout is `__root.tsx`; `routeTree.gen.ts` is auto-generated — do not
  edit by hand.
- The `@/` import alias maps to `FRONTEND/src`.
- Server entry (`BACKEND/server.ts`) and Start config (`BACKEND/start.ts`) are
  wired up in `vite.config.ts` via `srcDirectory` + relative entry paths.
- Scheme data in `FRONTEND/src/data/schemes.ts` is demo/mock data.
