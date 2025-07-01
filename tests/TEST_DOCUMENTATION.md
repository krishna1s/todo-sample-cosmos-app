# E2E Test Documentation for Todo Application

This directory contains comprehensive End-to-End (E2E) test suites for the Todo application built with React, TypeScript, and Azure Cosmos DB.

## Test Structure

The tests are organized into focused test suites, each covering specific aspects of the application:

### 1. **todo.spec.ts** (Original)
Basic smoke test that validates core create/delete functionality.

### 2. **list-management.spec.ts**
Tests related to todo list management:
- Creating new lists
- Navigating between lists
- Deleting lists
- Default list behavior
- Empty state handling

### 3. **item-management.spec.ts**
Tests for todo item operations:
- Creating single and multiple items
- Marking items as complete
- Deleting items
- Bulk operations
- State transitions (todo → inprogress → done)
- Data persistence across page reloads

### 4. **item-details.spec.ts**
Advanced item editing and detail management:
- Editing item names and descriptions
- Setting and updating due dates
- Changing item states via dropdown
- Form validation
- Cancel operations
- Complex formatting and special characters

### 5. **ui-interactions.spec.ts**
User interface and interaction testing:
- Application loading and layout
- Browser navigation (back/forward)
- Command bar functionality
- Context menus
- Form validation
- Search and filtering
- Responsive design
- Keyboard navigation
- Loading states

### 6. **advanced-workflows.spec.ts**
Complex scenarios and edge cases:
- Multi-list workflows with state isolation
- Data validation with special characters
- Performance testing with many items
- Concurrent operations
- State persistence
- Error handling and recovery
- Cross-browser compatibility
- Accessibility features
- URL routing and deep linking

## Test Features Covered

### Core Functionality
- ✅ List CRUD operations
- ✅ Item CRUD operations  
- ✅ State management (todo/inprogress/done)
- ✅ Data persistence
- ✅ Navigation

### UI/UX Testing
- ✅ Form validation
- ✅ Empty states
- ✅ Loading states
- ✅ Responsive design
- ✅ Keyboard navigation
- ✅ Context menus
- ✅ Command bars

### Advanced Scenarios
- ✅ Multi-list workflows
- ✅ Bulk operations
- ✅ Performance with large datasets
- ✅ Error handling
- ✅ Browser compatibility
- ✅ Accessibility
- ✅ Data validation

### Edge Cases
- ✅ Special characters and Unicode
- ✅ Long text handling
- ✅ Concurrent operations
- ✅ Invalid inputs
- ✅ Network issues simulation

## Running the Tests

### Prerequisites
```bash
cd tests
npm install
npx playwright install
```

### Running All Tests
```bash
npx playwright test
```

### Running Specific Test Suites
```bash
# Run only list management tests
npx playwright test list-management.spec.ts

# Run only item management tests  
npx playwright test item-management.spec.ts

# Run UI interaction tests
npx playwright test ui-interactions.spec.ts
```

### Running with Visual Browser
```bash
npx playwright test --headed
```

### Debug Mode
```bash
npx playwright test --debug
```

## Test Configuration

The tests are configured via `playwright.config.ts` with:
- **Base URL Discovery**: Automatically detects the app URL from environment variables or defaults to localhost:3000
- **Browser Support**: Configured for Chromium (can be extended to Firefox/Safari)
- **Timeouts**: Long timeouts suitable for E2E testing
- **Retries**: Automatic retries on CI/CD
- **Trace Collection**: For debugging failed tests

## Test Data Management

- All tests use `uuid` to generate unique identifiers
- Tests are designed to be independent and can run in parallel
- Each test cleans up its own data where possible
- Uses `test.beforeEach()` for consistent setup

## Best Practices Implemented

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Reliability**: Uses proper waits and expects for stable tests
3. **Maintainability**: Clear test structure and descriptive names
4. **Coverage**: Comprehensive coverage of user workflows
5. **Performance**: Efficient test execution with proper timeouts

## Application Features Tested

### Lists
- Create/Read/Update/Delete operations
- Navigation between lists
- Default list creation
- Empty state handling

### Items  
- CRUD operations with validation
- State transitions (todo → inprogress → done)
- Descriptions and due dates
- Bulk selection and operations
- Filtering and search

### UI Components
- Sidebar navigation
- Command bars
- Context menus
- Forms and validation
- Loading and empty states

### Advanced Features
- Deep linking and URL routing
- Data persistence
- Error handling
- Accessibility features
- Responsive design
- Keyboard navigation

## Extending the Tests

To add new test scenarios:

1. **Identify the feature area** and add to the appropriate spec file
2. **Follow the existing patterns** for test structure and naming
3. **Use unique identifiers** (uuid) for test data
4. **Include proper cleanup** if the test creates persistent data
5. **Add comprehensive assertions** to verify expected behavior

## Troubleshooting

### Common Issues
- **Base URL not set**: Ensure the app is running on the expected port
- **Timeouts**: Increase timeout values for slower environments
- **Element not found**: Check if UI elements have changed
- **Flaky tests**: Add proper waits and retry logic

### Debug Commands
```bash
# Run a single test with debug
npx playwright test list-management.spec.ts --debug

# Generate test traces
npx playwright test --trace on

# Open trace viewer
npx playwright show-trace trace.zip
```

This comprehensive test suite provides excellent coverage of the Todo application and serves as both regression testing and documentation of expected application behavior.