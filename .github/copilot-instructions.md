# Manifestation Lab v3.0 - GitHub Copilot Instructions

You are assisting with Manifestation Lab, a React 19.2 + TypeScript + Gemini AI application for transforming visual designs into interactive code.

## Quick Context

**Tech Stack**: React 19.2, TypeScript 5.8, Vite 6.2, Tailwind CSS, Google Gemini API  
**Architecture**: Feature-organized components, custom hooks, service layer for APIs  
**Style**: Function components, TypeScript strict mode, Tailwind utilities

## Code Guidelines

### React Components
- Use function components with TypeScript
- Always define prop interfaces
- Use hooks: `useState`, `useMemo`, `useCallback`
- Example:
```typescript
interface Props {
  artifact: Artifact;
  onSelect: (id: string) => void;
}

export function ArtifactCard({ artifact, onSelect }: Props) {
  // Component logic
}
```

### TypeScript
- Prefer `interface` over `type` for objects
- Avoid `any` - use `unknown` for dynamic types
- Use union types for variants
- Always type function parameters and returns

### Styling
- Use Tailwind CSS utility classes
- Group utilities: layout → typography → colors
- Use `cn()` helper for conditional classes
- Example:
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700">
  Generate
</button>
```

### AI Integration
- Always handle errors gracefully
- Show loading states (AI takes 5-15s)
- Validate AI responses before use
- Use structured prompts with clear requirements

### Error Handling
- Wrap async operations in try-catch
- Provide user-friendly error messages
- Offer recovery actions
- Log errors for debugging

### Accessibility
- Use semantic HTML (`<nav>`, `<main>`, `<button>`)
- Add ARIA labels for icon buttons
- Ensure keyboard navigation
- Maintain color contrast (WCAG AA)

## Project Structure

```
components/     # React components
  live/         # Live preview & dev tools
  hero/         # Landing page
  layout/       # Layouts
  ui/           # Reusable UI
services/       # API integrations (Gemini)
hooks/          # Custom hooks
utils/          # Helper functions
types.ts        # Global types
```

## Key Files

- `App.tsx`: Main application
- `services/gemini.ts`: AI code generation
- `hooks/useHistory.ts`: LocalStorage persistence
- `hooks/useIframeContent.ts`: Iframe injection
- `utils/reactConverter.ts`: HTML → React conversion

## Common Patterns

### Gemini API Call
```typescript
async function generate(prompt: string) {
  try {
    setLoading(true);
    const response = await geminiService.generateContent({ prompt });
    return response.text;
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
}
```

### Custom Hook
```typescript
function useArtifact(initial?: Artifact) {
  const [artifact, setArtifact] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  return { artifact, loading, error, setArtifact };
}
```

## Naming Conventions

- Components: `PascalCase.tsx` (e.g., `InputArea.tsx`)
- Hooks: `camelCase.ts` with "use" prefix (e.g., `useHistory.ts`)
- Utils: `camelCase.ts` (e.g., `fileHelpers.ts`)
- Types: `PascalCase` (e.g., `interface Artifact`)

## Security

- ⚠️ API keys should never be in client code (use backend proxy)
- Validate and sanitize all user input
- Escape HTML before iframe injection
- Use CSP headers in production

## Dependencies

- `@google/genai`: Gemini AI SDK
- `react`, `react-dom`: v19.2
- `@heroicons/react`: Icons
- Tailwind CSS: Via CDN

## When Suggesting Code

**Always include**:
- TypeScript types
- Error handling
- Loading states
- Accessibility attributes

**Prioritize**:
- User experience
- Security
- Performance
- Code readability

## Remember

This is a production-grade AI-powered application. Suggestions should be:
- Type-safe
- Error-resilient  
- Accessible
- Well-documented

For full details, see: COPILOT_PROMPT.md, AUDIT.md, ARCHITECTURE.md
