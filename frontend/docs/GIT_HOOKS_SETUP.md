# Git Hooks Setup

This project uses git hooks to automatically run Biome on staged files before every commit.

## What Happens on Commit

When you run `git commit`, the following happens automatically:

1. **Pre-commit hook triggers** - Runs before the commit is created
2. **lint-staged runs** - Only checks staged files (fast!)
3. **Biome checks and fixes** - Runs `biome check --write` on your staged files
4. **Auto-fixes applied** - Formatting and safe fixes are automatically applied
5. **Commit proceeds** - If no errors, commit goes through

## Setup

The git hooks were automatically set up when you ran `pnpm install` (via the `prepare` script).

### Manual Setup

If you need to manually set up the hooks:

```bash
pnpm prepare
```

This will install the pre-commit hook in your `.git/hooks/` directory.

## How It Works

### Tools Used

1. **simple-git-hooks** - Lightweight git hooks manager
2. **lint-staged** - Runs linters only on staged files
3. **Biome** - Fast linter and formatter

### Configuration

In `package.json`:

```json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

## What Gets Checked

The pre-commit hook runs Biome on:
- ✅ JavaScript files (`*.js`)
- ✅ JSX files (`*.jsx`)
- ✅ TypeScript files (`*.ts`)
- ✅ TSX files (`*.tsx`)
- ✅ JSON files (`*.json`)

## Example Workflow

### Normal Commit (No Issues)

```bash
git add .
git commit -m "Add new feature"
```

Output:
```
✔ Preparing lint-staged...
✔ Running tasks for staged files...
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
[main abc1234] Add new feature
 2 files changed, 10 insertions(+)
```

### Commit with Auto-fixable Issues

```bash
git add .
git commit -m "Add feature with formatting issues"
```

Output:
```
✔ Preparing lint-staged...
✔ Running tasks for staged files...
  ⚠ biome check --write --no-errors-on-unmatched
    Fixed 5 files
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
[main abc1234] Add feature with formatting issues
 3 files changed, 15 insertions(+), 8 deletions(-)
```

The fixes are automatically staged and committed!

### Commit with Errors

If there are errors that can't be auto-fixed:

```bash
git add .
git commit -m "Add broken code"
```

Output:
```
✔ Preparing lint-staged...
✖ Running tasks for staged files...
  ✖ biome check --write --no-errors-on-unmatched
    Found 2 errors
    × unused variable 'foo'
    × undefined variable 'bar'

✖ lint-staged failed due to a git error.
```

**The commit is blocked!** Fix the errors and try again.

## Bypassing the Hook (Not Recommended)

If you absolutely need to commit without running the checks:

```bash
git commit -m "Emergency fix" --no-verify
```

⚠️ **Warning**: Only use this in emergencies. Your code should pass linting before committing.

## Benefits

### Speed
- **Only checks staged files** - Not the entire codebase
- **Biome is fast** - 100x faster than ESLint
- **Typical pre-commit time**: 50-200ms

### Code Quality
- ✅ Consistent code style across the team
- ✅ Catches errors before they reach the repository
- ✅ Auto-fixes formatting issues
- ✅ No manual formatting needed

### Team Collaboration
- ✅ Everyone's code looks the same
- ✅ No "fix linting" commits
- ✅ Cleaner git history
- ✅ Easier code reviews

## Troubleshooting

### Hook not running

If the pre-commit hook isn't running:

```bash
# Re-install the hooks
pnpm prepare

# Check if the hook exists
ls -la .git/hooks/pre-commit

# The file should be executable
chmod +x .git/hooks/pre-commit
```

### Hook fails with "command not found"

Make sure you're using pnpm:

```bash
# Check pnpm is installed
pnpm --version

# If not, install it
npm install -g pnpm
```

### Want to skip the hook temporarily

```bash
# Skip for one commit
git commit --no-verify -m "message"

# Or disable the hook
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
```

### Restore the hook

```bash
# Re-enable
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit

# Or re-run setup
pnpm prepare
```

## Configuration Options

### Check only (no auto-fix)

If you want to only check without auto-fixing, modify `package.json`:

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx,json}": [
    "biome check --no-errors-on-unmatched"
  ]
}
```

### Add more file types

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx,json,css,md}": [
    "biome check --write --no-errors-on-unmatched"
  ]
}
```

### Run multiple commands

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": [
    "biome check --write --no-errors-on-unmatched",
    "pnpm test --findRelatedTests --passWithNoTests"
  ]
}
```

## CI/CD Integration

The same checks run in CI/CD should also run locally via git hooks.

### GitHub Actions Example

```yaml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm biome:check
```

## Uninstalling

To remove the git hooks:

```bash
# Remove the hook file
rm .git/hooks/pre-commit

# Uninstall packages
pnpm remove simple-git-hooks lint-staged

# Remove configuration from package.json
# (delete the "simple-git-hooks" and "lint-staged" sections)
```

## Resources

- [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)
- [lint-staged](https://github.com/okonet/lint-staged)
- [Biome Documentation](https://biomejs.dev/)

## Team Guidelines

1. **Always run tests locally** before committing
2. **Don't use --no-verify** unless absolutely necessary
3. **Fix errors immediately** - don't let them accumulate
4. **Keep commits small** - faster pre-commit checks
5. **Pull frequently** - avoid merge conflicts with formatted code

---

*The pre-commit hook helps maintain code quality and consistency across the entire team!* 🎉

