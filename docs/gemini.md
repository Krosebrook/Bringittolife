# Gemini AI Integration Guide

Complete guide to using Google Gemini AI in Manifestation Lab.

## Table of Contents

1. [Overview](#overview)
2. [Model Selection](#model-selection)
3. [API Setup](#api-setup)
4. [Core Features](#core-features)
5. [Design Personas](#design-personas)
6. [Advanced Configuration](#advanced-configuration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Manifestation Lab leverages multiple Google Gemini models to power its AI capabilities:

- **Code Generation**: Gemini 3 Pro Preview
- **Voice Processing**: Gemini 2.5 Flash Native Audio
- **Image Generation**: Gemini 2.5 Flash Image
- **Documentation**: Gemini 3 Flash Preview

### Why Gemini?

- **Multimodal**: Native support for text, images, audio, and video
- **Grounding**: Integration with Google Search for accurate information
- **Thinking Budget**: Advanced reasoning capabilities
- **Low Latency**: Fast response times for real-time interactions

---

## Model Selection

### Gemini 3 Pro Preview

**Purpose**: Primary code generation and artifact refinement

**Capabilities**:
- Vision input (images, PDFs)
- Long context windows (up to 2M tokens)
- Deep thinking with configurable budget
- Google Search grounding

**Configuration**:
```typescript
{
  model: 'gemini-3-pro-preview',
  config: {
    systemInstruction: BASE_SYSTEM_INSTRUCTION,
    tools: [{ googleSearch: {} }],
    temperature: 0.1,  // High precision
    thinkingConfig: { thinkingBudget: 4000 }
  }
}
```

**Best For**:
- Complex code generation
- Multi-step reasoning
- Architectural decisions
- Detailed HTML/CSS/JS generation

---

### Gemini 2.5 Flash Native Audio

**Purpose**: Real-time voice-to-text transcription

**Capabilities**:
- Native audio processing
- WebRTC streaming
- Low latency transcription
- Conversation context

**Configuration**:
```typescript
{
  model: 'gemini-2.5-flash-native-audio-preview-09-2025',
  config: {
    systemInstruction: 'Transcribe user voice commands for UI refinement'
  }
}
```

**Best For**:
- Voice commands
- Real-time refinement
- Hands-free operation

---

### Gemini 2.5 Flash Image

**Purpose**: UI mockup generation from text

**Capabilities**:
- High-quality image generation
- UI/UX focused
- Fast generation (<5 seconds)

**Usage**:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash-image',
  contents: { 
    parts: [{ 
      text: 'High-fidelity, award-winning UI/UX mockup for: E-commerce homepage' 
    }] 
  }
});
```

**Best For**:
- Text-to-image workflow
- Design inspiration
- Rapid prototyping

---

### Gemini 3 Flash Preview

**Purpose**: Fast documentation generation

**Capabilities**:
- Rapid analysis
- Structured JSON output
- Code understanding

**Best For**:
- Technical documentation
- Code analysis
- Quick summaries

---

## API Setup

### 1. Get Your API Key

Visit [Google AI Studio](https://aistudio.google.com/apikey) to generate an API key.

### 2. Configure Environment

Create a `.env` file:
```env
GEMINI_API_KEY=AIzaSy...your_key_here
```

### 3. Initialize the SDK

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});
```

### 4. Verify Connection

```typescript
try {
  const model = ai.models.get('gemini-3-pro-preview');
  console.log('Connected to:', model.name);
} catch (error) {
  console.error('API key invalid or model unavailable');
}
```

---

## Core Features

### Feature 1: Image-to-Code Generation

Transform visual designs into functional HTML/CSS/JS.

**Input**:
- User prompt (text description)
- Image file (PNG, JPG, PDF)
- Design persona (optional)

**Process**:
```typescript
const parts: Part[] = [
  { text: "Create a modern dashboard with this design" },
  { inlineData: { data: base64Image, mimeType: "image/png" } }
];

const response = await ai.models.generateContent({
  model: 'gemini-3-pro-preview',
  contents: { parts },
  config: {
    systemInstruction: BASE_SYSTEM_INSTRUCTION,
    temperature: 0.1,
    thinkingConfig: { thinkingBudget: 4000 }
  }
});

const html = response.text;
```

**Output**:
- Complete HTML5 document
- Tailwind CSS styling
- Interactive JavaScript
- Semantic structure

---

### Feature 2: Conversational Refinement

Iteratively refine artifacts through natural language chat.

**Example Session**:
```typescript
// Initial generation
const creation = await generateArtifact("Create a landing page");

// Chat-based refinement
const chat = ai.chats.create({
  model: 'gemini-3-pro-preview',
  history: [
    { role: 'user', parts: [{ text: 'Create a landing page' }] },
    { role: 'model', parts: [{ text: creation.html }] }
  ]
});

// User: "Make the header blue and add a CTA button"
const response = await chat.sendMessage({ 
  message: "Make the header blue and add a CTA button" 
});

const updatedHtml = response.text;
```

**Advantages**:
- Maintains context across iterations
- Natural language instructions
- Incremental changes
- History preservation

---

### Feature 3: Voice-Based Refinement

Control artifact generation with voice commands.

**Setup**:
```typescript
await liveDesignService.connect(
  (transcription) => {
    // Transcription received, apply refinement
    await refineArtifact(chatHistory, transcription);
  },
  (error) => {
    console.error('Voice error:', error);
  }
);

await liveDesignService.startListening();
```

**Workflow**:
1. User clicks microphone button
2. Browser requests microphone permission
3. Audio streams to Gemini Live API
4. Real-time transcription
5. Transcription applied as refinement
6. Updated artifact rendered

---

### Feature 4: Google Search Grounding

Enhance accuracy with real-time web search integration.

**Configuration**:
```typescript
{
  tools: [{ googleSearch: {} }]
}
```

**Response Format**:
```typescript
const grounding = response.candidates[0].groundingMetadata?.groundingChunks;

// Grounding sources:
[
  {
    web: {
      title: "Tailwind CSS Documentation",
      uri: "https://tailwindcss.com/docs",
      snippet: "Utility-first CSS framework..."
    }
  }
]
```

**Display Sources**:
```typescript
<div className="references">
  {grounding.map(chunk => (
    <a href={chunk.web.uri} target="_blank">
      {chunk.web.title}
    </a>
  ))}
</div>
```

---

## Design Personas

Personas are pre-configured design systems that influence aesthetic output.

### Available Personas

#### 1. Modernist (Default)
```typescript
persona: 'modernist'
```
**Characteristics**:
- Clean typography (Inter font)
- Ample whitespace
- Subtle gradients
- High precision grids
- Minimal borders

**Best For**: SaaS products, portfolios, modern web apps

---

#### 2. Brutalist
```typescript
persona: 'brutalist'
```
**Characteristics**:
- Bold, oversized typography
- Ultra-high contrast
- Raw, unpolished layouts
- Intentional overlapping elements
- Monospace fonts

**Best For**: Experimental projects, artistic portfolios, statement pieces

---

#### 3. Accessible
```typescript
persona: 'accessible'
```
**Characteristics**:
- WCAG 2.1 Level AAA compliance
- High contrast ratios (7:1+)
- Large interactive targets (44x44px min)
- Semantic ARIA labeling
- Screen reader optimized

**Best For**: Government sites, healthcare, education, public services

---

#### 4. Playful
```typescript
persona: 'playful'
```
**Characteristics**:
- Vibrant color palettes
- Organic border-radius (32px+)
- Bouncy micro-interactions
- Friendly, approachable copy
- Illustration-heavy

**Best For**: Children's apps, gaming, entertainment, creative tools

---

#### 5. Enterprise
```typescript
persona: 'enterprise'
```
**Characteristics**:
- High information density
- Professional blue/slate palettes
- Complex data tables
- Standard SaaS patterns
- Conservative design

**Best For**: B2B dashboards, analytics tools, admin panels

---

### Switching Personas

**At Generation**:
```typescript
const result = await geminiService.generateArtifact(
  prompt,
  image,
  mimeType,
  'brutalist'  // Persona selection
);
```

**During Refinement**:
```typescript
const result = await geminiService.refineArtifact(
  history,
  "Apply brutalist design principles",
  'brutalist'
);
```

---

## Advanced Configuration

### Thinking Budget

Control how much computational effort Gemini dedicates to reasoning.

**Default**: 4000 tokens

**Usage**:
```typescript
thinkingConfig: { thinkingBudget: 8000 }  // More detailed reasoning
```

**When to Increase**:
- Complex architectural decisions
- Multi-component systems
- Edge case handling
- Optimization requirements

**When to Decrease**:
- Simple UI elements
- Rapid iteration
- Cost optimization

---

### Temperature Control

Control randomness vs. determinism.

**Default**: 0.1 (high precision)

**Scale**:
- `0.0`: Most deterministic (same input = same output)
- `0.5`: Balanced creativity and consistency
- `1.0`: Maximum creativity and variation

**Usage**:
```typescript
config: {
  temperature: 0.3  // Slight variation, mostly consistent
}
```

---

### Safety Settings

Control content filtering (if needed).

```typescript
config: {
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ]
}
```

---

### Response Schema

Force structured JSON output.

```typescript
config: {
  responseSchema: {
    type: 'object',
    properties: {
      html: { type: 'string' },
      metadata: {
        type: 'object',
        properties: {
          components: { type: 'array' },
          dependencies: { type: 'array' }
        }
      }
    },
    required: ['html']
  }
}
```

---

## Best Practices

### 1. Prompt Engineering

**❌ Bad Prompt**:
```
Create a website
```

**✅ Good Prompt**:
```
Create a modern SaaS landing page with:
- Hero section with headline and CTA
- 3-column feature grid with icons
- Testimonials carousel
- Pricing table (3 tiers)
- Footer with links and social icons

Style: Clean, professional, blue accent color
```

**Tips**:
- Be specific about structure
- Mention key components
- Specify desired interactions
- Include aesthetic preferences
- Reference existing patterns

---

### 2. Error Handling

```typescript
async function safeGenerate(prompt: string) {
  try {
    const result = await geminiService.generateArtifact(prompt);
    return { success: true, data: result };
  } catch (error) {
    if (error.message.includes('quota')) {
      return { 
        success: false, 
        error: 'API quota exceeded. Please try again later.' 
      };
    } else if (error.message.includes('API_KEY')) {
      return { 
        success: false, 
        error: 'API key not configured. See setup guide.' 
      };
    } else {
      return { 
        success: false, 
        error: 'Generation failed. Please try again.' 
      };
    }
  }
}
```

---

### 3. Rate Limiting

Implement client-side throttling to prevent quota exhaustion:

```typescript
class RequestThrottler {
  private lastRequest = 0;
  private minInterval = 2000; // 2 seconds between requests

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    
    if (elapsed < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - elapsed)
      );
    }
    
    this.lastRequest = Date.now();
    return fn();
  }
}

const throttler = new RequestThrottler();
const result = await throttler.throttle(() => 
  geminiService.generateArtifact(prompt)
);
```

---

### 4. Caching Responses

Cache identical requests to save quota:

```typescript
const cache = new Map<string, { html: string; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

async function cachedGenerate(prompt: string) {
  const cached = cache.get(prompt);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.html;
  }
  
  const { html } = await geminiService.generateArtifact(prompt);
  cache.set(prompt, { html, timestamp: Date.now() });
  
  return html;
}
```

---

### 5. Context Management

Keep chat history concise to optimize token usage:

```typescript
function pruneHistory(history: ChatMessage[], maxMessages = 10): ChatMessage[] {
  if (history.length <= maxMessages) {
    return history;
  }
  
  // Keep first message (original prompt) and recent messages
  return [
    history[0],
    ...history.slice(-maxMessages + 1)
  ];
}

const prunedHistory = pruneHistory(chatHistory);
await geminiService.refineArtifact(prunedHistory, newPrompt);
```

---

## Troubleshooting

### Issue: "API_KEY execution context missing"

**Cause**: Environment variable not configured

**Solution**:
1. Create `.env` file in project root
2. Add: `GEMINI_API_KEY=your_api_key_here`
3. Restart development server

---

### Issue: "Quota exceeded"

**Cause**: Too many API requests

**Solution**:
- Wait for quota reset (typically 1 minute)
- Implement rate limiting
- Cache responses
- Upgrade to paid tier

---

### Issue: "Model not found"

**Cause**: Model name typo or unavailable

**Solution**:
- Verify model name spelling
- Check [Google AI Studio](https://aistudio.google.com) for available models
- Ensure you have access to preview models

---

### Issue: "Empty or invalid response"

**Cause**: Model didn't return expected format

**Solution**:
```typescript
function extractHtml(response: string): string {
  // Try full document match
  const fullDoc = response.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i);
  if (fullDoc) return fullDoc[0];
  
  // Try markdown code block
  const mdBlock = response.match(/```(?:html)?\s*([\s\S]*?)\s*```/i);
  if (mdBlock) return mdBlock[1];
  
  // Return as-is (might be partial HTML)
  return response.trim();
}
```

---

### Issue: "Voice input not working"

**Checklist**:
- [ ] Microphone permission granted
- [ ] HTTPS connection (required for getUserMedia)
- [ ] Browser supports WebRTC (Chrome, Firefox, Edge)
- [ ] No other app using microphone
- [ ] API key valid for Audio model

---

## Cost Optimization

### Pricing Awareness

Gemini pricing (as of 2024):
- **Input**: $0.05 / 1M tokens
- **Output**: $0.15 / 1M tokens
- **Images**: $0.0025 / image

### Optimization Strategies

1. **Reduce thinking budget** for simple tasks
2. **Cache responses** for repeated prompts
3. **Prune chat history** to minimize context
4. **Compress images** before sending
5. **Use Flash models** for simpler tasks

---

## Further Reading

- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [API Reference](../API.md)
- [Architecture Guide](../ARCHITECTURE.md)
- [Security Policy](../SECURITY.md)

---

**Last Updated**: 2024-12-30
