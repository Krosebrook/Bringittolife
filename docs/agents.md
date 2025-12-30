# Agent Architecture Documentation

Understanding the intelligent systems and automated processes in Manifestation Lab.

## Table of Contents

1. [Overview](#overview)
2. [Agent Types](#agent-types)
3. [Live Refinement Agent](#live-refinement-agent)
4. [Documentation Generation Agent](#documentation-generation-agent)
5. [Accessibility Audit Agent](#accessibility-audit-agent)
6. [CSS Analysis Agent](#css-analysis-agent)
7. [Pipeline Simulation Agent](#pipeline-simulation-agent)
8. [Future Agents](#future-agents)

---

## Overview

Manifestation Lab employs multiple "agents" - intelligent systems that automate specific tasks within the application. These agents leverage AI models, static analysis, and rule-based systems to enhance the development experience.

### What is an Agent?

An **agent** in this context is:
- An autonomous system that performs a specific task
- Potentially powered by AI, rules, or both
- Integrated into the user workflow
- Self-contained with clear inputs and outputs

### Design Principles

1. **Single Responsibility**: Each agent handles one concern
2. **Composability**: Agents can be chained together
3. **Transparency**: Users see what agents are doing
4. **Configurability**: Agents have adjustable parameters
5. **Graceful Degradation**: Failures don't break the app

---

## Agent Types

### Generative Agents

**Purpose**: Create new content from scratch

**Examples**:
- Initial artifact generation from image
- Text-to-image mockup generation
- Documentation generation

**Technology**: AI models (Gemini)

---

### Refinement Agents

**Purpose**: Iteratively improve existing content

**Examples**:
- Chat-based artifact refinement
- Voice command application
- CSS optimization suggestions

**Technology**: AI models + context management

---

### Analysis Agents

**Purpose**: Inspect and report on content quality

**Examples**:
- Accessibility audit
- CSS linting
- Performance analysis

**Technology**: Static analysis + rules engines

---

### Simulation Agents

**Purpose**: Predict or simulate system behavior

**Examples**:
- CI/CD pipeline preview
- Performance profiling
- Deployment simulation

**Technology**: Deterministic algorithms

---

## Live Refinement Agent

### Purpose

Enable real-time, conversational artifact modification through text and voice input.

### Architecture

```
User Input (Text/Voice)
       ↓
  Input Handler
       ↓
Context Assembly (Chat History + Current Artifact)
       ↓
  Gemini API Call
       ↓
HTML Response Extraction
       ↓
  State Update
       ↓
Iframe Re-render
```

### Implementation

**Location**: `hooks/useCreation.ts` → `refine()` method

**Input Schema**:
```typescript
interface RefineInput {
  prompt: string;        // User instruction
  isVoice: boolean;      // Voice vs. text input
  history: ChatMessage[]; // Conversation context
  persona: DesignPersona; // Design system
}
```

**Output Schema**:
```typescript
interface RefineOutput {
  html: string;                // Updated artifact
  grounding?: GroundingSource[]; // Reference sources
  timestamp: Date;             // Update time
}
```

### Decision Logic

1. **Context Building**:
   - Retrieve full chat history
   - Include current artifact state
   - Apply persona instructions

2. **Prompt Enhancement**:
   - Add system instructions
   - Inject design persona preferences
   - Include accessibility guidelines

3. **Response Processing**:
   - Extract HTML from response
   - Parse grounding metadata
   - Update chat history

4. **State Management**:
   - Update active creation
   - Persist to localStorage
   - Trigger re-render

### Voice Pipeline

```
Microphone → MediaDevices API → WebRTC Stream
                                      ↓
                          Gemini Live API (Audio Model)
                                      ↓
                              Transcription
                                      ↓
                          Refinement Agent
```

**Key Features**:
- Real-time streaming (no recording delay)
- Automatic transcription
- Context-aware interpretation
- Low latency (<2 seconds)

### Error Handling

```typescript
try {
  const result = await refineArtifact(history, prompt);
  setState({ success: true, data: result });
} catch (error) {
  if (error.type === 'QUOTA_EXCEEDED') {
    // Show rate limit message
  } else if (error.type === 'INVALID_RESPONSE') {
    // Request clarification
  } else {
    // Generic error with recovery options
  }
}
```

### Performance Considerations

- **Debouncing**: Prevent rapid-fire requests
- **Context Pruning**: Limit history to last 10 messages
- **Caching**: Store recent responses
- **Optimistic Updates**: Show loading state immediately

---

## Documentation Generation Agent

### Purpose

Automatically generate technical documentation for artifacts.

### Architecture

```
Artifact HTML/JS
       ↓
Code Analysis
       ↓
Pattern Recognition
       ↓
 Gemini API Call
       ↓
Structured JSON Output
       ↓
UI Rendering
```

### Implementation

**Location**: `services/docsService.ts`

**Input Schema**:
```typescript
interface DocsInput {
  code: string;  // Full artifact code
  type: 'html' | 'react';
}
```

**Output Schema**:
```typescript
interface WorkflowDoc {
  purpose: string;        // High-level purpose
  ioSchema: string;       // Input/output specification
  internalLogic: string;  // Implementation details
  lastUpdated: string;    // ISO timestamp
}
```

### Decision Logic

1. **Code Parsing**:
   - Identify structure (semantic HTML)
   - Extract JavaScript functions
   - Map data flow

2. **Pattern Matching**:
   - Recognize common UI patterns (forms, tables, etc.)
   - Identify state management patterns
   - Detect API calls

3. **Documentation Generation**:
   - Write purpose statement
   - Document inputs/outputs
   - Explain logic flow

### Prompt Template

```
Analyze the following code and generate structured documentation:

CODE:
{artifact_code}

Return JSON with:
1. purpose: What does this code do? (1-2 sentences)
2. ioSchema: What are the inputs and outputs?
3. internalLogic: How does it work internally? (key steps)

Format: Pure JSON, no markdown.
```

### Usage

```typescript
const doc = await docsService.generateDocumentation(artifactHtml);

// Display in UI
<div className="documentation">
  <h3>Purpose</h3>
  <p>{doc.purpose}</p>
  
  <h3>I/O Schema</h3>
  <pre>{doc.ioSchema}</pre>
  
  <h3>Internal Logic</h3>
  <p>{doc.internalLogic}</p>
</div>
```

---

## Accessibility Audit Agent

### Purpose

Scan artifacts for WCAG compliance issues and suggest fixes.

### Architecture

```
Artifact HTML
       ↓
 DOM Parsing
       ↓
Rule Engine (WCAG 2.1)
       ↓
Issue Detection
       ↓
Fix Suggestions
       ↓
UI Reporting
```

### Implementation

**Location**: `utils/injection.ts` (injected script) + `components/live/AccessibilityPanel.tsx`

**Audit Rules**:

1. **Color Contrast**
   - Minimum ratio: 4.5:1 (AA) or 7:1 (AAA)
   - Check text vs. background
   - Flag low contrast elements

2. **ARIA Labels**
   - All interactive elements must have labels
   - Buttons, links, inputs need descriptive text
   - Form fields require associated labels

3. **Keyboard Navigation**
   - Tab order must be logical
   - All actions accessible via keyboard
   - Focus indicators visible

4. **Semantic HTML**
   - Use appropriate tags (`<nav>`, `<main>`, `<button>`)
   - Heading hierarchy preserved
   - Lists for list content

5. **Alt Text**
   - All images need alt attributes
   - Decorative images: `alt=""`
   - Informative images: descriptive alt text

### Issue Schema

```typescript
interface AccessibilityIssue {
  id: string;              // Unique identifier
  type: 'critical' | 'warning' | 'info';
  element: string;         // Element description
  message: string;         // What's wrong
  suggestion: string;      // How to fix
  selector: string;        // CSS selector
}
```

### Decision Logic

```typescript
function auditAccessibility(doc: Document): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check 1: Color contrast
  doc.querySelectorAll('*').forEach(el => {
    const contrast = calculateContrast(el);
    if (contrast < 4.5) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'critical',
        element: el.tagName,
        message: `Low contrast ratio: ${contrast.toFixed(2)}`,
        suggestion: 'Increase color contrast to at least 4.5:1',
        selector: getCssSelector(el)
      });
    }
  });
  
  // Check 2: Missing ARIA labels
  doc.querySelectorAll('button, a, input').forEach(el => {
    if (!hasAccessibleName(el)) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'critical',
        element: el.tagName,
        message: 'Interactive element missing accessible name',
        suggestion: 'Add aria-label or text content',
        selector: getCssSelector(el)
      });
    }
  });
  
  // Additional checks...
  
  return issues;
}
```

### Auto-Fix Feature

Some issues can be automatically fixed:

```typescript
function autoFixIssues(issues: AccessibilityIssue[]): string[] {
  const fixes: string[] = [];
  
  issues.forEach(issue => {
    if (issue.type === 'missing-alt') {
      // Add alt="" to decorative images
      fixes.push(`${issue.selector} { add: alt="" }`);
    }
    
    if (issue.type === 'low-contrast') {
      // Increase text darkness
      fixes.push(`${issue.selector} { color: #000000 !important }`);
    }
  });
  
  return fixes;
}
```

---

## CSS Analysis Agent

### Purpose

Analyze custom CSS for issues and suggest improvements.

### Architecture

```
Custom CSS
     ↓
Tokenization
     ↓
Rule Validation
     ↓
Best Practice Check
     ↓
Suggestions
```

### Implementation

**Location**: `components/live/CssEditorPanel.tsx`

**Checks**:

1. **Syntax Errors**
   - Missing semicolons
   - Unmatched brackets
   - Invalid properties

2. **Best Practices**
   - Avoid `!important` (except accessibility overrides)
   - Use CSS variables for colors
   - Prefer classes over IDs for styling
   - Mobile-first media queries

3. **Performance**
   - Avoid expensive selectors (`*`, deep nesting)
   - Minimize reflows (layout thrashing)
   - Use `will-change` sparingly

4. **Accessibility**
   - Don't use `display: none` for screen reader content
   - Ensure focus styles aren't removed
   - Respect `prefers-reduced-motion`

### Linting Rules

```typescript
const CSS_LINT_RULES = [
  {
    id: 'no-important',
    severity: 'warning',
    message: 'Avoid !important unless absolutely necessary',
    pattern: /!important/g
  },
  {
    id: 'color-variables',
    severity: 'info',
    message: 'Consider using CSS variables for colors',
    check: (css) => {
      const hexColors = css.match(/#[0-9A-Fa-f]{6}/g);
      return hexColors && hexColors.length > 3;
    }
  },
  {
    id: 'universal-selector',
    severity: 'warning',
    message: 'Universal selector (*) can impact performance',
    pattern: /\*\s*\{/g
  }
];
```

### Auto-Fix

```typescript
function autoFixCss(css: string): string {
  let fixed = css;
  
  // Remove !important
  fixed = fixed.replace(/\s*!important/g, '');
  
  // Convert hex to CSS variables
  const hexColors = new Set(fixed.match(/#[0-9A-Fa-f]{6}/g));
  hexColors.forEach((color, index) => {
    fixed = fixed.replace(
      new RegExp(color, 'g'),
      `var(--color-${index})`
    );
  });
  
  return fixed;
}
```

---

## Pipeline Simulation Agent

### Purpose

Simulate CI/CD pipeline steps to preview production readiness.

### Architecture

```
Artifact Code
     ↓
Step Definition
     ↓
Sequential Execution
     ↓
Status Updates
     ↓
Results Display
```

### Implementation

**Location**: `components/live/CiCdPanel.tsx`

**Pipeline Steps**:

```typescript
const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'lint',
    name: 'ESLint',
    type: 'lint',
    duration: 2000,
    checks: ['syntax', 'best-practices', 'accessibility']
  },
  {
    id: 'type-check',
    name: 'TypeScript',
    type: 'test',
    duration: 3000,
    checks: ['type-safety']
  },
  {
    id: 'build',
    name: 'Build',
    type: 'build',
    duration: 5000,
    checks: ['compilation', 'optimization']
  },
  {
    id: 'deploy',
    name: 'Deploy Preview',
    type: 'deploy',
    duration: 4000,
    checks: ['upload', 'dns', 'ssl']
  }
];
```

### Execution Logic

```typescript
async function simulatePipeline(code: string): Promise<PipelineResult> {
  const results: StepResult[] = [];
  
  for (const step of PIPELINE_STEPS) {
    const result = await executeStep(step, code);
    results.push(result);
    
    if (result.status === 'failed') {
      break; // Stop on first failure
    }
  }
  
  return { results, success: results.every(r => r.status === 'success') };
}
```

### Step Execution

```typescript
async function executeStep(
  step: PipelineStep, 
  code: string
): Promise<StepResult> {
  
  const startTime = Date.now();
  
  try {
    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, step.duration));
    
    // Run actual checks
    const checks = await runStepChecks(step, code);
    
    return {
      stepId: step.id,
      status: checks.every(c => c.passed) ? 'success' : 'failed',
      duration: Date.now() - startTime,
      logs: checks.map(c => c.message)
    };
  } catch (error) {
    return {
      stepId: step.id,
      status: 'failed',
      duration: Date.now() - startTime,
      logs: [error.message]
    };
  }
}
```

---

## Future Agents

### Planned Enhancements

#### 1. Performance Profiler Agent
- Analyze runtime performance
- Identify bottlenecks
- Suggest optimizations
- Lighthouse integration

#### 2. SEO Optimization Agent
- Check meta tags
- Validate structured data
- Analyze content structure
- Generate SEO report

#### 3. Responsive Design Agent
- Test across breakpoints
- Identify layout issues
- Suggest mobile improvements
- Preview multiple devices simultaneously

#### 4. Security Scanner Agent
- Detect XSS vulnerabilities
- Check CSP compliance
- Validate input sanitization
- OWASP Top 10 coverage

#### 5. Collaboration Agent
- Multi-user editing
- Conflict resolution
- Change attribution
- Real-time synchronization

#### 6. Version Control Agent
- Artifact versioning
- Diff visualization
- Rollback capabilities
- Branch management

#### 7. Testing Agent
- Generate unit tests
- E2E test scaffolding
- Visual regression testing
- Accessibility testing automation

#### 8. Deployment Agent
- One-click deployment
- Platform integration (Vercel, Netlify, etc.)
- Environment configuration
- Domain management

---

## Agent Communication

Agents can communicate via shared state:

```typescript
interface AgentContext {
  artifact: Creation;
  history: ChatMessage[];
  config: AppConfig;
  emit: (event: AgentEvent) => void;
}

interface AgentEvent {
  type: string;
  source: string;
  data: any;
  timestamp: Date;
}
```

**Example**:
```typescript
// Accessibility Agent finds issues
accessibilityAgent.emit({
  type: 'issues_found',
  source: 'accessibility-agent',
  data: { issues: [...] },
  timestamp: new Date()
});

// CSS Agent listens and applies fixes
cssAgent.on('issues_found', (event) => {
  if (event.data.issues.some(i => i.type === 'contrast')) {
    applyContrastFixes();
  }
});
```

---

## Best Practices

### Agent Development

1. **Define clear interfaces**: Inputs and outputs should be well-typed
2. **Handle errors gracefully**: Don't break the app on agent failure
3. **Provide feedback**: Show progress, not just results
4. **Make agents optional**: Core functionality shouldn't depend on agents
5. **Test independently**: Unit test agents in isolation

### Agent Integration

1. **Lazy load agents**: Don't load all agents upfront
2. **Cache results**: Don't re-run expensive operations
3. **Respect user preferences**: Allow disabling agents
4. **Monitor performance**: Track agent execution time
5. **Log strategically**: Help debugging without noise

---

## See Also

- [Gemini Integration Guide](./gemini.md)
- [API Documentation](../API.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

**Last Updated**: 2024-12-30
