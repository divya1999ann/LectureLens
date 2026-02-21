#!/bin/bash

# LectureLens Backend Setup Script
# This script sets up the Django backend environment

echo "🚀 LectureLens Backend Setup"
echo "=============================="
echo ""

# Check if we're in the backend directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: Please run this script from the backend/ directory"
    exit 1
fi

# Step 1: Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
echo "✅ Virtual environment created"
echo ""

# Step 2: Activate and install dependencies
echo "📥 Installing dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Step 3: Setup environment
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env with your database credentials"
    echo ""
else
    echo "ℹ️  .env file already exists, skipping..."
    echo ""
fi

# Step 4: Database check
echo "🔍 Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is installed"
    echo ""
    echo "📋 To create the database, run:"
    echo "   psql postgres"
    echo ""
    echo "   Then execute:"
    echo "   CREATE USER lecturelens_user WITH PASSWORD 'strongpassword';"
    echo "   CREATE DATABASE lecturelens;"
    echo "   GRANT ALL PRIVILEGES ON DATABASE lecturelens TO lecturelens_user;"
    echo "   \\q"
    echo ""
else
    echo "⚠️  PostgreSQL not found. Please install it:"
    echo "   brew install postgresql"
    echo "   brew services start postgresql"
    echo ""
fi

# Step 5: Run migrations
echo "💾 Would you like to run migrations now? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Running migrations..."
    python manage.py makemigrations
    python manage.py migrate
    echo "✅ Migrations completed"
    echo ""
    
    # Step 6: Create superuser
    echo "👤 Would you like to create a superuser? (y/n)"
    read -r response2
    if [[ "$response2" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        python manage.py createsuperuser
        echo "✅ Superuser created"
        echo ""
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "The API will be available at: http://127.0.0.1:8000/"
echo "Admin panel: http://127.0.0.1:8000/admin/"
echo ""
