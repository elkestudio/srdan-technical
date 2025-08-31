#!/bin/bash

# Elke Battery Plugin Development Script
# Usage: ./update-plugin.sh

echo "🔋 Elke Battery Plugin - Development Helper"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Navigate to project root
PROJECT_ROOT="e:/web production new/srdan-technical"
PLUGIN_DIR="$PROJECT_ROOT/elke-battery"

echo "Project Root: $PROJECT_ROOT"
echo "Plugin Directory: $PLUGIN_DIR"
echo ""

# Check if plugin directory exists
if [ ! -d "$PLUGIN_DIR" ]; then
    print_error "Plugin directory not found: $PLUGIN_DIR"
    exit 1
fi

print_status "Plugin directory found"

# Step 1: Build the plugin
echo ""
echo "Step 1: Building plugin..."
cd "$PLUGIN_DIR"

if npm run build; then
    print_status "Plugin built successfully"
else
    print_error "Plugin build failed"
    exit 1
fi

# Step 2: Navigate back to project root
cd "$PROJECT_ROOT"

# Step 3: Reinstall plugin
echo ""
echo "Step 2: Reinstalling plugin in main project..."

if npm install file:./elke-battery --force; then
    print_status "Plugin installed successfully"
else
    print_error "Plugin installation failed"
    exit 1
fi

# Step 4: Sync with Capacitor
echo ""
echo "Step 3: Syncing with Capacitor..."

if npx cap sync; then
    print_status "Capacitor sync completed"
else
    print_warning "Capacitor sync completed with warnings"
fi

# Step 5: Display available commands
echo ""
echo "🚀 Available development commands:"
echo "================================"
echo "npm start                    # Start development server"
echo "npx cap run android         # Run on Android"
echo "npx cap run ios             # Run on iOS"
echo "npx cap build android       # Build for Android"
echo "npx cap build ios           # Build for iOS"
echo ""

print_status "Plugin update completed! 🎉"
echo ""
echo "You can now test the plugin by running:"
echo "npm start"
echo ""
echo "Then navigate to: http://localhost:8100/tabs/plugin"
