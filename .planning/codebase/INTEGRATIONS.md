# External Integrations

**Analysis Date:** 2026-06-01

## APIs & External Services

**Design System Integration:**
- Moon UI (@moondesignsystem/ui) - External CSS class library that composes Moon Design System's second layer
  - SDK/Client: CLI command `npx @moondesignsystem/react`
  - Auth: FIGMA_TOKEN (optional, for custom CSS generation)
  - Configuration: `packages/cli/` handles Moon UI CSS initialization and component scaffolding

**Visual Regression Testing:**
- Chromatic (chromatic-com/storybook) - Automated visual testing and UI review for Storybook
  - Integration: `@chromatic-com/storybook` addon in `docs/.storybook/main.ts`
  - Auth: `secrets.CHROMATIC_PROJECT_TOKEN` (GitHub Actions secret)
  - Config: `docs/chromatic.config.json` with projectId
  - Trigger: GitHub Actions workflow `.github/workflows/chromatic.yml` on pull_request and manual trigger

**Analytics:**
- Google Analytics - Embedded in Storybook manager head
  - Tracking ID: G-6L8W2YTV0W
  - Integration: Injected via `docs/.storybook/main.ts` managerHead config
  - Scope: Storybook documentation site only

## Data Storage

**Databases:**
- None - This is a React component library with no backend data layer

**File Storage:**
- Local filesystem only - Component library uses file system for CLI scaffolding
  - fs-extra package for enhanced file operations (`packages/package.json` dependency)
  - CLI reads/writes component files to user's project directory

**Caching:**
- npm package cache - Standard npm caching for dependencies

## Authentication & Identity

**Auth Provider:**
- None - Library has no user authentication system
- Token-based for integrations only:
  - FIGMA_TOKEN - Optional environment variable for Moon UI CSS customization (mentioned in README.md)
  - GitHub Actions secrets for CI/CD deployment

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, Rollbar, or similar service

**Logs:**
- Console-based logging
  - `packages/cli/helpers.ts` includes logger utility for CLI feedback
  - No persistent log aggregation

## CI/CD & Deployment

**Hosting:**
- Docker Hub - Container registry for built images
  - Image name: `heathmont/moon-react-docs`
  - Tag format: `heathmont/moon-react-docs:{version}`
- Vercel - Optional deployment target for Storybook static output
  - Config: `docs/vercel.json` with buildCommand, outputDirectory, framework settings
  - Output directory: `./storybook-static`
  - Build command: `npm run build-storybook`

**CI Pipeline:**
- GitHub Actions (`.github/workflows/`)
  
  **chromatic.yml:**
  - Triggers: Manual dispatch, pull requests to main
  - Runs: Ubuntu Latest
  - Node version: 22.18.0
  - Steps: Checkout → Setup Node → Install → Build Storybook → Run Chromatic
  - Uses: chromaui/action@latest with CHROMATIC_PROJECT_TOKEN

  **deploy.yml:**
  - Triggers: Git tags (v*), release published, manual dispatch
  - Runs: Ubuntu 24.04
  - Steps: 
    - Build Docker image on tag push
    - Push to Docker Hub (requires MOON_DOCKER_USERNAME, MOON_DOCKER_TOKEN)
    - Update remote docker-compose.yml in coingaming/stacks repo
    - Commit and push docker-compose changes (requires MOON_GH_TOKEN)
  - Container deployment: Updates sportsbet-t2 branch in coingaming/stacks

## Environment Configuration

**Required env vars:**
- FIGMA_TOKEN (optional) - For Moon UI CSS customization from Figma
- CHROMATIC_PROJECT_TOKEN - GitHub Actions secret for Chromatic integration
- MOON_DOCKER_USERNAME - GitHub Actions secret for Docker Hub login
- MOON_DOCKER_TOKEN - GitHub Actions secret for Docker Hub auth
- MOON_GH_TOKEN - GitHub Actions secret for accessing coingaming/stacks repository

**Build-time env vars:**
- NODE_ENV - Set to "production" in Dockerfile during build

**Secrets location:**
- `.env` file (not committed, mentioned in README.md)
- GitHub Actions Secrets (for CI/CD workflows)
- No .env.example file detected in repo

## Webhooks & Callbacks

**Incoming:**
- None detected - Library does not expose webhook endpoints

**Outgoing:**
- GitHub commit webhooks - Triggered when deploy.yml creates commits to coingaming/stacks repo
  - Pushes to sportsbet-t2 branch in external repository
  - Uses git commands with GitHub token authentication

## Repository & Package Management

**Package Registry:**
- npm (@moondesignsystem scope) - Main React component package published as public
  - Package name: @moondesignsystem/react
  - Access: public (publishConfig.access = "public")
  - Published via: `npm run release` (changesets publish)

**Repository:**
- GitHub: https://github.com/moondesignsystem/react
- Funding: OpenCollective https://opencollective.com/moon-react-library

**Release Management:**
- Changesets - Version management via `.changeset/` directory
  - Commands: `npm run changeset`, `npm run version`, `npm run release`
  - Semantic versioning enforced

---

*Integration audit: 2026-06-01*
