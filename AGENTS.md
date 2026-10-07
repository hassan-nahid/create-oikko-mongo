# AI Agent Guide: `create-oikko-mongo`

This document instructs AI coding assistants (such as Antigravity, Claude Code, Cursor, Copilot, Devin, Windsurf, Aider) on how to understand, execute, maintain, and contribute to the `create-oikko-mongo` package.

---

## 1. Package Purpose & Overview

`create-oikko-mongo` is an enterprise scaffolding CLI tool designed to create scalable, production-ready MERN (MongoDB + Express + TypeScript) backend architectures.

It provides:
- Fully offline-capable scaffolding from a local `template/` directory.
- Dynamic token generation (64-character cryptographic hex secrets for JWT and session).
- Dynamic role injection into `src/app/modules/user/user.interface.ts`.
- Dynamic `.env` and `.env.example` replacement.
- Zero-leak TypeScript configuration with strict types.
- Dual-mode execution: Interactive terminal wizard and Non-Interactive automated/AI mode.

---

## 2. CLI Execution Instructions for AI Agents

> **IMPORTANT FOR AI AGENTS**: Subprocess shells running in AI agents or CI/CD pipelines typically do NOT have an interactive TTY (`process.stdin.isTTY` is `false` or unallocated).

### How to Run:
Always provide the `-y`, `--yes`, or `--default` flag when bootstrapping a project:

```bash
# Standard automated scaffold:
node ./bin/index.js my-app --yes --no-install

# Custom automated scaffold:
node ./bin/index.js my-app --port 8080 --db "mongodb://localhost:27017/my-app" --roles "customer,admin" --force --yes
```

### Supported CLI Flags:
| Flag | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `[project-name]` | String | `my-oikko-app` | Positional argument for the target directory name. |
| `-y, --yes, --default` | Boolean | `false` | Skips all interactive prompts and uses defaults/supplied flags. |
| `-f, --force` | Boolean | `false` | Overwrites existing target directory without confirmation. |
| `--port` | String | `5000` | HTTP port injected into `.env`. |
| `--db` | String | `mongodb://localhost:27017/<name>` | MongoDB connection string. |
| `--roles` | String | `user, admin, super_admin` | Comma-delimited roles dynamically converted to `Role` enum. |
| `--pm` | String | `npm` | Package manager: `npm`, `pnpm`, `yarn`, `bun`. |
| `--latest` | Boolean | `false` | Converts dependencies in `package.json` to `"latest"`. |
| `--no-install` | Boolean | `false` | Skips running the package manager installation step. |
| `-h, --help` | Boolean | `false` | Outputs formatted CLI help. |
| `-v, --version` | Boolean | `false` | Outputs package version. |

---

## 3. Project File Tree & Responsibilities

```
create-oikko-mongo/
├── bin/
│   └── index.js       # CLI entry point. Parses args, manages prompts/fallbacks, copies template & injects dynamic variables.
├── template/          # Boilerplate files copied into the user's project.
│   ├── .env.example   # Variable template with placeholders ({{PORT}}, {{DB_URL}}, {{JWT_ACCESS_SECRET}}, etc.).
│   ├── _gitignore     # Renamed to .gitignore during scaffolding.
│   ├── package.json   # Base dependencies and scripts for the generated app.
│   ├── tsconfig.json  # TypeScript configuration.
│   ├── AGENTS.md      # AI Agent guide bundled into EVERY generated project!
│   ├── .cursorrules   # Cursor IDE guidelines bundled into EVERY generated project!
│   ├── README.md      # Documentation bundled into EVERY generated project!
│   └── src/           # Modular backend codebase (app, server, modules, config, middlewares, etc.).
├── AGENTS.md          # This file (AI instructions for the CLI package itself).
├── llms.txt           # Condensed LLM knowledge specification.
├── package.json       # CLI tool package manifest.
└── README.md          # Public documentation for developers.
```

---

## 4. Key Mechanisms to Know

### 1. Role Enum Dynamic Replacement
In `bin/index.js`, user-defined roles are transformed into TypeScript enum code:
```javascript
const enumCode = `export enum Role {\n${roles
    .map((r) => `    ${r.key} = "${r.val}"`)
    .join(",\n")}\n}`;
```
It regex-replaces `export enum Role\s*\{[\s\S]*?\}` inside `src/app/modules/user/user.interface.ts`.

### 2. Environment Variables Injection
`bin/index.js` dynamically generates:
- `JWT_ACCESS_SECRET`: 48 bytes hex (`crypto.randomBytes(48).toString("hex")`)
- `JWT_REFRESH_SECRET`: 48 bytes hex
- `SESSION_SECRET`: 24 bytes hex

It replaces placeholders in `.env.example` and produces `.env` and `.env.example`.

### 3. Safe TTY Handling
The CLI automatically detects if stdout/stdin is a TTY. If running non-interactively or in non-TTY environments (such as an AI subagent or background task), it logs using standard `console.log` rather than attempting to render interactive TTY prompts or spinners, preventing `ERR_TTY_INIT_FAILED`.
