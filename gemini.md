# Gemini API Integration Guide

Comprehensive guide for Google Gemini API usage in Manifestation Lab, including configuration, best practices, prompt engineering, and troubleshooting.

---

## Table of Contents

1. [Overview](#overview)
2. [API Setup & Configuration](#api-setup--configuration)
3. [Model Selection Guide](#model-selection-guide)
4. [Prompt Engineering](#prompt-engineering)
5. [Advanced Features](#advanced-features)
6. [Error Handling](#error-handling)
7. [Rate Limits & Quotas](#rate-limits--quotas)
8. [Security Best Practices](#security-best-practices)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Manifestation Lab leverages multiple Google Gemini models for different AI tasks. The integration is built on the `@google/genai` SDK (v1.28.0) and employs advanced features like thinking budgets, web search grounding, and multi-modal processing.

### Models in Use

| Model | Purpose | Key Features |
|-------|---------|--------------|
| `gemini-3-pro-preview` | Code generation & refinement | High reasoning, 4000 thinking budget, web search |
| `gemini-3-flash-preview` | Documentation generation | Fast, efficient, structured output |
| `gemini-2.5-flash-native-audio-preview-09-2025` | Voice input processing | Native audio, real-time streaming |

---

## API Setup & Configuration

### 1. Obtain API Key

Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to generate your API key.

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
# .env
GEMINI_API_KEY=your_api_key_here
```

**Important:** Never commit `.env` to version control. Add it to `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

### 3. Vite Configuration

The API key is injected at build time via `vite.config.ts`:

```typescript
// vite.config.ts
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    }
  };
});
```

### 4. Service Initialization

```typescript
// services/gemini.ts
import { GoogleGenAI } from "@google/genai";

class GeminiService {
  private getClient(): GoogleGenAI {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY execution context missing.");
    }
    return new GoogleGenAI({ apiKey });
  }
}
```

---

## Model Selection Guide

### Gemini 3 Pro Preview

**Use when:**
- Complex code generation required
- High-quality, production-ready output needed
- Multi-modal input (image + text)
- Deep reasoning and planning necessary

**Configuration:**
```typescript
{
  model: 'gemini-3-pro-preview',
  temperature: 0.1,              // Low for consistency
  thinkingBudget: 4000,          // High for complex tasks
  tools: [{ googleSearch: {} }], // Enable web search
  topP: 0.95,                    // Nucleus sampling
  topK: 40,                      // Top-K sampling
  maxOutputTokens: 8192          // Maximum response length
}
```

**Best for:**
- Initial artifact generation
- Complex refinements
- Multi-step transformations
- Architectural decisions

**Cost:** Higher (premium model)

### Gemini 3 Flash Preview

**Use when:**
- Fast response times critical
- Structured output needed (JSON)
- Documentation generation
- Simpler tasks with clear requirements

**Configuration:**
```typescript
{
  model: 'gemini-3-flash-preview',
  temperature: 0.2,              // Slightly higher for variety
  maxOutputTokens: 4096          // Adequate for docs
}
```

**Best for:**
- Technical documentation
- Code analysis
- Metadata extraction
- Quick validations

**Cost:** Lower (efficient model)

### Gemini 2.5 Flash Native Audio

**Use when:**
- Processing voice input
- Real-time audio streaming
- Transcription needed

**Configuration:**
```typescript
{
  model: 'gemini-2.5-flash-native-audio-preview-09-2025',
  temperature: 0.3,
  enableAudioStreaming: true
}
```

**Best for:**
- Voice commands
- Audio transcription
- Real-time interaction

**Cost:** Moderate (streaming-based)

---

## Prompt Engineering

### System Instructions

**Purpose:** Define the AI's role, capabilities, and constraints.

**Current System Instruction:**
```typescript
const BASE_SYSTEM_INSTRUCTION = `You are a world-class AI Software Architect and Lead Designer at the Manifestation Lab. 
Your mission is to transfigure user intent into production-grade, high-fidelity interactive digital artifacts.

CORE ARCHITECTURAL PRINCIPLES:
1. OUTPUT: Return ONLY a complete, self-contained HTML5 file. 
2. STYLING: Exclusively use Tailwind CSS.
3. TYPOGRAPHY: The environment is 'Prose-First'. All semantic tags (h1-h6, p, ul, ol, blockquote) are automatically styled to high-fidelity standards.
4. LAYOUT: For complex UI components (navigation bars, buttons, sidebars) that should NOT inherit typographic margins or styles, apply the 'not-prose' class to their container.
5. INTERACTIVITY: Implement robust ES6+ JavaScript. Handle state changes smoothly.
6. ACCESSIBILITY: Every interactive element MUST have an aria-label.

AESTHETIC GUARDRAILS:
- Use sophisticated typography (Inter).
- Ensure focus states are beautifully styled (glow/ring).
- Buttons must have distinct :hover and :active states.

FORMATTING: Output only raw code. No markdown code blocks. Start directly with <!DOCTYPE html>.`;
```

**Design Persona Extensions:**
```typescript
const PERSONA_INSTRUCTIONS: Record<DesignPersona, string> = {
  modernist: "Focus on clean typography (Inter), ample whitespace, and subtle gradients. High precision grids with minimal borders.",
  brutalist: "Bold, oversized typography, ultra-high contrast, raw layouts, and intentional overlapping elements.",
  accessible: "WCAG 2.1 Level AAA priority. High contrast ratios, large interactive targets, and semantic ARIA labeling.",
  playful: "Vibrant palettes, organic border-radials (32px+), bouncy micro-interactions, and friendly copy.",
  enterprise: "High information density, professional blue/slate palettes, complex data tables, and standard SaaS patterns."
};
```

### Effective User Prompts

#### ✅ Good Prompts

**Specific and Detailed:**
```
"Create a dark-themed project management dashboard with:
- Left sidebar navigation (Projects, Tasks, Calendar, Settings)
- Main content area with a kanban board (To Do, In Progress, Done)
- Each task card shows title, assignee avatar, due date, and priority badge
- Top header with search bar, notification bell, and user profile
- Use indigo as the primary accent color"
```

**Context-Rich:**
```
"Transform this hand-drawn wireframe into a modern blog layout:
- Hero section with large featured image and title overlay
- 3-column grid of recent posts with thumbnails and excerpts
- Sidebar with author bio, social links, and newsletter signup
- Sticky header with logo and navigation
- Follow the modernist design persona"
```

**Constraint-Defined:**
```
"Build an accessible contact form (WCAG AAA):
- Name, email, subject, message fields
- All inputs have explicit labels and aria-describedby for errors
- High contrast colors (7:1 ratio minimum)
- Large clickable targets (48px minimum)
- Clear focus indicators
- Success/error messages with icons and text"
```

#### ❌ Poor Prompts

**Too Vague:**
```
"Make a website"
"Create something cool"
"Design an app"
```

**Conflicting Requirements:**
```
"Create a minimalist dashboard but add lots of features and colors"
"Make it simple yet complex"
```

**Unrealistic Expectations:**
```
"Build a full e-commerce platform with user authentication, payment processing, 
inventory management, and admin panel in a single HTML file"
```

### Refinement Prompts

**Minor Changes:**
```
"Make the buttons slightly larger"
"Change the accent color to teal"
"Increase spacing between sections"
```

**Structural Changes:**
```
"Add a pricing section with three tiers (Basic, Pro, Enterprise)"
"Replace the sidebar with a top navigation bar"
"Convert the grid layout to a masonry style"
```

**Feature Additions:**
```
"Add a dark mode toggle button that switches between light and dark themes"
"Implement a search filter that shows/hides items based on input"
"Add a modal dialog that opens when clicking the 'Learn More' button"
```

---

## Advanced Features

### Web Search Grounding

Enable real-time web search for up-to-date information:

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-pro-preview',
  contents: { parts: [{ text: prompt }] },
  config: {
    tools: [{ googleSearch: {} }]  // Enable search
  }
});

// Access grounding sources
const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
```

**Use cases:**
- Current design trends
- Latest framework features
- Real-world examples
- Best practices

**Benefits:**
- More accurate, current outputs
- Verifiable sources
- Reduces hallucinations

### Thinking Budget

Allocate computational resources for complex reasoning:

```typescript
{
  thinkingConfig: { 
    thinkingBudget: 4000  // Higher = more reasoning
  }
}
```

**Guidelines:**
- Simple tasks: 1000-2000
- Moderate complexity: 2000-3000
- High complexity: 3000-4000
- Maximum: 8000 (rarely needed)

**Impact:**
- Better architectural decisions
- More coherent large outputs
- Improved edge case handling
- Longer generation time

### Multi-Modal Input

Process images alongside text:

```typescript
const parts: Part[] = [
  { text: "Convert this design into code:" },
  { 
    inlineData: { 
      data: imageBase64,  // Base64 without data URI prefix
      mimeType: 'image/png' 
    } 
  }
];

await ai.models.generateContent({
  model: 'gemini-3-pro-preview',
  contents: { parts }
});
```

**Supported formats:**
- PNG, JPEG, GIF, WEBP
- PDF (first page rendered)
- SVG (as image)

**Best practices:**
- Keep images under 4MB
- Use high-resolution for details
- Provide text context
- Specify what to focus on

### Chat-Based Refinement

Maintain conversation context:

```typescript
const chatHistory = history.map(h => ({
  role: h.role === 'user' ? 'user' : 'model',
  parts: [{ text: h.text }]
}));

const chat = ai.chats.create({
  model: 'gemini-3-pro-preview',
  config: { systemInstruction },
  history: chatHistory
});

const response = await chat.sendMessage(newPrompt);
```

**Benefits:**
- Incremental refinements
- Context preservation
- Coherent evolution
- Efficient token usage

---

## Error Handling

### Common Errors

#### 1. API Key Issues

```typescript
Error: "API_KEY execution context missing."
```

**Causes:**
- Missing `.env` file
- Incorrect env variable name
- Not restarted dev server after adding key

**Solution:**
```bash
# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env

# Restart dev server
npm run dev
```

#### 2. Quota Exceeded

```typescript
Error: "Quota exceeded for quota metric 'Generate Content API requests per minute'"
```

**Causes:**
- Too many requests in short time
- Free tier limits reached

**Solution:**
```typescript
// Implement exponential backoff
async function withRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('quota') && i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      } else {
        throw error;
      }
    }
  }
}
```

#### 3. Invalid Request

```typescript
Error: "Invalid value for parameter 'parts': must not be empty"
```

**Causes:**
- Empty prompt
- Missing required parameters
- Invalid base64 encoding

**Solution:**
```typescript
// Validate input before sending
function validateRequest(prompt: string, file?: string) {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty");
  }
  if (file && !isValidBase64(file)) {
    throw new Error("Invalid image encoding");
  }
}
```

#### 4. Content Filtering

```typescript
Error: "Content filtered for safety reasons"
```

**Causes:**
- Prompt contains harmful content
- Generated output violates policies

**Solution:**
```typescript
// Check safety ratings
const safetyRatings = response.candidates?.[0]?.safetyRatings;
if (!response.text) {
  console.error("Content filtered:", safetyRatings);
  showUserError("Content violated safety policies. Please rephrase.");
}
```

### Error Recovery Patterns

```typescript
class GeminiService {
  async generateArtifact(prompt: string) {
    try {
      return await this._generate(prompt);
    } catch (error) {
      // Log for debugging
      console.error("[Gemini] Generation failed:", error);
      
      // User-friendly error
      if (error.message.includes('quota')) {
        throw new Error("API quota exceeded. Please try again in a few minutes.");
      } else if (error.message.includes('API_KEY')) {
        throw new Error("API configuration error. Check your API key.");
      } else if (error.message.includes('filtered')) {
        throw new Error("Content moderation triggered. Please rephrase your request.");
      } else {
        throw new Error("Generation failed. Please try again.");
      }
    }
  }
}
```

---

## Rate Limits & Quotas

### Free Tier Limits

| Resource | Limit |
|----------|-------|
| Requests per minute | 15 RPM |
| Requests per day | 1,500 RPD |
| Tokens per minute | 32,000 TPM |
| Tokens per day | 50,000 TPD |

### Paid Tier Limits

| Resource | Limit |
|----------|-------|
| Requests per minute | 360 RPM |
| Requests per day | Unlimited |
| Tokens per minute | 4,000,000 TPM |

### Optimization Strategies

**1. Request Batching**
```typescript
// Instead of multiple calls
await generate(prompt1);
await generate(prompt2);
await generate(prompt3);

// Batch when possible
await generate([prompt1, prompt2, prompt3].join('\n\n'));
```

**2. Caching**
```typescript
const cache = new Map<string, string>();

async function cachedGenerate(prompt: string) {
  const key = hashPrompt(prompt);
  if (cache.has(key)) {
    return cache.get(key);
  }
  const result = await generate(prompt);
  cache.set(key, result);
  return result;
}
```

**3. Smart Model Selection**
```typescript
// Use Flash for simple tasks
if (isSimpleTask(prompt)) {
  return flashModel.generate(prompt);
} else {
  return proModel.generate(prompt);
}
```

---

## Security Best Practices

### 1. Never Expose API Keys Client-Side

**❌ Bad:**
```typescript
// Embedded in code
const apiKey = "AIzaSyC...";
const ai = new GoogleGenAI({ apiKey });
```

**✅ Good:**
```typescript
// Server-side proxy
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ prompt })
});
```

### 2. Implement Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 15;
  private readonly windowMs = 60000;

  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      throw new Error("Rate limit exceeded");
    }
    
    this.requests.push(now);
  }
}
```

### 3. Sanitize Inputs

```typescript
function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .slice(0, 10000); // Max length
}
```

### 4. Validate Outputs

```typescript
function validateHTML(html: string): boolean {
  // Check for malicious patterns
  if (html.includes('<script>')) return false;
  if (html.includes('javascript:')) return false;
  if (html.includes('onerror=')) return false;
  return true;
}
```

---

## Performance Optimization

### 1. Streaming Responses

```typescript
// For real-time output (future enhancement)
const stream = await ai.models.generateContentStream({
  model: 'gemini-3-pro-preview',
  contents: { parts: [{ text: prompt }] }
});

for await (const chunk of stream) {
  updateUI(chunk.text);
}
```

### 2. Parallel Requests

```typescript
// Generate multiple artifacts simultaneously
const [artifact1, artifact2, artifact3] = await Promise.all([
  generate(prompt1),
  generate(prompt2),
  generate(prompt3)
]);
```

### 3. Lazy Loading

```typescript
// Only load Gemini client when needed
let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
}
```

### 4. Response Compression

```typescript
// Compress large responses for storage
function compressHTML(html: string): string {
  return html
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}
```

---

## Troubleshooting

### Issue: Slow Generation Times

**Symptoms:** Requests take 15-30+ seconds

**Causes:**
- High thinking budget
- Complex prompts
- Large images
- Network latency

**Solutions:**
1. Reduce thinking budget for simpler tasks
2. Break complex prompts into steps
3. Resize images before sending
4. Use faster models (Flash) when appropriate

### Issue: Inconsistent Outputs

**Symptoms:** Same prompt gives very different results

**Causes:**
- High temperature setting
- Insufficient context
- Vague prompts

**Solutions:**
1. Lower temperature (0.1-0.2)
2. Provide more context in prompt
3. Use system instructions for consistency
4. Add explicit constraints

### Issue: API Timeouts

**Symptoms:** Requests fail with timeout errors

**Causes:**
- Server-side processing delays
- Network issues
- Very large requests

**Solutions:**
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000);

try {
  const response = await fetch(url, { 
    signal: controller.signal 
  });
} finally {
  clearTimeout(timeoutId);
}
```

### Issue: Memory Leaks

**Symptoms:** Browser slowdown over time

**Causes:**
- Unclosed connections
- Large cached data
- Event listener accumulation

**Solutions:**
```typescript
// Clean up connections
useEffect(() => {
  const service = createService();
  return () => service.close();
}, []);

// Limit cache size
const MAX_CACHE_SIZE = 50;
if (cache.size > MAX_CACHE_SIZE) {
  const oldestKey = cache.keys().next().value;
  cache.delete(oldestKey);
}
```

---

## Best Practices Summary

### DO ✅

- Use environment variables for API keys
- Implement proper error handling
- Cache responses when appropriate
- Monitor quota usage
- Validate inputs and outputs
- Use appropriate models for tasks
- Provide clear, specific prompts
- Test with various inputs
- Log errors for debugging
- Implement rate limiting

### DON'T ❌

- Expose API keys in client code
- Ignore error responses
- Send unvalidated user input
- Use Pro model for simple tasks
- Make excessive API calls
- Trust all AI outputs blindly
- Use extremely high thinking budgets unnecessarily
- Skip input sanitization
- Hardcode prompts without testing
- Ignore safety ratings

---

## Additional Resources

### Official Documentation
- [Gemini API Documentation](https://ai.google.dev/docs)
- [API Reference](https://ai.google.dev/api)
- [Pricing](https://ai.google.dev/pricing)
- [Safety Settings](https://ai.google.dev/docs/safety_setting_gemini)

### Manifestation Lab Resources
- [Primary Service Implementation](./services/gemini.ts)
- [Voice Service](./services/live.ts)
- [Documentation Service](./services/docsService.ts)
- [Agent Architecture](./agents.md)

### Support
- [GitHub Issues](https://github.com/Krosebrook/Bringittolife/issues)
- [Contributing Guide](./CONTRIBUTING.md)

---

**Last Updated:** December 29, 2024  
**Gemini SDK Version:** @google/genai v1.28.0  
**API Version:** v1 (beta)
