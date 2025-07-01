#!/bin/bash

# E2E Test Runner Script for Todo Application
# This script helps run the comprehensive E2E test suite

set -e

echo "🚀 Todo Application E2E Test Runner"
echo "======================================"

# Check if we're in the tests directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the tests directory"
    echo "   cd tests && ./run-e2e-tests.sh"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing test dependencies..."
    npm install
fi

# Install Playwright browsers if needed
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo "🎭 Installing Playwright browsers..."
    npx playwright install
fi

# Check if application is running
echo "🔍 Checking if application is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application is running on http://localhost:3000"
    APP_RUNNING=true
else
    echo "⚠️  Application is not running on http://localhost:3000"
    echo ""
    echo "To run the application:"
    echo "  1. In a new terminal, navigate to the repository root"
    echo "  2. Start the web frontend: cd src/web && npm install && npm start"
    echo "  3. Start the API backend: cd src/api && dotnet run"
    echo "  4. Or use Azure Developer CLI: azd up"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
    APP_RUNNING=false
fi

# Set test environment
export REACT_APP_WEB_BASE_URL="${REACT_APP_WEB_BASE_URL:-http://localhost:3000}"

echo ""
echo "🧪 Test Environment:"
echo "   Base URL: $REACT_APP_WEB_BASE_URL"
echo "   Playwright Config: $(pwd)/playwright.config.ts"
echo ""

# Parse command line arguments
TEST_SUITE=""
HEADED=""
DEBUG=""
TIMEOUT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --suite)
            TEST_SUITE="$2"
            shift 2
            ;;
        --headed)
            HEADED="--headed"
            shift
            ;;
        --debug)
            DEBUG="--debug"
            shift
            ;;
        --timeout)
            TIMEOUT="--timeout=$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --suite SUITE    Run specific test suite (list-management, item-management, etc.)"
            echo "  --headed         Run tests in headed mode (visible browser)"
            echo "  --debug          Run tests in debug mode"
            echo "  --timeout MS     Set custom timeout in milliseconds"
            echo "  --help           Show this help message"
            echo ""
            echo "Available test suites:"
            echo "  - todo.spec.ts (original basic test)"
            echo "  - list-management.spec.ts"
            echo "  - item-management.spec.ts"
            echo "  - item-details.spec.ts"
            echo "  - ui-interactions.spec.ts"
            echo "  - advanced-workflows.spec.ts"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Run all tests"
            echo "  $0 --suite list-management.spec.ts   # Run list management tests"
            echo "  $0 --headed                          # Run all tests with visible browser"
            echo "  $0 --debug --suite todo.spec.ts      # Debug the basic test"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build test command
TEST_CMD="npx playwright test"

if [ -n "$TEST_SUITE" ]; then
    TEST_CMD="$TEST_CMD $TEST_SUITE"
fi

if [ -n "$HEADED" ]; then
    TEST_CMD="$TEST_CMD $HEADED"
fi

if [ -n "$DEBUG" ]; then
    TEST_CMD="$TEST_CMD $DEBUG"
fi

if [ -n "$TIMEOUT" ]; then
    TEST_CMD="$TEST_CMD $TIMEOUT"
fi

echo "🎯 Running tests with command: $TEST_CMD"
echo ""

# Run the tests
eval $TEST_CMD

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed successfully!"
else
    echo "❌ Some tests failed (exit code: $TEST_EXIT_CODE)"
    echo ""
    echo "Troubleshooting tips:"
    echo "  - Ensure the application is running and accessible"
    echo "  - Check browser console for errors: npx playwright test --headed"
    echo "  - Run in debug mode: npx playwright test --debug"
    echo "  - View test traces: npx playwright show-trace test-results/**/trace.zip"
fi

echo ""
echo "📊 Test Reports:"
echo "   HTML Report: playwright-report/index.html"
echo "   Test Results: test-results/"
echo ""
echo "🔍 For more details, see TEST_DOCUMENTATION.md"

exit $TEST_EXIT_CODE