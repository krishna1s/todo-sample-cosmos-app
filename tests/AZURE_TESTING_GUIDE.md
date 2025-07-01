# Azure Endpoint Testing Guide

## 🌐 Running E2E Tests Against Azure Deployment

This guide explains how to run the comprehensive E2E test suite against your Azure deployment with code coverage collection.

### Quick Start

```bash
# Set your Azure endpoint
export REACT_APP_WEB_BASE_URL="https://app-web-ocwiawb26beca.azurewebsites.net"

# Run tests with coverage
./run-e2e-tests.sh --coverage

# Generate coverage report
./generate-coverage-report.sh
```

### Automated Azure Testing

Use the dedicated Azure endpoint runner:

```bash
./run-tests-azure-endpoint.sh
```

This script:
- ✅ Sets up the Azure endpoint URL automatically
- ✅ Tests connectivity to your deployment
- ✅ Runs all E2E tests with coverage enabled
- ✅ Generates comprehensive coverage reports
- ✅ Provides troubleshooting guidance

### Manual Testing Steps

1. **Verify Azure Deployment**
   ```bash
   curl -I https://app-web-ocwiawb26beca.azurewebsites.net/
   ```

2. **Set Environment**
   ```bash
   export REACT_APP_WEB_BASE_URL="https://app-web-ocwiawb26beca.azurewebsites.net"
   export COVERAGE=true
   ```

3. **Run Specific Test Suites**
   ```bash
   # List management tests
   ./run-e2e-tests.sh --coverage --suite list-management.spec.ts
   
   # Item management tests  
   ./run-e2e-tests.sh --coverage --suite item-management.spec.ts
   
   # All UI interaction tests
   ./run-e2e-tests.sh --coverage --suite ui-interactions.spec.ts
   
   # Advanced workflow tests
   ./run-e2e-tests.sh --coverage --suite advanced-workflows.spec.ts
   ```

4. **Generate Coverage Report**
   ```bash
   ./generate-coverage-report.sh
   ```

### Test Scenarios Covered

#### 🗂️ List Management (5 scenarios)
- Create new todo lists
- Navigate between lists
- Rename existing lists
- Delete lists with confirmation
- List persistence across page reloads

#### 📋 Item Management (9 scenarios)  
- Create todo items
- Mark items as in-progress/done
- Edit item names and descriptions
- Delete items
- Item state transitions
- Bulk operations
- Data persistence

#### ✏️ Item Details (8 scenarios)
- Advanced item editing
- Due date management
- Form validation
- Special character handling
- Unicode support
- Long text handling

#### 🎨 UI Interactions (10 scenarios)
- Command bar functionality
- Context menus
- Keyboard navigation
- Responsive design testing
- Accessibility compliance
- ARIA labels validation

#### 🔄 Advanced Workflows (10 scenarios)
- Complex multi-list scenarios
- Performance with large datasets
- Concurrent operations
- Error handling
- Recovery scenarios
- Cross-browser compatibility

### Coverage Collection

The E2E tests collect comprehensive code coverage including:

- **Frontend Coverage**: JavaScript/TypeScript execution in browser
- **Component Coverage**: React component interaction tracking
- **User Journey Coverage**: Real user workflow analysis
- **Feature Coverage**: Complete feature utilization mapping

### Coverage Reports

Generated reports include:

1. **HTML Dashboard** (`coverage/index.html`)
   - Interactive coverage visualization
   - File-by-file analysis
   - Execution statistics
   - Coverage percentage metrics

2. **Raw Data** (`coverage/merged-coverage.json`)
   - Detailed execution ranges
   - File-level coverage data
   - Performance metrics
   - Integration with CI/CD pipelines

3. **Individual Test Coverage** (`coverage/*_coverage.json`)
   - Per-test scenario coverage
   - Test-specific code paths
   - Isolated coverage analysis

### Expected Coverage Areas

When running against your Azure deployment, coverage will include:

#### Core Application Files
- `App.tsx` - Main application component
- `TodoList.tsx` - List management component
- `TodoItem.tsx` - Individual item component
- `CommandBar.tsx` - Action bar component
- `Navigation.tsx` - Navigation component

#### Utility Functions
- API service modules
- State management utilities
- Validation functions
- Helper utilities

#### Feature Modules
- List CRUD operations
- Item state management
- Form handling
- Error handling
- Data persistence

### Troubleshooting

#### Connectivity Issues
```bash
# Test endpoint accessibility
curl -v https://app-web-ocwiawb26beca.azurewebsites.net/

# Check DNS resolution
nslookup app-web-ocwiawb26beca.azurewebsites.net

# Test with different timeout
curl --connect-timeout 30 --max-time 60 https://app-web-ocwiawb26beca.azurewebsites.net/
```

#### Coverage Collection Issues
```bash
# Verify coverage setup
export COVERAGE=true
node -e "console.log('Coverage enabled:', process.env.COVERAGE === 'true')"

# Check coverage directory
ls -la coverage/

# Validate coverage files
find coverage -name "*.json" -exec wc -l {} \;
```

#### Test Execution Issues
```bash
# Run with verbose output
./run-e2e-tests.sh --headed --suite list-management.spec.ts

# Debug mode
./run-e2e-tests.sh --debug --suite todo.spec.ts

# Check test results
ls -la test-results/
```

### CI/CD Integration

For automated testing in pipelines:

```yaml
# GitHub Actions example
- name: Run E2E Tests with Coverage
  run: |
    export REACT_APP_WEB_BASE_URL="${{ secrets.AZURE_WEB_URL }}"
    cd tests
    npm install
    npx playwright install
    ./run-e2e-tests.sh --coverage
    ./generate-coverage-report.sh

- name: Upload Coverage Report
  uses: actions/upload-artifact@v3
  with:
    name: e2e-coverage-report
    path: tests/coverage/
```

### Performance Considerations

- **Test Duration**: Complete suite runs in ~15-20 minutes
- **Coverage Collection**: Adds ~10% overhead to test execution
- **Resource Usage**: Requires stable internet connection to Azure
- **Concurrency**: Tests run sequentially to avoid data conflicts

### Next Steps

1. **Run Initial Test Suite**
   ```bash
   ./run-tests-azure-endpoint.sh
   ```

2. **Review Coverage Report**
   - Open `coverage/index.html` in browser
   - Analyze uncovered code paths
   - Identify areas needing additional tests

3. **Integrate into Development Workflow**
   - Add coverage targets to CI/CD
   - Set coverage thresholds
   - Monitor coverage trends over time

This comprehensive testing approach ensures your Azure-deployed todo application is thoroughly validated across all features and user workflows.