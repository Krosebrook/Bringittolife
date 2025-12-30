# Contributing to Manifestation Lab

Thank you for your interest in contributing to Manifestation Lab! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Code Guidelines](#code-guidelines)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation Guidelines](#documentation-guidelines)
8. [Pull Request Process](#pull-request-process)
9. [Issue Guidelines](#issue-guidelines)
10. [Community](#community)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Harassment, trolling, or derogatory comments
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, issues, and other contributions that do not align with this Code of Conduct.

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- A GitHub account
- A Google Gemini API key (for testing)

### First-Time Contributors

If you're new to open source:
1. Read through existing issues labeled `good first issue`
2. Explore the codebase to understand the structure
3. Review the [ARCHITECTURE.md](./ARCHITECTURE.md) document
4. Start with documentation or small bug fixes

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/Bringittolife.git
cd Bringittolife

# Add upstream remote
git remote add upstream https://github.com/Krosebrook/Bringittolife.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Add your API key to .env
echo "GEMINI_API_KEY=your_api_key_here" >> .env
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### 5. Verify Setup

- Open the application in your browser
- Try generating a simple artifact from text
- Check the console for errors

---

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **Bug Fixes** 🐛
   - Fix broken functionality
   - Resolve edge cases
   - Improve error handling

2. **Features** ✨
   - New capabilities
   - UI/UX improvements
   - Integration enhancements

3. **Documentation** 📚
   - Fix typos or unclear explanations
   - Add examples
   - Improve guides

4. **Testing** 🧪
   - Write unit tests
   - Add integration tests
   - Improve test coverage

5. **Performance** ⚡
   - Optimize slow operations
   - Reduce bundle size
   - Improve rendering

6. **Refactoring** 🔧
   - Improve code structure
   - Enhance type safety
   - Remove technical debt

### Contribution Workflow

```
1. Find/Create Issue → 2. Fork & Branch → 3. Develop → 4. Test → 5. Pull Request
```

---

## Code Guidelines

### TypeScript Style

**DO ✅**

```typescript
// Use interfaces for object types
interface ArtifactProps {
  artifact: Artifact;
  onSelect: (id: string) => void;
}

// Use function components
export function ArtifactCard({ artifact, onSelect }: ArtifactProps) {
  // Implementation
}

// Always type function returns
function generateId(): string {
  return crypto.randomUUID();
}

// Use descriptive variable names
const isGenerating = state.isLoading;
const hasError = !!error;
```

**DON'T ❌**

```typescript
// Don't use 'any' type
function process(data: any) { }

// Don't use 'type' for object interfaces (prefer 'interface')
type Props = { name: string };

// Don't use single-letter variables (except in short loops)
const a = data.filter(x => x.active);

// Don't skip return type annotations
function calculate(x: number) {
  return x * 2;
}
```

### React Patterns

**Component Structure:**

```typescript
/**
 * Brief description of component purpose
 */
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState<StateType>(initialValue);
  const customValue = useCustomHook();

  // 2. Derived state and memoization
  const derivedValue = useMemo(() => {
    return expensiveCalculation(state);
  }, [state]);

  // 3. Event handlers
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // 4. Effects
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  // 5. Render
  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
}
```

**Hooks Best Practices:**

```typescript
// ✅ Good: Meaningful hook names with 'use' prefix
function useArtifactGeneration(prompt: string) {
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Hook logic
  
  return { artifact, loading };
}

// ✅ Good: Proper dependency arrays
useEffect(() => {
  fetchData(id);
}, [id]); // Only re-run when id changes

// ❌ Bad: Missing dependencies
useEffect(() => {
  fetchData(id);
}, []); // Will use stale id
```

### Styling with Tailwind

**DO ✅**

```tsx
// Group utilities logically: layout → spacing → typography → colors
<button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">
  Generate
</button>

// Use Tailwind's responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Use the cn() helper for conditional classes
<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "disabled-class"
)}>
```

**DON'T ❌**

```tsx
// Don't use inline styles
<div style={{ padding: '16px', color: 'blue' }}>

// Don't create custom CSS classes
<style>{`.my-custom-class { padding: 16px; }`}</style>

// Don't use arbitrary values without good reason
<div className="p-[13px]"> // Use p-3 or p-4 instead
```

### File Organization

```
src/
├── components/          # React components
│   ├── live/           # Live preview features
│   ├── hero/           # Landing page sections
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── utils/              # Helper functions
├── types.ts            # Global TypeScript types
└── App.tsx             # Main application component
```

**Naming Conventions:**

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `InputArea.tsx` |
| Hooks | camelCase with "use" | `useHistory.ts` |
| Utils | camelCase | `fileHelpers.ts` |
| Types/Interfaces | PascalCase | `interface Artifact` |
| Constants | UPPER_SNAKE_CASE | `MAX_HISTORY_ITEMS` |

### Error Handling

```typescript
// ✅ Good: Specific error handling with user-friendly messages
async function generateArtifact(prompt: string) {
  try {
    const result = await geminiService.generateArtifact(prompt);
    return result;
  } catch (error) {
    if (error instanceof APIError) {
      if (error.code === 'QUOTA_EXCEEDED') {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.code === 'INVALID_KEY') {
        throw new Error('API key is invalid. Please check configuration.');
      }
    }
    
    // Log for debugging
    console.error('[Generation] Unexpected error:', error);
    throw new Error('Generation failed. Please try again.');
  }
}

// ✅ Good: Graceful degradation
function getStoredHistory(): Creation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load history:', error);
    return []; // Fallback to empty
  }
}
```

### Comments and Documentation

```typescript
/**
 * Generates a complete HTML artifact from a prompt and optional image.
 * 
 * @param prompt - User's text description of desired artifact
 * @param image - Optional base64-encoded image
 * @param persona - Design system to apply (default: 'modernist')
 * @returns Promise resolving to generated HTML and metadata
 * @throws {Error} If API request fails or quota exceeded
 * 
 * @example
 * const result = await generateArtifact(
 *   "Create a todo app",
 *   undefined,
 *   'modernist'
 * );
 */
async function generateArtifact(
  prompt: string,
  image?: string,
  persona: DesignPersona = 'modernist'
): Promise<GenerationResult> {
  // Implementation
}

// Use inline comments for complex logic
function pruneHistory(history: Creation[]): Creation[] {
  // Step 1: Remove images from all but the 3 most recent items
  const pruned = history.map((item, idx) =>
    idx > 2 ? { ...item, originalImage: undefined } : item
  );
  
  // Step 2: If still too large, remove HTML from older items
  // Keep only metadata for historical reference
  return pruned;
}
```

---

## Testing Guidelines

### Test Structure (Future)

When test infrastructure is added, follow these patterns:

```typescript
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction correctly', async () => {
    const onClickMock = vi.fn();
    render(<ComponentName onClick={onClickMock} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('displays error state appropriately', () => {
    render(<ComponentName error="Test error" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

Until automated tests are implemented, manually verify:

- [ ] Component renders correctly
- [ ] User interactions work as expected
- [ ] Error states display appropriately
- [ ] Loading states show correctly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Accessibility features function (keyboard nav, ARIA labels)
- [ ] Changes don't break existing functionality

---

## Documentation Guidelines

### Code Documentation

- Document all public APIs with JSDoc
- Explain "why" in comments, not "what" (code should be self-explanatory)
- Update documentation when changing functionality
- Include examples for complex features

### Markdown Documentation

- Use clear, concise language
- Include code examples
- Add table of contents for long documents
- Use headings consistently
- Add links to related documentation

### README Updates

When adding features, update README.md:
- Add to feature list if user-facing
- Update setup instructions if needed
- Include usage examples
- Update screenshots if UI changed

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test your changes**
   - Manual testing of affected features
   - Check console for errors
   - Verify in different browsers

3. **Review your changes**
   ```bash
   git diff upstream/main
   ```

4. **Update documentation**
   - Update relevant .md files
   - Add JSDoc comments
   - Update CHANGELOG.md

### Creating a Pull Request

1. **Push to your fork**
   ```bash
   git push origin feature-branch-name
   ```

2. **Open PR on GitHub**
   - Use descriptive title: "Add dark mode toggle" not "Update"
   - Reference related issues: "Fixes #123"
   - Provide detailed description

3. **PR Description Template**
   ```markdown
   ## Description
   Brief summary of changes

   ## Motivation
   Why this change is needed

   ## Changes Made
   - Bullet list of specific changes
   - Include file names

   ## Testing Done
   - How you tested
   - What scenarios you verified

   ## Screenshots (if applicable)
   [Add screenshots for UI changes]

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-reviewed the changes
   - [ ] Commented complex code
   - [ ] Updated documentation
   - [ ] Changes generate no new warnings
   - [ ] Tested on multiple browsers (if UI change)
   ```

### PR Review Process

1. **Automated Checks** (future)
   - Linting
   - Type checking
   - Unit tests
   - Build verification

2. **Code Review**
   - Maintainer reviews code
   - Provides feedback or requests changes
   - Approves when ready

3. **Addressing Feedback**
   ```bash
   # Make requested changes
   git add .
   git commit -m "Address review feedback"
   git push origin feature-branch-name
   ```

4. **Merge**
   - Maintainer merges when approved
   - PR automatically closes related issues

---

## Issue Guidelines

### Creating Issues

**Bug Reports:**

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Browser: Chrome 120
- OS: macOS 14
- Node: 18.17.0

**Screenshots**
[If applicable]
```

**Feature Requests:**

```markdown
**Feature Description**
Clear description of the proposed feature

**Use Case**
Why this feature is needed

**Proposed Solution**
How you envision this working

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Any other relevant information
```

### Issue Labels

| Label | Purpose |
|-------|---------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Documentation improvements |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `question` | Further information requested |
| `wontfix` | Will not be worked on |
| `duplicate` | Already reported |

---

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions and reviews

### Getting Help

If you're stuck:
1. Check existing documentation (README, ARCHITECTURE, AUDIT)
2. Search closed issues for similar problems
3. Open a new issue with detailed information
4. Be patient - maintainers volunteer their time

### Recognition

Contributors are recognized in:
- GitHub contributor graph
- CHANGELOG.md (for significant contributions)
- Release notes

---

## License

By contributing to Manifestation Lab, you agree that your contributions will be licensed under the Apache License 2.0.

---

## Questions?

If you have questions about contributing:
1. Check this guide thoroughly
2. Review existing issues and PRs
3. Open a GitHub Discussion
4. Tag maintainers if urgent

---

Thank you for contributing to Manifestation Lab! Your efforts help make this project better for everyone. 🚀

---

**Last Updated:** December 29, 2024  
**Contributors:** See [GitHub Contributors](https://github.com/Krosebrook/Bringittolife/graphs/contributors)
