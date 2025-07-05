#!/bin/bash

echo "Starting PhotoEditor Pro Server..."
echo ""
echo "Opening browser in 3 seconds..."
echo ""

sleep 3

# Try to open browser (works on most systems)
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:8000
elif command -v open > /dev/null; then
    open http://localhost:8000
else
    echo "Please open http://localhost:8000 in your browser"
fi

python3 -m http.server 8000