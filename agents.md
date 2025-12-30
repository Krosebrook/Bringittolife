# AI Agent Architecture

This document provides a comprehensive overview of the AI agent architecture in Manifestation Lab, including purpose, capabilities, data flow, and implementation details.

---

## Table of Contents

1. [Overview](#overview)
2. [Primary Synthesis Agent](#primary-synthesis-agent)
3. [Live Refinement Agent](#live-refinement-agent)
4. [Documentation Generator Agent](#documentation-generator-agent)
5. [Accessibility Audit Agent](#accessibility-audit-agent)
6. [Decision Logic & Flow](#decision-logic--flow)
7. [Error Handling & Recovery](#error-handling--recovery)
8. [Performance Considerations](#performance-considerations)
9. [Future Enhancements](#future-enhancements)

---

## Overview

Manifestation Lab employs a multi-agent architecture where specialized AI agents handle different aspects of the code generation and refinement pipeline. Each agent is optimized for specific tasks and uses appropriate models from the Google Gemini family.

### Agent Hierarchy

```
┌─────────────────────────────────────────────────┐
│          User Input (Image/Text/Voice)           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  Primary Synthesis  │ ◄── Gemini 3 Pro
        │       Agent         │     (High-thinking budget)
        └─────────┬───────────┘
                  │
                  ├──► HTML Artifact
                  │
                  ▼
        ┌─────────────────────┐
        │   Live Refinement   │ ◄── Gemini 3 Pro
        │       Agent         │     (Chat-based, contextual)
        └─────────┬───────────┘
                  │
                  ├──► Refined HTML
                  │
                  ▼
        ┌─────────────────────┐
        │    Documentation    │ ◄── Gemini 3 Flash
        │   Generator Agent   │     (Fast, efficient)
        └─────────┬───────────┘
                  │
                  └──► Technical Docs (JSON)
```

---

## Primary Synthesis Agent

### Purpose
Transforms multi-modal input (images, text prompts, or both) into complete, production-ready HTML artifacts with Tailwind CSS styling.

### Model
**Gemini 3 Pro Preview** (`gemini-3-pro-preview`)

### Configuration
```typescript
{
  model: 'gemini-3-pro-preview',
  temperature: 0.1,  // Low for consistency
  thinkingBudget: 4000,  // High for complex reasoning
  tools: [{ googleSearch: {} }],  // Enable web search
  systemInstruction: BASE_SYSTEM_INSTRUCTION + PERSONA_INSTRUCTIONS
}
```

### Input Schema

```typescript
interface SynthesisInput {
  prompt: string;              // User's text description
  fileBase64?: string;         // Optional image (base64)
  mimeType?: string;           // Image MIME type
  persona: DesignPersona;      // Design system preference
}
```

### Output Schema

```typescript
interface SynthesisOutput {
  html: string;                // Complete HTML document
  grounding?: GroundingSource[];  // Web sources used
}
```

### Decision Logic

1. **Input Analysis**
   - Parse prompt for intent (app, game, utility, dashboard)
   - If image provided, analyze visual structure and design patterns
   - Identify required interactivity and state management needs

2. **Architecture Selection**
   - Single-page or multi-section layout
   - Navigation patterns (none, tabs, sidebar, top nav)
   - Data display requirements (forms, tables, cards, lists)

3. **Design System Application**
   - Apply persona-specific styling rules
   - Generate color palettes based on persona
   - Select appropriate typography and spacing

4. **Code Generation**
   - Semantic HTML5 structure with proper landmarks
   - Tailwind CSS utilities (no custom CSS)
   - Vanilla JavaScript for interactivity (ES6+)
   - ARIA attributes for accessibility

5. **Quality Assurance**
   - Validate HTML structure
   - Ensure all interactive elements have labels
   - Apply focus states and hover effects
   - Test responsive breakpoints

### Example Prompts

**Text-only:**
```
"Create a minimalist task management app with a sidebar, 
drag-and-drop kanban board, and dark mode toggle."
```

**Image + Text:**
```
Image: [Hand-drawn wireframe]
Prompt: "Transform this sketch into a modern dashboard 
with real-time charts and data tables."
```

### Persona Behaviors

#### Modernist
- Inter font family
- Subtle gradients (gray-50 to gray-100)
- Minimal borders, high precision grids
- Ample whitespace (p-8, gap-6)
- Muted color palette (slate, zinc)

#### Brutalist
- Bold, oversized typography (text-4xl+)
- Ultra-high contrast (black/white)
- Intentional element overlapping
- Raw, unpolished aesthetic
- Minimal padding, aggressive scaling

#### Accessible
- WCAG 2.1 Level AAA compliance
- Contrast ratios ≥7:1 for normal text
- Large interactive targets (min-h-12)
- Explicit ARIA labeling on all controls
- Focus indicators with 3px outlines

#### Playful
- Vibrant, saturated colors (pink, purple, teal)
- High border-radius (rounded-2xl, rounded-3xl)
- Bouncy animations (ease-out transitions)
- Friendly, casual copy
- Emoji and icon-heavy

#### Enterprise
- Professional blue/slate palettes
- High information density
- Complex data tables with sorting
- Standard SaaS patterns (sidebar + header)
- Conservative, formal language

---

## Live Refinement Agent

### Purpose
Enables iterative improvement of artifacts through natural language or voice commands while maintaining design consistency and context.

### Model
**Gemini 3 Pro Preview** (`gemini-3-pro-preview`)

### Configuration
```typescript
{
  model: 'gemini-3-pro-preview',
  temperature: 0.1,
  thinkingBudget: 4000,
  history: ChatMessage[],  // Full conversation context
  systemInstruction: BASE_SYSTEM_INSTRUCTION + PERSONA_INSTRUCTIONS
}
```

### Input Schema

```typescript
interface RefinementInput {
  history: ChatMessage[];      // Full conversation history
  newPrompt: string;           // Latest refinement request
  persona: DesignPersona;      // Current design persona
  currentHtml?: string;        // For context (implicit via history)
}
```

### Output Schema

```typescript
interface RefinementOutput {
  html: string;                // Updated HTML artifact
  grounding?: GroundingSource[];
}
```

### Decision Logic

1. **Context Understanding**
   - Analyze full chat history for artifact evolution
   - Identify previous user requests and AI responses
   - Understand current state and structure

2. **Change Classification**
   - **Minor**: Color, spacing, text changes (preserve structure)
   - **Moderate**: Add/remove sections, rearrange layout
   - **Major**: Complete redesign, new functionality

3. **Scope Determination**
   - Localized: Single component or section
   - Section-wide: Multiple related components
   - Global: Entire artifact transformation

4. **Incremental Refinement**
   - Apply requested changes surgically
   - Maintain existing functionality
   - Preserve user's previous refinements
   - Update only affected areas

5. **Consistency Validation**
   - Ensure design persona alignment
   - Maintain color scheme coherence
   - Preserve interaction patterns
   - Validate accessibility standards

### Example Refinements

**Minor:**
```
"Make the buttons more rounded"
→ Updates button border-radius classes
```

**Moderate:**
```
"Add a pricing section with three tiers"
→ Inserts new section, maintains header/footer
```

**Major:**
```
"Redesign as a brutalist landing page"
→ Complete transformation with new persona
```

### Voice Integration

**Audio Processing:**
- Uses `gemini-2.5-flash-native-audio-preview-09-2025`
- Real-time audio streaming via WebRTC
- Continuous transcription to text
- Automatic refinement trigger on speech end

**Implementation:**
```typescript
// In services/live.ts
await liveDesignService.connect(
  (transcription) => {
    if (transcription.trim()) {
      refine(transcription, true);  // isVoice flag
    }
  },
  (error) => handleError(error)
);
```

---

## Documentation Generator Agent

### Purpose
Analyzes generated artifacts and produces structured technical documentation including purpose, I/O schemas, and internal logic.

### Model
**Gemini 3 Flash Preview** (`gemini-3-flash-preview`)

### Configuration
```typescript
{
  model: 'gemini-3-flash-preview',
  temperature: 0.2,
  systemInstruction: DOCS_SYSTEM_INSTRUCTION
}
```

### Input Schema

```typescript
interface DocsInput {
  html: string;               // Artifact to document
  metadata?: {
    name: string;
    type: ArtifactType;
    persona: DesignPersona;
  };
}
```

### Output Schema

```typescript
interface WorkflowDoc {
  purpose: string;           // High-level description
  ioSchema: string;          // Inputs/outputs, data flow
  internalLogic: string;     // Implementation details
  lastUpdated: string;       // ISO timestamp
}
```

### Decision Logic

1. **Code Analysis**
   - Identify main components and their roles
   - Detect state management patterns
   - Map data flow and event handlers
   - Recognize interaction patterns

2. **Purpose Extraction**
   - Classify artifact type (app, game, utility, dashboard)
   - Summarize primary use case
   - Identify target users

3. **I/O Schema Generation**
   - Document user inputs (forms, clicks, voice)
   - Describe outputs (visual changes, data displays)
   - Map state transformations

4. **Logic Documentation**
   - Explain JavaScript functions
   - Describe event handlers
   - Document data structures
   - Highlight edge cases

### Example Output

```json
{
  "purpose": "Task management kanban board with drag-and-drop functionality, 
              dark mode support, and real-time filtering.",
  "ioSchema": "Input: Task creation (text), drag events (mouse/touch), 
               filter selection (click). Output: Updated task positions, 
               filtered view, theme preference persistence.",
  "internalLogic": "Tasks stored in localStorage as JSON array. Drag handlers 
                    use HTML5 Drag & Drop API. Dark mode toggles 'dark' class 
                    on root element, triggering Tailwind dark: variants.",
  "lastUpdated": "2024-12-29T10:30:00Z"
}
```

---

## Accessibility Audit Agent

### Purpose
Performs real-time WCAG compliance scanning within the browser, identifying issues and generating remediation suggestions.

### Implementation
**Client-side JavaScript** (not Gemini-based)

### Execution Context
Runs in the preview iframe via injected script (`ACCESSIBILITY_AUDIT_SCRIPT` in `utils/injection.ts`)

### Audit Rules

1. **Critical Issues**
   - Missing alt text on images
   - Form inputs without labels
   - Buttons without accessible names
   - Insufficient color contrast (<4.5:1)
   - Missing main landmark
   - Inaccessible interactive elements

2. **Warnings**
   - Redundant ARIA roles
   - Empty headings
   - Skipped heading levels
   - Missing lang attribute
   - Non-unique IDs

3. **Informational**
   - Opportunities for ARIA enhancements
   - Semantic HTML suggestions
   - Keyboard navigation improvements

### Decision Logic

```javascript
// Simplified audit flow
function auditAccessibility() {
  const issues = [];
  
  // Check images
  document.querySelectorAll('img').forEach(img => {
    if (!img.alt) {
      issues.push({
        type: 'critical',
        element: 'img',
        message: 'Missing alt attribute',
        suggestion: 'Add descriptive alt text',
        selector: getSelector(img)
      });
    }
  });
  
  // Check contrast
  checkColorContrast();
  
  // Check ARIA
  validateARIA();
  
  // Check structure
  validateLandmarks();
  
  return issues;
}
```

### Auto-Heal Capability

The "Heal All" feature automatically applies fixes:

```javascript
function healAccessibilityIssues(issues) {
  issues.forEach(issue => {
    const element = document.querySelector(issue.selector);
    if (!element) return;
    
    switch (issue.type) {
      case 'missing-alt':
        element.alt = generateAltText(element);
        break;
      case 'missing-label':
        addLabel(element);
        break;
      case 'low-contrast':
        adjustContrast(element);
        break;
    }
  });
}
```

---

## Decision Logic & Flow

### Complete Generation Flow

```
User Input
    │
    ▼
┌─────────────────────┐
│  Input Validation   │
│  - File type check  │
│  - Prompt sanitize  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Base64 Encoding    │◄── fileHelpers.ts
│  - Image conversion │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Primary Synthesis   │◄── geminiService.generateArtifact()
│  - Model: Gemini 3  │
│  - Thinking: 4000   │
└──────────┬──────────┘
           │
           ├──► HTML Output
           │
           ▼
┌─────────────────────┐
│  Iframe Architect   │◄── useIframeContent hook
│  - Strip styles     │
│  - Inject Tailwind  │
│  - Add interactivity│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Live Preview       │
│  - Render iframe    │
│  - Enable chat      │
│  - Show dev tools   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   User Refinement   │
│  - Text/Voice input │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Refinement Agent    │◄── geminiService.refineArtifact()
│  - Context-aware    │
│  - Incremental      │
└──────────┬──────────┘
           │
           └──► Updated HTML → Loop
```

### Persona Selection Impact

```
Persona Change
    │
    ▼
┌─────────────────────┐
│  Update Prompt      │
│  - Append persona   │
│  - Modify system    │
│    instruction      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Regeneration       │
│  - Preserve content │
│  - Apply new style  │
│  - Maintain state   │
└─────────────────────┘
```

---

## Error Handling & Recovery

### API Errors

```typescript
try {
  const result = await geminiService.generateArtifact(...);
} catch (error) {
  if (error.message.includes('quota')) {
    // Quota exceeded
    showError('API quota exceeded. Try again later.');
  } else if (error.message.includes('API_KEY')) {
    // Missing/invalid key
    showError('API key not configured.');
  } else {
    // Generic error
    showError('Generation failed. Please try again.');
  }
}
```

### Network Errors

```typescript
// Exponential backoff with retry
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### State Recovery

```typescript
// LocalStorage persistence with quota handling
useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      // Prune large assets
      pruneHistory();
    }
  }
}, [history]);
```

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Load preview iframe only when needed
   - Defer documentation generation until panel opened

2. **Debouncing**
   - CSS editor updates debounced (300ms)
   - Theme changes debounced (100ms)

3. **Memoization**
   - Iframe content memoized with `useMemo`
   - Expensive computations cached

4. **Efficient Rendering**
   - Virtual scrolling for history (future enhancement)
   - Conditional rendering of dev tools

### Model Selection Rationale

| Task | Model | Why |
|------|-------|-----|
| Code Generation | Gemini 3 Pro | High reasoning, complex outputs |
| Refinement | Gemini 3 Pro | Context-aware, maintains quality |
| Documentation | Gemini 3 Flash | Fast, efficient for structured output |
| Voice | Gemini 2.5 Flash Audio | Native audio processing, real-time |

---

## Future Enhancements

### Planned Agent Additions

1. **Test Generation Agent**
   - Auto-generate Vitest tests
   - Cover edge cases
   - Integration tests

2. **Component Extraction Agent**
   - Identify reusable components
   - Generate React component files
   - Create component library

3. **Optimization Agent**
   - Analyze performance
   - Suggest improvements
   - Auto-apply optimizations

4. **Security Audit Agent**
   - Scan for XSS vulnerabilities
   - Check CSP compliance
   - Validate sanitization

5. **Multi-Language Agent**
   - Support additional frameworks (Vue, Svelte, Angular)
   - Generate backend code (Node, Python, Go)
   - Create full-stack applications

### Model Upgrades

- **Gemini 4 Pro**: When available, leverage enhanced reasoning
- **Custom Fine-tuned Models**: Train on high-quality artifact corpus
- **Specialized Models**: CSS-specific, JavaScript-specific models

### Agent Collaboration

Future versions will enable multi-agent collaboration:

```
User: "Create an e-commerce site"
    │
    ├──► Architecture Agent: Plans structure
    ├──► Design Agent: Creates UI
    ├──► Code Agent: Implements logic
    ├──► Test Agent: Generates tests
    └──► Security Agent: Audits code
```

---

## Conclusion

Manifestation Lab's agent architecture is designed for modularity, scalability, and continuous improvement. Each agent is specialized for its task, using appropriate models and configurations. The system balances quality output with performance, providing users with a powerful yet responsive code generation experience.

For implementation details, see:
- [services/gemini.ts](./services/gemini.ts) - Primary and refinement agents
- [services/live.ts](./services/live.ts) - Voice integration
- [services/docsService.ts](./services/docsService.ts) - Documentation generator
- [utils/injection.ts](./utils/injection.ts) - Accessibility audit script

For further questions or contributions, see [CONTRIBUTING.md](./CONTRIBUTING.md).
