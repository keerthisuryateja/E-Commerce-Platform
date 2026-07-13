# Frontend Testing Documentation

## Overview

This directory contains comprehensive unit and integration tests for the E-Commerce React frontend. The test suite covers components, context state management, user workflows, accessibility, and performance.

## Test Structure

```
tests/
├── unit/
│   ├── context.test.js        # AppContext state management tests
│   └── components.test.js     # React component tests
├── integration/
│   └── userFlow.test.js       # End-to-end user workflow tests
└── README.md                  # This file
```

## Test Categories

### 1. Unit Tests

#### Context (`unit/context.test.js`)
Tests React Context for state management:
- ✓ State initialization with default values
- ✓ Authentication (login/logout)
- ✓ Cart operations (add/remove/update)
- ✓ Product state management
- ✓ Order state management
- ✓ Toast notifications
- ✓ WebSocket integration
- ✓ API communication
- ✓ Error handling
- ✓ localStorage persistence

**Run:** `npm test -- unit/context`

#### Components (`unit/components.test.js`)
Tests React component rendering and interactions:
- ✓ Login Component (read-only inputs, credentials toggle)
- ✓ Signup Component (showcase mode)
- ✓ Navbar (navigation, user menu, admin controls)
- ✓ Product Card (display, stock indicators, add to cart)
- ✓ Product Modal (details, quantity selector)
- ✓ Cart (item list, quantity adjustment, total calculation)
- ✓ Checkout (payment, order creation)
- ✓ Orders Page (order list, status display, cancellation)
- ✓ Admin Panel (inventory management, product CRUD)
- ✓ API Status Dashboard (health checks)
- ✓ Toast Notifications (display, auto-dismiss)
- ✓ Error Boundary (error catching and recovery)
- ✓ Skeleton Loading (placeholders)
- ✓ Profile Dashboard (shipping addresses)
- ✓ Wishlist (save and manage)

**Run:** `npm test -- unit/components`

### 2. Integration Tests

#### User Workflows (`integration/userFlow.test.js`)
Tests complete user journeys:

1. **Complete User Shopping Journey**
   - Login → Browse → Add to Cart → Checkout → Order Complete
   - ✓ 21 steps covering entire purchase flow

2. **Admin Product Management**
   - Login → Edit Inventory → Real-time Sync
   - ✓ 21 steps for admin operations

3. **Order Management by Admin**
   - View Orders → Update Status → Cancel Orders → Restock
   - ✓ 15 steps for order lifecycle

4. **Multi-Tab Synchronization**
   - WebSocket state sync across browser tabs
   - ✓ 20 steps testing concurrent access

5. **Network Disconnection Recovery**
   - Handle offline → Reconnect → Resume Operations
   - ✓ 15 steps for network resilience

6. **Search and Filter**
   - Product search, price filters, stock filters
   - ✓ 15 steps for filtering functionality

7. **Error Recovery**
   - Handle validation errors, retry operations
   - ✓ 16 steps for error scenarios

8. **Accessibility Flow**
   - Keyboard navigation, screen reader, contrast
   - ✓ 14 steps for a11y compliance

9. **Performance and Load Testing**
   - Large datasets, concurrent users, memory
   - ✓ 15 steps for performance validation

**Run:** `npm test -- integration`

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm test -- unit
```

### Run Integration Tests Only
```bash
npm test -- integration
```

### Run Specific Test File
```bash
npm test -- unit/components.test.js
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode (Hot reload tests)
```bash
npm test -- --watch
```

### Debug Mode
```bash
npm test -- --debug
```

## Test Setup

### Prerequisites
- Node.js v16+
- React 18+
- Vite
- Testing libraries (to be installed)

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Install Testing Dependencies**
   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
   ```

3. **Create vitest.config.js**
   ```javascript
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
     },
   })
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Components | 95% | - |
| Context | 90% | - |
| Pages | 90% | - |
| Utilities | 85% | - |
| Overall | 90% | - |

## Writing Component Tests

### Test Template

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const { getByRole } = render(<MyComponent />);
    const button = getByRole('button');
    fireEvent.click(button);
    // Assert
  });
});
```

### Best Practices

1. **Test User Behavior, Not Implementation**
   ```javascript
   // Good - tests what user sees
   expect(screen.getByText('Add to Cart')).toBeInTheDocument();
   
   // Bad - tests internal state
   expect(component.state.isOpen).toBe(true);
   ```

2. **Use Accessible Selectors**
   ```javascript
   // Good
   screen.getByRole('button', { name: /submit/i })
   screen.getByLabelText(/email/i)
   
   // Bad
   screen.getByTestId('btn-123')
   wrapper.find('.button')
   ```

3. **Test Error States**
   ```javascript
   // Test successful case
   // Test error case
   // Test loading case
   // Test empty state
   ```

4. **Mock API Calls**
   ```javascript
   jest.mock('../api', () => ({
     fetchProducts: jest.fn(() => Promise.resolve([]))
   }));
   ```

5. **Clean Up After Tests**
   ```javascript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

## Testing with Context

### Mock AppContext

```javascript
import { AppProvider } from '../context/AppContext';

function renderWithContext(component) {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
}

// Usage
renderWithContext(<MyComponent />);
```

### Mock WebSocket

```javascript
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
}));
```

## Performance Testing

### Measure Component Render Time

```bash
npm test -- --reporter=verbose
```

### Monitor Bundle Size

```bash
npm run build
npm install -g source-map-explorer
source-map-explorer 'dist/**/*.js'
```

## Accessibility Testing

### Test Keyboard Navigation

```javascript
it('should be navigable with keyboard', () => {
  render(<Component />);
  const button = screen.getByRole('button');
  
  // Tab to button
  fireEvent.keyDown(button, { key: 'Tab' });
  expect(button).toHaveFocus();
  
  // Enter to activate
  fireEvent.keyDown(button, { key: 'Enter' });
  // Assert action occurred
});
```

### Test with axe

```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## E2E Testing with Cypress

### Install Cypress

```bash
npm install --save-dev cypress
npx cypress open
```

### Example E2E Test

```javascript
// cypress/e2e/shopping.cy.js
describe('User Shopping Journey', () => {
  it('should complete purchase', () => {
    cy.visit('http://localhost:5173');
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## Debugging Tests

### Use Debug Helper

```javascript
import { render, screen } from '@testing-library/react';

const { debug } = render(<Component />);
debug(); // Prints DOM tree
```

### Console Logging in Tests

```javascript
it('should work', () => {
  const { rerender } = render(<Component prop={1} />);
  console.log('Initial render');
  
  rerender(<Component prop={2} />);
  console.log('After rerender');
});
```

### Run Single Test

```bash
npm test -- --grep "should render correctly"
```

## Continuous Integration

### GitHub Actions

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build
      - uses: codecov/codecov-action@v2
```

## Common Testing Patterns

### Testing Async Operations

```javascript
it('should fetch data', async () => {
  render(<Component />);
  
  // Wait for async operation
  const element = await screen.findByText('Data Loaded');
  expect(element).toBeInTheDocument();
});
```

### Testing Context Updates

```javascript
it('should update context', async () => {
  render(<AppConsumer />);
  
  const button = screen.getByRole('button');
  fireEvent.click(button);
  
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

### Testing Local Storage

```javascript
it('should persist to localStorage', () => {
  const { getByRole } = render(<Component />);
  fireEvent.click(getByRole('button'));
  
  expect(localStorage.getItem('key')).toBe('value');
});
```

## Test Reporting

### Generate Coverage Report

```bash
npm test -- --coverage
```

### View HTML Coverage

```bash
npm test -- --coverage
open coverage/index.html
```

## Mobile Testing

### Test Responsive Design

```javascript
it('should be responsive', () => {
  window.innerWidth = 375; // Mobile width
  render(<Component />);
  
  // Assert mobile layout
  expect(screen.getByTestId('mobile-menu')).toBeVisible();
});
```

## Visual Regression Testing

### Setup Percy

```bash
npm install --save-dev @percy/cli @percy/cypress
```

### Add Visual Test

```javascript
describe('Visual Regression', () => {
  it('should match snapshot', () => {
    cy.visit('http://localhost:5173');
    cy.percySnapshot('Dashboard');
  });
});
```

## Troubleshooting

### Issue: Tests fail with "Cannot find module"

**Solution**:
```javascript
// Update jest.config.js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1'
}
```

### Issue: Timeout errors

**Solution**:
```javascript
jest.setTimeout(10000); // 10 second timeout
```

### Issue: WebSocket errors in tests

**Solution**:
```javascript
// Mock WebSocket globally
global.WebSocket = jest.fn();
```

## Best Practices Checklist

- ☐ Write tests before implementation (TDD)
- ☐ Test user interactions, not internals
- ☐ Maintain > 85% code coverage
- ☐ Keep tests fast (< 1s each)
- ☐ Mock external dependencies
- ☐ Use accessible selectors
- ☐ Test error states
- ☐ Clean up after each test
- ☐ Make tests deterministic (no flakiness)
- ☐ Document complex test setups

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Vitest Documentation](https://vitest.dev/)
- [Jest Docs](https://jestjs.io/)
- [Cypress Docs](https://docs.cypress.io/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:

1. Write component tests
2. Write integration tests
3. Ensure > 85% coverage
4. Run full test suite
5. Update documentation

## Support

For testing questions:
1. Check this documentation
2. Review example tests
3. Check Testing Library docs
4. Open an issue
