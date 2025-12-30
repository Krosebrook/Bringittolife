# API Documentation

This document provides detailed documentation for the service layer APIs in Manifestation Lab.

## Table of Contents

1. [Gemini Service](#gemini-service)
2. [Live Design Service](#live-design-service)
3. [Documentation Service](#documentation-service)
4. [File Helpers](#file-helpers)
5. [React Converter](#react-converter)
6. [Injection Utilities](#injection-utilities)

---

## Gemini Service

**Location**: `services/gemini.ts`

The primary AI service that handles code generation, artifact refinement, and image generation using Google's Gemini models.

### Class: `GeminiService`

#### Method: `generateArtifact`

Generates a complete HTML artifact from a text prompt and optional image input.

**Signature**:
```typescript
async generateArtifact(
  prompt: string,
  fileBase64?: string,
  mimeType?: string,
  persona?: DesignPersona
): Promise<{ html: string; grounding?: any[] }>
```

**Parameters**:
- `prompt` (string): The text description of what to generate
- `fileBase64` (string, optional): Base64-encoded image data
- `mimeType` (string, optional): MIME type of the image (e.g., 'image/png')
- `persona` (DesignPersona, optional): Design system to apply (default: 'modernist')

**Returns**:
- Promise resolving to an object containing:
  - `html` (string): Generated HTML code
  - `grounding` (array, optional): Search grounding sources from Google Search

**Usage**:
```typescript
const { html, grounding } = await geminiService.generateArtifact(
  "Create a modern dashboard with charts",
  imageBase64,
  "image/png",
  "modernist"
);
```

**Models Used**:
- Primary: `gemini-3-pro-preview`
- Configuration: 
  - Temperature: 0.1 (high precision)
  - Thinking Budget: 4000 tokens
  - Google Search grounding enabled

**Error Handling**:
```typescript
try {
  const result = await geminiService.generateArtifact(prompt);
} catch (error) {
  if (error.message.includes('API_KEY')) {
    // Handle missing API key
  } else {
    // Handle generation failure
  }
}
```

---

#### Method: `refineArtifact`

Refines an existing artifact based on chat history and a new instruction.

**Signature**:
```typescript
async refineArtifact(
  history: ChatMessage[],
  newPrompt: string,
  persona?: DesignPersona
): Promise<{ html: string; grounding?: any[] }>
```

**Parameters**:
- `history` (ChatMessage[]): Previous conversation history
- `newPrompt` (string): New refinement instruction
- `persona` (DesignPersona, optional): Design system to maintain

**Returns**:
- Promise resolving to updated artifact with grounding sources

**Usage**:
```typescript
const { html, grounding } = await geminiService.refineArtifact(
  chatHistory,
  "Make the header blue and add a search bar"
);
```

**Models Used**:
- Chat-based: `gemini-3-pro-preview`
- Maintains context from previous messages

---

#### Method: `generateStarterImage`

Generates a high-quality UI mockup image from a text prompt.

**Signature**:
```typescript
async generateStarterImage(
  prompt: string
): Promise<GeneratedImageResult>
```

**Parameters**:
- `prompt` (string): Description of the UI to generate

**Returns**:
- Promise resolving to:
  - `base64` (string): Base64-encoded image data
  - `mimeType` (string): Image MIME type

**Usage**:
```typescript
const { base64, mimeType } = await geminiService.generateStarterImage(
  "E-commerce product page"
);
const imageUrl = `data:${mimeType};base64,${base64}`;
```

**Models Used**:
- Image generation: `gemini-2.5-flash-image`
- Enhanced prompt: Adds "High-fidelity, award-winning UI/UX mockup" prefix

---

### Design Personas

The service supports 5 design personas that influence the aesthetic output:

```typescript
const PERSONA_INSTRUCTIONS: Record<DesignPersona, string> = {
  modernist: "Clean typography, ample whitespace, subtle gradients",
  brutalist: "Bold typography, ultra-high contrast, raw layouts",
  accessible: "WCAG 2.1 AAA priority, high contrast, semantic ARIA",
  playful: "Vibrant palettes, organic borders, bouncy interactions",
  enterprise: "High information density, professional blue/slate palettes"
};
```

**Usage**:
```typescript
// Generate with specific persona
const result = await geminiService.generateArtifact(
  prompt,
  undefined,
  undefined,
  'brutalist'
);
```

---

### System Instructions

The base system instruction ensures:
1. **Output**: Complete, self-contained HTML5
2. **Styling**: Tailwind CSS exclusively
3. **Typography**: Prose-first with semantic HTML
4. **Layout**: `not-prose` class for UI components
5. **Interactivity**: Robust ES6+ JavaScript
6. **Accessibility**: ARIA labels on all interactive elements

---

## Live Design Service

**Location**: `services/live.ts`

Handles WebRTC-based audio streaming for voice-to-text artifact refinement.

### Class: `LiveDesignService`

#### Method: `connect`

Establishes a connection to the Gemini Live API for audio streaming.

**Signature**:
```typescript
async connect(
  onTranscription: (text: string) => void,
  onError: (error: Error) => void
): Promise<void>
```

**Parameters**:
- `onTranscription` (function): Callback for transcribed text
- `onError` (function): Error handler callback

**Usage**:
```typescript
await liveDesignService.connect(
  (transcription) => {
    console.log('User said:', transcription);
    // Apply refinement
  },
  (error) => {
    console.error('Voice error:', error);
  }
);
```

---

#### Method: `startListening`

Begins capturing audio from the user's microphone.

**Signature**:
```typescript
async startListening(): Promise<void>
```

**Requirements**:
- User must grant microphone permission
- Browser must support WebRTC and MediaDevices API

**Usage**:
```typescript
try {
  await liveDesignService.startListening();
} catch (error) {
  // Handle permission denied or unsupported browser
}
```

---

#### Method: `close`

Closes the audio connection and stops listening.

**Signature**:
```typescript
close(): void
```

**Usage**:
```typescript
liveDesignService.close();
```

---

### Models Used

- Audio processing: `gemini-2.5-flash-native-audio-preview-09-2025`
- Real-time transcription with low latency

---

## Documentation Service

**Location**: `services/docsService.ts`

Generates structured technical documentation for code artifacts.

### Class: `DocsService`

#### Method: `generateDocumentation`

Analyzes code and generates structured JSON documentation.

**Signature**:
```typescript
async generateDocumentation(
  code: string
): Promise<WorkflowDoc>
```

**Parameters**:
- `code` (string): HTML/JavaScript code to document

**Returns**:
- Promise resolving to:
  - `purpose` (string): High-level purpose
  - `ioSchema` (string): Input/output specification
  - `internalLogic` (string): Implementation details
  - `lastUpdated` (string): ISO timestamp

**Usage**:
```typescript
const doc = await docsService.generateDocumentation(artifactHtml);
console.log(doc.purpose);
```

**Models Used**:
- Analysis: `gemini-3-flash-preview`
- Output: Structured JSON format

---

## File Helpers

**Location**: `utils/fileHelpers.ts`

Utility functions for file operations.

### Function: `fileToBase64`

Converts a File object to a base64-encoded string.

**Signature**:
```typescript
async fileToBase64(file: File): Promise<string>
```

**Parameters**:
- `file` (File): File to convert

**Returns**:
- Promise resolving to base64 string (without data URI prefix)

**Usage**:
```typescript
const base64 = await fileToBase64(imageFile);
const dataUrl = `data:${imageFile.type};base64,${base64}`;
```

**Supported Formats**:
- Images: PNG, JPG, JPEG, GIF, WebP
- Documents: PDF
- Max size: Limited by browser memory

---

### Function: `downloadFile`

Triggers a browser download for a blob or data URL.

**Signature**:
```typescript
function downloadFile(
  content: Blob | string,
  filename: string
): void
```

**Parameters**:
- `content` (Blob | string): Content to download
- `filename` (string): Name of the downloaded file

**Usage**:
```typescript
// Download HTML
downloadFile(
  new Blob([htmlContent], { type: 'text/html' }),
  'artifact.html'
);

// Download from data URL
downloadFile(pdfDataUrl, 'artifact.pdf');
```

---

## React Converter

**Location**: `utils/reactConverter.ts`

Converts HTML strings to React component strings.

### Function: `convertToReact`

Transforms HTML into formatted React component code.

**Signature**:
```typescript
function convertToReact(html: string): string
```

**Parameters**:
- `html` (string): HTML string to convert

**Returns**:
- React component as a formatted string

**Features**:
- Converts `class` → `className`
- Converts `for` → `htmlFor`
- Extracts semantic components (header, nav, footer)
- Maps interactive elements to state
- Adds proper imports and exports

**Usage**:
```typescript
const reactCode = convertToReact(htmlString);
// Returns formatted React component ready for export
```

**Example Output**:
```jsx
import React, { useState } from 'react';

export function MyComponent() {
  const [uiState, setUiState] = useState({
    searchInput: '',
    emailInput: ''
  });

  return (
    <div className="container">
      <input
        type="text"
        value={uiState.searchInput}
        onChange={(e) => setUiState({...uiState, searchInput: e.target.value})}
      />
    </div>
  );
}
```

---

## Injection Utilities

**Location**: `utils/injection.ts`

Utilities for safely injecting content into iframes.

### Function: `createInjectionScript`

Creates a complete HTML document with injected dependencies.

**Signature**:
```typescript
function createInjectionScript(
  bodyHtml: string,
  customCss?: string,
  theme?: ThemeState
): string
```

**Parameters**:
- `bodyHtml` (string): HTML content for the body
- `customCss` (string, optional): Additional CSS rules
- `theme` (ThemeState, optional): Theme colors (HSL values)

**Returns**:
- Complete HTML document as a string

**Injections**:
- Tailwind CSS CDN
- Custom CSS variables for theming
- Prose styling for typography
- Interactive scripts (drag-and-drop, accessibility)

**Usage**:
```typescript
const iframeDoc = createInjectionScript(
  artifactHtml,
  '.custom { color: red; }',
  { h: 217, s: 91, l: 60 }
);

iframe.srcdoc = iframeDoc;
```

---

### Function: `sanitizeHtml`

Removes potentially dangerous HTML elements and attributes.

**Signature**:
```typescript
function sanitizeHtml(html: string): string
```

**Parameters**:
- `html` (string): HTML to sanitize

**Returns**:
- Sanitized HTML string

**Removes**:
- `<script>` tags
- Event handlers (onclick, onerror, etc.)
- `javascript:` URLs
- `data:` URLs in certain contexts

**Usage**:
```typescript
const safe = sanitizeHtml(userProvidedHtml);
```

**⚠️ Note**: This is basic sanitization. For production, consider using DOMPurify.

---

## Error Handling Patterns

All services follow consistent error handling:

```typescript
try {
  const result = await service.method();
  return result;
} catch (error) {
  console.error('[ServiceName]', error);
  throw new Error('User-friendly error message');
}
```

**Best Practices**:
- Log detailed errors for debugging
- Throw user-friendly messages
- Provide recovery suggestions
- Validate inputs before API calls

---

## Rate Limiting

**Current State**: No rate limiting implemented (client-side).

**Recommendation**: Implement server-side rate limiting:

```typescript
// Example: Simple token bucket
class RateLimiter {
  private tokens: number = 100;
  private lastRefill: number = Date.now();

  async checkLimit(): Promise<boolean> {
    this.refillTokens();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }

  private refillTokens() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(100, this.tokens + elapsed * 10);
    this.lastRefill = now;
  }
}
```

---

## Testing

**Recommended Testing Patterns**:

```typescript
// Mock Gemini service for tests
jest.mock('../services/gemini', () => ({
  geminiService: {
    generateArtifact: jest.fn().mockResolvedValue({
      html: '<div>Test</div>',
      grounding: []
    })
  }
}));

// Test component
test('generates artifact on submit', async () => {
  const onGenerate = jest.fn();
  render(<InputArea onGenerate={onGenerate} />);
  
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Test prompt' }
  });
  fireEvent.click(screen.getByText('Generate'));
  
  await waitFor(() => {
    expect(onGenerate).toHaveBeenCalledWith('Test prompt', undefined);
  });
});
```

---

## Performance Considerations

### Caching

Consider implementing response caching:

```typescript
const cache = new Map<string, { html: string; timestamp: number }>();

async function generateWithCache(prompt: string) {
  const cached = cache.get(prompt);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.html;
  }
  
  const { html } = await geminiService.generateArtifact(prompt);
  cache.set(prompt, { html, timestamp: Date.now() });
  return html;
}
```

### Debouncing

For refinement operations:

```typescript
import { debounce } from 'lodash';

const debouncedRefine = debounce(async (prompt: string) => {
  await geminiService.refineArtifact(history, prompt);
}, 1000);
```

---

## See Also

- [Architecture Documentation](./ARCHITECTURE.md)
- [Security Best Practices](./SECURITY.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
