#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Smart Faucet Mobile - Installation Wizard   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${YELLOW}[1/5] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
echo ""

# Step 2: Check npm
echo -e "${YELLOW}[2/5] Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm found: $NPM_VERSION${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}[3/5] Installing dependencies...${NC}"
echo "This may take a few minutes. Please wait..."
npm install --silent
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
echo ""

# Step 4: Setup environment
echo -e "${YELLOW}[4/5] Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠  Please edit .env and set your API_BASE_URL:${NC}"
    echo "   • iOS Simulator: http://localhost:8080/api"
    echo "   • Android Emulator: http://10.0.2.2:8080/api"
    echo "   • Physical Device: http://YOUR_IP:8080/api"
else
    echo -e "${BLUE}ℹ  .env file already exists${NC}"
fi
echo ""

# Step 5: Check backend
echo -e "${YELLOW}[5/5] Checking backend connection...${NC}"
if [ -f ".env" ]; then
    API_URL=$(grep API_BASE_URL .env | cut -d '=' -f2)
    if [ -z "$API_URL" ]; then
        echo -e "${YELLOW}⚠  API_BASE_URL not set in .env${NC}"
    else
        echo -e "${BLUE}ℹ  API URL: $API_URL${NC}"
        echo -e "${YELLOW}⚠  Make sure your backend is running at this address${NC}"
    fi
fi
echo ""

# Success message
echo -e "${GREEN}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Installation Complete! 🎉           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Edit .env file:"
echo "   ${YELLOW}nano .env${NC}"
echo ""
echo "2. Start the app:"
echo "   ${YELLOW}npm start${NC}"
echo ""
echo "3. Choose platform:"
echo "   • Press ${GREEN}i${NC} for iOS Simulator"
echo "   • Press ${GREEN}a${NC} for Android Emulator"
echo "   • Scan QR code for physical device"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "   • README.md - Complete documentation"
echo "   • QUICKSTART.md - Quick start guide"
echo "   • PROJE_OZETI.md - Turkish summary"
echo "   • ARCHITECTURE.md - Architecture overview"
echo ""
echo -e "${YELLOW}Need help? Check the troubleshooting section in README.md${NC}"
echo ""
