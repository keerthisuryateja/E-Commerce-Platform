# Backend Testing Documentation

## Overview

This directory contains comprehensive unit and integration tests for the E-Commerce backend API. The test suite covers authentication, product management, order processing, database operations, middleware, and API integration.

## Test Structure

```
tests/
├── unit/
│   ├── authController.test.js      # Authentication tests
│   ├── productController.test.js   # Product management tests
│   ├── orderController.test.js     # Order processing tests
│   ├── database.test.js            # Database configuration tests
│   └── middleware.test.js          # Middleware tests
├── integration/
│   └── api.test.js                 # API integration test plan
└── README.md                       # This file
```

## Test Categories

### 1. Unit Tests

#### Auth Controller (`authController.test.js`)
Tests authentication functionality:
- ✓ Login with valid credentials (admin and user)
- ✓ Login validation (missing email/password)
- ✓ Invalid credentials rejection
- ✓ JWT token generation and encoding
- ✓ Signup disabled in read-only mode

**Run:** `npm test -- unit/auth`

#### Product Controller (`productController.test.js`)
Tests product management:
- ✓ Retrieve all products
- ✓ Update product stock with validation
- ✓ Update product price with validation
- ✓ Create new products
- ✓ Delete products
- ✓ Error handling for invalid data

**Run:** `npm test -- unit/products`

#### Order Controller (`orderController.test.js`)
Tests order processing:
- ✓ Create orders with stock validation
- ✓ Retrieve user/admin orders
- ✓ Cancel orders with restocking
- ✓ Update order status
- ✓ Prevent double cancellation
- ✓ Admin-only operations

**Run:** `npm test -- unit/orders`

#### Database (`database.test.js`)
Tests database operations:
- ✓ MySQL connection and fallback simulator
- ✓ Table structure and constraints
- ✓ Default user initialization
- ✓ CRUD operations
- ✓ Data integrity
- ✓ Query performance
- ✓ Concurrent access

**Run:** `npm test -- unit/database`

#### Middleware (`middleware.test.js`)
Tests middleware functionality:
- ✓ JWT authentication
- ✓ CORS headers
- ✓ JSON parsing
- ✓ Error handling
- ✓ Request logging
- ✓ Input validation
- ✓ Rate limiting
- ✓ Security headers

**Run:** `npm test -- unit/middleware`

### 2. Integration Tests

#### API Integration (`integration/api.test.js`)
Tests complete API workflows:
- ✓ Authentication flow
- ✓ Product management workflow
- ✓ Order lifecycle
- ✓ WebSocket synchronization
- ✓ Error handling
- ✓ Role-based access control
- ✓ Database fallback
- ✓ Data validation

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
npm test -- unit/authController.test.js
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode (Run tests on file changes)
```bash
npm test -- --watch
```

## Test Setup

### Prerequisites
- Node.js v16+
- MySQL Server (or fallback simulator)
- Environment variables configured (.env file)

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   Create `.env` file:
   ```
   PORT=5000
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=password
   MYSQL_DATABASE=ecommerce
   JWT_SECRET=your-secret-key
   ```

3. **Initialize Database** (if using MySQL)
   ```bash
   mysql -u root -p < db_schema.sql
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Unit Tests | 90% | - |
| Integration Tests | 85% | - |
| Controllers | 100% | - |
| Routes | 95% | - |
| Middleware | 90% | - |
| Database | 85% | - |

## Writing New Tests

### Test Template

```javascript
const tests = {
  'Test Name': async () => {
    // Setup
    const req = { /* mock request */ };
    const res = { /* mock response */ };

    // Execute
    await controller.method(req, res);

    // Assert
    if (!(condition)) throw new Error('Expected condition');
    console.log('✓ Test passed');
  }
};
```

### Best Practices

1. **Use Descriptive Names**: Test names should clearly describe what is being tested
   ```javascript
   // Good
   'Login with valid admin credentials'
   
   // Bad
   'Login test'
   ```

2. **Arrange-Act-Assert Pattern**: Structure tests clearly
   ```javascript
   // Arrange
   const input = { email: 'test@test.com' };
   
   // Act
   const result = await auth.login(input);
   
   // Assert
   if (!result.token) throw new Error('No token');
   ```

3. **Mock External Dependencies**: Don't make real API calls
   ```javascript
   const mockDb = {
     query: async () => [mockData]
   };
   ```

4. **Test Error Cases**: Don't just test the happy path
   ```javascript
   // Test valid input
   'Create product with valid data'
   
   // Test invalid input
   'Create product with missing name'
   'Create product with negative price'
   ```

5. **Keep Tests Isolated**: Each test should be independent
   ```javascript
   // Reset state before each test
   mockDb.products = [];
   mockDb.orders = [];
   ```

## Continuous Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

### Pre-commit Hooks

Add to `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

## Test Metrics

### Code Coverage

```bash
npm test -- --coverage
```

Coverage thresholds:
- **Statements**: 85%
- **Branches**: 80%
- **Functions**: 85%
- **Lines**: 85%

### Test Duration

Target: Tests should complete in < 5 seconds

```bash
npm test -- --timing
```

## Debugging Tests

### Enable Verbose Logging

```bash
DEBUG=* npm test
```

### Run Single Test

```bash
npm test -- --grep "Login with valid credentials"
```

### Inspect Failed Test

```javascript
// Add to test to pause execution
console.log('Debug point:', variable);
```

## Common Issues and Solutions

### Issue: Test Times Out

**Solution**: Increase timeout in test file:
```javascript
// In test file
const timeout = 10000; // 10 seconds
```

### Issue: Database Connection Fails

**Solution**: 
1. Ensure MySQL is running
2. Check credentials in .env
3. Fall back to simulator (automatic)

### Issue: Import Errors

**Solution**:
1. Verify file paths are correct
2. Check require() statements
3. Ensure modules are installed

## Test Reporting

Generate test report:

```bash
npm test -- --reporter json > test-report.json
```

View HTML report:

```bash
npm install karma-html-reporter
npm test -- --reporter html
open report.html
```

## Performance Testing

Load test the API:

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/products

# Using wrk
wrk -t4 -c100 -d30s http://localhost:5000/api/products
```

## Security Testing

Test for common vulnerabilities:

```bash
# SQL Injection
curl "http://localhost:5000/api/products?id=1' OR '1'='1"

# XSS
curl -X POST http://localhost:5000/api/products \
  -d '{"name":"<script>alert(1)</script>"}'

# CSRF
# Test without proper headers
```

## Contributing

When adding new features:

1. Write tests first (TDD)
2. Implement feature
3. Ensure all tests pass
4. Update test documentation
5. Maintain > 85% coverage

## References

- [Jest Documentation](https://jestjs.io/)
- [Express Testing Guide](https://expressjs.com/en/guide/testing.html)
- [Node.js Testing Best Practices](https://nodejs.dev/en/learn/testing/)

## Support

For test-related questions or issues, please:
1. Check this documentation
2. Review existing test examples
3. Open an issue with reproduction steps
