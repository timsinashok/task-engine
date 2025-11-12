#!/bin/bash

# Setup script for Productivity Dashboard as a macOS background app
# This script will:
# 1. Build the app
# 2. Create a launchd plist to auto-start on login
# 3. Load the service

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_NAME="com.productivity.dashboard"
PLIST_NAME="${APP_NAME}.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_NAME}"

echo "🚀 Setting up Productivity Dashboard as a background app..."
echo ""

# Step 1: Build the app
echo "📦 Building the app..."
npm run build

if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist directory not found"
  exit 1
fi

echo "✅ Build complete!"
echo ""

# Step 2: Create launchd plist
echo "📝 Creating launchd configuration..."

# Get the full path to node
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
  echo "❌ Node.js not found in PATH. Please install Node.js first."
  exit 1
fi

# Create the plist content
cat > "$PLIST_PATH" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${APP_NAME}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${NODE_PATH}</string>
        <string>${SCRIPT_DIR}/server.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${SCRIPT_DIR}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${SCRIPT_DIR}/dashboard.log</string>
    <key>StandardErrorPath</key>
    <string>${SCRIPT_DIR}/dashboard-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
        <key>PORT</key>
        <string>1122</string>
    </dict>
</dict>
</plist>
EOF

echo "✅ Created plist at: $PLIST_PATH"
echo ""

# Step 3: Unload existing service if it exists
if launchctl list | grep -q "${APP_NAME}"; then
    echo "🔄 Unloading existing service..."
    launchctl unload "$PLIST_PATH" 2>/dev/null || true
fi

# Step 4: Load the service
echo "🚀 Loading service..."
launchctl load "$PLIST_PATH"

echo ""
echo "✅ Setup complete!"
echo ""
# Load PORT from .env.local if it exists
PORT=1122
if [ -f "${SCRIPT_DIR}/.env.local" ]; then
    ENV_PORT=$(grep "^PORT=" "${SCRIPT_DIR}/.env.local" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
    if [ ! -z "$ENV_PORT" ]; then
        PORT=$ENV_PORT
    fi
fi

echo "📋 Next steps:"
echo "   1. The app is now running at: http://localhost:${PORT}"
echo "   2. It will automatically start when you log in"
echo "   3. To stop it: launchctl unload $PLIST_PATH"
echo "   4. To start it: launchctl load $PLIST_PATH"
echo "   5. To check status: launchctl list | grep ${APP_NAME}"
echo "   6. View logs: tail -f ${SCRIPT_DIR}/dashboard.log"
echo ""
echo "🌐 Open in browser: http://localhost:${PORT}"

