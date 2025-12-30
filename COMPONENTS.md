# Component Architecture Documentation

Comprehensive guide to the React component structure in Manifestation Lab.

## Table of Contents

1. [Overview](#overview)
2. [Component Organization](#component-organization)
3. [Core Components](#core-components)
4. [Live Preview Components](#live-preview-components)
5. [UI Components](#ui-components)
6. [Layout Components](#layout-components)
7. [Component Patterns](#component-patterns)
8. [State Management](#state-management)

---

## Overview

Manifestation Lab uses a **feature-based component architecture** where components are organized by feature area rather than by type. This improves maintainability and makes it easier to understand component relationships.

### Design Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition**: Complex UIs built from simple components
3. **Reusability**: Generic components in `ui/`, specific ones in feature folders
4. **Type Safety**: All components fully typed with TypeScript
5. **Accessibility**: WCAG 2.1 compliance built-in

---

## Component Organization

```
components/
├── App.tsx                    # Main application component
├── InputArea.tsx              # Prompt input and file upload
├── Hero.tsx                   # Landing page hero section
├── LivePreview.tsx            # Modal preview container
├── CreationHistory.tsx        # Artifact history carousel
├── PreviewToolbar.tsx         # Preview control toolbar
├── PdfRenderer.tsx            # PDF file preview
│
├── live/                      # Live preview & dev tools
│   ├── ManifestationLoading.tsx    # AI generation loading state
│   ├── SimulatorViewport.tsx       # Device simulator frame
│   ├── ChatPanel.tsx               # Conversational refinement UI
│   ├── PersonaSelector.tsx         # Design persona switcher
│   ├── CssEditorPanel.tsx          # Custom CSS editor
│   ├── AccessibilityPanel.tsx      # A11y audit results
│   ├── DocumentationPanel.tsx      # AI-generated docs
│   ├── CiCdPanel.tsx               # Pipeline simulation
│   ├── ReferencePanel.tsx          # Grounding sources
│   └── toolbar/                    # Toolbar components
│       ├── ActionControls.tsx      # Primary actions (export, etc.)
│       ├── DeviceControls.tsx      # Device mode switcher
│       ├── ViewportControls.tsx    # Pan/zoom controls
│       └── WindowControls.tsx      # Close/minimize
│
├── hero/                      # Landing page components
│   └── (hero-specific components)
│
├── layout/                    # Layout components
│   └── AppFooter.tsx          # Main footer with history
│
└── ui/                        # Reusable UI primitives
    ├── PWAInstaller.tsx       # Service worker prompt
    └── RecoveryAction.tsx     # Import/restore artifact
```

---

## Core Components

### App.tsx

**Purpose**: Main application orchestrator

**Responsibilities**:
- Coordinate creation lifecycle
- Manage focus states (hero vs. preview)
- Route between different views
- Handle global error boundaries

**Props**: None (root component)

**State**:
- `activeCreation`: Currently viewed artifact
- `isGenerating`: AI generation in progress
- `generationError`: Error state

**Key Logic**:
```typescript
const isFocused = useMemo(() => 
  !!activeCreation || isGenerating, 
  [activeCreation, isGenerating]
);
```

**Children**:
- `Hero` (landing page)
- `InputArea` (generation controls)
- `LivePreview` (artifact viewer)
- `AppFooter` (history carousel)

---

### InputArea.tsx

**Purpose**: Primary input interface for artifact generation

**Props**:
```typescript
interface InputAreaProps {
  onGenerate: (prompt: string, file?: File) => void;
  onTextToImage: (prompt: string) => void;
  isGenerating: boolean;
  error: string | null;
  disabled: boolean;
}
```

**Features**:
- Text prompt input (textarea)
- File drag-and-drop zone
- Image/PDF preview
- Text-to-image toggle
- Error display

**Key Logic**:
- File validation (type, size)
- Prompt validation (min length)
- Drag-and-drop handling
- Keyboard shortcuts (Cmd/Ctrl + Enter to submit)

**Accessibility**:
- ARIA labels on all inputs
- Keyboard navigation
- Focus management
- Error announcements

---

### LivePreview.tsx

**Purpose**: Full-screen modal for artifact viewing and refinement

**Props**:
```typescript
interface LivePreviewProps {
  creation: Creation | null;
  isLoading: boolean;
  isFocused: boolean;
  onReset: () => void;
}
```

**Features**:
- Fullscreen modal overlay
- Animated transitions
- Loading states
- Error handling
- Close/reset functionality

**Children**:
- `PreviewToolbar`
- `SimulatorViewport`
- `ChatPanel`
- `ManifestationLoading`
- Dev tool panels (CSS, A11y, Docs, CI/CD)

**State Management**:
- Active panel tracking
- Theme state
- Custom CSS
- Chat history

---

### Hero.tsx

**Purpose**: Landing page hero section with branding

**Props**: None

**Features**:
- Animated title with gradient
- Tagline and description
- Feature highlights
- Background effects (grid, noise)

**Styling**:
- Centered layout
- Responsive typography
- Gradient text effect
- Animated entrance

---

### CreationHistory.tsx

**Purpose**: Horizontal scrolling carousel of past artifacts

**Props**:
```typescript
interface CreationHistoryProps {
  history: Creation[];
  onSelect: (creation: Creation) => void;
}
```

**Features**:
- Thumbnail previews
- Infinite scroll
- Creation metadata (name, date)
- Hover effects
- Empty state

**Key Logic**:
- Generate thumbnail from HTML
- Format timestamps
- Handle selection

---

## Live Preview Components

### SimulatorViewport.tsx

**Purpose**: Iframe-based artifact preview with device simulation

**Props**:
```typescript
interface SimulatorViewportProps {
  creation: Creation;
  deviceMode: DeviceMode;
  scale: number;
  customCss?: string;
}
```

**Features**:
- Sandboxed iframe
- Device frame simulation (desktop, tablet, mobile)
- Pan and zoom
- Custom CSS injection
- Theme synchronization

**Key Implementation**:
```typescript
const iframeContent = useIframeContent(
  creation.html,
  customCss,
  creation.theme
);

<iframe
  ref={iframeRef}
  srcDoc={iframeContent}
  sandbox="allow-scripts allow-same-origin"
  className="w-full h-full"
/>
```

---

### ChatPanel.tsx

**Purpose**: Conversational refinement interface

**Props**:
```typescript
interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onVoiceToggle: () => void;
  isListening: boolean;
  isLoading: boolean;
}
```

**Features**:
- Message list with scrolling
- Text input with send button
- Voice input toggle
- Listening indicator
- Grounding source display
- Voice/text badge

**Message Format**:
```typescript
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  grounding?: GroundingSource[];
  isVoiceInput?: boolean;
}
```

---

### PersonaSelector.tsx

**Purpose**: Design persona switcher

**Props**:
```typescript
interface PersonaSelectorProps {
  activePersona: DesignPersona;
  onChange: (persona: DesignPersona) => void;
}
```

**Personas**:
- Modernist (default)
- Brutalist
- Accessible
- Playful
- Enterprise

**UI**:
- Radio button group
- Visual previews
- Descriptions
- Active state highlighting

---

### CssEditorPanel.tsx

**Purpose**: Live CSS editor with syntax highlighting and linting

**Props**:
```typescript
interface CssEditorPanelProps {
  initialCss: string;
  onChange: (css: string) => void;
  onAutoFix: () => void;
}
```

**Features**:
- Code editor (textarea with syntax highlighting)
- Live preview updates
- CSS linting
- Auto-fix suggestions
- Reset button

**Linting Rules**:
- Syntax errors
- Best practices
- Performance warnings
- Accessibility checks

---

### AccessibilityPanel.tsx

**Purpose**: WCAG compliance audit and fixes

**Props**:
```typescript
interface AccessibilityPanelProps {
  issues: AccessibilityIssue[];
  onFixAll: () => void;
  onFixSingle: (issueId: string) => void;
}
```

**Features**:
- Issue categorization (critical, warning, info)
- Issue details and suggestions
- One-click fixes
- "Heal All" button
- Re-audit functionality

**Issue Display**:
```tsx
<div className="issue critical">
  <Icon />
  <div>
    <h4>{issue.element}</h4>
    <p>{issue.message}</p>
    <button onClick={() => onFixSingle(issue.id)}>
      Fix
    </button>
  </div>
</div>
```

---

### DocumentationPanel.tsx

**Purpose**: AI-generated technical documentation

**Props**:
```typescript
interface DocumentationPanelProps {
  documentation: WorkflowDoc | null;
  isGenerating: boolean;
  onGenerate: () => void;
}
```

**Documentation Structure**:
- **Purpose**: High-level overview
- **I/O Schema**: Input/output specification
- **Internal Logic**: Implementation details
- **Last Updated**: Timestamp

**Features**:
- Generate button
- Loading state
- Markdown rendering
- Copy to clipboard

---

### CiCdPanel.tsx

**Purpose**: Simulated CI/CD pipeline visualization

**Props**:
```typescript
interface CiCdPanelProps {
  pipeline: PipelineStep[];
  onRun: () => void;
  isRunning: boolean;
}
```

**Pipeline Steps**:
1. Lint (ESLint)
2. Type Check (TypeScript)
3. Build (Compilation)
4. Deploy (Preview)

**Step Status**:
- Pending (gray)
- Active (blue, animated)
- Success (green)
- Failed (red)

**Visualization**:
```tsx
<div className="pipeline">
  {pipeline.map(step => (
    <div className={`step ${step.status}`}>
      <Icon />
      <span>{step.name}</span>
      {step.status === 'active' && <Spinner />}
    </div>
  ))}
</div>
```

---

### ReferencePanel.tsx

**Purpose**: Display grounding sources from Google Search

**Props**:
```typescript
interface ReferencePanelProps {
  sources: GroundingSource[];
}
```

**Source Display**:
- Title
- URL (clickable)
- Snippet preview
- Domain favicon

**Features**:
- List view
- External links
- Empty state when no sources

---

## UI Components

### PWAInstaller.tsx

**Purpose**: Prompt user to install Progressive Web App

**Props**: None (uses service worker API)

**Features**:
- Detect installability
- Show install prompt
- Handle install event
- Dismissible
- Persistent preference

**Logic**:
```typescript
useEffect(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowPrompt(true);
  });
}, []);
```

---

### RecoveryAction.tsx

**Purpose**: Import or restore artifacts

**Props**:
```typescript
interface RecoveryActionProps {
  isVisible: boolean;
  onImport: (creation: Creation) => void;
}
```

**Features**:
- JSON file import
- Drag-and-drop support
- Validation
- Error handling

---

## Layout Components

### AppFooter.tsx

**Purpose**: Footer with creation history and metadata

**Props**:
```typescript
interface AppFooterProps {
  history: Creation[];
  onSelect: (creation: Creation) => void;
}
```

**Features**:
- History carousel
- Artifact count
- Version info
- Links (docs, GitHub)

---

## Component Patterns

### Pattern 1: Controlled Components

All form inputs are controlled components:

```typescript
const [value, setValue] = useState('');

<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Pattern 2: Composition

Complex UIs built from smaller pieces:

```typescript
<LivePreview>
  <PreviewToolbar />
  <SimulatorViewport>
    <iframe />
  </SimulatorViewport>
  <ChatPanel />
</LivePreview>
```

### Pattern 3: Render Props

For flexible rendering:

```typescript
<DataFetcher
  url="/api/data"
  render={(data, loading, error) => (
    loading ? <Spinner /> :
    error ? <Error message={error} /> :
    <DataDisplay data={data} />
  )}
/>
```

### Pattern 4: Custom Hooks

Extract reusable logic:

```typescript
function useArtifactGenerator() {
  const [state, setState] = useState(...);
  
  const generate = useCallback(...);
  const refine = useCallback(...);
  
  return { state, generate, refine };
}
```

### Pattern 5: Memoization

Optimize performance:

```typescript
const expensiveValue = useMemo(() => 
  computeExpensiveValue(input),
  [input]
);

const memoizedCallback = useCallback(() => 
  doSomething(a, b),
  [a, b]
);
```

---

## State Management

### Local State

Use `useState` for component-specific state:

```typescript
const [isOpen, setIsOpen] = useState(false);
```

### Shared State (Props)

Pass state down via props:

```typescript
<Parent>
  <Child value={parentState} onChange={setParentState} />
</Parent>
```

### Context API (Future)

For deeply nested props:

```typescript
const ThemeContext = createContext();

<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>

// In child component
const theme = useContext(ThemeContext);
```

### Custom Hooks

Encapsulate stateful logic:

```typescript
// useHistory.ts
export function useHistory() {
  const [history, setHistory] = useState<Creation[]>([]);
  
  const addCreation = useCallback((creation: Creation) => {
    setHistory(prev => [creation, ...prev]);
  }, []);
  
  return { history, addCreation };
}
```

---

## Testing Components

### Unit Tests

Test individual components in isolation:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { InputArea } from './InputArea';

test('calls onGenerate with prompt', () => {
  const onGenerate = jest.fn();
  render(<InputArea onGenerate={onGenerate} />);
  
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Test prompt' }
  });
  
  fireEvent.click(screen.getByText('Generate'));
  
  expect(onGenerate).toHaveBeenCalledWith('Test prompt', undefined);
});
```

### Integration Tests

Test component interactions:

```typescript
test('full generation flow', async () => {
  render(<App />);
  
  // Enter prompt
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Create a button' }
  });
  
  // Submit
  fireEvent.click(screen.getByText('Generate'));
  
  // Wait for result
  await waitFor(() => {
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });
});
```

---

## Component Checklist

When creating a new component:

- [ ] Define TypeScript interface for props
- [ ] Add JSDoc comment describing purpose
- [ ] Implement accessibility (ARIA, keyboard nav)
- [ ] Handle loading and error states
- [ ] Add responsive styling
- [ ] Memoize expensive operations
- [ ] Write unit tests
- [ ] Document in this file

---

## See Also

- [API Documentation](../API.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Agent Documentation](./agents.md)

---

**Last Updated**: 2024-12-30
