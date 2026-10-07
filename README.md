# create-oikko-mongo

Production-grade, modular MongoDB, Express, and TypeScript backend scaffolder.

`create-oikko-mongo` is a command-line scaffolding tool designed to bootstrap scalable, enterprise-ready REST APIs. It eliminates repetitive backend setup by providing an organized modular architecture, robust authentication strategies, role-based access control, caching layers, and external service integrations out of the box.

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [CLI Setup Modes](#cli-setup-modes)
- [AI Agent & Non-Interactive Usage](#ai-agent--non-interactive-usage)
- [Architecture & Directory Structure](#architecture--directory-structure)
- [Core Capabilities](#core-capabilities)
  - [Authentication & Authorization](#authentication--authorization)
  - [Dynamic Role-Based Access Control](#dynamic-role-based-access-control)
  - [Validation & Error Handling](#validation--error-handling)
  - [Redis Caching & Token Management](#redis-caching--token-management)
  - [Notification & Storage Integrations](#notification--storage-integrations)
- [Environment Variables](#environment-variables)
- [Default API Endpoints](#default-api-endpoints)
- [Scripts & Development](#scripts--development)
- [Publishing & Distribution](#publishing--distribution)
- [License](#license)

---

## Overview

Starting a production backend from scratch often requires dozens of boilerplate steps: setting up TypeScript configurations, path aliases, JWT access and refresh token rotations, OAuth providers, input validation layers, and global error pipelines.

`create-oikko-mongo` provides:

- A completely offline-capable npm package without third-party repository dependencies.
- Strict TypeScript configuration with zero type leaks.
- Dynamic code generation (custom roles, environments, and cryptographically secure secrets).
- Option to automatically resolve and install the latest versions of all dependencies.

---

## Quick Start

Initialize a new backend service using your preferred package manager:

### Using npm
```bash
npm create oikko-mongo@latest my-backend-api
```

### Using npx
```bash
npx create-oikko-mongo@latest my-backend-api
```

### Using pnpm
```bash
pnpm create oikko-mongo my-backend-api
```

### Using yarn
```bash
yarn create oikko-mongo my-backend-api
```

### Using bun
```bash
bun create oikko-mongo my-backend-api
```

---

## CLI Setup Modes

When executing the scaffolder, you are prompted to select between two initialization modes:

### 1. Default Setup (Recommended)
Designed for rapid development. Immediately provisions a fully functional API with:
- Server Port: `5000`
- MongoDB URI: `mongodb://localhost:27017/<project-name>`
- Standard Roles: `USER`, `ADMIN`, `SUPER_ADMIN`
- Cryptographically secure 64-character random secrets for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and session keys.

### 2. Custom Setup (Interactive)
Allows comprehensive customization during initialization:
- **Project Port**: Custom port definition.
- **Database Connection**: Custom MongoDB local or cloud URI.
- **Custom User Roles**: Comma-separated roles (e.g. `user, seller, manager, admin`). The CLI dynamically generates the TypeScript `Role` enum and adjusts validation schemas accordingly.
- **Package Manager Selection**: Choose between `npm`, `pnpm`, `yarn`, or `bun`.
- **Dependency Versioning**: Option to install tested stable versions or automatically upgrade all packages to their `latest` npm releases.

---

## AI Agent & Non-Interactive Usage

`create-oikko-mongo` is fully optimized for **AI Agents** (Cursor, Copilot, Claude Code, Devin, Antigravity, Windsurf) and automated CI/CD pipelines.

When running inside subagents or non-TTY environments, always specify `--yes` or pass explicit configuration flags to avoid interactive prompt halts:

### Examples for AI Agents:
```bash
# Instant default scaffolding (Zero prompts)
npx create-oikko-mongo my-app --yes

# Custom configuration in a single command
npx create-oikko-mongo my-store --roles "customer,seller,admin" --port 8000 --pm pnpm --force

# Fast generation skipping npm install
npx create-oikko-mongo my-api --yes --no-install
```

### Supported CLI Flags:

| Flag | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `[project-name]` | String | `my-oikko-app` | Target project directory name. |
| `-y, --yes, --default` | Boolean | `false` | Non-interactive execution using defaults or provided flags. |
| `-f, --force` | Boolean | `false` | Overwrites the destination directory if it already exists. |
| `--port <port>` | String | `5000` | HTTP port written to `.env`. |
| `--db <uri>` | String | `mongodb://localhost:27017/<name>` | MongoDB connection string. |
| `--roles <list>` | String | `user, admin, super_admin` | Comma-separated roles injected into `Role` enum. |
| `--pm <manager>` | String | `npm` | Package manager: `npm`, `pnpm`, `yarn`, `bun`. |
| `--latest` | Boolean | `false` | Sets all dependencies to `"latest"` before installing. |
| `--no-install` | Boolean | `false` | Skips package manager dependency installation. |
| `-h, --help` | Boolean | `false` | Displays help message and exits. |
| `-v, --version` | Boolean | `false` | Displays package version and exits. |

### Built-in AI Guidelines in Scaffolded Projects
Every project created with `create-oikko-mongo` automatically bundles:
- `AGENTS.md` - Complete architectural guidelines, coding patterns, and module generation recipes for AI agents.
- `.cursorrules` - Rules tailored for Cursor and IDE-based AI assistants.
- `llms.txt` - High-signal project summary following the `llms.txt` standard.

---

## Architecture & Directory Structure

The generated codebase follows a strict modular structure. Each feature domain contains its own controllers, services, interfaces, models, routes, and validation schemas:

```text
my-backend-api/
├── src/
│   ├── app/
│   │   ├── config/              # Centralized environment, passport, and redis configuration
│   │   │   ├── db.ts
│   │   │   ├── env.ts           # Type-safe environment validation
│   │   │   ├── passport.ts      # Passport Google & Local strategies
│   │   │   └── redis.config.ts  # Redis connection and lifecycle management
│   │   ├── errorHelpers/        # Custom AppError class
│   │   ├── helpers/             # Error parsers (Zod, Mongoose duplicate key, cast errors)
│   │   ├── interfaces/          # Global TypeScript declaration merging
│   │   │   └── index.d.ts
│   │   ├── middlewares/         # Middleware pipeline
│   │   │   ├── checkAuth.ts     # JWT verification & RBAC guard
│   │   │   ├── globalErrorHandler.ts # Centralized HTTP error handler
│   │   │   ├── notFound.ts      # 404 handler
│   │   │   ├── requestLogger.ts # HTTP request logger
│   │   │   └── validateRequest.ts # Zod schema validator
│   │   ├── modules/             # Business logic modules
│   │   │   ├── auth/            # Authentication, token exchange, password reset
│   │   │   ├── otp/             # One-time password generation & verification
│   │   │   └── user/            # User CRUD and profile operations
│   │   ├── routes/              # Central application router
│   │   │   └── index.ts
│   │   └── utils/               # Helper utilities
│   │       ├── catchAsync.ts    # Async wrapper for Express handlers
│   │       ├── logger.ts        # Winston logger
│   │       ├── sendEmail.ts     # Nodemailer / Resend transport
│   │       ├── sendResponse.ts  # Standardized JSON response envelope
│   │       ├── userTokens.ts    # Token issue and verification utilities
│   │       └── templates/       # EJS email notification templates
│   ├── app.ts                   # Express application setup
│   └── server.ts                # HTTP server bootstrap and database listeners
├── .env                         # Local environment configuration
├── .env.example                 # Template environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Core Capabilities

### Authentication & Authorization
The template implements a dual-layer authentication system:
- **JWT Authentication**: Short-lived access tokens and long-lived refresh tokens stored securely in `httpOnly`, `secure`, and `sameSite` cookies, as well as bearer header authorization.
- **Passport.js Integration**: Pre-configured with `LocalStrategy` (email/password with bcrypt hashing) and `GoogleStrategy` (OAuth 2.0 profile exchange).
- **Password Reset & Recovery**: Time-limited signed tokens and OTP-based verification workflows.

### Dynamic Role-Based Access Control
Role-based authorization is enforced at the route level via the `checkAuth` middleware:

```typescript
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

router.get("/admin-dashboard", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getData);
```

When custom roles are configured during CLI generation, the `Role` enum in `src/app/modules/user/user.interface.ts` is dynamically populated.

### Validation & Error Handling
- **Request Validation**: Powered by Zod schemas validating `body`, `query`, and `params` through a unified middleware.
- **Standardized Response Envelope**: All API responses conform to a strict schema:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "Operation successful",
    "data": {}
  }
  ```
- **Error Pipeline**: Translates Zod errors, Mongoose validation errors, Mongo duplicate key errors (code 11000), and custom `AppError` exceptions into consistent, client-friendly error structures with actionable error source paths.

### Redis Caching & Token Management
Pre-configured Redis client supports:
- Fast retrieval for high-traffic read operations.
- Temporary token blacklisting on logout.
- In-memory rate limiting and OTP expiration storage.

### Notification & Storage Integrations
- **Email Transports**: Nodemailer with SMTP alongside Resend API support, paired with responsive EJS HTML templates for account verification and password resets.
- **Object Storage**: Pre-configured wrappers for AWS S3, Cloudflare R2, and Cloudinary.
- **Payment Processing**: SSLCommerz gateway integration covering payment initiation, IPN validation, success, and cancel callbacks.
- **Alerts**: Optional Telegram bot notifications for system error logging.

---

## Environment Variables

The project includes a `.env` configuration file automatically provisioned by the CLI:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | HTTP server port | `5000` |
| `NODE_ENV` | Application environment (`development` / `production`) | `development` |
| `DB_URL` | MongoDB connection string | `mongodb://localhost:27017/<project>` |
| `JWT_ACCESS_SECRET` | Secret key for access token signing | *Auto-generated 64-character hex* |
| `JWT_ACCESS_EXPIRES` | Access token lifespan | `1d` |
| `JWT_REFRESH_SECRET` | Secret key for refresh token signing | *Auto-generated 64-character hex* |
| `JWT_REFRESH_EXPIRES` | Refresh token lifespan | `30d` |
| `BCRYPT_SALT_ROUND` | Salt rounds for password hashing | `10` |
| `SUPER_ADMIN_EMAIL` | Initial super admin email | `superadmin@example.com` |
| `SUPER_ADMIN_PASSWORD` | Initial super admin password | `SuperAdmin@123456` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Optional |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect URL | `http://localhost:5000/api/v1/auth/google/callback` |
| `FRONTEND_URL` | Client application origin for CORS | `http://localhost:3000` |
| `REDIS_HOST` | Redis server host | `localhost` |
| `REDIS_PORT` | Redis server port | `6379` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `465` |
| `SMTP_USER` | SMTP username | Optional |
| `SMTP_PASS` | SMTP application password | Optional |

---

## Default API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login` - Authenticate via credentials and receive token cookies.
- `POST /refresh-token` - Issue a new access token using a refresh token.
- `POST /logout` - Clear authentication cookies.
- `POST /forgot-password` - Request a password reset link or token.
- `POST /reset-password` - Reset account password with token.
- `POST /change-password` - Update password for authenticated user.
- `GET  /google` - Initiate Google OAuth handshake.
- `GET  /google/callback` - OAuth redirect handler.

### Users (`/api/v1/user`)
- `POST /register` - Register a new user account.
- `GET  /me` - Retrieve current authenticated user profile.
- `GET  /all-users` - Administrator listing of registered accounts.

### OTP (`/api/v1/otp`)
- `POST /send-otp` - Dispatch one-time password to email.
- `POST /verify-otp` - Verify submitted OTP code.

---

## Scripts & Development

Navigate to the project root and use standard npm scripts:

```bash
# Start development server with file watching via tsx
npm run dev

# Run TypeScript compilation
npm run build

# Start production server
npm start
```

---

## Publishing & Distribution

To publish your own version of this scaffolder to the npm registry:

1. Update the `name` and `version` fields in `package.json` if required.
2. Log in to your npm account:
   ```bash
   npm login
   ```
3. Publish to the public registry:
   ```bash
   npm publish --access public
   ```

---

## License

MIT License. Free for open-source and commercial use.
