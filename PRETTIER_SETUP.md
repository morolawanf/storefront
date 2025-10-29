# Prettier Setup

This project uses [Prettier](https://prettier.io/) for code formatting to ensure consistent code style across the codebase.

## Installed Packages

- `prettier` - Core Prettier formatter
- `prettier-plugin-tailwindcss` - Automatically sorts Tailwind CSS classes

## Configuration

The Prettier configuration is defined in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "jsxSingleQuote": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Key Settings

- **semi**: Always use semicolons
- **singleQuote**: Use single quotes for strings (except JSX)
- **printWidth**: Wrap lines at 100 characters
- **tabWidth**: Use 2 spaces for indentation
- **plugins**: Tailwind CSS class sorting enabled

## Usage

### Format All Files

```bash
npm run format
```

This will format all `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.css`, `.scss`, and `.md` files.

### Check Formatting (CI/Pre-commit)

```bash
npm run format:check
```

This checks if files are formatted correctly without modifying them. Useful for CI/CD pipelines.

### Format Specific Files

```bash
npx prettier --write path/to/file.tsx
```

### Format Specific Directory

```bash
npx prettier --write "src/components/**/*.{ts,tsx}"
```

## VS Code Integration

### Recommended Extensions

Install the Prettier VS Code extension:
- **Extension ID**: `esbenp.prettier-vscode`

The project includes `.vscode/extensions.json` which will prompt you to install recommended extensions.

### Auto-Format on Save

The `.vscode/settings.json` is configured to:
- Use Prettier as the default formatter
- Format files on save
- Run ESLint fixes on save

### Manual Format in VS Code

- **macOS**: `Shift + Option + F`
- **Windows/Linux**: `Shift + Alt + F`

## Ignored Files

The following are ignored via `.prettierignore`:
- `node_modules/`
- `.next/`
- `out/`
- `dist/`
- `build/`
- Build artifacts and lock files

## Integration with ESLint

Prettier works alongside ESLint. While ESLint handles code quality rules, Prettier focuses purely on formatting. There should be no conflicts between the two.

## Pre-commit Hook (Optional)

To enforce formatting before commits, you can set up Husky + lint-staged:

```bash
npm install -D husky lint-staged
npx husky init
```

Then add to `package.json`:

```json
{
  "lint-staged": {
    "**/*.{js,jsx,ts,tsx,json,css,scss,md}": [
      "prettier --write",
      "eslint --fix"
    ]
  }
}
```

## Troubleshooting

### Prettier Not Working in VS Code

1. Make sure the Prettier extension is installed
2. Check VS Code's default formatter: `Ctrl/Cmd + Shift + P` → "Format Document With" → Choose Prettier
3. Restart VS Code

### Format on Save Not Working

1. Check `.vscode/settings.json` exists
2. Verify `"editor.formatOnSave": true` is set
3. Make sure no other formatter is conflicting

### Tailwind Classes Not Sorting

1. Verify `prettier-plugin-tailwindcss` is installed
2. Check it's listed in `.prettierrc` plugins
3. Restart VS Code or the Prettier server

## Best Practices

1. **Run format before committing** - `npm run format`
2. **Don't commit unformatted code** - Use `npm run format:check` in CI
3. **Let Prettier handle formatting** - Don't manually format code
4. **Trust the config** - Prettier's opinionated defaults work well

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run format` | Format all files |
| `npm run format:check` | Check if files are formatted |
| `npx prettier --write <file>` | Format specific file |
| `npx prettier --check <file>` | Check specific file |
