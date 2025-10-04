#!/bin/bash

# Places & AI Application Setup Script

echo "🚀 Setting up Places & AI Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed (for Flask option)
if ! command -v python3 &> /dev/null; then
    echo "⚠️  Python 3 is not installed. Flask backend will not be available."
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies (Node.js)
echo "📦 Installing backend dependencies (Node.js)..."
cd backend
npm install
cd ..

# Install backend dependencies (Flask)
if command -v python3 &> /dev/null; then
    echo "📦 Installing backend dependencies (Flask)..."
    cd backend-flask
    pip3 install -r requirements.txt
    cd ..
fi

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your actual configuration values."
fi

# Create directories if they don't exist
mkdir -p logs
mkdir -p uploads

echo "✅ Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Set up Snowflake database"
echo "3. Configure Gemini API key"
echo "4. Run 'npm run dev' to start the application"
echo ""
echo "For detailed instructions, see docs/README.md"





