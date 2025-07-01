# Code Coverage Guide for E2E Tests

## Overview

This E2E test suite includes comprehensive code coverage collection to measure how much of the frontend application code is executed during testing. This guide explains how to use, interpret, and optimize coverage data for the Todo application.

## What is E2E Code Coverage?

E2E code coverage tracks which parts of your frontend JavaScript/TypeScript code are executed when users (or tests) interact with your application. Unlike unit test coverage, which tests individual functions, E2E coverage shows:

- **Real User Interactions**: Coverage reflects actual user workflows
- **Component Integration**: Shows how components work together
- **Browser Execution**: Tracks code as it runs in a real browser environment
- **End-to-End Paths**: Covers complete user journeys from UI to backend

## Getting Started

### 1. Enable Coverage Collection

```bash
# Method 1: Using the test runner script
./run-e2e-tests.sh --coverage

# Method 2: Environment variable
COVERAGE=true npx playwright test

# Method 3: For specific test suites
./run-e2e-tests.sh --coverage --suite item-management.spec.ts
```

### 2. View Coverage Reports

After running tests with coverage enabled:

```bash
# View HTML coverage report
open coverage/index.html

# Or on Linux
xdg-open coverage/index.html

# Generate report from existing data
./generate-coverage-report.sh
```

### 3. Coverage Files

The following files are generated:

```
coverage/
├── index.html                 # Interactive HTML report
├── merged-coverage.json       # Combined coverage data
├── list-management_*.json     # Individual test coverage
├── item-management_*.json
└── ...
```

## Understanding Coverage Data

### Coverage Metrics

**Files Analyzed**: Total number of JavaScript/TypeScript files detected
**Files with Coverage**: Files that had code executed during tests
**Execution Ranges**: Number of code blocks executed per file
**Estimated Coverage**: Percentage of code executed (approximation)

### Coverage Report Sections

1. **Coverage Summary**
   - High-level metrics and overview
   - Total files analyzed vs. files with coverage
   - Overall coverage percentage estimate

2. **File Details Table**
   - Individual file coverage status
   - Source file URLs and paths
   - Execution range counts per file

3. **Coverage Analysis**
   - Explanation of metrics
   - Guidance on interpreting results

### What Files Are Covered?

The coverage system tracks:

✅ **Application Source Code**
- React components (`*.tsx`, `*.jsx`)
- TypeScript utilities (`*.ts`)
- JavaScript modules (`*.js`)
- Custom hooks and services

❌ **Excluded from Coverage**
- Test files (`*.spec.ts`, `*.test.ts`)
- Node modules (`node_modules/`)
- Build artifacts and transpiled code
- Playwright test infrastructure

## Coverage Implementation

### Technical Architecture

```typescript
// coverage-setup.ts - Core coverage utilities
export class CoverageCollector {
  async startCoverage(page: Page): Promise<void> {
    // Enable JavaScript coverage collection
    await page.coverage.startJSCoverage({
      resetOnNavigation: true,
      reportAnonymousScripts: true,
    });
  }

  async stopCoverage(page: Page, testName: string): Promise<void> {
    // Collect and save coverage data
    const coverage = await page.coverage.stopJSCoverage();
    // Filter and save application-specific coverage
  }
}
```

### Test Integration

Each test file includes coverage hooks:

```typescript
import { coverageCollector } from "./coverage-setup";

test.describe("My Test Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Start coverage collection before each test
    await coverageCollector.startCoverage(page);
    await page.goto("/");
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Stop and save coverage after each test
    await coverageCollector.stopCoverage(page, `suite-${testInfo.title}`);
  });
});
```

## Coverage Best Practices

### 1. Use Coverage to Guide Test Development

```bash
# Run coverage to identify gaps
./run-e2e-tests.sh --coverage

# Check which components aren't being tested
open coverage/index.html

# Add tests for uncovered areas
```

### 2. Focus on Critical User Paths

- **Primary Workflows**: List creation, item management, state transitions
- **Error Scenarios**: Form validation, network errors, edge cases
- **UI Interactions**: Navigation, keyboard shortcuts, responsive design

### 3. Coverage Goals

For E2E tests, aim for:
- **60-80% of critical components**: Core user workflows
- **High component coverage**: Most React components exercised
- **Key utility coverage**: Important business logic functions

Don't aim for 100% - E2E tests should focus on user journeys, not exhaustive code coverage.

### 4. Interpret Coverage Contextually

**High Coverage + Passing Tests** = Good confidence in user workflows
**Low Coverage + Passing Tests** = May need more comprehensive test scenarios
**High Coverage + Failing Tests** = Good test coverage, fix the bugs
**Low Coverage + Failing Tests** = Need both more tests and bug fixes

## Advanced Coverage Workflows

### 1. Coverage-Driven Test Development

```bash
# 1. Run initial coverage baseline
./run-e2e-tests.sh --coverage --suite list-management.spec.ts

# 2. Identify uncovered components in report
open coverage/index.html

# 3. Add tests for critical uncovered areas
# 4. Re-run coverage to verify improvement
./run-e2e-tests.sh --coverage --suite list-management.spec.ts
```

### 2. Continuous Coverage Monitoring

```bash
# Save coverage data for comparison
cp coverage/merged-coverage.json coverage/baseline-coverage.json

# After making changes, compare coverage
./run-e2e-tests.sh --coverage
diff coverage/baseline-coverage.json coverage/merged-coverage.json
```

### 3. Coverage in CI/CD

Add coverage collection to your CI pipeline:

```yaml
# Example GitHub Actions step
- name: Run E2E Tests with Coverage
  run: |
    cd tests
    COVERAGE=true npx playwright test
    ./generate-coverage-report.sh

- name: Upload Coverage Report
  uses: actions/upload-artifact@v3
  with:
    name: e2e-coverage-report
    path: tests/coverage/
```

## Troubleshooting Coverage

### Common Issues

**Problem**: No coverage data generated
```bash
# Solution: Ensure COVERAGE environment variable is set
COVERAGE=true npx playwright test

# Check if coverage directory exists
ls -la coverage/
```

**Problem**: Coverage shows 0% for application files
```bash
# Solution: Verify application is running and accessible
curl http://localhost:3000

# Check browser console for JavaScript errors
./run-e2e-tests.sh --coverage --headed
```

**Problem**: Coverage only shows test files
```bash
# Solution: Check coverage filtering in coverage-setup.ts
# Ensure application files are being loaded correctly
```

### Debugging Coverage Collection

```bash
# 1. Run single test with coverage and visible browser
COVERAGE=true npx playwright test todo.spec.ts --headed

# 2. Check console logs for coverage messages
COVERAGE=true npx playwright test --verbose

# 3. Examine raw coverage data
cat coverage/*_coverage.json | jq '.[0]'

# 4. Verify coverage files are being created
ls -la coverage/
```

## Coverage Report Customization

### Modifying Coverage Collection

Edit `coverage-setup.ts` to customize:

```typescript
// Change coverage filtering
const filteredCoverage = coverage.filter(entry => {
  const url = entry.url;
  return (
    url.includes("localhost:3000") &&
    !url.includes("node_modules") &&
    // Add custom filtering logic here
    url.includes("your-specific-pattern")
  );
});
```

### Customizing Reports

Edit `generate-coverage-report.sh` to modify:
- Report formatting and styling
- Additional metrics calculation
- Integration with other reporting tools

## Integration with Other Tools

### Combining with Unit Test Coverage

```bash
# Run unit tests with coverage (if available)
cd src/web && npm run test:coverage

# Run E2E tests with coverage
cd tests && ./run-e2e-tests.sh --coverage

# Compare and combine coverage reports
```

### Exporting Coverage Data

```bash
# Convert to standard formats
cd tests
node -e "
const coverage = require('./coverage/merged-coverage.json');
// Convert to Istanbul/NYC format
// Export to SonarQube format
// Send to coverage services
"
```

## Conclusion

E2E code coverage provides valuable insights into how your tests exercise your application code from a user perspective. Use it to:

1. **Identify Testing Gaps**: Find critical code paths not covered by tests
2. **Validate Test Quality**: Ensure tests exercise intended functionality
3. **Guide Test Development**: Prioritize test scenarios based on coverage gaps
4. **Monitor Test Effectiveness**: Track coverage trends over time

Remember: Coverage is a tool to improve testing, not a goal in itself. Focus on meaningful user scenarios and use coverage data to enhance your test suite's effectiveness.