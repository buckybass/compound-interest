# Project notes

- This is a single-page Thai compound-interest calculator built with Vite, React and TypeScript for static hosting on GitHub Pages.
- Keep calculations pure in `src/lib/calculate.ts`; interest accrues monthly before an end-of-month deposit and is rounded to satang each month.
- Before every UX/UI design or code change, read `.github/skill-ui-ios.md` and follow its applicable guidance.
- Prefer accessible, responsive controls and small static assets. Check at 393px and 320px before changing layouts.
- Run `npm test`, `npm run lint`, and `npm run build` after changes. The Pages workflow derives the project subpath from `GITHUB_REPOSITORY`.