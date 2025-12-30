<div align="center">

# Manifestation Lab v3.0

[![CI/CD](https://github.com/Krosebrook/Bringittolife/actions/workflows/ci.yml/badge.svg)](https://github.com/Krosebrook/Bringittolife/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)

Manifestation Lab is a production-grade neural synthesis environment that transfigures raw visual fragments—doodles, blueprints, or screenshots—into high-fidelity interactive digital artifacts.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Krosebrook/Bringittolife.git
cd Bringittolife

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Start development server
npm run dev

# 5. Open in browser
# Navigate to http://localhost:3000
```

### Your First Generation

1. **Upload an image**: Drag and drop a design mockup, wireframe, or screenshot
2. **Add a prompt**: Describe what you want to create (e.g., "Create a modern todo app with dark mode")
3. **Click Generate**: Watch as AI transforms your input into interactive code
4. **Refine**: Use text or voice commands to iterate on your creation

---

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
- **[SUMMARY.md](./SUMMARY.md)** - Quick overview and feature highlights
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and changes

### Technical Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and technical architecture
- **[PRD.md](./PRD.md)** - Product requirements and specifications
- **[ROADMAP.md](./ROADMAP.md)** - Future plans from MVP to v1.0+

### AI Integration Guides
- **[agents.md](./agents.md)** - AI agent architecture and decision logic
- **[gemini.md](./gemini.md)** - Google Gemini API integration guide
- **[claude.md](./claude.md)** - Claude AI integration guide (planned)

### Comprehensive Resources
- **[AUDIT.md](./AUDIT.md)** - Codebase audit and recommendations (15,700 words)
- **[REPOSITORIES.md](./REPOSITORIES.md)** - Reference repositories (14,600 words)
- **[GITHUB_AGENT_PROMPTS.md](./GITHUB_AGENT_PROMPTS.md)** - AI agent prompts (26,300 words)
- **[COPILOT_PROMPT.md](./COPILOT_PROMPT.md)** - GitHub Copilot context (16,300 words)

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # TypeScript type checking
```

### Project Structure

```
Bringittolife/
├── components/          # React components
│   ├── live/           # Live preview features
│   ├── hero/           # Landing page sections
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API integration layer
│   ├── gemini.ts       # Primary AI service
│   ├── live.ts         # Voice/audio service
│   └── docsService.ts  # Documentation generator
├── utils/              # Utility functions
│   ├── fileHelpers.ts  # File operations
│   ├── injection.ts    # Iframe injection logic
│   └── reactConverter.ts # HTML to React converter
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

### Code Style

This project follows strict code quality standards:

- **ESLint**: Enforced via `.eslintrc.json`
- **Prettier**: Code formatting via `.prettierrc`
- **TypeScript**: Strict mode enabled
- **React**: Function components with hooks
- **Tailwind CSS**: Utility-first styling

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 🧪 Testing

**Status**: Testing infrastructure planned for v3.1 (Q1 2025)

Planned testing stack:
- **Vitest** for unit tests
- **React Testing Library** for component tests
- **Playwright** for E2E tests

See [ROADMAP.md](./ROADMAP.md) for details.

---

## 🚢 Deployment

### Environment Variables

Create a `.env` file (see `.env.example`):

```bash
GEMINI_API_KEY=your_api_key_here
```

### Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

### Deploy Options

- **Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Krosebrook/Bringittolife)
- **Netlify**: [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Krosebrook/Bringittolife)
- **Self-hosted**: Serve the `dist/` directory with any static host

**Important**: Configure `GEMINI_API_KEY` in your deployment platform's environment variables.

---

## 🔒 Security

### API Key Security

⚠️ **Current Limitation**: API keys are bundled in the client code.

**Recommended**: Use a backend proxy to secure API keys (see [ROADMAP.md](./ROADMAP.md) v3.1).

### Reporting Security Issues

Please report security vulnerabilities privately to the maintainers. Do not open public issues for security concerns.

---

## 🤝 Contributing

We welcome contributions! Please see:

1. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Comprehensive contribution guide
2. **[Code of Conduct](./CONTRIBUTING.md#code-of-conduct)** - Community standards
3. **[ROADMAP.md](./ROADMAP.md)** - Planned features and priorities

### Quick Contribution Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/Bringittolife.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes and commit
git commit -m "Add your feature"

# 5. Push to your fork
git push origin feature/your-feature-name

# 6. Open a Pull Request on GitHub
```

---

<div align="center">

This project includes comprehensive documentation for AI-assisted development:

- **GitHub Copilot**: [.github/copilot-instructions.md](./.github/copilot-instructions.md)
- **AI Agents**: [agents.md](./agents.md) - Agent architecture and logic
- **Gemini API**: [gemini.md](./gemini.md) - Integration patterns
- **Best Practices**: [AUDIT.md](./AUDIT.md) - Code quality guidelines

---

## 📈 Project Status

- **Version**: 3.0.0
- **Status**: Active Development
- **License**: Apache 2.0
- **Maintained**: Yes

### Recent Updates

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

### Upcoming Features

See [ROADMAP.md](./ROADMAP.md) for planned features and timeline.

---

## 🌟 Showcase

*Coming soon: User-generated artifacts gallery*

---

## 💬 Community & Support

- **Issues**: [GitHub Issues](https://github.com/Krosebrook/Bringittolife/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Krosebrook/Bringittolife/discussions)
- **Documentation**: See [📚 Documentation](#-documentation) section above

---

## 📄 License

This project is licensed under the **Apache License 2.0**.

SPDX-License-Identifier: Apache-2.0

See [LICENSE](./LICENSE) for full license text.

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI models
- **React Team** for the amazing framework
- **Tailwind CSS** for utility-first styling
- **Open Source Community** for inspiration and tools

---

**Built with ❤️ by the Manifestation Lab Team**
