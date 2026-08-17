# Yojantra

Yojantra is an AI-powered smart automation platform designed to help citizens discover potentially relevant government schemes, understand their eligibility, identify missing benefits, analyze document readiness....

Yojantra combines AI, eligibility logic, document intelligence and workflow automation into a single citizen-centric platform.
Instead of stopping at scheme discovery, Yojantra creates a personalized **benefit roadmap**.

Built for **Internal Smart India Hackathon 2026 — PS-001: AI-Driven Smart Automation System**.

# 🔥 Key Features
1. 🧠 Personalized Benefit Discovery

Yojantra analyzes a citizen's profile and identifies government schemes that may be relevant to them.

The system considers factors such as:

Age
Location
Income
Occupation
Student status
Other relevant eligibility information

Instead of forcing users to search through multiple schemes manually, Yojantra provides a personalized starting point.

---
2. 🎯 Benefit Gap Detection
Don't just find benefits. Find what's missing.

One of Yojantra's core ideas is Benefit Gap Detection.

Instead of simply returning:

"You are eligible for Scheme A."

Yojantra aims to identify potentially relevant benefits that a citizen may not have considered.

Example:

```Potential Benefits


✓ Education Scholarship
✓ Health Support
✓ Housing Assistance
✓ Skill Development Support


Priority Recommendation:
Health Support

This transforms scheme discovery from a passive search process into a proactive recommendation system.
```

---

And many more features!!!

Yojantra aims to reduce friction between citizens and the benefits already available through government schemes.
Prototype Note: Yojantra currently uses demo/simulated scheme data for demonstration purposes. We believe real government information should only be integrated through verified official sources, APIs, or appropriate authorization. With the necessary permissions and partnerships, this prototype can later be connected to real, up-to-date government scheme data.




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
> showcase experience.


