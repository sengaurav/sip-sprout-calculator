# SIP Sprout — Mutual Fund SIP Calculator

A colorful, playful calculator that projects mutual fund SIP growth month by
month, lets the user step up their monthly investment every year, and
compares their expected return against real market benchmarks (Fixed
Deposit, Debt Fund, Nifty 50 historical average, Aggressive Equity). Users
can download a PDF projection report.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

**Option A — Vercel CLI**
```bash
npm install -g vercel
vercel
```
Follow the prompts (link/create a project, accept defaults). Vercel
auto-detects Next.js, so no extra config is needed.

**Option B — GitHub + Vercel dashboard**
1. Push this folder to a new GitHub repo.
2. Go to vercel.com → "Add New Project" → import the repo.
3. Framework preset: Next.js (auto-detected). Click Deploy.

## Project structure

```
app/
  layout.tsx      — root layout, fonts, metadata
  page.tsx         — the calculator (inputs, chart, PDF export)
  globals.css      — Tailwind + font imports
tailwind.config.js — color palette (grape, leaf, sun, berry, sky, violet2)
```

## Notes

- Calculations assume a constant annual return compounded monthly — this is
  a simplification for illustration, same approach most SIP calculators use.
- The PDF export runs entirely in the browser (jsPDF), no server/API route
  needed, so it works on Vercel's static/serverless hosting with no extra
  setup.
- Benchmark rates (FD ~7%, Debt ~8%, Nifty 50 ~12%, Aggressive Equity ~15%)
  are illustrative reference points, not live market data. Swap them in
  `app/page.tsx` (`SCENARIOS_BASE`) if you want different comparisons.
# sip-sprout-calculator
