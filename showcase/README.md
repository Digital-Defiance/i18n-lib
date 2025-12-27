# @digitaldefiance/i18n-lib Showcase

This is the GitHub Pages showcase site for **@digitaldefiance/i18n-lib**, a production-ready TypeScript internationalization library with component-based architecture, type-safe translations, and comprehensive error handling. Built with React, TypeScript, and Vite.

## About i18n-lib

`@digitaldefiance/i18n-lib` is a comprehensive internationalization solution providing:
- ICU MessageFormat with industry-standard message formatting
- Component-based architecture with full type safety
- Unlimited language support - register any language you need
- 37+ CLDR-compliant plural rules for complex pluralization
- 8 built-in languages (EN-US, EN-UK, FR, ES, DE, ZH, JA, UK)
- Advanced pluralization and gender support
- Advanced number formatting with currency and percent support
- Context integration with automatic currency, timezone, and language injection
- 93.22% test coverage with 1,738 tests

## Development

```bash
cd showcase
npm install
npm run dev
```

Visit `http://localhost:5173` to see the site.

## Building

```bash
npm run build
```

The built site will be in the `dist` directory.

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The deployment is handled by the `.github/workflows/deploy-showcase.yml` workflow.

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Framer Motion** - Animations
- **React Icons** - Icon library
- **React Intersection Observer** - Scroll animations

## Structure

- `/src/components` - React components
- `/src/assets` - Static assets
- `/public` - Public files
- `index.html` - Entry HTML file
- `vite.config.ts` - Vite configuration
