# Contributing to Manifestation Lab

Thank you for your interest in contributing to Manifestation Lab! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Testing Guidelines](#testing-guidelines)
9. [Documentation](#documentation)
10. [AI-Assisted Development](#ai-assisted-development)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.30.0 or higher
- **Google Gemini API Key**: Required for AI features

### First-Time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Bringittolife.git
   cd Bringittolife
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Krosebrook/Bringittolife.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```
6. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Setup

### Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
```

**⚠️ Security Note**: Never commit API keys to the repository. The `.env` file is gitignored.

### Running the Application

```bash
# Development server (port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Development Tools

We recommend using:
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Error Lens
- **React Developer Tools** browser extension
- **GitHub Copilot** (optional, but recommended)

## Project Structure

```
Bringittolife/
├── components/          # React components
│   ├── live/           # Live preview & dev tools
│   ├── hero/           # Landing page components
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── services/           # API integrations
│   ├── gemini.ts       # Primary AI service
│   ├── live.ts         # Voice/audio service
│   └── docsService.ts  # Documentation generation
├── hooks/              # Custom React hooks
│   ├── useCreation.ts  # Creation lifecycle management
│   ├── useHistory.ts   # LocalStorage persistence
│   ├── useIframeContent.ts # Iframe injection
│   └── usePanZoom.ts   # Canvas navigation
├── utils/              # Utility functions
│   ├── fileHelpers.ts  # File operations
│   ├── injection.ts    # Iframe content injection
│   └── reactConverter.ts # HTML → React conversion
├── types.ts            # Global TypeScript types
├── App.tsx             # Main application
└── index.tsx           # Entry point
```

## Coding Standards

### TypeScript

- **Always use TypeScript** - Avoid `any`, prefer `unknown` for dynamic types
- **Define interfaces** for all component props and function parameters
- **Prefer `interface`** over `type` for object shapes
- **Use utility types**: `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`
- **Export types** that may be reused

Example:
```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ label, onClick, variant = 'primary', disabled }: ButtonProps) {
  // Component implementation
}
```

### React Components

- **Use function components** with hooks (no class components)
- **Destructure props** in function parameters
- **Use meaningful names**: `PascalCase` for components, `camelCase` for functions
- **One component per file** (except tightly coupled sub-components)
- **Export at the bottom** of the file for better code organization

Example:
```typescript
import { useState, useCallback } from 'react';
import { SomeType } from '../types';

interface Props {
  data: SomeType;
  onUpdate: (value: string) => void;
}

export function MyComponent({ data, onUpdate }: Props) {
  const [state, setState] = useState('');
  
  const handleChange = useCallback((value: string) => {
    setState(value);
    onUpdate(value);
  }, [onUpdate]);

  return (
    <div className="p-4">
      {/* Component JSX */}
    </div>
  );
}
```

### Hooks

- **Follow React Hooks rules**:
  - Only call hooks at the top level
  - Only call hooks from React functions
- **Custom hooks must start with `use`**
- **Document complex hooks** with JSDoc comments
- **Memoize callbacks** with `useCallback` when passed to child components
- **Memoize expensive computations** with `useMemo`

### Styling

- **Use Tailwind CSS utility classes** exclusively
- **Group utilities** logically: layout → spacing → typography → colors
- **Use `cn()` helper** for conditional classes
- **Avoid inline styles** unless absolutely necessary
- **Use semantic color names** from Tailwind palette

Example:
```tsx
<button 
  className="
    flex items-center gap-2 
    px-4 py-2 rounded-lg
    text-sm font-medium
    bg-indigo-600 text-white
    hover:bg-indigo-700 active:bg-indigo-800
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  "
>
  Submit
</button>
```

### Error Handling

- **Always wrap async operations** in try-catch blocks
- **Provide user-friendly error messages**
- **Log errors for debugging**: `console.error('[Context]', error)`
- **Offer recovery actions** when possible
- **Validate input** before processing

Example:
```typescript
try {
  setState({ loading: true, error: null });
  const result = await geminiService.generateArtifact(prompt);
  setState({ loading: false, data: result });
} catch (error) {
  console.error('[GenerateArtifact]', error);
  setState({ 
    loading: false, 
    error: 'Failed to generate artifact. Please try again.' 
  });
}
```

### Accessibility

- **Use semantic HTML**: `<nav>`, `<main>`, `<article>`, `<button>`
- **Add ARIA labels** for icon-only buttons
- **Ensure keyboard navigation** for all interactive elements
- **Maintain color contrast** (WCAG AA minimum)
- **Provide focus indicators** for all focusable elements

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic changes)
- **refactor**: Code refactoring (no feature/fix)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **ci**: CI/CD changes

### Examples

```bash
feat(live-preview): add voice-to-text refinement

Implemented WebRTC-based audio streaming with Gemini 2.5 Flash
for real-time voice-to-text artifact refinement.

Closes #123
```

```bash
fix(gemini): handle missing API key gracefully

Added proper error handling when GEMINI_API_KEY is not configured.
Shows user-friendly error message with setup instructions.
```

```bash
docs(readme): update installation instructions

Added prerequisites section and troubleshooting guide.
```

## Pull Request Process

### Before Submitting

1. **Update your fork**:
   ```bash
   git fetch upstream
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

3. **Make your changes** following coding standards

4. **Test thoroughly**:
   ```bash
   npm run dev  # Test in development
   npm run build  # Ensure production build works
   ```

5. **Commit your changes** using conventional commits

6. **Push to your fork**:
   ```bash
   git push origin feat/your-feature-name
   ```

### Submitting the PR

1. Go to the [Bringittolife repository](https://github.com/Krosebrook/Bringittolife)
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template completely
5. Link related issues using keywords: `Closes #123`, `Fixes #456`

### PR Requirements

- [ ] Code follows project style guidelines
- [ ] Changes are documented in code comments where necessary
- [ ] README or documentation updated if needed
- [ ] No console errors or warnings
- [ ] Build succeeds (`npm run build`)
- [ ] All new code has TypeScript types
- [ ] Accessibility guidelines followed
- [ ] Security best practices followed

### Review Process

- Maintainers will review your PR within 3-5 business days
- Address feedback by pushing additional commits
- Once approved, a maintainer will merge your PR
- Delete your feature branch after merging

## Testing Guidelines

### Manual Testing Checklist

When making changes, test:
- [ ] Image upload and processing
- [ ] Text prompt generation
- [ ] Text-to-image generation
- [ ] Voice refinement (if applicable)
- [ ] Live preview rendering
- [ ] Export functionality (HTML, React, PDF)
- [ ] Design persona switching
- [ ] Theme customization
- [ ] CSS editor (if applicable)
- [ ] Accessibility panel (if applicable)
- [ ] LocalStorage persistence
- [ ] PWA installation

### Browser Testing

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest, if available)

### Device Testing

Test responsive behavior on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

## Documentation

### Code Documentation

- **Add JSDoc comments** for complex functions and services
- **Document parameters** and return types
- **Include examples** for non-obvious usage
- **Explain "why"**, not just "what"

Example:
```typescript
/**
 * Converts an HTML string into a React component string with proper formatting.
 * 
 * Handles:
 * - Semantic element detection and component extraction
 * - State mapping for interactive elements (inputs, selects)
 * - Attribute conversion (class → className, for → htmlFor)
 * 
 * @param html - Raw HTML string from Gemini API
 * @returns Formatted React component as a string
 * 
 * @example
 * const reactCode = convertToReact('<div class="btn">Click me</div>');
 * // Returns: '<div className="btn">Click me</div>'
 */
export function convertToReact(html: string): string {
  // Implementation
}
```

### README Updates

Update the README when:
- Adding new features
- Changing setup process
- Modifying dependencies
- Adding new scripts or commands

## AI-Assisted Development

This project embraces AI-assisted development:

### Using GitHub Copilot

- Refer to [.github/copilot-instructions.md](./.github/copilot-instructions.md)
- Follow the established patterns in [COPILOT_PROMPT.md](./COPILOT_PROMPT.md)
- Always review and test AI-generated code

### Using AI Prompts

- See [GITHUB_AGENT_PROMPTS.md](./GITHUB_AGENT_PROMPTS.md) for engineered prompts
- Adapt prompts for your specific use case
- Document any new patterns you discover

### Best Practices

- **Always review** AI-generated code for correctness
- **Test thoroughly** before committing
- **Follow project conventions** over AI suggestions
- **Document AI-assisted changes** in commit messages if relevant

## Getting Help

- **Documentation**: Start with [README.md](./README.md) and [SUMMARY.md](./SUMMARY.md)
- **Issues**: Search [existing issues](https://github.com/Krosebrook/Bringittolife/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/Krosebrook/Bringittolife/discussions)
- **Discord**: Join our [Discord community](https://discord.gg/manifestation-lab) (if applicable)

## Recognition

Contributors will be:
- Listed in [CONTRIBUTORS.md](./CONTRIBUTORS.md)
- Mentioned in release notes
- Given credit in the project README

Thank you for contributing to Manifestation Lab! 🚀
