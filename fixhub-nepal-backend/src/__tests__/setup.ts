import { ensureDbConnection } from '../test-app';
import mongoose from 'mongoose';

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  await ensureDbConnection();
}, 30000); // 30 second timeout for DB connection

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
}, 10000);

// Optional: Clear collections between test suites
beforeEach(async () => {
  // You can add logic here to clear specific collections if needed
  // But be careful not to clear user data needed for authentication
});