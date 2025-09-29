process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Silence console noise from expected error logs during tests
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('TestLog')) {
    return;
  }
  originalError.call(console, ...args);
};
