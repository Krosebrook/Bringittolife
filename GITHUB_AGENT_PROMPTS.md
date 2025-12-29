# Context-Engineered Prompts for GitHub Agents

This document provides 5 carefully crafted, context-engineered prompts for GitHub Agents (Copilot Workspace, Coding Agents, etc.) to accelerate development of Manifestation Lab.

---

## Understanding Context Engineering

Context engineering ensures AI agents have the right information to produce accurate, consistent results. Each prompt includes:
- **System Context**: Project-specific constraints and standards
- **Workspace Context**: Current repository state and files
- **Task Instructions**: Clear, specific objectives
- **Success Criteria**: How to verify completion

---

## Prompt 1: Implement Comprehensive Testing Infrastructure

### Context
```
Repository: Manifestation Lab v3.0
Tech Stack: React 19.2, TypeScript, Vite, Tailwind CSS
Current State: Zero test coverage, no testing infrastructure
Priority: CRITICAL (see AUDIT.md section 3)
```

### Prompt
```
You are a senior test engineer setting up testing infrastructure for a React 19 + TypeScript project called Manifestation Lab.

CONTEXT:
- Project root: /home/runner/work/Bringittolife/Bringittolife
- No existing tests or test configuration
- Tech stack: React 19.2, TypeScript 5.8, Vite 6.2, Tailwind CSS
- Key features: AI-powered code generation, iframe-based preview, file upload

REQUIREMENTS:
1. Install and configure testing dependencies:
   - Vitest as test runner
   - React Testing Library for component tests
   - jsdom for DOM simulation
   - @testing-library/jest-dom for custom matchers
   - @testing-library/user-event for interaction testing
   - @axe-core/react for accessibility testing

2. Create vitest.config.ts with proper setup:
   - Configure jsdom environment
   - Setup test globals
   - Include coverage configuration (80% target)
   - Configure path aliases to match tsconfig.json

3. Create test directory structure:
   tests/
     unit/
       components/
       services/
       utils/
     integration/
     fixtures/
     setup.ts

4. Write example tests for critical components:
   - tests/unit/components/InputArea.test.tsx
   - tests/unit/services/gemini.test.ts
   - tests/integration/artifact-generation.test.tsx

5. Update package.json scripts:
   "test": "vitest"
   "test:ui": "vitest --ui"
   "test:coverage": "vitest --coverage"
   "test:watch": "vitest --watch"

6. Create tests/setup.ts with:
   - Global test utilities
   - Mock implementations for Gemini API
   - Custom render function with providers
   - Accessibility testing setup

CONSTRAINTS:
- Use TypeScript for all test files
- Follow React Testing Library best practices (test behavior, not implementation)
- Mock all external API calls (Gemini)
- Ensure tests are fast (<100ms per test)
- Include accessibility checks in component tests

SUCCESS CRITERIA:
- [ ] All dependencies installed
- [ ] vitest.config.ts created and working
- [ ] Test directory structure created
- [ ] At least 3 example tests written and passing
- [ ] package.json scripts updated
- [ ] tests/setup.ts with mock utilities
- [ ] npm run test executes successfully
- [ ] Coverage report generated

DELIVERABLES:
1. vitest.config.ts
2. tests/setup.ts
3. Example test files (3+)
4. Updated package.json
5. README section on running tests

Start by analyzing the existing codebase to understand component structure, then implement the testing infrastructure systematically.
```

---

## Prompt 2: Implement Server-Side API Proxy for Security

### Context
```
Repository: Manifestation Lab v3.0
Security Issue: Gemini API keys exposed in client-side bundle (CRITICAL)
Reference: AUDIT.md section 4
Goal: Move API calls to secure server-side proxy
```

### Prompt
```
You are a security engineer tasked with fixing a critical security vulnerability in Manifestation Lab.

SECURITY ISSUE:
The Gemini API key is currently exposed in the client-side bundle via vite.config.ts (lines 14-15).
This allows anyone to extract the key and use it maliciously.

CURRENT ARCHITECTURE:
- Client-side React app (Vite)
- Direct Gemini API calls from browser (services/gemini.ts, services/live.ts)
- API key injected via process.env at build time

TARGET ARCHITECTURE:
- Client makes requests to local API routes (e.g., /api/generate)
- Server-side proxy forwards requests to Gemini API
- API key stored only on server, never exposed to client

IMPLEMENTATION STEPS:

1. Choose backend approach (select ONE):
   Option A: Vite server middleware (simpler, development-friendly)
   Option B: Express server (production-ready, more flexible)
   Option C: Serverless functions (if deploying to Vercel/Netlify)

2. Create API proxy structure:
   api/
     generate.ts      # POST /api/generate
     refine.ts        # POST /api/refine
     live-audio.ts    # WebSocket /api/live-audio
     docs.ts          # POST /api/docs

3. Implement security measures:
   - Rate limiting (10 requests/minute per IP)
   - Request validation (zod schemas)
   - CORS configuration (same-origin only)
   - Error sanitization (don't leak internal errors)
   - Request logging for audit

4. Update client-side services:
   - Modify services/gemini.ts to call /api/generate
   - Modify services/live.ts to use WebSocket proxy
   - Remove direct Gemini SDK usage from client
   - Add proper error handling for API responses

5. Environment variables:
   - Create .env.example with GEMINI_API_KEY placeholder
   - Update .gitignore to ensure .env is never committed
   - Document setup in README.md

6. Update vite.config.ts:
   - Remove API key injection
   - Add proxy configuration for /api/* routes
   - Configure CORS for development

CONSTRAINTS:
- API key MUST NEVER appear in client bundle
- Maintain existing API functionality (no breaking changes)
- Keep response format identical for backward compatibility
- Add request/response type definitions
- Include rate limiting to prevent abuse

SUCCESS CRITERIA:
- [ ] API proxy implemented and working
- [ ] services/gemini.ts calls proxy instead of direct API
- [ ] API key only in server environment
- [ ] Rate limiting active
- [ ] Request validation implemented
- [ ] Error handling improved
- [ ] Documentation updated
- [ ] Client bundle analyzed (no API key present)
- [ ] npm run build && grep -r "GEMINI_API_KEY" dist/ returns no matches

TESTING CHECKLIST:
- [ ] Generate artifact through proxy (works)
- [ ] Refine artifact through proxy (works)
- [ ] Rate limiting triggers after 10 requests
- [ ] Invalid requests rejected with 400
- [ ] Network tab shows /api/* calls, not direct Gemini

DELIVERABLES:
1. api/ directory with proxy endpoints
2. Updated client services
3. Security middleware (rate limiting, validation)
4. .env.example file
5. Updated README with security notes
6. Verification script to confirm no key leakage

Prioritize security over convenience. This is a CRITICAL vulnerability.
```

---

## Prompt 3: Implement CI/CD Pipeline with GitHub Actions

### Context
```
Repository: Manifestation Lab v3.0
Current State: No automated testing, builds, or deployments
Reference: AUDIT.md section 5
Goal: Full CI/CD pipeline for quality and deployment automation
```

### Prompt
```
You are a DevOps engineer implementing a comprehensive CI/CD pipeline for Manifestation Lab using GitHub Actions.

PROJECT CONTEXT:
- React 19.2 + TypeScript + Vite application
- No existing workflows or automation
- Security-sensitive (API keys, code generation)
- Target deployment: Vercel (primary) or Netlify (alternative)

WORKFLOWS TO IMPLEMENT:

1. **Continuous Integration** (.github/workflows/ci.yml)
   Trigger: Push to any branch, Pull requests
   
   Jobs:
   a) Lint & Format Check
      - Run ESLint
      - Run Prettier check
      - Report violations as annotations
   
   b) Type Check
      - Run TypeScript compiler (tsc --noEmit)
      - Report type errors
   
   c) Test
      - Run Vitest unit tests
      - Run Vitest integration tests
      - Generate coverage report
      - Upload coverage to Codecov
      - Fail if coverage < 80%
   
   d) Build
      - Run production build (npm run build)
      - Check bundle size (fail if > 1MB gzipped)
      - Upload build artifacts
   
   e) Security Scan
      - Run npm audit
      - Check for high/critical vulnerabilities
      - Fail if critical vulnerabilities found

   Matrix strategy: Test on Node 18, 20, 22

2. **Security Scanning** (.github/workflows/security.yml)
   Trigger: Daily at 2 AM UTC, Pull requests
   
   Jobs:
   a) CodeQL Analysis
      - Language: JavaScript/TypeScript
      - Scan for security vulnerabilities
      - Upload results to GitHub Security
   
   b) Dependency Review
      - Check for vulnerable dependencies
      - Review license compliance
      - Block if critical issues found
   
   c) Secret Scanning
      - Scan for accidentally committed secrets
      - Check for API keys, tokens

3. **Deploy to Production** (.github/workflows/deploy.yml)
   Trigger: Push to main branch, Manual workflow_dispatch
   
   Jobs:
   a) Build & Test (inherit from ci.yml)
   
   b) Deploy to Vercel
      - Build production bundle
      - Deploy to Vercel
      - Comment deployment URL on PR
      - Update deployment status
   
   c) Smoke Tests
      - Test deployed app (basic functionality)
      - Verify critical paths work
      - Rollback if tests fail

4. **Accessibility Audit** (.github/workflows/a11y.yml)
   Trigger: Pull requests, Weekly
   
   Jobs:
   a) Automated a11y Testing
      - Build app
      - Run Playwright with axe-core
      - Test WCAG 2.1 AA compliance
      - Generate accessibility report
      - Comment on PR with results

CONFIGURATION FILES:

1. .github/dependabot.yml
   - Automated dependency updates
   - Security updates: immediate
   - Regular updates: weekly
   - Grouped updates for patch versions

2. .github/CODEOWNERS
   - Define code ownership
   - Require reviews from owners

3. Branch Protection Rules (document in README)
   - Require PR before merge to main
   - Require status checks to pass
   - Require 1 approval
   - Enforce up-to-date branches

SECRETS TO CONFIGURE (document in README):
- GEMINI_API_KEY: For testing (use test key)
- VERCEL_TOKEN: For deployments
- CODECOV_TOKEN: For coverage reports

CONSTRAINTS:
- Use latest GitHub Actions versions
- Cache node_modules for speed
- Set reasonable timeouts (10 min max)
- Use matrix strategies for efficiency
- Include descriptive comments in YAML

SUCCESS CRITERIA:
- [ ] All 4 workflows created and working
- [ ] CI runs on every push/PR
- [ ] Security scans run daily
- [ ] Deployments automated for main branch
- [ ] Accessibility checks on PRs
- [ ] Status badges added to README
- [ ] Branch protection rules documented
- [ ] Secrets configuration documented

DELIVERABLES:
1. .github/workflows/ci.yml
2. .github/workflows/security.yml
3. .github/workflows/deploy.yml
4. .github/workflows/a11y.yml
5. .github/dependabot.yml
6. README section: "CI/CD Pipeline"
7. README section: "Deployment"
8. Status badges in README

MONITORING:
Add workflow badges to README.md:
[![CI](https://github.com/Krosebrook/Bringittolife/workflows/CI/badge.svg)](https://github.com/Krosebrook/Bringittolife/actions)
[![Security](https://github.com/Krosebrook/Bringittolife/workflows/Security/badge.svg)](https://github.com/Krosebrook/Bringittolife/actions)

Ensure workflows are efficient, secure, and provide clear feedback on failures.
```

---

## Prompt 4: Migrate to Feature-Based Architecture

### Context
```
Repository: Manifestation Lab v3.0
Current Structure: Component-based organization
Target Structure: Feature-based (scalable, AI-friendly)
Reference: REPOSITORIES.md - AI-Ready React Template
```

### Prompt
```
You are a senior React architect refactoring Manifestation Lab to a scalable, feature-based architecture.

PROBLEM:
Current structure groups by technical role (components/, services/, hooks/), which doesn't scale well and makes it hard for AI assistants to understand feature boundaries.

CURRENT STRUCTURE:
```
components/
  Hero.tsx
  InputArea.tsx
  LivePreview.tsx
  live/
    ChatPanel.tsx
    CssEditorPanel.tsx
    AccessibilityPanel.tsx
services/
  gemini.ts
  live.ts
  docsService.ts
hooks/
  useHistory.ts
  useIframeContent.ts
utils/
  fileHelpers.ts
  reactConverter.ts
```

TARGET STRUCTURE (Feature-Based):
```
src/
  features/
    artifact-generation/
      components/
        InputArea.tsx
        ImageUploader.tsx
      services/
        gemini.service.ts
      hooks/
        useArtifactGeneration.ts
      utils/
        promptBuilder.ts
      types.ts
      index.ts              # Public API
    
    live-preview/
      components/
        SimulatorViewport.tsx
        DeviceControls.tsx
      hooks/
        useIframeContent.ts
      utils/
        injection.ts
      types.ts
      index.ts
    
    refinement/
      components/
        ChatPanel.tsx
        VoiceInput.tsx
      services/
        live.service.ts
      hooks/
        useRefinement.ts
      types.ts
      index.ts
    
    dev-studio/
      components/
        CssEditorPanel.tsx
        AccessibilityPanel.tsx
        DocumentationPanel.tsx
        CiCdPanel.tsx
      hooks/
        useCssEditor.ts
      types.ts
      index.ts
    
    export/
      components/
        ExportDialog.tsx
      services/
        export.service.ts
      utils/
        reactConverter.ts
      types.ts
      index.ts
    
    history/
      components/
        CreationHistory.tsx
      hooks/
        useHistory.ts
      types.ts
      index.ts
  
  shared/
    components/          # Truly shared UI components
      Button.tsx
      Card.tsx
    utils/
      fileHelpers.ts
    types.ts
  
  core/                  # App-level concerns
    layout/
      AppLayout.tsx
      Header.tsx
    routing/
      routes.tsx
    theme/
      ThemeProvider.tsx
```

MIGRATION STEPS:

1. Planning Phase:
   - Analyze current dependencies between components
   - Identify feature boundaries
   - Map current files to new structure
   - Create migration checklist

2. Create New Structure:
   - Create src/ directory
   - Create feature directories with template structure
   - Create shared/ and core/ directories
   - Create index.ts barrel exports for each feature

3. Move Files (ONE FEATURE AT A TIME):
   - Start with least dependent feature (history)
   - Move component files
   - Move related hooks, services, utils
   - Update imports within feature
   - Create feature's index.ts with public API
   - Update external imports to use barrel exports

4. Update Imports Throughout Codebase:
   - Use absolute imports with @ alias
   - Import from feature barrel exports: `import { InputArea } from '@/features/artifact-generation'`
   - Avoid deep imports: NO `import from '@/features/artifact-generation/components/InputArea'`

5. Create Feature READMEs:
   Each feature should have README.md:
   ```markdown
   # Feature: Artifact Generation
   
   ## Purpose
   Handles image upload, prompt input, and AI-powered artifact generation.
   
   ## Public API
   - `<InputArea />` - Main input component
   - `useArtifactGeneration()` - Generation hook
   
   ## Dependencies
   - @/shared/utils/fileHelpers
   - @google/genai
   
   ## Related Features
   - live-preview (displays generated artifacts)
   - refinement (iterates on artifacts)
   ```

6. Update Configuration:
   - tsconfig.json: Ensure paths include src/
   - vite.config.ts: Update alias to point to src/
   - Update any test configurations

CONSTRAINTS:
- Maintain 100% functionality during migration
- Each feature must have single responsibility
- Shared code goes in shared/, not features/
- Features should minimize cross-dependencies
- All imports through barrel exports (index.ts)

SUCCESS CRITERIA:
- [ ] src/ directory structure created
- [ ] All files moved to appropriate features
- [ ] All imports updated (no broken imports)
- [ ] Barrel exports created for each feature
- [ ] Feature READMEs written
- [ ] tsconfig.json updated
- [ ] vite.config.ts updated
- [ ] App builds successfully
- [ ] App runs without errors
- [ ] All features still functional

QUALITY CHECKS:
- [ ] No circular dependencies between features
- [ ] No deep imports (all via index.ts)
- [ ] Each feature can be understood independently
- [ ] Feature boundaries are clear and logical
- [ ] Shared code properly identified

DELIVERABLES:
1. Migrated src/ directory structure
2. Updated tsconfig.json and vite.config.ts
3. Feature READMEs (one per feature)
4. Migration guide document
5. Architecture diagram (ASCII or Mermaid)
6. Updated ARCHITECTURE.md

ROLLBACK PLAN:
If migration causes issues:
1. Keep backup of original structure (git branch)
2. Test thoroughly after each feature migration
3. Commit after each successful feature migration
4. Document any issues in migration guide

This is a large refactor. Take it slowly, one feature at a time, and test after each migration.
```

---

## Prompt 5: Implement Advanced Error Handling & Monitoring

### Context
```
Repository: Manifestation Lab v3.0
Current State: Basic error handling, no monitoring
Reference: AUDIT.md section 10
Goal: Production-grade error handling, logging, and monitoring
```

### Prompt
```
You are a reliability engineer implementing comprehensive error handling and monitoring for Manifestation Lab.

CURRENT STATE PROBLEMS:
- Basic try/catch blocks with generic error messages
- No centralized error handling
- No error tracking or analytics
- No user feedback on errors
- AI failures are silent or cryptic

TARGET STATE:
- Robust error boundaries at feature level
- Centralized error handling service
- User-friendly error messages
- Error tracking and alerting (Sentry)
- Comprehensive logging
- Retry logic for transient failures
- Offline support with graceful degradation

IMPLEMENTATION PLAN:

1. **Error Classification System**
   
   Create src/core/errors/types.ts:
   ```typescript
   export enum ErrorCategory {
     NETWORK = 'network',
     AI_GENERATION = 'ai_generation',
     VALIDATION = 'validation',
     AUTHORIZATION = 'authorization',
     UNKNOWN = 'unknown'
   }
   
   export enum ErrorSeverity {
     LOW = 'low',        // Recoverable, no user impact
     MEDIUM = 'medium',  // Degraded experience
     HIGH = 'high',      // Feature broken
     CRITICAL = 'critical' // App broken
   }
   
   export class AppError extends Error {
     constructor(
       message: string,
       public category: ErrorCategory,
       public severity: ErrorSeverity,
       public userMessage: string,
       public recoverable: boolean = true,
       public metadata?: Record<string, any>
     ) {
       super(message);
     }
   }
   ```

2. **Centralized Error Handler**
   
   Create src/core/errors/errorHandler.ts:
   - Log errors to console (dev) or Sentry (prod)
   - Show user-friendly toast notifications
   - Track error frequency
   - Implement circuit breaker for repeated failures
   - Provide recovery suggestions

3. **React Error Boundaries**
   
   Create src/core/errors/ErrorBoundary.tsx:
   - Catch component errors
   - Show fallback UI with recovery options
   - Log error to monitoring service
   - Provide "Try Again" and "Report Issue" actions
   
   Create feature-level boundaries:
   - ArtifactGenerationErrorBoundary
   - LivePreviewErrorBoundary
   - DevStudioErrorBoundary

4. **AI Service Error Handling**
   
   Update services/gemini.service.ts:
   ```typescript
   async function generateWithRetry<T>(
     operation: () => Promise<T>,
     maxRetries = 3,
     backoff = 1000
   ): Promise<T> {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await operation();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         
         // Exponential backoff
         await sleep(backoff * Math.pow(2, i));
         
         // Check if error is retryable
         if (!isRetryable(error)) throw error;
       }
     }
   }
   
   // Usage
   const artifact = await generateWithRetry(
     () => gemini.generateContent(prompt),
     3,
     1000
   );
   ```

5. **Monitoring Integration (Sentry)**
   
   Install and configure Sentry:
   ```bash
   npm install @sentry/react
   ```
   
   Create src/core/monitoring/sentry.ts:
   - Initialize Sentry
   - Configure error filtering
   - Add user context
   - Add breadcrumbs for debugging
   - Set up performance monitoring

6. **User Feedback System**
   
   Create toast notification system:
   - Success: "Artifact generated successfully!"
   - Warning: "Generation taking longer than usual..."
   - Error: "Generation failed. [Try Again] [Report Issue]"
   - Info: "Working in offline mode"
   
   Use ShadCN Toast component for consistency

7. **Offline Support**
   
   Update service worker:
   - Cache recent artifacts
   - Queue failed API requests
   - Show offline indicator
   - Retry queued requests when online

8. **Logging System**
   
   Create src/core/logging/logger.ts:
   ```typescript
   export const logger = {
     info: (message: string, meta?: any) => {
       if (process.env.NODE_ENV === 'development') {
         console.log(`[INFO] ${message}`, meta);
       }
       // Send to logging service in production
     },
     
     error: (error: Error | AppError, meta?: any) => {
       console.error(`[ERROR] ${error.message}`, error, meta);
       // Send to Sentry
     },
     
     ai: (operation: string, duration: number, success: boolean) => {
       // Track AI operation performance
     }
   };
   ```

9. **Performance Monitoring**
   
   Track key metrics:
   - AI generation time
   - App load time
   - Component render time
   - API response time
   
   Create src/core/monitoring/performance.ts:
   ```typescript
   export function trackAIGeneration(
     startTime: number,
     success: boolean,
     errorType?: string
   ) {
     const duration = Date.now() - startTime;
     logger.ai('generation', duration, success);
     
     if (duration > 15000) {
       logger.warn('Slow AI generation', { duration });
     }
   }
   ```

CONSTRAINTS:
- Errors must never crash the app
- User always has recovery path
- Error messages are helpful, not technical
- No sensitive data in error reports
- Graceful degradation for offline
- Performance impact < 5ms per request

SUCCESS CRITERIA:
- [ ] Error classification system implemented
- [ ] Centralized error handler created
- [ ] Error boundaries at feature level
- [ ] AI service retry logic implemented
- [ ] Sentry integrated and configured
- [ ] Toast notifications for user feedback
- [ ] Offline support functional
- [ ] Logging system implemented
- [ ] Performance monitoring active
- [ ] Error recovery flows tested

ERROR SCENARIOS TO HANDLE:
1. Network failure during generation
2. Gemini API rate limit exceeded
3. Invalid API key
4. Malformed AI response
5. Image upload too large
6. Browser storage quota exceeded
7. Iframe injection failure
8. Audio streaming disconnection

USER EXPERIENCE:
For each error, provide:
1. What happened (simple explanation)
2. Why it happened (if known)
3. What user can do (recovery steps)
4. Option to report issue

Example:
```
❌ Generation Failed
The AI service is temporarily unavailable.

Try:
• Wait a moment and try again
• Check your internet connection
• Use a different image or prompt

[Try Again]  [Report Issue]
```

DELIVERABLES:
1. src/core/errors/ directory with error system
2. src/core/monitoring/ with Sentry integration
3. src/core/logging/ with logger
4. Updated services with retry logic
5. Error boundaries for each feature
6. Toast notification system
7. Offline support in service worker
8. Documentation: Error Handling Guide
9. Documentation: Monitoring Dashboard Guide

TESTING:
- Simulate each error scenario
- Test recovery flows
- Verify error reporting to Sentry
- Test offline mode
- Load test (ensure no performance regression)

This is critical for production readiness. Users should never see unhandled errors.
```

---

## How to Use These Prompts

### For GitHub Copilot Workspace:
1. Open the project in GitHub
2. Navigate to "Copilot" → "New Workspace"
3. Paste the relevant prompt
4. Review and approve suggested changes

### For GitHub Copilot Agent Mode:
1. Open repository in VS Code
2. Open Copilot Chat (Ctrl+I or Cmd+I)
3. Switch to "Agent Mode"
4. Paste prompt and let agent work
5. Review changes in diff view

### For CLI/API Agents:
1. Use prompts with context via API
2. Provide repository access (read/write)
3. Monitor progress through logging
4. Review code before merging

---

## Best Practices for Using These Prompts

1. **One Prompt at a Time**: Don't run all 5 simultaneously
2. **Review Generated Code**: AI can make mistakes; always review
3. **Test Thoroughly**: Run tests after each implementation
4. **Iterate**: Use follow-up prompts to refine
5. **Document Changes**: Update CHANGELOG.md after completion

---

## Customization Guide

To adapt these prompts for other projects:

1. Replace project name and tech stack
2. Update file paths and structure
3. Adjust success criteria
4. Modify constraints for your needs
5. Update deliverables list

---

## Troubleshooting

### If Agent Gets Stuck:
```
Current task is taking too long. Please:
1. Summarize what you've completed so far
2. List any blockers or issues
3. Suggest next steps
4. Ask for human guidance if needed
```

### If Agent Makes Errors:
```
The previous implementation has issues:
[describe issues]

Please:
1. Analyze what went wrong
2. Fix the issues
3. Explain your approach
4. Test the fixes
```

---

## Success Metrics

After implementing all 5 prompts:

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| Test Coverage | 0% | 80%+ | `npm run test:coverage` |
| Security Score | F | A | `npm audit`, no API keys in bundle |
| CI/CD Pipeline | None | Full | All checks passing |
| Code Organization | 6/10 | 9/10 | Subjective review |
| Error Handling | Basic | Production | Error scenarios covered |

---

## Next Steps

1. **Phase 1**: Use Prompts 1 & 2 (Testing + Security) - Week 1
2. **Phase 2**: Use Prompt 3 (CI/CD) - Week 2  
3. **Phase 3**: Use Prompt 4 (Architecture) - Week 3-4
4. **Phase 4**: Use Prompt 5 (Monitoring) - Week 5

**Total Timeline**: 5-6 weeks to production-ready state

---

*Last Updated: December 29, 2025*  
*See AUDIT.md for full analysis and COPILOT_PROMPT.md for Copilot-specific guidance*
