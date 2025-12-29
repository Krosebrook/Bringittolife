# GitHub Copilot Context-Engineered Prompt

This document contains a comprehensive, context-engineered prompt for GitHub Copilot to understand and assist with development of Manifestation Lab v3.0.

---

## Master Prompt for GitHub Copilot

Copy and paste this into your GitHub Copilot instructions file (`.github/copilot-instructions.md`) or use it in Copilot Chat for context-aware assistance.

```markdown
# Manifestation Lab v3.0 - GitHub Copilot Development Guide

You are an expert AI assistant helping to develop Manifestation Lab, a production-grade React application that uses Google Gemini AI to transform visual designs into interactive code.

## Project Context

### Tech Stack
- **Frontend**: React 19.2, TypeScript 5.8
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS (via Play CDN)
- **AI Integration**: Google Gemini API (@google/genai)
- **Icons**: Heroicons v2.2
- **PWA**: Service Worker for offline support

### Project Structure
```
Bringittolife/
├── components/          # React components (feature-organized)
│   ├── live/           # Live preview and dev tools
│   ├── hero/           # Landing page components
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI primitives
├── services/           # External API integrations
│   ├── gemini.ts       # Primary AI code generation
│   ├── live.ts         # Audio streaming for voice commands
│   └── docsService.ts  # AI-powered documentation
├── hooks/              # Custom React hooks
│   ├── useHistory.ts   # Local storage with quota management
│   └── useIframeContent.ts  # Iframe injection & theming
├── utils/              # Helper functions
│   ├── fileHelpers.ts  # File upload & base64 conversion
│   ├── reactConverter.ts  # HTML → React JSX transpilation
│   └── injection.ts    # Iframe content injection
├── types.ts            # Centralized TypeScript types
└── App.tsx            # Root component
```

### Core Features
1. **Image-to-Code**: Upload wireframes/designs → AI generates HTML/CSS/JS
2. **Voice Refinement**: Real-time voice commands to iterate on generated code
3. **Live Preview**: Iframe-based simulation with device emulation
4. **Dev Studio**: CSS editor, accessibility audit, documentation generator
5. **Multiple Exports**: React components, standalone HTML, PDF

## Development Guidelines

### Code Style

#### React Components
- Always use **function components** (no class components)
- Use TypeScript for all components with explicit prop types
- Prefer hooks over higher-order components
- Use `useMemo` and `useCallback` for expensive computations
- Example:
  ```typescript
  interface ArtifactCardProps {
    artifact: Artifact;
    onSelect: (id: string) => void;
  }
  
  export function ArtifactCard({ artifact, onSelect }: ArtifactCardProps) {
    const formattedDate = useMemo(
      () => new Date(artifact.timestamp).toLocaleDateString(),
      [artifact.timestamp]
    );
    
    return (
      <div onClick={() => onSelect(artifact.id)}>
        {/* ... */}
      </div>
    );
  }
  ```

#### TypeScript
- **Always** use strict mode (already enabled in tsconfig.json)
- Prefer `interface` over `type` for object shapes
- Use union types for state variations
- Avoid `any` - use `unknown` if type is truly dynamic
- Example:
  ```typescript
  // Good
  interface GeminiResponse {
    text: string;
    metadata?: Record<string, unknown>;
  }
  
  // Avoid
  let response: any;
  ```

#### Styling with Tailwind
- Use Tailwind utility classes directly in JSX
- Group related utilities (layout, then typography, then colors)
- Use `clsx` or `cn` utility for conditional classes
- Create reusable component variants with cva (class-variance-authority)
- Example:
  ```tsx
  <button
    className={cn(
      // Layout
      "flex items-center gap-2 px-4 py-2",
      // Typography
      "text-sm font-medium",
      // Colors & effects
      "bg-indigo-600 text-white hover:bg-indigo-700",
      "transition-colors duration-200",
      // Conditional
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    Generate Artifact
  </button>
  ```

### AI Integration Patterns

#### Gemini API Calls
- Always handle errors gracefully (API rate limits, network issues)
- Show loading states during generation (can take 5-15 seconds)
- Validate AI responses before using them
- Example:
  ```typescript
  async function generateArtifact(prompt: string, image?: string) {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await geminiService.generateContent({
        prompt,
        image,
        model: 'gemini-3-pro-preview'
      });
      
      // Validate response
      if (!response?.text) {
        throw new Error('Invalid response from AI');
      }
      
      return response.text;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      // Show user-friendly error message
    } finally {
      setIsGenerating(false);
    }
  }
  ```

#### Prompt Engineering
- Be specific and structured in prompts
- Include design system context (Tailwind CSS, modern web standards)
- Request accessible markup (ARIA labels, semantic HTML)
- Example prompt template:
  ```typescript
  const prompt = `
  Generate a ${componentType} with the following requirements:
  ${userRequirements}
  
  Technical constraints:
  - Use semantic HTML5 elements
  - Style with Tailwind CSS utility classes
  - Include proper ARIA labels for accessibility
  - Make it responsive (mobile-first)
  - Use modern ES6+ JavaScript if interactivity is needed
  
  Design style: ${selectedPersona} (Modernist/Brutalist/Accessible/etc.)
  
  Return only the HTML/CSS/JS code, no explanations.
  `;
  ```

### State Management
- Use local state (`useState`) for component-specific state
- Use custom hooks for reusable stateful logic
- Use Context API sparingly (only for truly global state)
- Persist critical data to localStorage via `useHistory` hook
- Example:
  ```typescript
  // Custom hook for artifact state
  function useArtifact(initialArtifact?: Artifact) {
    const [artifact, setArtifact] = useState(initialArtifact);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const refine = useCallback(async (feedback: string) => {
      // Refinement logic
    }, [artifact]);
    
    return { artifact, isLoading, error, refine };
  }
  ```

### Error Handling
- Always wrap async operations in try-catch
- Provide user-friendly error messages (not technical details)
- Log errors for debugging (console.error in dev)
- Offer recovery actions ("Try Again" button)
- Example:
  ```typescript
  try {
    const result = await riskyOperation();
  } catch (error) {
    console.error('Operation failed:', error);
    
    const userMessage = error instanceof NetworkError
      ? 'Please check your internet connection and try again.'
      : 'Something went wrong. Please try again later.';
    
    showToast({ type: 'error', message: userMessage });
  }
  ```

### Accessibility (a11y)
- Use semantic HTML (`<nav>`, `<main>`, `<article>`, etc.)
- Include ARIA labels for icon-only buttons
- Ensure keyboard navigation works (Tab, Enter, Escape)
- Maintain focus management in modals and dialogs
- Use sufficient color contrast (WCAG AA minimum)
- Example:
  ```tsx
  <button
    aria-label="Generate artifact from uploaded image"
    onClick={handleGenerate}
  >
    <SparklesIcon className="w-5 h-5" />
  </button>
  ```

### Performance
- Lazy load heavy components with `React.lazy` and `Suspense`
- Memoize expensive computations with `useMemo`
- Debounce user input for search/filter operations
- Optimize images (WebP format, responsive sizes)
- Example:
  ```tsx
  const LivePreview = lazy(() => import('./components/LivePreview'));
  
  function App() {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LivePreview artifact={currentArtifact} />
      </Suspense>
    );
  }
  ```

## Common Tasks & Patterns

### Adding a New Feature Component
1. Create component file in appropriate directory
2. Define TypeScript interface for props
3. Implement component with hooks
4. Add to parent component
5. Update types.ts if new types are needed

### Integrating with Gemini API
1. Import `geminiService` from `services/gemini.ts`
2. Call appropriate method (`generateArtifact`, `refineArtifact`)
3. Handle loading and error states
4. Parse and validate response
5. Update UI with results

### Working with Iframes
1. Use `useIframeContent` hook for content injection
2. Sanitize user-generated HTML before injection
3. Use `postMessage` for iframe ↔ parent communication
4. Theme and CSS are injected automatically by the hook

### Persisting Data
1. Import `useHistory` hook
2. Call `saveArtifact(artifact)` to persist
3. Quota management is automatic
4. Oldest artifacts are pruned when storage is full

## Security Considerations

### API Key Management
- **CRITICAL**: Never expose Gemini API key in client code
- Use environment variables (VITE requires `VITE_` prefix, but this project uses custom setup)
- In production, proxy API calls through a backend service
- Current setup (dev only): Key injected at build time via `vite.config.ts`

### User Input Validation
- Sanitize all user input before sending to AI
- Validate file types and sizes before upload
- Escape HTML in user-provided content
- Limit prompt length to prevent abuse

### Content Security
- Sanitize AI-generated HTML before iframe injection
- Use Content Security Policy headers (in production)
- Avoid `eval()` or `Function()` with untrusted code

## Testing Approach

(Note: Tests not yet implemented - see AUDIT.md)

When writing tests:
- Test user behavior, not implementation details
- Mock Gemini API calls (don't hit real API in tests)
- Use React Testing Library for component tests
- Test accessibility with `@axe-core/react`
- Example:
  ```typescript
  test('generates artifact on form submit', async () => {
    const mockGenerate = jest.fn();
    render(<InputArea onGenerate={mockGenerate} />);
    
    const input = screen.getByPlaceholderText(/describe/i);
    const button = screen.getByRole('button', { name: /generate/i });
    
    await userEvent.type(input, 'Create a login form');
    await userEvent.click(button);
    
    expect(mockGenerate).toHaveBeenCalledWith('Create a login form', undefined);
  });
  ```

## Common Pitfalls to Avoid

### ❌ Don't Do This
```typescript
// Modifying state directly
artifact.html = newHtml; // BAD

// Using any type
function process(data: any) { } // BAD

// Inline functions in JSX (re-creates on every render)
<button onClick={() => handleClick(id)}> // BAD (in loops)

// Forgetting error handling
const data = await fetchData(); // BAD - no try/catch
```

### ✅ Do This Instead
```typescript
// Immutable state updates
setArtifact({ ...artifact, html: newHtml }); // GOOD

// Proper typing
function process(data: GeminiResponse) { } // GOOD

// Memoized callbacks
const handleClick = useCallback((id: string) => {
  // ...
}, [dependencies]); // GOOD

// Error handling
try {
  const data = await fetchData();
} catch (error) {
  handleError(error);
} // GOOD
```

## File Naming Conventions
- Components: PascalCase (e.g., `InputArea.tsx`, `LivePreview.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useHistory.ts`, `useArtifact.ts`)
- Services: camelCase with ".service" suffix (e.g., `gemini.service.ts`)
- Utils: camelCase (e.g., `fileHelpers.ts`, `formatDate.ts`)
- Types: PascalCase for interfaces/types (e.g., `interface Artifact { }`)

## Git Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Be descriptive but concise
- Examples:
  - `feat: add voice command refinement`
  - `fix: handle API rate limit errors`
  - `refactor: extract prompt building logic to utility`
  - `docs: update README with setup instructions`

## Dependencies to Know
- `@google/genai`: Official Gemini AI SDK
- `react`, `react-dom`: React 19.2 (latest)
- `@heroicons/react`: Icon library (outline and solid variants)
- Tailwind CSS: Loaded via CDN (not in package.json)
- PDF.js: For PDF rendering (loaded dynamically)

## Environment Variables
```bash
# .env file (not committed to git)
GEMINI_API_KEY=your_api_key_here
```

## Quick Reference: Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root component, main application logic |
| `services/gemini.ts` | Gemini API integration, artifact generation |
| `services/live.ts` | Real-time audio streaming for voice commands |
| `hooks/useHistory.ts` | LocalStorage persistence with quota management |
| `hooks/useIframeContent.ts` | Iframe content injection and theming |
| `utils/reactConverter.ts` | HTML → React component conversion |
| `types.ts` | Global TypeScript type definitions |
| `vite.config.ts` | Build configuration, env variables |

## When Suggesting Code

### Always:
- Include TypeScript types
- Add JSDoc comments for complex logic
- Consider edge cases (null, empty, errors)
- Follow existing patterns in the codebase
- Suggest tests if test infrastructure exists

### Prioritize:
- User experience (fast, responsive, intuitive)
- Accessibility (keyboard nav, screen readers)
- Security (input validation, API safety)
- Performance (memoization, lazy loading)
- Code readability (clear names, comments)

## Resources
- Project Documentation: README.md, ARCHITECTURE.md, PRD.md
- Audit Report: AUDIT.md (comprehensive codebase analysis)
- Repository Recommendations: REPOSITORIES.md
- GitHub Agent Prompts: GITHUB_AGENT_PROMPTS.md

## Questions to Ask Before Coding

1. Does this change align with the existing architecture?
2. Are there similar patterns elsewhere in the codebase?
3. What edge cases should I handle?
4. How will this impact performance?
5. Is this accessible to all users?
6. Could this introduce security issues?

## Remember

This project is about:
- **Innovation**: Pushing boundaries of AI-assisted development
- **Quality**: Production-grade code, not just demos
- **UX**: Delightful, intuitive user experience
- **Accessibility**: Inclusive design for everyone
- **Performance**: Fast, responsive, smooth interactions

Your suggestions should reflect these values.

---

*Last Updated: December 29, 2025*
```

---

## How to Use This Prompt

### Method 1: Project-Wide Configuration
1. Create `.github/copilot-instructions.md` in your repository
2. Paste the prompt above
3. Copilot will automatically use this context for all suggestions

### Method 2: Chat Context
1. Open Copilot Chat in VS Code (Ctrl+I or Cmd+I)
2. Type `/clear` to reset context
3. Paste: "Use the instructions in .github/copilot-instructions.md"
4. Start your coding session

### Method 3: Inline Comments
For specific tasks, add contextual comments:
```typescript
// Using Manifestation Lab patterns:
// - TypeScript with strict types
// - Tailwind for styling
// - Error handling with user-friendly messages
// Generate a component that...
```

## Maintenance

Update this prompt when:
- Project structure changes significantly
- New major dependencies are added
- Coding standards evolve
- New patterns emerge

Keep it synchronized with:
- `ARCHITECTURE.md`
- `AUDIT.md` recommendations
- Actual codebase patterns

---

## Expected Outcomes

With this prompt, GitHub Copilot should:
- ✅ Suggest TypeScript code with proper types
- ✅ Use Tailwind CSS correctly
- ✅ Include error handling by default
- ✅ Follow project conventions automatically
- ✅ Generate accessible markup
- ✅ Respect security best practices
- ✅ Match existing code style

---

## Troubleshooting

### Copilot Ignores Instructions
- Ensure `.github/copilot-instructions.md` exists
- Reload VS Code window
- Try explicit chat message: "Follow project guidelines from copilot-instructions.md"

### Suggestions Don't Match Style
- Check if file is similar to examples in prompt
- Add inline comment with specific guidance
- Update prompt with more examples

### Poor TypeScript Suggestions
- Ensure `tsconfig.json` is correctly configured
- Open relevant type definition files
- Add type annotations in comments

---

*This prompt is designed to work with GitHub Copilot, Copilot Chat, and Copilot Workspace. Adjust as needed for other AI coding assistants.*
