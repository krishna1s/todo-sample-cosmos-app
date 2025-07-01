#!/bin/bash

# Azure Endpoint Test Runner
# This script demonstrates how to run E2E tests against your Azure deployment

set -e

echo "🌐 Running E2E Tests against Azure Endpoint"
echo "==========================================="

# Set the Azure endpoint URL
export REACT_APP_WEB_BASE_URL="https://app-web-ocwiawb26beca.azurewebsites.net"

echo "🎯 Target URL: $REACT_APP_WEB_BASE_URL"
echo "📊 Coverage collection: ENABLED"
echo ""

# Test connectivity to the endpoint
echo "🔍 Testing connectivity to Azure endpoint..."
if curl -s --connect-timeout 10 --max-time 30 "$REACT_APP_WEB_BASE_URL" > /dev/null; then
    echo "✅ Endpoint is accessible"
else
    echo "❌ Endpoint connectivity issue - continuing with test setup demo"
    echo ""
    echo "💡 Note: If running in a restricted environment, you may need to:"
    echo "   1. Run tests from a machine with internet access"
    echo "   2. Update firewall/network settings"
    echo "   3. Verify the Azure endpoint is running and accessible"
    echo ""
fi

echo ""
echo "🧪 Running E2E Tests with Coverage Collection..."
echo "=============================================="

# Run tests with coverage enabled
export COVERAGE=true

# Run specific test suite to demonstrate coverage
echo "Running list management tests with coverage..."
./run-e2e-tests.sh --coverage --suite list-management.spec.ts

echo ""
echo "📊 Coverage Report Generation"
echo "============================="

# Generate coverage report
if [ -d "coverage" ]; then
    ./generate-coverage-report.sh
    
    echo ""
    echo "✅ Coverage Analysis Complete!"
    echo ""
    echo "📁 Generated Files:"
    echo "   📊 HTML Report:    coverage/index.html"
    echo "   📋 Raw Data:      coverage/merged-coverage.json"
    echo "   📄 Individual:    coverage/*_coverage.json"
    echo ""
    echo "🌐 To view the HTML report:"
    echo "   file://$(pwd)/coverage/index.html"
    echo ""
    
    # Show summary of coverage files
    if [ -f "coverage/merged-coverage.json" ]; then
        echo "📈 Coverage Summary:"
        node -e "
        const fs = require('fs');
        const coverage = JSON.parse(fs.readFileSync('coverage/merged-coverage.json'));
        console.log(\`   Files analyzed: \${coverage.length}\`);
        console.log(\`   Files with coverage: \${coverage.filter(f => f.ranges && f.ranges.length > 0).length}\`);
        "
    fi
else
    echo "⚠️  No coverage data generated (likely due to connectivity issues)"
    echo ""
    echo "📝 Coverage Setup Instructions:"
    echo "   1. Ensure application is accessible at: $REACT_APP_WEB_BASE_URL"
    echo "   2. Run: COVERAGE=true ./run-e2e-tests.sh"
    echo "   3. Generate report: ./generate-coverage-report.sh"
fi

echo ""
echo "🔧 For manual execution:"
echo "   export REACT_APP_WEB_BASE_URL=\"https://app-web-ocwiawb26beca.azurewebsites.net\""
echo "   COVERAGE=true ./run-e2e-tests.sh --coverage"
echo "   ./generate-coverage-report.sh"