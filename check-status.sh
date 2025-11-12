#!/bin/bash

# Quick status check for Productivity Dashboard background service

APP_NAME="com.productivity.dashboard"
PLIST_PATH="$HOME/Library/LaunchAgents/${APP_NAME}.plist"

echo "🔍 Productivity Dashboard Status Check"
echo "======================================"
echo ""

# Check if plist exists
if [ -f "$PLIST_PATH" ]; then
    echo "✅ Service configuration found: $PLIST_PATH"
else
    echo "❌ Service configuration not found"
    exit 1
fi

echo ""

# Check if service is loaded
if launchctl list | grep -q "$APP_NAME"; then
    echo "✅ Service is RUNNING"
    echo ""
    echo "Process details:"
    launchctl list | grep "$APP_NAME"
    echo ""
    
    # Check if port is in use
    if lsof -i :1122 > /dev/null 2>&1; then
        echo "✅ Port 1122 is active"
        echo ""
        echo "Port details:"
        lsof -i :1122
    else
        echo "⚠️  Port 1122 is not in use"
    fi
else
    echo "❌ Service is NOT running"
    echo ""
    echo "To start it, run:"
    echo "  launchctl load $PLIST_PATH"
fi

echo ""
echo "📋 Useful commands:"
echo "  Stop:   launchctl unload $PLIST_PATH"
echo "  Start:  launchctl load $PLIST_PATH"
echo "  Logs:   tail -f dashboard.log"
echo "  Errors: tail -f dashboard-error.log"

