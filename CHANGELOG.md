# Changelog

All notable changes to Manifestation Lab will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Automated testing infrastructure (Jest + React Testing Library)
- CI/CD pipeline with GitHub Actions
- API key server-side proxy for enhanced security
- Component library with Storybook
- Internationalization (i18n) support
- Dark/Light mode toggle
- Export to CodeSandbox/StackBlitz
- Collaborative editing via WebRTC
- Version control for artifacts
- Template marketplace

## [3.0.0] - 2024-12-30

### Added - Major Release
- **Multi-Modal Synthesis**: Image-to-code generation using Google Gemini 3 Pro
- **Live Refinement Agent**: Real-time artifact mutation via text and voice
- **Design Personas**: 5 distinct design systems (Modernist, Brutalist, Accessible, Playful, Enterprise)
- **Developer Suite**:
  - CSS Lab with live editing and auto-fix
  - Accessibility audit engine with WCAG compliance checks
  - Technical documentation generator
  - CI/CD pipeline visualization
- **Pro-Grade Exports**: React components, HTML files, and PDF generation
- **PWA Architecture**: Offline-first with service worker caching
- **Voice Input**: WebRTC-based voice-to-text refinement
- **Theme Lab**: Dynamic HSL color system with live preview
- **Reference Panel**: Integrated grounding sources from Google Search
- **Pan/Zoom Controls**: Infinite canvas navigation with device mode switching

### Technical Architecture
- React 19.2 with TypeScript 5.8
- Vite 6.2 build tooling
- Tailwind CSS via dynamic CDN
- Google Gemini API integration (@google/genai v1.28.0)
- Heroicons v2.2 for UI icons
- LocalStorage persistence with smart quota management
- Iframe injection architecture for sandboxed previews

### Documentation
- Comprehensive AUDIT.md (15,700 words)
- Technical ARCHITECTURE.md
- Product Requirements Document (PRD.md)
- SUMMARY.md quick start guide
- COPILOT_PROMPT.md for GitHub Copilot (16,300 words)
- GITHUB_AGENT_PROMPTS.md with 5 engineered prompts (26,300 words)
- REPOSITORIES.md with 6 reference repositories (14,600 words)

### Security
- SPDX-License-Identifier: Apache-2.0
- Client-side API key configuration (requires backend proxy for production)
- Content sanitization in iframe injection
- ARIA labels for accessibility

## [2.0.0] - 2024-Q3 (Historical)

### Added
- Initial React implementation
- Basic image upload and processing
- Gemini API integration
- Simple HTML generation

### Changed
- Migrated from vanilla JavaScript to React
- Updated to Gemini 1.5 Pro

## [1.0.0] - 2024-Q1 (Historical)

### Added
- Initial prototype
- Basic prompt-to-HTML generation
- Simple UI with image upload
- Gemini Flash model integration

---

## Version Naming Convention

- **Major (X.0.0)**: Breaking changes, architectural overhauls, major feature additions
- **Minor (0.X.0)**: New features, non-breaking enhancements, significant improvements
- **Patch (0.0.X)**: Bug fixes, minor tweaks, documentation updates

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on proposing changes.

## Links

- [GitHub Repository](https://github.com/Krosebrook/Bringittolife)
- [Issue Tracker](https://github.com/Krosebrook/Bringittolife/issues)
- [Documentation](./README.md)
