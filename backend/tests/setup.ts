// Test-only environment defaults. Real environments supply these via `.env`
// (dev) or the host's environment variables (production).
process.env.NODE_ENV ??= "test";
process.env.PORT ??= "3000";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.DIRECT_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.SESSION_SECRET ??= "test-session-secret-at-least-32-characters-long";
process.env.FRONTEND_ORIGIN ??= "http://localhost:5173";
process.env.ADMIN_ORIGIN ??= "http://localhost:5174";
process.env.CLOUDINARY_CLOUD_NAME ??= "test-cloud";
process.env.CLOUDINARY_API_KEY ??= "test-key";
process.env.CLOUDINARY_API_SECRET ??= "test-secret";
