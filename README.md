# Yojantra

AI-powered discovery of Indian government schemes. Find the benefits meant for you.

## Project structure

```
├── FRONTEND/          # UI code (React + TanStack Router + Tailwind)
│   ├── public/        # Static assets (favicon, robots.txt)
│   └── src/
│       ├── components/  # Reusable components (Nav, Footer, sections, UI)
│       ├── routes/      # File-based routes (pages)
│       ├── data/        # Mock scheme data
│       ├── hooks/       # Shared React hooks
│       ├── store/       # Zustand state (user profile)
│       ├── lib/         # Utilities
│       ├── assets/      # Images
│       ├── router.tsx   # Router setup
│       └── styles.css   # Global styles (Tailwind)
├── BACKEND/           # Server code (SSR entry, middleware, error handling)
│   ├── server.ts      # SSR server entry
│   ├── start.ts       # TanStack Start middleware (error + CSRF)
│   └── lib/           # Server-side error capture & error page
├── vite.config.ts     # Build config (TanStack Start + Vite)
├── package.json
└── tsconfig.json
```

## Stack

- [TanStack Start](https://tanstack.com/start) — full-stack React framework (SSR)
- [TanStack Router](https://tanstack.com/router) — file-based routing
- [TanStack Query](https://tanstack.com/query) — server state
- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui
- Zustand, React Hook Form, Zod

## Development

Requires Node.js 22+.

```sh
npm install
npm run dev
```

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — lint with ESLint
- `npm run format` — format with Prettier

> Scheme data in `FRONTEND/src/data/schemes.ts` is demo/mock data for the
> showcase experience. The app never processes applications or collects fees —
> it directs users to official government portals.
