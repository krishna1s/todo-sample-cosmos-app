#!/bin/bash

# Coverage Report Generator for E2E Tests
# This script processes coverage data collected during Playwright tests

set -e

echo "📊 Generating Test Coverage Report"
echo "=================================="

# Check if we're in the tests directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the tests directory"
    echo "   cd tests && ./generate-coverage-report.sh"
    exit 1
fi

# Check if coverage directory exists
if [ ! -d "coverage" ]; then
    echo "⚠️  No coverage directory found. Running tests with coverage enabled first..."
    COVERAGE=true npx playwright test
fi

# Check if coverage files exist
COVERAGE_FILES=$(find coverage -name "*_coverage.json" 2>/dev/null | wc -l)
if [ "$COVERAGE_FILES" -eq 0 ]; then
    echo "⚠️  No coverage data found. Running tests with coverage enabled..."
    COVERAGE=true npx playwright test
fi

echo "🔍 Found $COVERAGE_FILES coverage data files"

# Generate merged coverage report
echo "📝 Merging coverage data..."
node -e "
const fs = require('fs');
const path = require('path');

const coverageDir = 'coverage';
const files = fs.readdirSync(coverageDir).filter(f => f.endsWith('_coverage.json'));

if (files.length === 0) {
  console.log('No coverage files found');
  process.exit(1);
}

const mergedCoverage = [];
const urlCoverage = new Map();

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(coverageDir, file)));
  for (const entry of data) {
    const url = entry.url;
    if (urlCoverage.has(url)) {
      // Merge ranges for the same URL
      const existing = urlCoverage.get(url);
      existing.ranges.push(...entry.ranges);
    } else {
      urlCoverage.set(url, entry);
    }
  }
}

const mergedData = Array.from(urlCoverage.values());
fs.writeFileSync(path.join(coverageDir, 'merged-coverage.json'), JSON.stringify(mergedData, null, 2));

console.log(\`Merged coverage data: \${mergedData.length} unique files\`);
"

# Generate a simple HTML coverage report
echo "🎨 Generating HTML coverage report..."
node -e "
const fs = require('fs');
const path = require('path');

const coverageFile = path.join('coverage', 'merged-coverage.json');
if (!fs.existsSync(coverageFile)) {
  console.log('No merged coverage file found');
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coverageFile));

let totalLines = 0;
let coveredLines = 0;
let totalFunctions = 0;
let coveredFunctions = 0;

const fileDetails = coverage.map(entry => {
  const url = entry.url;
  const fileName = url.split('/').pop() || url;
  
  // Simple calculation based on ranges
  const ranges = entry.ranges || [];
  const fileCovered = ranges.length > 0;
  const lineCount = ranges.reduce((sum, range) => sum + (range.end - range.start), 0);
  
  totalLines += 100; // Estimate
  if (fileCovered) coveredLines += lineCount / 10; // Rough estimate
  
  return {
    file: fileName,
    url: url,
    covered: fileCovered,
    ranges: ranges.length
  };
});

const linesCoverage = totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : 0;

const html = \`
<!DOCTYPE html>
<html>
<head>
    <title>E2E Test Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .file-list { border-collapse: collapse; width: 100%; }
        .file-list th, .file-list td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .file-list th { background-color: #f8f9fa; }
        .covered { color: #28a745; }
        .not-covered { color: #dc3545; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <h1>📊 E2E Test Coverage Report</h1>
    
    <div class=\"summary\">
        <h2>Coverage Summary</h2>
        <div class=\"metric\">
            <div class=\"metric-value\">\${coverage.length}</div>
            <div>Files Analyzed</div>
        </div>
        <div class=\"metric\">
            <div class=\"metric-value\">\${fileDetails.filter(f => f.covered).length}</div>
            <div>Files with Coverage</div>
        </div>
        <div class=\"metric\">
            <div class=\"metric-value\">\${linesCoverage}%</div>
            <div>Estimated Coverage</div>
        </div>
    </div>

    <h2>File Details</h2>
    <table class=\"file-list\">
        <thead>
            <tr>
                <th>File</th>
                <th>URL</th>
                <th>Coverage Status</th>
                <th>Execution Ranges</th>
            </tr>
        </thead>
        <tbody>
            \${fileDetails.map(file => \`
                <tr>
                    <td>\${file.file}</td>
                    <td style=\"font-size: 12px; color: #666;\">\${file.url}</td>
                    <td class=\"\${file.covered ? 'covered' : 'not-covered'}\">
                        \${file.covered ? '✅ Covered' : '❌ Not Covered'}
                    </td>
                    <td>\${file.ranges}</td>
                </tr>
            \`).join('')}
        </tbody>
    </table>

    <h2>📈 Coverage Analysis</h2>
    <p>This report shows which JavaScript/TypeScript files were executed during the E2E test run.</p>
    <ul>
        <li><strong>Files Analyzed:</strong> Total number of source files detected</li>
        <li><strong>Files with Coverage:</strong> Files that had code executed during tests</li>
        <li><strong>Execution Ranges:</strong> Number of code execution ranges per file</li>
    </ul>

    <h2>🔍 Understanding Coverage</h2>
    <p>This coverage report is collected from browser execution during E2E tests. It shows:</p>
    <ul>
        <li>Which frontend JavaScript/TypeScript files were loaded and executed</li>
        <li>Code paths that were exercised during test scenarios</li>
        <li>Files that may need additional test coverage</li>
    </ul>

    <p><em>Generated on: \${new Date().toISOString()}</em></p>
</body>
</html>
\`;

fs.writeFileSync(path.join('coverage', 'index.html'), html);
console.log('HTML coverage report generated: coverage/index.html');
"

echo ""
echo "✅ Coverage Report Generated!"
echo ""
echo "📁 Coverage Files:"
echo "   📊 HTML Report:    coverage/index.html"
echo "   📋 Raw Data:      coverage/merged-coverage.json"
echo "   📄 Individual:    coverage/*_coverage.json"
echo ""
echo "🌐 Open the HTML report in your browser:"
echo "   file://$(pwd)/coverage/index.html"
echo ""
echo "💡 Tip: Run tests with COVERAGE=true to collect coverage data"
echo "   COVERAGE=true npx playwright test"