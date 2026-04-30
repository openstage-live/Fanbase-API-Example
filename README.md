# Fanzone Example

An example fan application built with the [Openstage Fanbase API](https://fanbaseapi.openstage.live). This project demonstrates how to create a custom fan app with features such as posts, timeline, comments, payments, and fan interactions.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) with Composition API
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Routing**: [Vue Router 4](https://router.vuejs.org/) with [unplugin-vue-router](https://uvr.esm.is/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with PostCSS
- **UI Components**: [shadcn-vue](https://www.shadcn-vue.com/) (built on [Reka UI](https://reka-ui.com/))
- **Forms & Validation**: [VeeValidate](https://vee-validate.logaretm.com/) + [Zod](https://zod.dev/)
- **Media Player**: [Mux Player](https://www.mux.com/player)
- **Payments**: [Stripe](https://stripe.com/)
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) with Workbox
- **Internationalization**: [Vue I18n](https://vue-i18n.intlify.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Error Tracking**: [Sentry](https://sentry.io/)
- **Analytics**: [Google Tag Manager](https://github.com/gtm-support/vue-gtm)

## Prerequisites

- **Node.js**: v23.10.0
- **pnpm**: v10.17.0

## Getting Started

### 1. Install Dependencies

This project uses pnpm as its package manager. The `preinstall` script enforces this requirement.

```bash
pnpm install
```

This will:

- Install all project dependencies
- Set up git hooks via `simple-git-hooks`
- Configure pre-commit hooks for linting and type checking

### 2. Environment Variables

Create a `.env` file in the project root based on the configuration below. You can use the `.env.example` file as a reference template.

#### Required Variables

```bash
# Openstage API Configuration
# Production
VITE_OPENSTAGE_API_FAN=https://api.openstage.live/fan2
VITE_OPENSTAGE_API_FAN_QUEUE=https://queue.openstage.live/fan2

# Staging
# VITE_OPENSTAGE_API_FAN=https://api-stage.openstage.live/fan2
# VITE_OPENSTAGE_API_FAN_QUEUE=https://api-stage.openstage.live/fan2

# Artist Configuration
VITE_ARTIST_ID=your-artist-id
VITE_ARTIST_SHORT_NAME=artist-short-name
VITE_ARTIST_NAME=Artist Full Name
VITE_ARTIST_MIN_AGE=13

# Site Metadata
VITE_SITE_TITLE=Example Title
VITE_SITE_DESCRIPTION=Example Description

# Application URLs
VITE_HOME_URL=https://yourdomain.com  # Use http://localhost:5173 for development

# Stripe Configuration
VITE_STRIPE_PK=pk_live_your_stripe_public_key
VITE_STRIPE_CONNECT_ID=acct_your_connect_id

# Geolocation Configuration
VITE_RADAR_KEY=your-radar-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Mux configuration
VITE_MUX_ENV_KEY=your-mux-env-key

# Environment
VITE_ENV=production # development, staging, production
```

#### Optional Variables (Feature Flags & Integrations)

```bash
# Feature Flags
VITE_FF_TELEMETRY=false
VITE_FF_SENTRY=false
VITE_FF_GTM=false
VITE_FF_PASSWORD=your-password # Password protect the site

# Sentry (if VITE_FF_SENTRY=true)
VITE_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project

# Google Tag Manager (if VITE_FF_GTM=true)
VITE_GTM_ID=GTM-XXXXXXX
```

### 3. Development Server

Start the development server with hot module replacement:

```bash
pnpm dev
```

The application will open automatically at `http://localhost:5173`.

### 4. Building for Production

Build the application for different environments:

```bash
# Development build
pnpm build-dev

# Staging build
pnpm build-stage

# Production build
pnpm build-prod
```

Or use the convenience scripts that include formatting, linting, and type checking:

```bash
pnpm stage  # Format, lint, check, then build for staging
pnpm prod   # Format, lint, check, then build for production
```

### 5. Preview Production Build

Preview the production build locally:

```bash
pnpm preview
```

## Development Workflow

### Pre-commit Hooks

This project uses `simple-git-hooks` with `lint-staged` to ensure code quality. On every commit, the following will run automatically:

- **Prettier**: Formats all files
- **Oxlint**: Fast linter for JavaScript/TypeScript files
- **ESLint**: Comprehensive linting with Vue-specific rules
- **TypeScript**: Type checking via `vue-tsc`

### Code Quality Scripts

```bash
# Format code with Prettier
pnpm format

# Lint with Oxlint and ESLint
pnpm lint

# Type check with TypeScript
pnpm check

# Find unused dependencies and exports
pnpm knip
```

### Testing

```bash
# Run unit tests
pnpm test:unit
```

## Project Structure

```
fanzone-example/
├── src/
│   ├── api/              # API service layer and endpoints
│   ├── assets/           # Static assets (fonts, styles)
│   ├── components/       # Vue components
│   │   ├── generic/      # Generic reusable components
│   │   ├── modules/      # Feature-specific modules
│   │   └── ui/           # shadcn-vue UI component library
│   ├── composables/      # Vue composables
│   ├── locales/          # i18n translations
│   ├── pages/            # Route pages (auto-routed)
│   ├── router/           # Router configuration
│   ├── stores/           # Pinia stores
│   └── utils/            # Utility functions
├── public/               # Public static assets
├── dist/                 # Build output
└── ...config files
```

## Key Features

### Path Aliases

The following path aliases are configured for cleaner imports:

- `@/` → `src/`
- `@api/` → `src/api/`
- `@composables/` → `src/composables/`
- `@generics/` → `src/components/generic/`
- `@modules/` → `src/components/modules/`
- `@stores/` → `src/stores/`
- `@ui/` → `src/components/ui/`
- `@utils/` → `src/utils/`

### PWA Support

The application is configured as a Progressive Web App with:

- Service worker with workbox for caching strategies
- Offline support with navigation fallbacks
- Installable on mobile and desktop
- Custom caching for images, videos, fonts, and Cloudinary assets

### Type Safety

- Full TypeScript support throughout the codebase
- Zod schemas for runtime validation
- Auto-generated typed routes via [`unplugin-vue-router`](https://uvr.esm.is/)

## Openstage Fanbase API Integration

This project demonstrates integration with the [Openstage Fanbase API](https://fanbaseapi.openstage.live):

- **Fan Authentication**: Login, signup, password reset
- **Content Feed**: Timeline and posts
- **Comments**: Social interactions
- **Payments**: Stripe integration for subscriptions
- **NFC Taps**: Example integration using Zatap
- **Telemetry**: Fan interaction tracking and timeline integration

Refer to the `src/api/` directory for API service implementations.

## Troubleshooting

### pnpm not installed

```bash
npm install -g pnpm
```

### Pre-commit hooks not running

```bash
pnpm simple-git-hooks
```

### Build issues

Clear the cache and reinstall:

```bash
rm -rf node_modules pnpm-lock.yaml dist
pnpm install
```

## Support

For questions about the Openstage Fanbase API or this example, please contact [support@openstage.live](mailto:support@openstage.live)
