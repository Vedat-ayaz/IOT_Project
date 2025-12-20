#!/bin/bash

# Smart Faucet Mobile App - Setup Script
# This script helps you set up the mobile app for the first time

echo "🚀 Smart Faucet Mobile App Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✅ npm found: $(npm -v)"

# Check if we're in the mobile directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the mobile directory"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and set your API_BASE_URL"
    echo "   - For iOS Simulator: http://localhost:8080/api"
    echo "   - For Android Emulator: http://10.0.2.2:8080/api"
    echo "   - For Physical Device: http://YOUR_IP:8080/api"
else
    echo ""
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the app, run:"
echo "  npm start"
echo ""
echo "Then:"
echo "  - Press 'i' for iOS Simulator"
echo "  - Press 'a' for Android Emulator"
echo "  - Scan QR code for physical device"
echo ""
echo "For more help, see:"
echo "  - QUICKSTART.md"
echo "  - README.md"
echo ""
