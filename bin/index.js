#!/usr/bin/env node

import { intro, outro, text, select, confirm, isCancel, cancel, spinner } from "@clack/prompts";
import color from "picocolors";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { parseArgs } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.resolve(__dirname, "../template");
const pkgJsonPath = path.resolve(__dirname, "../package.json");

function generateSecureSecret(bytes = 32) {
    return crypto.randomBytes(bytes).toString("hex");
}

function parseRoles(input) {
    return input
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => {
            const key = r.toUpperCase().replace(/[\s-]+/g, "_");
            const val = r.toLowerCase().replace(/\s+/g, "_");
            return { key, val };
        });
}

function validateProjectName(value) {
    if (!value || !value.trim()) return "Project name cannot be empty.";
    if (/^[A-Z]/.test(value)) return "Project name must start with a lowercase letter.";
    if (/[^a-z0-9-_]/.test(value)) return "Only lowercase letters, numbers, hyphens, and underscores allowed.";
    return null;
}

const defaultRoles = [
    { key: "USER", val: "user" },
    { key: "ADMIN", val: "admin" },
    { key: "SUPER_ADMIN", val: "super_admin" },
];

async function getPackageVersion() {
    try {
        const pkgData = await fs.readJson(pkgJsonPath);
        return pkgData.version || "1.0.0";
    } catch {
        return "1.0.0";
    }
}

function printHelp(version) {
    console.log(`
${color.bold(color.cyan("create-oikko-mongo"))} v${version}
Production-ready MERN enterprise backend scaffolder by Oikko

${color.bold("USAGE:")}
  npx create-oikko-mongo [project-name] [options]
  npm create oikko-mongo [project-name] [options]

${color.bold("ARGUMENTS:")}
  [project-name]          Directory name for the new project (default: my-oikko-app)

${color.bold("OPTIONS:")}
  -y, --yes, --default    Non-interactive setup using defaults (Ideal for AI agents & CI/CD)
  -f, --force             Overwrite destination directory if it already exists
  --port <port>           Backend server port (default: 5000)
  --db <uri>              MongoDB connection URI (default: mongodb://localhost:27017/<project-name>)
  --roles <list>          Comma-separated user roles (default: user, admin, super_admin)
  --pm <manager>          Package manager: npm | pnpm | yarn | bun (default: npm)
  --latest                Upgrade all dependencies to latest npm releases
  --no-install            Skip running package manager install
  -h, --help              Show this help message and exit
  -v, --version           Show version number and exit

${color.bold("AI AGENT & NON-INTERACTIVE EXAMPLES:")}
  # Instant default scaffolding:
  npx create-oikko-mongo my-app --yes

  # Custom setup without interactive prompts:
  npx create-oikko-mongo my-store --roles "customer,seller,admin" --port 8000 --pm pnpm --force

  # Scaffolding without auto-install:
  npx create-oikko-mongo my-api --yes --no-install
`);
}

async function main() {
    const version = await getPackageVersion();

    // Parse CLI arguments
    const { values, positionals } = parseArgs({
        args: process.argv.slice(2),
        options: {
            help: { type: "boolean", short: "h", default: false },
            version: { type: "boolean", short: "v", default: false },
            yes: { type: "boolean", short: "y", default: false },
            default: { type: "boolean", default: false },
            force: { type: "boolean", short: "f", default: false },
            port: { type: "string" },
            db: { type: "string" },
            roles: { type: "string" },
            pm: { type: "string" },
            latest: { type: "boolean", default: false },
            "no-install": { type: "boolean", default: false },
            install: { type: "boolean", default: true },
        },
        strict: false,
        allowPositionals: true,
    });

    if (values.help) {
        printHelp(version);
        process.exit(0);
    }

    if (values.version) {
        console.log(`create-oikko-mongo v${version}`);
        process.exit(0);
    }

    const isTTY = Boolean(process.stdout?.isTTY && process.stdin?.isTTY);
    const isNonInteractive = Boolean(values.yes || values.default || !isTTY);

    if (isTTY && !isNonInteractive) {
        console.log();
        intro(color.bold(color.bgCyan(color.black(" 🚀 OIKKO • MERN STARTER (MongoDB + Express + TS) "))));
    } else {
        console.log(color.bold(color.cyan(`\n🚀 OIKKO • MERN STARTER v${version} (Automated/AI Mode)\n`)));
    }

    // 1. Resolve Project Name
    let projectName = positionals[0];

    if (!projectName) {
        if (isNonInteractive) {
            projectName = "my-oikko-app";
        } else {
            projectName = await text({
                message: "What is your project name?",
                placeholder: "my-oikko-app",
                defaultValue: "my-oikko-app",
                validate(value) {
                    return validateProjectName(value) || undefined;
                },
            });

            if (isCancel(projectName)) {
                cancel("Operation cancelled.");
                process.exit(0);
            }
        }
    } else {
        const error = validateProjectName(projectName);
        if (error) {
            console.error(color.red(`Error: ${error}`));
            process.exit(1);
        }
    }

    const targetDir = path.resolve(process.cwd(), projectName);

    // Directory conflict handling
    if (fs.existsSync(targetDir)) {
        if (values.force) {
            await fs.emptyDir(targetDir);
        } else if (isNonInteractive) {
            console.error(color.red(`Error: Target directory "${projectName}" already exists. Use --force to overwrite.`));
            process.exit(1);
        } else {
            const overwrite = await confirm({
                message: `Directory "${projectName}" already exists. Do you want to overwrite it?`,
                initialValue: false,
            });

            if (isCancel(overwrite) || !overwrite) {
                cancel("Operation cancelled.");
                process.exit(0);
            }

            await fs.emptyDir(targetDir);
        }
    }

    // 2. Setup Mode & Options Resolution
    let port = values.port || "5000";
    let dbUrl = values.db || `mongodb://localhost:27017/${projectName}`;
    let roles = values.roles ? parseRoles(values.roles) : defaultRoles;
    let installLatest = Boolean(values.latest);
    let packageManager = values.pm || "npm";
    let runInstall = values["no-install"] ? false : Boolean(values.install);

    if (!isNonInteractive) {
        const setupMode = await select({
            message: "Select setup mode:",
            options: [
                {
                    value: "default",
                    label: "⚡ Default Setup (Recommended)",
                    hint: "Instant start with standard roles (USER, ADMIN, SUPER_ADMIN), port 5000 & MongoDB",
                },
                {
                    value: "custom",
                    label: "🛠️  Custom Setup",
                    hint: "Customize roles, port, database URI, and package versions",
                },
            ],
        });

        if (isCancel(setupMode)) {
            cancel("Operation cancelled.");
            process.exit(0);
        }

        if (setupMode === "custom") {
            // Custom Port
            const portAnswer = await text({
                message: "Backend server PORT:",
                placeholder: "5000",
                defaultValue: port,
            });
            if (isCancel(portAnswer)) {
                cancel("Operation cancelled.");
                process.exit(0);
            }
            port = portAnswer.trim() || "5000";

            // Custom DB URL
            const dbAnswer = await text({
                message: "MongoDB connection URI:",
                placeholder: `mongodb://localhost:27017/${projectName}`,
                defaultValue: dbUrl,
            });
            if (isCancel(dbAnswer)) {
                cancel("Operation cancelled.");
                process.exit(0);
            }
            dbUrl = dbAnswer.trim() || `mongodb://localhost:27017/${projectName}`;

            // Custom Roles
            const rolesAnswer = await text({
                message: "Define User Roles (comma-separated):",
                placeholder: "user, admin, super_admin",
                defaultValue: roles.map((r) => r.val).join(", "),
                hint: "Example: user, seller, admin or student, teacher, admin",
            });
            if (isCancel(rolesAnswer)) {
                cancel("Operation cancelled.");
                process.exit(0);
            }
            roles = parseRoles(rolesAnswer);

            // Package Manager
            const pmAnswer = await select({
                message: "Select package manager:",
                options: [
                    { value: "npm", label: "npm" },
                    { value: "pnpm", label: "pnpm" },
                    { value: "yarn", label: "yarn" },
                    { value: "bun", label: "bun" },
                ],
            });
            if (isCancel(pmAnswer)) {
                cancel("Operation cancelled.");
                process.exit(0);
            }
            packageManager = pmAnswer;

            // Dependency Version Strategy
            const versionStrategy = await select({
                message: "Dependency version strategy:",
                options: [
                    {
                        value: "stable",
                        label: "🛡️ Tested & Stable (Recommended)",
                        hint: "Uses tested SemVer ranges with caret (^). Prevents breaking changes.",
                    },
                    {
                        value: "latest",
                        label: "⚡ Bleeding Edge (latest)",
                        hint: "Forces latest releases from npm registry. May introduce breaking changes.",
                    },
                ],
            });
            if (isCancel(versionStrategy)) {
                cancel("Operation cancelled.");
                process.exit(0);
            }
            installLatest = versionStrategy === "latest";

            // Install dependencies now
            const installAnswer = await confirm({
                message: "Run package installation now?",
                initialValue: true,
            });
            if (isCancel(installAnswer)) {
                cancel("Operation cancelled.");
                process.exit(0);
            }
            runInstall = installAnswer;
        }
    }

    // Spinner / Progress helper that works safely in both TTY and non-TTY (AI agents/subprocesses)
    const createSafeSpinner = () => {
        if (!isTTY) {
            return {
                start(msg) {
                    console.log(color.cyan(`⏳ ${msg}`));
                },
                stop(msg) {
                    console.log(color.green(`${msg}`));
                },
            };
        }
        return spinner();
    };

    const s = createSafeSpinner();
    s.start(`Scaffolding project in ${color.cyan(projectName)}...`);

    // 1. Copy template files
    await fs.copy(templateDir, targetDir);

    // 2. Handle gitignore
    const gitignorePath = path.join(targetDir, "_gitignore");
    if (await fs.pathExists(gitignorePath)) {
        await fs.rename(gitignorePath, path.join(targetDir, ".gitignore"));
    }

    // 3. Update package.json & README.md
    const pkgPath = path.join(targetDir, "package.json");
    if (await fs.pathExists(pkgPath)) {
        const pkg = await fs.readJson(pkgPath);
        pkg.name = projectName;

        if (installLatest) {
            for (const dep of Object.keys(pkg.dependencies || {})) {
                pkg.dependencies[dep] = "latest";
            }
            for (const devDep of Object.keys(pkg.devDependencies || {})) {
                pkg.devDependencies[devDep] = "latest";
            }
        }

        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }

    const readmePath = path.join(targetDir, "README.md");
    if (await fs.pathExists(readmePath)) {
        let readmeContent = await fs.readFile(readmePath, "utf-8");
        readmeContent = readmeContent.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
        await fs.writeFile(readmePath, readmeContent, "utf-8");
    }

    // 4. Dynamically Inject Roles into user.interface.ts
    const userInterfacePath = path.join(targetDir, "src/app/modules/user/user.interface.ts");
    if (await fs.pathExists(userInterfacePath)) {
        let content = await fs.readFile(userInterfacePath, "utf-8");

        const enumCode = `export enum Role {\n${roles
            .map((r) => `    ${r.key} = "${r.val}"`)
            .join(",\n")}\n}`;

        content = content.replace(/export enum Role\s*\{[\s\S]*?\}/, enumCode);
        await fs.writeFile(userInterfacePath, content, "utf-8");
    }

    // 5. Generate secure secrets and dynamic .env
    const envExamplePath = path.join(targetDir, ".env.example");
    const envDestPath = path.join(targetDir, ".env");

    if (await fs.pathExists(envExamplePath)) {
        let envContent = await fs.readFile(envExamplePath, "utf-8");

        const jwtAccessSecret = generateSecureSecret(48);
        const jwtRefreshSecret = generateSecureSecret(48);
        const sessionSecret = generateSecureSecret(24);

        envContent = envContent
            .replace(/\{\{PORT\}\}/g, port)
            .replace(/\{\{DB_URL\}\}/g, dbUrl)
            .replace(/\{\{JWT_ACCESS_SECRET\}\}/g, jwtAccessSecret)
            .replace(/\{\{JWT_REFRESH_SECRET\}\}/g, jwtRefreshSecret)
            .replace(/\{\{SESSION_SECRET\}\}/g, sessionSecret);

        await fs.writeFile(envDestPath, envContent, "utf-8");
        await fs.writeFile(envExamplePath, envContent, "utf-8");
    }

    s.stop(color.green(`✓ Scaffolding complete!`));

    // 6. Install dependencies if requested
    if (runInstall) {
        s.start(
            installLatest
                ? `Installing latest packages with ${packageManager} (this may take a moment)...`
                : `Installing dependencies with ${packageManager}...`
        );

        try {
            const installCmd =
                packageManager === "yarn"
                    ? "yarn install"
                    : packageManager === "pnpm"
                    ? "pnpm install"
                    : packageManager === "bun"
                    ? "bun install"
                    : "npm install";

            execSync(installCmd, { cwd: targetDir, stdio: "ignore" });
            s.stop(color.green(`✓ Dependencies installed successfully!`));
        } catch (err) {
            s.stop(color.yellow(`⚠ Dependency installation failed. You can install manually.`));
        }
    }

    console.log();
    if (isTTY && !isNonInteractive) {
        outro(color.bold(color.green(`🎉 Success! Your Oikko MongoDB project is ready at ./${projectName}`)));
    } else {
        console.log(color.bold(color.green(`🎉 Success! Your Oikko MongoDB project is ready at ./${projectName}\n`)));
    }

    console.log(color.cyan("Next steps:"));
    console.log(`  ${color.white(`cd ${projectName}`)}`);
    if (!runInstall) {
        console.log(`  ${color.white(`${packageManager} install`)}`);
    }
    console.log(`  ${color.white(`${packageManager} run dev`)}\n`);
    console.log(color.gray("Documentation & Updates: https://github.com/hassan-nahid/oikko-backend-mongo\n"));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
