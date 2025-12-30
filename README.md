<div align="center">

# Manifestation Lab v3.0

**AI-Powered Code Generation from Visual Designs**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Gemini-3%20Pro-8e75b2.svg)](https://ai.google.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[Features](#-core-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Roadmap](#-roadmap) • [Contributing](#-contributing)

</div>

---

## 🎯 What is Manifestation Lab?

Manifestation Lab is a production-grade neural synthesis environment that transforms visual designs—doodles, blueprints, or screenshots—into high-fidelity interactive code using AI.

**Key Capabilities**:
- 🖼️ **Image-to-Code**: Upload designs and generate HTML/CSS/JS instantly
- 💬 **Conversational AI**: Refine artifacts through natural language chat
- 🎤 **Voice Commands**: Hands-free development with voice-to-text
- 🎨 **Design Systems**: 5 built-in personas (Modernist, Brutalist, Accessible, etc.)
- 🛠️ **Developer Tools**: CSS editor, A11y audit, docs generator, CI/CD simulator
- 📦 **Multi-Format Export**: HTML, React, PDF with one click

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher  
- **Google Gemini API Key**: Get yours at [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Krosebrook/Bringittolife.git
   cd Bringittolife
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to `http://localhost:3000`

6. **Create your first artifact**:
   - Upload an image or screenshot
   - Describe what you want to build
   - Click "Generate" and watch the magic happen! ✨

### Alternative: Direct Browser Usage

For quick testing without Node.js:

1. Download the repository
2. Set `GEMINI_API_KEY` in your environment
3. Open `index.html` in a modern browser
4. Start creating!

## ✨ Core Features

- **Multi-Modal Synthesis**: Bridge the gap between static imagery (PNG, JPG, PDF) and functional code using Gemini 3 Pro.
- **Live Refinement Agent**: Mutate your artifacts in real-time via text or voice commands.
- **Design Personas**: Switch between Modernist, Brutalist, Accessible, Playful, and Enterprise design systems instantly.
- **Developer Suite**:
    - **CSS Lab**: Real-time CSS editor with an integrated linter and auto-fix capabilities.
    - **Accessibility Audit**: WCAG compliance engine with one-click "Heal All" functionality.
    - **Technical Manifesto**: AI-generated documentation including purpose, I/O schemas, and runtime logic.
    - **Pipeline Visualization**: Simulated CI/CD steps for production readiness.
- **Pro-Grade Exports**: Export artifacts as modular React components, standalone HTML files, or high-fidelity PDFs.
- **PWA Ready**: Offline-first architecture with service worker caching.

## 🛠️ Technical Stack

<table>
<tr>
<td><b>Frontend</b></td>
<td>React 19.2, TypeScript 5.8, Vite 6.2</td>
</tr>
<tr>
<td><b>Styling</b></td>
<td>Tailwind CSS (Dynamic Play CDN)</td>
</tr>
<tr>
<td><b>AI Engine</b></td>
<td>Google Gemini 3 Pro, Gemini 2.5 Flash</td>
</tr>
<tr>
<td><b>Icons</b></td>
<td>Heroicons v2.2</td>
</tr>
<tr>
<td><b>PWA</b></td>
<td>Service Worker, Offline-First Architecture</td>
</tr>
</table>

**Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## 📚 Documentation

### Getting Started
- 📖 **[SUMMARY.md](./SUMMARY.md)** - Quick overview and walkthrough
- 🚀 **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project
- 🔒 **[SECURITY.md](./SECURITY.md)** - Security policy and vulnerability reporting

### Technical Documentation
- 🏗️ **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design decisions
- 🔧 **[API.md](./API.md)** - Service layer and API documentation
- 🧩 **[COMPONENTS.md](./COMPONENTS.md)** - Component architecture guide
- 📝 **[PRD.md](./PRD.md)** - Product requirements document

### AI Integration
- 🤖 **[docs/gemini.md](./docs/gemini.md)** - Gemini API integration guide
- 🎯 **[docs/agents.md](./docs/agents.md)** - Agent architecture and patterns
- 💡 **[COPILOT_PROMPT.md](./COPILOT_PROMPT.md)** - GitHub Copilot context (16,300 words)
- 🎨 **[GITHUB_AGENT_PROMPTS.md](./GITHUB_AGENT_PROMPTS.md)** - AI agent prompts (26,300 words)

### Project Management
- 🗺️ **[ROADMAP.md](./ROADMAP.md)** - Development roadmap and future plans
- 📋 **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes
- 🔍 **[AUDIT.md](./AUDIT.md)** - Comprehensive codebase audit (15,700 words)
- 📚 **[REPOSITORIES.md](./REPOSITORIES.md)** - Reference repositories (14,600 words)

---

## 🗺️ Roadmap

**v3.0 (Current)**: Production Beta
- ✅ Multi-modal AI generation
- ✅ Voice refinement
- ✅ 5 design personas
- ✅ Developer suite

**v3.1 (Q1 2025)**: Quality & Stability
- 🔨 Testing infrastructure
- 🔨 CI/CD pipeline
- 🔨 ESLint + Prettier
- 🔨 Security hardening

**v3.2 (Q2 2025)**: Performance & Scale
- 🔮 Backend API proxy
- 🔮 Performance optimization
- 🔮 Monitoring & analytics

**v4.0 (Q3 2025)**: Collaboration
- 🔮 Real-time multi-user editing
- 🔮 Public artifact gallery
- 🔮 Cloud sync

See the full [ROADMAP.md](./ROADMAP.md) for detailed plans.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Read the guides**:
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
   - [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards

2. **Find an issue**:
   - Browse [open issues](https://github.com/Krosebrook/Bringittolife/issues)
   - Look for `good first issue` labels

3. **Submit a PR**:
   - Fork the repository
   - Create a feature branch
   - Make your changes
   - Submit a pull request

**Quick Links**:
- 🐛 [Report a Bug](https://github.com/Krosebrook/Bringittolife/issues/new?template=bug_report.yml)
- ✨ [Request a Feature](https://github.com/Krosebrook/Bringittolife/issues/new?template=feature_request.yml)
- 📝 [Documentation Issue](https://github.com/Krosebrook/Bringittolife/issues/new?template=documentation.yml)

---

## 📊 Project Stats

- **Lines of Code**: ~5,000+
- **Components**: 30+
- **Documentation**: 100,000+ words
- **AI Models**: 4 Gemini models
- **Design Personas**: 5

---

## 🛡️ License & Credits

**License**: Apache 2.0 - See [LICENSE](./LICENSE) for details

**Built with**:
- [React](https://react.dev) - UI framework
- [Google Gemini](https://ai.google.dev) - AI models
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Heroicons](https://heroicons.com) - Icons

**Acknowledgments**:
- Google AI team for Gemini API
- React team for React 19
- Open source community

---

<div align="center">

**[⭐ Star this repo](https://github.com/Krosebrook/Bringittolife)** if you find it useful!

Made with ❤️ by [Krosebrook](https://github.com/Krosebrook)

[Report Bug](https://github.com/Krosebrook/Bringittolife/issues) • [Request Feature](https://github.com/Krosebrook/Bringittolife/issues) • [Documentation](./SUMMARY.md)

</div>
