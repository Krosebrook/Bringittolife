# Claude AI Integration Guide

Guide for integrating Anthropic Claude AI into Manifestation Lab as an alternative or complementary AI provider to Google Gemini.

---

## Table of Contents

1. [Overview](#overview)
2. [Why Claude?](#why-claude)
3. [Integration Architecture](#integration-architecture)
4. [API Setup](#api-setup)
5. [Model Selection](#model-selection)
6. [Implementation Guide](#implementation-guide)
7. [Prompt Adaptation](#prompt-adaptation)
8. [Comparison: Claude vs Gemini](#comparison-claude-vs-gemini)
9. [Hybrid Strategy](#hybrid-strategy)
10. [Migration Path](#migration-path)

---

## Overview

While Manifestation Lab currently uses Google Gemini exclusively, Anthropic Claude offers compelling alternatives with different strengths. This guide outlines how to integrate Claude into the application, either as a replacement or complementary provider.

### Current Status

**🚧 Not Yet Implemented**

This document serves as:
- Planning reference for future Claude integration
- Comparison guide for model selection
- Architecture proposal for multi-provider support

---

## Why Claude?

### Strengths of Claude

1. **Superior Code Quality**
   - Exceptional at generating clean, well-structured code
   - Strong understanding of software architecture patterns
   - Better at following complex coding conventions

2. **Safety and Reliability**
   - Advanced Constitutional AI for safer outputs
   - More consistent behavior across requests
   - Better at refusing inappropriate requests gracefully

3. **Long Context Windows**
   - Claude 3.5 Sonnet: 200K tokens
   - Excellent for large codebase understanding
   - Better at maintaining context in long conversations

4. **Reasoning Capabilities**
   - Strong at multi-step reasoning
   - Excellent at understanding complex requirements
   - Better at edge case identification

5. **Documentation Quality**
   - Generates comprehensive, clear documentation
   - Better at technical writing
   - More structured outputs

### Use Cases for Claude in Manifestation Lab

| Task | Best Provider | Rationale |
|------|--------------|-----------|
| Initial code generation | Claude | Cleaner structure, better patterns |
| Image understanding | Gemini | Superior vision capabilities |
| Voice processing | Gemini | Native audio support |
| Documentation | Claude | Better technical writing |
| Refinements | Either | Both perform well |
| Complex refactoring | Claude | Better architectural understanding |

---

## Integration Architecture

### Multi-Provider Service Layer

```typescript
// services/ai-provider.ts
export interface AIProvider {
  name: 'gemini' | 'claude';
  generateArtifact(params: GenerateParams): Promise<GenerateResult>;
  refineArtifact(params: RefineParams): Promise<RefineResult>;
  generateDocs(params: DocsParams): Promise<DocsResult>;
}

// Services registry
const providers = {
  gemini: geminiService,
  claude: claudeService
};

export function getProvider(name: 'gemini' | 'claude'): AIProvider {
  return providers[name];
}
```

### Unified Interface

```typescript
// services/synthesis.ts
export class SynthesisService {
  private provider: AIProvider;

  constructor(providerName: 'gemini' | 'claude' = 'gemini') {
    this.provider = getProvider(providerName);
  }

  async generateArtifact(
    prompt: string, 
    image?: string, 
    persona?: DesignPersona
  ): Promise<Creation> {
    return this.provider.generateArtifact({
      prompt,
      image,
      persona
    });
  }

  switchProvider(name: 'gemini' | 'claude') {
    this.provider = getProvider(name);
  }
}
```

---

## API Setup

### 1. Obtain API Key

Visit [Anthropic Console](https://console.anthropic.com/) to get your API key.

### 2. Environment Configuration

```bash
# .env
GEMINI_API_KEY=your_gemini_key_here
CLAUDE_API_KEY=your_claude_key_here
AI_PROVIDER=gemini  # or 'claude' or 'auto'
```

### 3. Install SDK

```bash
npm install @anthropic-ai/sdk
```

### 4. Type Definitions

```typescript
// types.ts
export type AIProviderName = 'gemini' | 'claude';

export interface AIConfig {
  provider: AIProviderName;
  fallbackProvider?: AIProviderName;
  autoSwitch?: boolean;  // Auto-switch based on task
}
```

---

## Model Selection

### Claude 3.5 Models

| Model | Context | Best For | Cost |
|-------|---------|----------|------|
| **Claude 3.5 Sonnet** | 200K | Primary code generation, complex reasoning | Medium |
| **Claude 3.5 Haiku** | 200K | Fast responses, documentation, simple tasks | Low |
| **Claude 3 Opus** | 200K | Highest quality, most complex tasks | High |

### Recommended Mapping

```typescript
const modelMapping = {
  // Primary artifact generation
  generateArtifact: 'claude-3-5-sonnet-20241022',
  
  // Quick refinements
  refineArtifact: 'claude-3-5-haiku-20241022',
  
  // Complex refactoring
  complexRefactor: 'claude-3-opus-20240229',
  
  // Documentation
  generateDocs: 'claude-3-5-haiku-20241022'
};
```

---

## Implementation Guide

### Claude Service Implementation

```typescript
// services/claude.ts
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, GenerateParams, GenerateResult } from './ai-provider';

class ClaudeService implements AIProvider {
  name = 'claude' as const;
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY not configured");
    }
    this.client = new Anthropic({ apiKey });
  }

  async generateArtifact(params: GenerateParams): Promise<GenerateResult> {
    const { prompt, image, persona = 'modernist' } = params;
    
    const systemPrompt = this.buildSystemPrompt(persona);
    const messages = this.buildMessages(prompt, image);

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8192,
        temperature: 0.1,
        system: systemPrompt,
        messages
      });

      const html = this.extractHTML(response.content);
      
      return {
        html,
        metadata: {
          model: 'claude-3-5-sonnet',
          tokens: response.usage.input_tokens + response.usage.output_tokens,
          stopReason: response.stop_reason
        }
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refineArtifact(params: RefineParams): Promise<RefineResult> {
    const { history, newPrompt, persona } = params;
    
    const systemPrompt = this.buildSystemPrompt(persona);
    const messages = this.convertHistory(history);
    messages.push({
      role: 'user',
      content: newPrompt
    });

    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',  // Faster for refinements
      max_tokens: 8192,
      temperature: 0.1,
      system: systemPrompt,
      messages
    });

    return {
      html: this.extractHTML(response.content),
      metadata: {
        model: 'claude-3-5-haiku',
        tokens: response.usage.input_tokens + response.usage.output_tokens
      }
    };
  }

  async generateDocs(params: DocsParams): Promise<DocsResult> {
    const { html, metadata } = params;
    
    const systemPrompt = `You are a technical documentation expert. 
    Analyze code and generate comprehensive documentation.
    Return ONLY valid JSON with keys: purpose, ioSchema, internalLogic.`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Analyze this code:\n\n${html}\n\nGenerate documentation.`
      }]
    });

    return JSON.parse(this.extractJSON(response.content));
  }

  private buildSystemPrompt(persona: DesignPersona): string {
    const basePrompt = `You are an expert web developer and designer creating production-ready HTML artifacts.

REQUIREMENTS:
- Output ONLY complete, self-contained HTML5 files
- Use ONLY Tailwind CSS for styling (NO custom CSS)
- Use semantic HTML5 elements (<header>, <main>, <section>, etc.)
- Implement robust JavaScript (ES6+) for interactivity
- Every interactive element MUST have proper ARIA labels
- Ensure excellent accessibility (WCAG 2.1 AA minimum)
- Create beautiful, modern designs with attention to detail

STYLING:
- Use Tailwind utility classes exclusively
- Apply 'prose' class for content-rich sections
- Use 'not-prose' for UI components to prevent typography inheritance
- Ensure responsive design with mobile-first approach
- Add smooth hover and focus states

INTERACTIVITY:
- Use vanilla JavaScript (no external dependencies)
- Implement proper event handling
- Manage state effectively
- Handle edge cases and errors gracefully

FORMAT:
Output raw HTML starting with <!DOCTYPE html>. 
NO markdown code blocks or explanations.`;

    const personaInstructions = {
      modernist: "\n\nDESIGN PERSONA - MODERNIST:\n- Clean, sophisticated typography\n- Ample whitespace and breathing room\n- Subtle gradients and shadows\n- Minimal borders, precise grids\n- Neutral, muted color palette",
      brutalist: "\n\nDESIGN PERSONA - BRUTALIST:\n- Bold, oversized typography\n- Ultra-high contrast (black/white)\n- Raw, unpolished aesthetic\n- Intentional overlapping elements\n- Minimal padding, aggressive scaling",
      accessible: "\n\nDESIGN PERSONA - ACCESSIBLE:\n- WCAG 2.1 Level AAA compliance\n- High contrast ratios (7:1 minimum)\n- Large interactive targets (48px+)\n- Explicit ARIA labeling everywhere\n- Clear focus indicators (3px outlines)",
      playful: "\n\nDESIGN PERSONA - PLAYFUL:\n- Vibrant, saturated colors\n- High border-radius (rounded-2xl+)\n- Bouncy animations and transitions\n- Friendly, casual language\n- Icon and emoji-rich interface",
      enterprise: "\n\nDESIGN PERSONA - ENTERPRISE:\n- Professional blue/slate palette\n- High information density\n- Complex data tables with sorting\n- Standard SaaS patterns\n- Conservative, formal tone"
    };

    return basePrompt + personaInstructions[persona];
  }

  private buildMessages(prompt: string, image?: string): Anthropic.MessageParam[] {
    const content: Anthropic.ContentBlock[] = [{ 
      type: 'text', 
      text: prompt 
    }];

    if (image) {
      // Claude expects base64 with data URI prefix removed
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const mediaType = this.getMediaType(image);
      
      content.unshift({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data
        }
      });
    }

    return [{ role: 'user', content }];
  }

  private extractHTML(content: Anthropic.ContentBlock[]): string {
    const textContent = content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('\n');

    // Remove markdown code blocks if present
    return textContent
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  }

  private extractJSON(content: Anthropic.ContentBlock[]): string {
    const text = content
      .filter(block => block.type === 'text')
      .map(block => (block as Anthropic.TextBlock).text)
      .join('\n');

    // Extract JSON from markdown or raw text
    const jsonMatch = text.match(/```json\n?(.*?)\n?```/s) || 
                      text.match(/\{[\s\S]*\}/);
    
    return jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
  }

  private getMediaType(dataUri: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
    if (dataUri.includes('image/jpeg') || dataUri.includes('image/jpg')) {
      return 'image/jpeg';
    } else if (dataUri.includes('image/png')) {
      return 'image/png';
    } else if (dataUri.includes('image/gif')) {
      return 'image/gif';
    } else if (dataUri.includes('image/webp')) {
      return 'image/webp';
    }
    return 'image/png'; // default
  }

  private handleError(error: any): Error {
    if (error.status === 429) {
      return new Error("Rate limit exceeded. Please try again later.");
    } else if (error.status === 401) {
      return new Error("Invalid API key. Check your Claude API configuration.");
    } else if (error.error?.type === 'overloaded_error') {
      return new Error("Claude servers are overloaded. Please retry.");
    } else {
      return new Error(`Claude API error: ${error.message}`);
    }
  }

  private convertHistory(history: ChatMessage[]): Anthropic.MessageParam[] {
    return history.map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.text
    }));
  }
}

export const claudeService = new ClaudeService();
```

---

## Prompt Adaptation

### Key Differences

| Aspect | Gemini | Claude |
|--------|--------|--------|
| System Instructions | `systemInstruction` field | `system` parameter |
| Thinking Budget | `thinkingConfig` | Not applicable |
| Web Search | `tools: [{ googleSearch }]` | Not supported natively |
| Message Format | `contents.parts` | `messages` with `content` blocks |
| Temperature | 0.0-2.0 | 0.0-1.0 |

### Prompt Engineering Tips for Claude

1. **Be Explicit About Format**
   ```
   Output ONLY raw HTML. No markdown, no explanations, 
   no code blocks. Start directly with <!DOCTYPE html>.
   ```

2. **Use XML Tags for Structure** (Claude likes these)
   ```xml
   <instructions>
     <output_format>HTML5</output_format>
     <styling>Tailwind CSS only</styling>
     <accessibility>WCAG 2.1 AA minimum</accessibility>
   </instructions>
   ```

3. **Leverage Claude's Reasoning**
   ```
   Think step-by-step:
   1. Analyze the requirements
   2. Plan the component structure
   3. Implement with Tailwind CSS
   4. Add JavaScript for interactivity
   5. Ensure accessibility
   ```

4. **Request Structured Output**
   ```
   Return a JSON object with exactly these keys:
   - purpose: string
   - ioSchema: string
   - internalLogic: string
   ```

---

## Comparison: Claude vs Gemini

### Performance Benchmarks (Estimated)

| Metric | Gemini 3 Pro | Claude 3.5 Sonnet |
|--------|--------------|-------------------|
| Code Quality | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Speed | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Vision | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Context Window | 128K tokens | 200K tokens |
| Cost | $$ | $$$ |
| Consistency | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Documentation | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### Strengths & Weaknesses

**Gemini Advantages:**
- Superior image understanding
- Native audio processing
- Web search integration
- Thinking budget feature
- Lower cost
- Faster for vision tasks

**Claude Advantages:**
- Better code structure
- More consistent outputs
- Superior documentation
- Longer context window
- Better at following complex instructions
- Safer, more reliable

**Recommended Strategy:**
Use both based on task requirements (see Hybrid Strategy below).

---

## Hybrid Strategy

### Task-Based Provider Selection

```typescript
// services/smart-provider.ts
export class SmartProviderService {
  private providers = {
    gemini: geminiService,
    claude: claudeService
  };

  async generateArtifact(params: GenerateParams): Promise<GenerateResult> {
    const provider = this.selectProvider(params);
    return provider.generateArtifact(params);
  }

  private selectProvider(params: GenerateParams): AIProvider {
    // Use Gemini for image-heavy tasks
    if (params.image) {
      return this.providers.gemini;
    }

    // Use Claude for complex text-only generation
    if (this.isComplexTask(params.prompt)) {
      return this.providers.claude;
    }

    // Use Gemini for voice input
    if (params.isVoice) {
      return this.providers.gemini;
    }

    // Default to Claude for text generation
    return this.providers.claude;
  }

  private isComplexTask(prompt: string): boolean {
    const complexityIndicators = [
      'dashboard', 'admin', 'complex', 'multiple',
      'data table', 'chart', 'integration'
    ];
    
    return complexityIndicators.some(indicator => 
      prompt.toLowerCase().includes(indicator)
    );
  }
}
```

### Fallback Strategy

```typescript
export class ResilientProviderService {
  async generateArtifact(params: GenerateParams): Promise<GenerateResult> {
    try {
      // Try primary provider
      return await claudeService.generateArtifact(params);
    } catch (error) {
      console.warn("Claude failed, falling back to Gemini:", error);
      
      try {
        // Fallback to secondary provider
        return await geminiService.generateArtifact(params);
      } catch (fallbackError) {
        throw new Error("All AI providers failed");
      }
    }
  }
}
```

### Cost Optimization

```typescript
export class CostOptimizedService {
  private monthlyBudget = 100; // USD
  private spending = { gemini: 0, claude: 0 };

  async generateArtifact(params: GenerateParams): Promise<GenerateResult> {
    // Check budget
    if (this.getTotalSpending() > this.monthlyBudget * 0.9) {
      // Near budget limit, use cheaper provider
      return geminiService.generateArtifact(params);
    }

    // Normal operation - use best provider for task
    const provider = this.selectBestProvider(params);
    const result = await provider.generateArtifact(params);
    
    // Track spending
    this.trackCost(provider.name, result.metadata.tokens);
    
    return result;
  }

  private trackCost(provider: 'gemini' | 'claude', tokens: number) {
    const costPerToken = {
      gemini: 0.00001, // Example pricing
      claude: 0.000015
    };
    
    this.spending[provider] += tokens * costPerToken[provider];
  }
}
```

---

## Migration Path

### Phase 1: Add Claude as Optional

1. Install SDK: `npm install @anthropic-ai/sdk`
2. Add API key to `.env`
3. Implement `ClaudeService`
4. Add provider selection UI
5. Test with limited users

### Phase 2: Hybrid Approach

1. Implement smart provider selection
2. Use Claude for text-only tasks
3. Use Gemini for vision/audio tasks
4. Monitor quality and cost
5. Gather user feedback

### Phase 3: Full Integration

1. Make provider selection transparent
2. Implement automatic fallbacks
3. Optimize based on performance data
4. Document best practices
5. Train users on differences

### Phase 4: Future Enhancements

1. Add more providers (GPT-4, etc.)
2. Implement A/B testing
3. Create provider benchmarking
4. Build cost analytics dashboard
5. Enable user provider preferences

---

## Configuration Example

### Provider Config File

```typescript
// config/ai-providers.ts
export const aiConfig = {
  default: 'gemini',
  
  providers: {
    gemini: {
      enabled: true,
      models: {
        generation: 'gemini-3-pro-preview',
        refinement: 'gemini-3-pro-preview',
        documentation: 'gemini-3-flash-preview',
        voice: 'gemini-2.5-flash-native-audio-preview-09-2025'
      },
      maxRetries: 3,
      timeout: 60000
    },
    
    claude: {
      enabled: false, // Enable when ready
      models: {
        generation: 'claude-3-5-sonnet-20241022',
        refinement: 'claude-3-5-haiku-20241022',
        documentation: 'claude-3-5-haiku-20241022'
      },
      maxRetries: 3,
      timeout: 60000
    }
  },
  
  taskMapping: {
    'image-to-code': 'gemini',
    'text-to-code': 'claude',
    'voice-refinement': 'gemini',
    'documentation': 'claude',
    'complex-refactor': 'claude'
  }
};
```

---

## Best Practices

### DO ✅

- Start with single provider (Gemini)
- Add Claude when needed for quality
- Use task-based selection
- Implement proper error handling
- Monitor costs closely
- Test both providers extensively
- Document differences
- Provide user choice when appropriate

### DON'T ❌

- Switch providers mid-conversation
- Use multiple providers simultaneously for same task
- Ignore cost implications
- Skip error handling
- Assume identical output formats
- Expose provider details to users unnecessarily
- Switch providers without testing

---

## Future Considerations

### Other AI Providers

**OpenAI GPT-4:**
- Excellent code generation
- Strong reasoning
- Large ecosystem
- Higher cost

**Cohere:**
- Good for embeddings
- Classification tasks
- Lower cost

**Local Models:**
- LLaMA 3
- Mistral
- Privacy-focused
- No API costs

---

## Conclusion

While Claude integration is not yet implemented, this guide provides a roadmap for:
- Understanding Claude's strengths
- Planning integration architecture
- Implementing hybrid strategies
- Migrating incrementally

The current Gemini implementation serves Manifestation Lab well, but Claude offers complementary strengths that could enhance code quality and consistency.

**Recommendation:** Implement Claude as an optional provider in v3.2.0, focusing on text-to-code generation where it excels.

---

For implementation questions, see:
- [Gemini Integration](./gemini.md)
- [Agent Architecture](./agents.md)
- [Contributing Guide](./CONTRIBUTING.md)

**Last Updated:** December 29, 2024  
**Status:** Planning / Not Implemented
