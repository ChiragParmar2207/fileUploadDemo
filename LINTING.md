# ESLint and Prettier Setup

## Server Configuration

### Installed Packages
```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier @eslint/js
```

### Configuration Files
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to ignore for formatting
- `eslint.config.js` - ESLint rules (flat config format)

### Scripts
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

---

## Client Configuration

### Installed Packages
```bash
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks @eslint/js
```

### Configuration Files
- `.prettierrc` - Prettier formatting rules (React-friendly)
- `.prettierignore` - Files to ignore for formatting
- `eslint.config.js` - ESLint rules with React support

### Scripts
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting errors
npm run format        # Format all source files
npm run format:check  # Check formatting without changes
```

---

## Prettier Rules

### Common Settings (Both Projects)
- **Semi-colons**: Required
- **Quotes**: Single quotes (except JSX)
- **Tab Width**: 2 spaces
- **Trailing Commas**: ES5 style
- **Print Width**: 100 characters
- **Arrow Parens**: Always
- **End of Line**: LF

---

## ESLint Rules

### Server Rules
- Prettier integration enabled
- ES modules support
- Unused variables warning (allow `_` prefix)
- Console statements allowed
- Process.exit allowed

### Client Rules
- Prettier integration enabled
- React support (auto-detect version)
- React Hooks rules enforced
- React in JSX scope not required (React 17+)
- PropTypes disabled
- Unused variables warning (allow `_` prefix)

---

## VS Code Integration (Optional)

Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## Pre-commit Hook (Optional)

Install husky and lint-staged:

```bash
# Server
cd server
npm install --save-dev husky lint-staged
npx husky init
```

```bash
# Client
cd client
npm install --save-dev husky lint-staged
npx husky init
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.jsx": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Usage Examples

### Format all files
```bash
# Server
cd server
npm run format

# Client
cd client
npm run format
```

### Check for issues
```bash
# Server
cd server
npm run lint
npm run format:check

# Client
cd client
npm run lint
npm run format:check
```

### Auto-fix issues
```bash
# Server
cd server
npm run lint:fix

# Client
cd client
npm run lint:fix
```

---

## Notes

- ESLint and Prettier are configured to work together without conflicts
- Using modern ESLint flat config format (`eslint.config.js`)
- Prettier runs as an ESLint rule for consistency
- Configuration files ignore `node_modules`, `dist`, `build`, and log directories
