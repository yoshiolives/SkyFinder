#!/bin/bash

# Development startup script

echo "🚀 Starting Places & AI Application in development mode..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run setup.sh first."
    exit 1
fi

# Start the application
echo "🔄 Starting both frontend and backend..."
npm run dev





