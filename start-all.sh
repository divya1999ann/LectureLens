#!/bin/bash

echo "🚀 Starting LectureLens - All Services"
echo "======================================"
echo ""
echo "Opening 3 terminal windows..."
echo ""
echo "Terminal 1: Django Backend (port 8000)"
echo "Terminal 2: AI Service (port 8001)"
echo "Terminal 3: React Frontend (port 3000)"
echo ""
echo "Press Ctrl+C in each terminal to stop"
echo ""

# For macOS - open 3 terminal tabs
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/backend && source venv/bin/activate && python manage.py runserver"'
sleep 2
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/ai-service && source venv/bin/activate && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001"'
sleep 2
osascript -e 'tell application "Terminal" to do script "cd '"$(pwd)"'/frontend && npm start"'

echo "✅ All services starting in separate terminals!"
