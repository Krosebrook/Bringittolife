#!/bin/bash

# Manifestation Lab - Automated Setup Script
# This script sets up the development environment automatically

set -e  # Exit on error

echo "
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         Manifestation Lab - Development Setup             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${YELLOW}[1/6] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version must be 18 or higher (found: v$NODE_VERSION)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"

# Install dependencies
echo -e "\n${YELLOW}[2/6] Installing dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
echo -e "\n${YELLOW}[3/6] Setting up environment configuration...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file from .env.example${NC}"
    echo -e "${YELLOW}⚠ Please edit .env and add your GEMINI_API_KEY${NC}"
    
    # Prompt for API key
    read -p "Do you have a Gemini API key ready? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your Gemini API key: " API_KEY
        sed -i.bak "s/your_gemini_api_key_here/$API_KEY/" .env
        rm .env.bak 2>/dev/null || true
        echo -e "${GREEN}✓ API key configured${NC}"
    else
        echo -e "${YELLOW}⚠ Get your API key from: https://makersuite.google.com/app/apikey${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Run type checking
echo -e "\n${YELLOW}[4/6] Running TypeScript type check...${NC}"
npm run type-check

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Type check passed${NC}"
else
    echo -e "${YELLOW}⚠ Type check failed (non-critical)${NC}"
fi

# Run linting
echo -e "\n${YELLOW}[5/6] Running ESLint...${NC}"
npm run lint

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Linting passed${NC}"
else
    echo -e "${YELLOW}⚠ Linting issues found. Run 'npm run lint:fix' to auto-fix${NC}"
fi

# Try to build
echo -e "\n${YELLOW}[6/6] Testing build process...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed. Check errors above.${NC}"
    exit 1
fi

# Success message
echo -e "
${GREEN}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              ✓ Setup completed successfully!              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${NC}

${YELLOW}Next steps:${NC}

1. ${GREEN}Start development server:${NC}
   npm run dev

2. ${GREEN}Open in browser:${NC}
   http://localhost:3000

3. ${GREEN}Try your first generation:${NC}
   - Upload an image or enter a text prompt
   - Click 'Generate' and watch the magic happen!

${YELLOW}Useful commands:${NC}

  npm run dev         - Start development server
  npm run build       - Build for production
  npm run lint        - Check code quality
  npm run lint:fix    - Auto-fix linting issues
  npm run format      - Format code with Prettier
  npm run type-check  - Check TypeScript types

${YELLOW}Documentation:${NC}

  README.md           - Project overview
  CONTRIBUTING.md     - Contribution guidelines
  ARCHITECTURE.md     - Technical architecture
  gemini.md          - Gemini API guide
  TROUBLESHOOTING.md - Common issues and solutions

${YELLOW}Need help?${NC}

  Issues:      https://github.com/Krosebrook/Bringittolife/issues
  Discussions: https://github.com/Krosebrook/Bringittolife/discussions

Happy coding! 🚀
"
