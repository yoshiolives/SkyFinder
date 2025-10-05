# Biome Linter & Formatter Setup

This project uses [Biome](https://biomejs.dev/) for linting and formatting instead of ESLint and Prettier.

## What is Biome?

Biome is a fast, modern toolchain for web projects that provides:
- **Lightning-fast linting** - 10-100x faster than ESLint
- **Built-in formatting** - Replaces Prettier
- **Import sorting** - Automatically organizes imports
- **Zero configuration** - Works out of the box with sensible defaults

## Installation

Biome is already installed in this project. If you need to install it manually:

```bash
pnpm add -D @biomejs/biome
```

## Available Commands

### Check everything (lint + format)
```bash
pnpm biome:check
```

### Fix all issues automatically
```bash
pnpm biome:fix
```

### Format code only
```bash
pnpm biome:format
# or
pnpm format
```

### Lint code only
```bash
pnpm biome:lint
```

## VS Code Integration

### Install Extension

1. Open VS Code
2. Go to Extensions (Cmd/Ctrl + Shift + X)
3. Search for "Biome"
4. Install the official Biome extension by `biomejs`

### Settings

The project includes VS Code settings (`.vscode/settings.json`) that:
- Set Biome as the default formatter
- Enable format on save
- Auto-organize imports on save
- Disable ESLint and Prettier to avoid conflicts

## Configuration

The Biome configuration is in `biome.json`. Current settings:

### Formatter
- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quote style**: Single quotes (double for JSX)
- **Semicolons**: Always
- **Trailing commas**: ES5 style

### Linter
- **Rules**: Recommended rules enabled
- **Unused variables**: Warning (not error)
- **No explicit any**: Off (TypeScript)
- **No debugger**: Warning (not error for development)
- **Double equals**: Warning (suggests triple equals)

### Import Sorting
- Automatically organizes imports
- Runs on save in VS Code

## Ignored Files

Biome ignores:
- `node_modules/`
- `.next/`
- `out/`
- `build/`
- `dist/`
- `*.config.js`
- `*.config.ts`

## Migrating from ESLint/Prettier

If you were using ESLint or Prettier before:

```bash
# Migrate ESLint config
pnpm biome migrate eslint

# Migrate Prettier config
pnpm biome migrate prettier
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Run Biome
  run: pnpm biome:check
```

```yaml
# With auto-fix
- name: Run Biome and fix
  run: pnpm biome:fix
```

## Pre-commit Hook ✅ CONFIGURED

Biome automatically runs before every commit! This has been set up with `simple-git-hooks` and `lint-staged`.

**What happens on commit:**
1. Only staged files are checked (fast!)
2. Biome automatically fixes issues
3. Fixed files are added to the commit
4. Commit proceeds if no errors

**See `GIT_HOOKS_SETUP.md` for full documentation.**

To bypass (not recommended):
```bash
git commit --no-verify -m "message"
```

## Common Tasks

### Format all files
```bash
pnpm format
```

### Check for issues without fixing
```bash
pnpm biome:check
```

### Fix all auto-fixable issues
```bash
pnpm biome:fix
```

### Check specific file
```bash
pnpm biome check src/components/MyComponent.tsx
```

### Format specific file
```bash
pnpm biome format --write src/components/MyComponent.tsx
```

## Rules Overview

### Enabled Rules
- ✅ No unused variables (warning)
- ✅ No var (use const/let)
- ✅ Use const when possible
- ✅ No double equals (use ===)
- ✅ No debugger (warning)
- ✅ Valid typeof checks
- ✅ No unreachable code
- ✅ No duplicate keys
- ✅ Use template literals

### Disabled Rules
- ❌ No explicit any (off for flexibility)

## Troubleshooting

### Biome not formatting on save
1. Make sure you have the Biome VS Code extension installed
2. Check that `.vscode/settings.json` is present
3. Restart VS Code

### Conflicts with ESLint/Prettier
- Disable ESLint and Prettier extensions in VS Code
- Remove `.eslintrc`, `.prettierrc` if migrating from those tools

### Format command not found
```bash
# Make sure Biome is installed
pnpm install

# Try running directly
pnpm biome --version
```

## Performance

Biome is significantly faster than ESLint + Prettier:
- **Linting**: ~100x faster than ESLint
- **Formatting**: ~20x faster than Prettier
- **No Node modules overhead**: Written in Rust

Example benchmark for this project:
- ESLint: ~3-5 seconds
- Biome: ~50-200 milliseconds

## Resources

- [Biome Documentation](https://biomejs.dev/)
- [Biome VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Biome CLI Reference](https://biomejs.dev/reference/cli/)
- [Configuration Reference](https://biomejs.dev/reference/configuration/)

## Support

If you encounter issues with Biome:
1. Check the [Biome GitHub Issues](https://github.com/biomejs/biome/issues)
2. Read the [troubleshooting guide](https://biomejs.dev/guides/getting-started/#troubleshooting)
3. Ask on the [Biome Discord](https://biomejs.dev/chat)

