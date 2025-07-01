# ToDo Application E2E Tests

This directory contains a comprehensive End-to-End (E2E) test suite for the Todo application, built with [Playwright](https://playwright.dev/). The tests cover all major functionality including list management, item operations, UI interactions, and advanced workflows.

## Test Suite Overview

### 🧪 Test Files
- **`todo.spec.ts`** - Original basic smoke test (create and delete item)
- **`list-management.spec.ts`** - Todo list CRUD operations and navigation
- **`item-management.spec.ts`** - Todo item CRUD, state transitions, bulk operations
- **`item-details.spec.ts`** - Advanced item editing, descriptions, due dates
- **`ui-interactions.spec.ts`** - UI/UX testing, forms, navigation, responsive design
- **`advanced-workflows.spec.ts`** - Complex scenarios, performance, error handling

### 📋 Features Tested
- ✅ **List Management**: Create, rename, delete, navigate between lists
- ✅ **Item Operations**: CRUD operations, state transitions (todo→inprogress→done)
- ✅ **Item Details**: Edit names/descriptions, set due dates, validation
- ✅ **UI/UX**: Forms, command bars, context menus, keyboard navigation
- ✅ **Advanced Workflows**: Multi-list scenarios, bulk operations, performance
- ✅ **Edge Cases**: Special characters, Unicode, error handling, data validation
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 🚀 Quick Start

### Prerequisites
Ensure the Todo application is running before executing tests:

**Option 1: Local Development**
```bash
# Terminal 1 - Start Web Frontend
cd src/web
npm install
npm start

# Terminal 2 - Start API Backend  
cd src/api
dotnet run

# Terminal 3 - Run Tests
cd tests
./run-e2e-tests.sh
```

**Option 2: Azure Developer CLI**
```bash
# Deploy to Azure
azd up

# Set environment URL
export REACT_APP_WEB_BASE_URL="https://your-app-url.azurewebsites.net"

# Run tests
cd tests
./run-e2e-tests.sh
```

**Option 3: Azure Deployment Testing**
```bash
# Test against existing Azure deployment
cd tests
export REACT_APP_WEB_BASE_URL="https://app-web-ocwiawb26beca.azurewebsites.net"
./run-tests-azure-endpoint.sh

# Or run with coverage collection
./run-e2e-tests.sh --coverage
./generate-coverage-report.sh
```

### Test Environment Discovery

The tests will discover the application endpoint in this order:
1. `REACT_APP_WEB_BASE_URL` environment variable
2. Value from `.azure/<environment>/.env` file
3. Defaults to `http://localhost:3000`

## 🎯 Running Tests

### Setup (First Time)
```bash
cd tests
npm install
npx playwright install
```

### Run All Tests
```bash
# Using the test runner script (recommended)
./run-e2e-tests.sh

# Or directly with Playwright
npx playwright test
```

### Run Specific Test Suites
```bash
# Run list management tests only
./run-e2e-tests.sh --suite list-management.spec.ts

# Run with visible browser
./run-e2e-tests.sh --headed

# Debug mode
./run-e2e-tests.sh --debug --suite todo.spec.ts

# Custom timeout
./run-e2e-tests.sh --timeout 30000
```

### Code Coverage
The test suite includes comprehensive code coverage collection to analyze which parts of the frontend application are exercised during testing.

```bash
# Run tests with code coverage
./run-e2e-tests.sh --coverage

# Coverage for specific test suite
./run-e2e-tests.sh --coverage --suite item-management.spec.ts

# Environment variable approach
COVERAGE=true npx playwright test

# Generate coverage report from existing data
./generate-coverage-report.sh
```

**Coverage Features:**
- ✅ **JavaScript/TypeScript Coverage**: Tracks execution of frontend code
- ✅ **File-level Analysis**: Shows which files were loaded and executed
- ✅ **Code Path Tracking**: Identifies executed code ranges
- ✅ **HTML Reports**: Visual coverage reports with detailed breakdowns
- ✅ **Merge Capability**: Combines coverage data from multiple test runs

**Coverage Reports:**
- **HTML Report**: `coverage/index.html` - Interactive coverage dashboard
- **Raw Data**: `coverage/merged-coverage.json` - Programmatic access to coverage data
- **Individual Files**: `coverage/*_coverage.json` - Per-test coverage data

**Understanding Coverage:**
This coverage represents frontend code execution during E2E tests. It shows:
- Which React components and utilities were rendered/executed
- Code paths exercised by user interactions
- Files that may need additional test scenarios
- Overall test completeness from a code execution perspective

```

### Individual Test Commands
```bash
# Specific test file
npx playwright test list-management.spec.ts

# With browser visible
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Specific test pattern
npx playwright test --grep "Create a new todo list"
```

## 🔧 Test Configuration

### Playwright Configuration (`playwright.config.ts`)
- **Browsers**: Chromium (configurable for Firefox/Safari)
- **Timeouts**: Extended for E2E testing (2 hours per test)
- **Retries**: Automatic retries on CI environments
- **Reports**: HTML reports with traces for debugging
- **Base URL**: Auto-discovery from environment

### Environment Variables
```bash
# Set custom application URL
export REACT_APP_WEB_BASE_URL="https://your-app.com"

# Set Azure environment
export AZURE_ENV_NAME="production"
```

## 🐛 Debugging & Troubleshooting

### Debug Individual Tests
```bash
# Debug with browser visible
npx playwright test todo.spec.ts --debug --headed

# Generate trace files
npx playwright test --trace on

# View trace files
npx playwright show-trace test-results/**/trace.zip
```

### Common Issues

**App Not Running**
```bash
# Check if app is accessible
curl http://localhost:3000

# Verify both frontend and backend are running
# Frontend: http://localhost:3000
# Backend: http://localhost:5000 or https://localhost:5001
```

**Test Timeouts**
```bash
# Increase timeout for slow environments
npx playwright test --timeout=60000
```

**Element Not Found**
```bash
# Run with headed mode to see UI state
npx playwright test --headed

# Use trace viewer to inspect failed tests
npx playwright show-trace test-results/**/trace.zip
```

## 📊 Test Reports

After running tests, reports are available:
- **HTML Report**: `playwright-report/index.html`
- **Test Results**: `test-results/` directory
- **Traces**: Available for failed tests in test results

```bash
# Open HTML report
npx playwright show-report

# View specific trace
npx playwright show-trace test-results/**/trace.zip
```

## 🏗️ Test Architecture

### Test Organization
```
tests/
├── todo.spec.ts                    # Basic smoke test
├── list-management.spec.ts         # List operations
├── item-management.spec.ts         # Item CRUD operations  
├── item-details.spec.ts           # Advanced item editing
├── ui-interactions.spec.ts        # UI/UX testing
├── advanced-workflows.spec.ts     # Complex scenarios
├── TEST_DOCUMENTATION.md          # Detailed documentation
├── run-e2e-tests.sh              # Test runner script
└── playwright.config.ts          # Playwright configuration
```

### Test Data Strategy
- **UUID Generation**: All test data uses unique identifiers
- **Test Isolation**: Each test is independent and self-contained
- **Cleanup**: Tests clean up their own data where possible
- **Parallel Execution**: Tests can run safely in parallel

### Best Practices
- ✅ Page Object Model patterns
- ✅ Explicit waits and proper timing
- ✅ Comprehensive assertions
- ✅ Error handling and recovery
- ✅ Cross-browser compatibility
- ✅ Accessibility testing

## 📚 Additional Resources

- **[TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md)** - Comprehensive test documentation
- **[Playwright Documentation](https://playwright.dev/docs/intro)** - Official Playwright docs
- **[Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/)** - For deployment and environment management

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns and naming conventions
2. Use unique test data with UUID generation
3. Include proper setup/teardown in `beforeEach`/`afterEach`
4. Add comprehensive assertions
5. Update this README if adding new test categories
6. Test in both local and deployed environments

## 💡 Tips

- Use `--headed` flag to see tests running in browser
- Use `--debug` flag to step through tests interactively  
- Check `playwright-report/index.html` for detailed results
- Use trace viewer for debugging failed tests
- Run specific test suites during development for faster feedback